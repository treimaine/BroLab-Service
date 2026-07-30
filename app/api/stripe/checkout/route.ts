/**
 * Stripe Checkout API - Artist Purchases
 * 
 * Creates Stripe Checkout Sessions as Direct Charges on provider's connected account.
 * Payments go directly to provider's Stripe account (0% platform fee for MVP).
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.7, 13.8
 */

import { CONVEX_CONFIG, getAppOrigin, STRIPE_CONFIG } from '@/lib/env'
import {
    logCheckoutAttempt,
    logCheckoutFailure,
    logCheckoutSuccess,
} from '@/lib/monitoring'
import { getPostHogClient } from '@/lib/posthog-server'
import { auth } from '@clerk/nextjs/server'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { isValidLicenseTier } from '@/shared/licenses'
import { signCheckoutFulfillment } from '../../../../shared/checkoutFulfillment'

// Initialize Stripe with platform secret key
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2026-06-24.dahlia',
})

// Initialize Convex client for server-side queries
const convex = new ConvexHttpClient(CONVEX_CONFIG.url)

// Simple in-memory idempotency cache for test mode
const idempotencyCache = new Map<string, { url: string; sessionId: string }>()

// ============================================================================
// REQUEST TYPES
// ============================================================================

type LicenseTier = 'basic' | 'premium' | 'unlimited'
type ItemType = 'track' | 'service'

interface CheckoutRequest {
  workspaceId: string
  itemType: ItemType
  itemId: string
  licenseTier?: LicenseTier // Required for tracks
  successUrl?: string
  cancelUrl?: string
}

interface ItemData {
  name: string
  priceInCents: number
  currency: string
}

interface WorkspaceData {
  name: string
  slug: string
  paymentsStatus: string
  stripeAccountId?: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate checkout request body
 */
function validateCheckoutRequest(body: CheckoutRequest): { valid: boolean; error?: string } {
  const { workspaceId, itemType, itemId, licenseTier } = body

  if (
    typeof workspaceId !== 'string' ||
    typeof itemId !== 'string' ||
    !workspaceId.trim() ||
    !itemId.trim()
  ) {
    return { valid: false, error: 'Missing required fields: workspaceId, itemType, itemId' }
  }

  if (itemType !== 'track' && itemType !== 'service') {
    return { valid: false, error: 'itemType must be either track or service' }
  }

  if (
    itemType === 'track' &&
    (typeof licenseTier !== 'string' || !isValidLicenseTier(licenseTier))
  ) {
    return {
      valid: false,
      error: 'licenseTier must be basic, premium, or unlimited for track purchases',
    }
  }

  if (itemType === 'service' && licenseTier !== undefined) {
    return { valid: false, error: 'licenseTier is only valid for track purchases' }
  }

  return { valid: true }
}

function priceToCents(price: number): number {
  if (!Number.isFinite(price) || price <= 0) {
    throw new Error('Item price is invalid')
  }

  const cents = Math.round(price * 100)
  if (!Number.isSafeInteger(cents) || cents <= 0) {
    throw new Error('Item price is invalid')
  }

  return cents
}

/**
 * Validate workspace payments configuration
 */
function validatePaymentsConfiguration(workspace: WorkspaceData): { valid: boolean; error?: string } {
  if (workspace.paymentsStatus !== 'active' || !workspace.stripeAccountId) {
    return {
      valid: false,
      error: 'This provider has not completed Stripe Connect onboarding. Purchases are not available yet.',
    }
  }

  return { valid: true }
}

/**
 * Fetch track data and calculate price
 */
async function getTrackItemData(
  itemId: string,
  licenseTier: LicenseTier,
  isTestMode: boolean,
  workspaceId: string
): Promise<ItemData> {
  if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
    // Test mode: Return mock track data
    const mockPrices = {
      basic: 29.99,
      premium: 49.99,
      unlimited: 149.99,
    }
    const tierPrice = mockPrices[licenseTier]
    return {
      name: `Test Beat - ${licenseTier.charAt(0).toUpperCase() + licenseTier.slice(1)} License`,
      priceInCents: Math.round(tierPrice * 100),
      currency: 'usd',
    }
  }

  const track = await convex.query(api.modules.beats.getPublishedTrack, {
    trackId: itemId as Id<'tracks'>,
    workspaceId: workspaceId as Id<'workspaces'>,
  })

  if (!track) {
    throw new Error('Track not found')
  }

  const tierPrice = track.priceUsdByTier[licenseTier]
  if (tierPrice === undefined) {
    throw new Error(`Invalid license tier: ${licenseTier}`)
  }

  const itemName = `${track.title} - ${licenseTier.charAt(0).toUpperCase() + licenseTier.slice(1)} License`
  const priceInCents = priceToCents(tierPrice)

  return {
    name: itemName,
    priceInCents,
    currency: 'usd',
  }
}

/**
 * Fetch service data and calculate price
 */
async function getServiceItemData(
  itemId: string,
  workspaceId: string,
  isTestMode?: boolean
): Promise<ItemData> {
  if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
    // Test mode: Return mock service data
    return {
      name: 'Test Mixing Service',
      priceInCents: 9999, // $99.99
      currency: 'usd',
    }
  }

  const service = await convex.query(api.modules.services.getService, {
    serviceId: itemId as Id<'services'>,
  })

  if (!service) {
    throw new Error('Service not found')
  }

  if (service.workspaceId !== workspaceId || !service.isActive) {
    throw new Error('Service is not available for booking')
  }

  return {
    name: service.title,
    priceInCents: priceToCents(service.priceUSD),
    currency: 'usd',
  }
}

/**
 * Create Stripe Checkout Session
 */
async function createCheckoutSession(
  workspace: {
    name: string
    slug: string
    stripeAccountId: string
  },
  itemData: ItemData,
  metadata: Record<string, string>,
  successUrl: string,
  cancelUrl: string,
  idempotencyKey: string | null
): Promise<Stripe.Checkout.Session> {
  return await stripe.checkout.sessions.create(
    {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: itemData.currency,
            product_data: {
              name: itemData.name,
              description: metadata.itemType === 'track'
                ? `Beat license from ${workspace.name}`
                : `Service booking from ${workspace.name}`,
            },
            unit_amount: itemData.priceInCents,
          },
          quantity: 1,
        },
      ],
      metadata,
      // Do not send application_fee_amount for 0% fee.
      // Stripe rejects zero-valued application fees on Checkout payment intents.
      payment_intent_data: undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: undefined, // Stripe will prompt for email
    },
    {
      stripeAccount: workspace.stripeAccountId, // Direct Charge on connected account
      idempotencyKey: idempotencyKey ?? undefined,
    }
  )
}

// ============================================================================
// AUTHENTICATION HELPERS
// ============================================================================

/**
 * Authenticate user (supports test mode)
 */
async function authenticateUser(request: Request): Promise<string | null> {
  const testAuthHeader = request.headers.get('x-test-user-id')
  const allowTestMode = process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true'

  // Test mode: accept x-test-user-id header
  if (testAuthHeader && allowTestMode) {
    console.log('[AUTH] Test mode authentication via x-test-user-id:', testAuthHeader)
    return testAuthHeader
  }

  // Production mode: use Clerk authentication
  try {
    const auth_result = await auth()
    const userId = auth_result.userId

    if (userId) {
      console.log('[AUTH] Clerk authentication successful:', userId)
      return userId
    }

    // If no userId but request has x-test-user-id, allow it if test mode is enabled
    if (testAuthHeader && allowTestMode) {
      console.log('[AUTH] Test mode fallback via x-test-user-id')
      return testAuthHeader
    }

    console.log('[AUTH] Clerk auth() returned no userId, test mode not available')
    return null
  } catch (error) {
    console.error('[AUTH] Clerk auth error:', error)

    // Fallback to test mode if enabled
    if (testAuthHeader && allowTestMode) {
      console.log('[AUTH] Test mode fallback after auth error')
      return testAuthHeader
    }

    return null
  }
}

/**
 * Check idempotency cache
 */
function checkIdempotencyCache(idempotencyKey: string | null): { url: string; sessionId: string } | null {
  if (!idempotencyKey) {
    return null
  }

  if (idempotencyCache.has(idempotencyKey)) {
    const cached = idempotencyCache.get(idempotencyKey)!
    console.log('[IDEMPOTENCY] Cache hit for key:', idempotencyKey)
    return cached
  }

  return null
}

/**
 * Cache idempotency result
 */
function cacheIdempotencyResult(idempotencyKey: string | null, url: string, sessionId: string): void {
  if (!idempotencyKey) {
    return
  }

  // Always cache in memory for idempotency
  // In production, this is ephemeral but still useful for immediate duplicate detection
  idempotencyCache.set(idempotencyKey, { url, sessionId })
  console.log('[IDEMPOTENCY] Cached result for key:', idempotencyKey, 'sessionId:', sessionId)

  // Optional: Add cleanup for old cache entries after 1 hour
  // This prevents memory leaks in long-running servers
  if (idempotencyCache.size > 1000) {
    console.warn('[IDEMPOTENCY] Cache size exceeds 1000 entries, consider cleanup')
  }
}

// ============================================================================
// WORKSPACE HELPERS
// ============================================================================

/**
 * Fetch workspace (supports test mode)
 */
async function fetchWorkspace(
  workspaceId: string,
  isTestMode: boolean
): Promise<WorkspaceData | null> {
  if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
    if (workspaceId === 'test_workspace_001') {
      return {
        name: 'Test Workspace',
        slug: 'test-workspace',
        paymentsStatus: 'active',
        stripeAccountId: 'acct_test123',
      }
    }
    return null
  }

  return await convex.query(api.platform.workspaces.getWorkspace, {
    workspaceId: workspaceId as Id<'workspaces'>,
  })
}

/**
 * Build checkout URLs
 */
function buildCheckoutUrls(
  body: CheckoutRequest,
  workspace: WorkspaceData,
  itemType: ItemType,
  origin: string
): { successUrl: string; cancelUrl: string } {
  const defaultSuccessUrl =
    `${origin}/_t/${workspace.slug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
  const defaultCancelUrl =
    `${origin}/_t/${workspace.slug}/${itemType === 'track' ? 'beats' : 'services'}/${body.itemId}`

  const successUrl = validateCheckoutRedirect(body.successUrl, defaultSuccessUrl, origin)
  const cancelUrl = validateCheckoutRedirect(body.cancelUrl, defaultCancelUrl, origin)

  return { successUrl, cancelUrl }
}

function normalizeIdempotencyKey(value: string | null): string | null {
  if (value === null) return null

  const normalized = value.trim()
  if (
    normalized.length === 0 ||
    normalized.length > 255 ||
    !/^[\x21-\x7E]+$/.test(normalized)
  ) {
    throw new Error('Invalid Idempotency-Key header')
  }

  return normalized
}

function validateCheckoutRedirect(
  candidate: string | undefined,
  fallback: string,
  origin: string
): string {
  if (!candidate) return fallback

  const resolved = new URL(candidate, origin)
  if (resolved.origin !== new URL(origin).origin) {
    throw new Error('Checkout redirect URLs must stay on this site')
  }

  return resolved.toString()
}

/**
 * Build metadata for webhook
 */
async function buildMetadata(
  workspaceId: string,
  itemType: ItemType,
  itemId: string,
  userId: string,
  itemData: ItemData,
  connectedAccountId: string,
  licenseTier?: LicenseTier
): Promise<Record<string, string>> {
  const fulfillmentSecret =
    process.env.CHECKOUT_FULFILLMENT_SECRET ??
    process.env.STRIPE_CONNECT_WEBHOOK_SECRET
  if (!fulfillmentSecret) {
    throw new Error('Checkout fulfillment signing is not configured')
  }

  const fulfillmentFields = {
    workspaceId,
    itemType,
    itemId,
    licenseTier: licenseTier ?? '',
    buyerClerkUserId: userId,
    expectedAmountCents: itemData.priceInCents,
    currency: itemData.currency,
    connectedAccountId,
  }
  const fulfillmentSignature = await signCheckoutFulfillment(
    fulfillmentSecret,
    fulfillmentFields
  )

  const metadata: Record<string, string> = {
    workspaceId,
    itemType,
    itemId,
    buyerClerkUserId: userId,
    expectedAmountCents: String(itemData.priceInCents),
    expectedCurrency: itemData.currency,
    connectedAccountId,
    fulfillmentSignature,
  }

  if (licenseTier) {
    metadata.licenseTier = licenseTier
  }

  return metadata
}

/**
 * Process checkout request (validation + data fetching)
 */
async function processCheckoutRequest(
  body: CheckoutRequest,
  userId: string,
  isTestMode: boolean,
  startTime: number,
  origin: string
): Promise<{
  workspace: WorkspaceData
  itemData: ItemData
  metadata: Record<string, string>
  successUrl: string
  cancelUrl: string
} | NextResponse> {
  const { workspaceId, itemType, itemId, licenseTier } = body

  // Log attempt
  logCheckoutAttempt({
    userId,
    workspaceId,
    itemType,
    itemId,
    licenseTier,
    startTime,
  })

  // Fetch workspace
  const workspace = await fetchWorkspace(workspaceId, isTestMode)

  if (!workspace) {
    logCheckoutFailure({
      userId,
      workspaceId,
      itemType,
      itemId,
      errorCode: 'WORKSPACE_NOT_FOUND',
      errorMessage: 'Workspace not found',
      duration: Date.now() - startTime,
    })
    return NextResponse.json({ error: 'Workspace not found' }, { status: 404 })
  }

  // Validate payments configuration
  const paymentsValidation = validatePaymentsConfiguration(workspace)

  if (!paymentsValidation.valid) {
    logCheckoutFailure({
      userId,
      workspaceId,
      itemType,
      itemId,
      errorCode: 'PAYMENTS_NOT_CONFIGURED',
      errorMessage: paymentsValidation.error || 'Payments not configured',
      duration: Date.now() - startTime,
    })
    return NextResponse.json(
      {
        error: 'Payments not configured',
        message: paymentsValidation.error,
      },
      { status: 400 }
    )
  }

  // Fetch item data
  const itemData =
    itemType === 'track'
      ? await getTrackItemData(itemId, licenseTier!, isTestMode, workspaceId)
      : await getServiceItemData(itemId, workspaceId, isTestMode)

  // Build metadata and URLs
  const metadata = await buildMetadata(
    workspaceId,
    itemType,
    itemId,
    userId,
    itemData,
    workspace.stripeAccountId!,
    licenseTier
  )
  const { successUrl, cancelUrl } = buildCheckoutUrls(body, workspace, itemType, origin)

  return { workspace, itemData, metadata, successUrl, cancelUrl }
}

/**
 * Create or mock Stripe session
 */
async function createOrMockStripeSession(
  isTestMode: boolean,
  workspace: WorkspaceData,
  itemData: ItemData,
  metadata: Record<string, string>,
  successUrl: string,
  cancelUrl: string,
  idempotencyKey: string | null
): Promise<Stripe.Checkout.Session> {
  if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
    return {
      id: `cs_test_${Date.now()}`,
      url: `https://checkout.stripe.com/test/${Date.now()}`,
    } as Stripe.Checkout.Session
  }

  return await createCheckoutSession(
    {
      name: workspace.name,
      slug: workspace.slug,
      stripeAccountId: workspace.stripeAccountId!,
    },
    itemData,
    metadata,
    successUrl,
    cancelUrl,
    idempotencyKey
  )
}

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

/**
 * Handle Stripe errors
 */
function handleStripeError(
  error: Error & { code?: string; stack?: string },
  userId: string | undefined,
  workspaceId: string | undefined,
  itemType: ItemType | undefined,
  itemId: string | undefined,
  duration: number
): NextResponse {
  logCheckoutFailure({
    userId,
    workspaceId,
    itemType,
    itemId,
    errorCode: error.code || 'STRIPE_ERROR',
    errorMessage: error.message,
    duration,
    stack: error.stack,
  })
  return NextResponse.json(
    {
      error: 'Payment processing error',
      message: error.message,
    },
    { status: 400 }
  )
}

/**
 * Handle validation errors
 */
function handleValidationError(
  error: Error,
  userId: string | undefined,
  workspaceId: string | undefined,
  itemType: ItemType | undefined,
  itemId: string | undefined,
  duration: number
): NextResponse {
  logCheckoutFailure({
    userId,
    workspaceId,
    itemType,
    itemId,
    errorCode: 'VALIDATION_ERROR',
    errorMessage: error.message,
    duration,
    stack: error.stack,
  })
  return NextResponse.json({ error: error.message }, { status: 400 })
}

/**
 * Handle generic errors
 */
function handleGenericError(
  userId: string | undefined,
  workspaceId: string | undefined,
  itemType: ItemType | undefined,
  itemId: string | undefined,
  duration: number
): NextResponse {
  logCheckoutFailure({
    userId,
    workspaceId,
    itemType,
    itemId,
    errorCode: 'INTERNAL_SERVER_ERROR',
    errorMessage: 'Failed to create checkout session',
    duration,
  })
  return NextResponse.json(
    { error: 'Failed to create checkout session' },
    { status: 500 }
  )
}

// ============================================================================
// POST /api/stripe/checkout
// ============================================================================

export async function POST(request: Request) {
  const startTime = Date.now()
  let userId: string | undefined
  let workspaceId: string | undefined
  let itemType: ItemType | undefined
  let itemId: string | undefined

  try {
    const idempotencyKey = normalizeIdempotencyKey(
      request.headers.get('Idempotency-Key')
    )

    const authenticatedUserId = await authenticateUser(request)
    if (!authenticatedUserId) {
      return handleAuthenticationFailure(startTime)
    }
    userId = authenticatedUserId

    const body: CheckoutRequest = await request.json()
    const validation = validateCheckoutRequest(body)
    if (!validation.valid) {
      return handleValidationFailure(userId, validation.error, startTime)
    }

    const scopedCacheKey = idempotencyKey
      ? [
          userId,
          idempotencyKey,
          body.workspaceId,
          body.itemType,
          body.itemId,
          body.licenseTier ?? '',
        ].join(':')
      : null
    const cachedResult = checkIdempotencyCache(scopedCacheKey)
    if (cachedResult) {
      return NextResponse.json(cachedResult)
    }

    workspaceId = body.workspaceId
    itemType = body.itemType
    itemId = body.itemId

    const isTestMode = !!request.headers.get('x-test-user-id')
    const result = await processCheckoutRequest(body, userId, isTestMode, startTime, getAppOrigin(request))

    if (result instanceof NextResponse) {
      return result
    }

    const { workspace, itemData, metadata, successUrl, cancelUrl } = result

    const session = await createOrMockStripeSession(
      isTestMode,
      workspace,
      itemData,
      metadata,
      successUrl,
      cancelUrl,
      idempotencyKey
    )

    const duration = Date.now() - startTime
    logCheckoutSuccess({
      userId,
      workspaceId,
      sessionId: session.id,
      itemType,
      itemId,
      priceInCents: itemData.priceInCents,
      currency: itemData.currency,
      duration,
    })

    const phClient = getPostHogClient()
    if (phClient && userId) {
      phClient.capture({
        distinctId: userId,
        event: 'checkout_session_created',
        properties: {
          item_type: itemType,
          item_id: itemId,
          workspace_id: workspaceId,
          license_tier: body.licenseTier,
          amount_cents: itemData.priceInCents,
          currency: itemData.currency,
          stripe_session_id: session.id,
        },
      })
      await phClient.flush()
    }

    cacheIdempotencyResult(scopedCacheKey, session.url!, session.id)

    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    return handlePostError(error, userId, workspaceId, itemType, itemId, startTime)
  }
}

function handleAuthenticationFailure(startTime: number): NextResponse {
  logCheckoutFailure({
    errorCode: 'UNAUTHORIZED',
    errorMessage: 'User not authenticated',
    duration: Date.now() - startTime,
  })
  return NextResponse.json(
    { error: 'Unauthorized. Please sign in to make a purchase.' },
    { status: 401 }
  )
}

function handleValidationFailure(
  userId: string,
  error: string | undefined,
  startTime: number
): NextResponse {
  logCheckoutFailure({
    userId,
    errorCode: 'VALIDATION_FAILED',
    errorMessage: error || 'Invalid checkout request',
    duration: Date.now() - startTime,
  })
  return NextResponse.json({ error }, { status: 400 })
}

function handlePostError(
  error: unknown,
  userId: string | undefined,
  workspaceId: string | undefined,
  itemType: ItemType | undefined,
  itemId: string | undefined,
  startTime: number
): NextResponse {
  const duration = Date.now() - startTime
  console.error('Stripe checkout error:', error)

  if (error && typeof error === 'object' && 'code' in error) {
    return handleStripeError(error as Error & { code?: string }, userId, workspaceId, itemType, itemId, duration)
  }

  if (error instanceof Error) {
    return handleValidationError(error, userId, workspaceId, itemType, itemId, duration)
  }

  return handleGenericError(userId, workspaceId, itemType, itemId, duration)
}
