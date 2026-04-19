/**
 * Stripe Checkout API - Artist Purchases
 * 
 * Creates Stripe Checkout Sessions as Direct Charges on provider's connected account.
 * Payments go directly to provider's Stripe account (0% platform fee for MVP).
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.7, 13.8
 */

import { CONVEX_CONFIG, SITE_CONFIG, STRIPE_CONFIG } from '@/lib/env'
import {
  logCheckoutAttempt,
  logCheckoutFailure,
  logCheckoutSuccess,
} from '@/lib/monitoring'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

// Initialize Stripe with platform secret key
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2026-03-25.dahlia',
})

// Initialize Convex client for server-side queries
const convex = new ConvexHttpClient(CONVEX_CONFIG.url)

// Simple in-memory idempotency cache for test mode
const idempotencyCache = new Map<string, { url: string; sessionId: string }>()

// ============================================================================
// REQUEST TYPES
// ============================================================================

interface CheckoutRequest {
  workspaceId: string
  itemType: 'track' | 'service'
  itemId: string
  licenseTier?: 'basic' | 'premium' | 'unlimited' // Required for tracks
  successUrl?: string
  cancelUrl?: string
}

interface ItemData {
  name: string
  priceInCents: number
  currency: string
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Validate checkout request body
 */
function validateCheckoutRequest(body: CheckoutRequest): { valid: boolean; error?: string } {
  const { workspaceId, itemType, itemId, licenseTier } = body

  if (!workspaceId || !itemType || !itemId) {
    return { valid: false, error: 'Missing required fields: workspaceId, itemType, itemId' }
  }

  if (itemType === 'track' && !licenseTier) {
    return { valid: false, error: 'licenseTier is required for track purchases' }
  }

  return { valid: true }
}

/**
 * Validate workspace payments configuration
 */
function validatePaymentsConfiguration(workspace: {
  paymentsStatus: string
  stripeAccountId?: string
  [key: string]: any // Allow additional properties from Convex
}): { valid: boolean; error?: string } {
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
  licenseTier: 'basic' | 'premium' | 'unlimited',
  isTestMode?: boolean
): Promise<ItemData> {
  if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
    // Test mode: Return mock track data
    const mockPrices = {
      basic: 29.99,
      premium: 49.99,
      unlimited: 99.99,
    }
    const tierPrice = mockPrices[licenseTier]
    return {
      name: `Test Beat - ${licenseTier.charAt(0).toUpperCase() + licenseTier.slice(1)} License`,
      priceInCents: Math.round(tierPrice * 100),
      currency: 'usd',
    }
  }

  const track = await convex.query(api.modules.beats.getTrack, {
    trackId: itemId as Id<'tracks'>,
  })

  if (!track) {
    throw new Error('Track not found')
  }

  if (track.status !== 'published') {
    throw new Error('Track is not available for purchase')
  }

  const tierPrice = track.priceUsdByTier[licenseTier]
  if (tierPrice === undefined) {
    throw new Error(`Invalid license tier: ${licenseTier}`)
  }

  const itemName = `${track.title} - ${licenseTier.charAt(0).toUpperCase() + licenseTier.slice(1)} License`
  const priceInCents = Math.round(tierPrice * 100)

  return {
    name: itemName,
    priceInCents,
    currency: 'usd',
  }
}

/**
 * Fetch service data and calculate price
 */
async function getServiceItemData(itemId: string, isTestMode?: boolean): Promise<ItemData> {
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

  if (!service.isActive) {
    throw new Error('Service is not available for booking')
  }

  return {
    name: service.title,
    priceInCents: Math.round(service.priceUSD * 100),
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
  cancelUrl: string
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
      payment_intent_data: {
        application_fee_amount: 0, // 0% platform fee for MVP
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: undefined, // Stripe will prompt for email
    },
    {
      stripeAccount: workspace.stripeAccountId, // Direct Charge on connected account
    }
  )
}

// ============================================================================
// POST /api/stripe/checkout
// ============================================================================

export async function POST(request: Request) {
  const startTime = Date.now()
  let userId: string | undefined
  let workspaceId: string | undefined
  let itemType: string | undefined
  let itemId: string | undefined
  let licenseTier: string | undefined

  try {
    // 0. Check idempotency key in test mode
    const idempotencyKey = request.headers.get('Idempotency-Key')
    if (idempotencyKey && idempotencyCache.has(idempotencyKey)) {
      const cached = idempotencyCache.get(idempotencyKey)!
      return NextResponse.json({
        url: cached.url,
        sessionId: cached.sessionId,
      })
    }

    // 1. Authenticate user (buyer)
    // Support test mode: check for test authorization header
    const testAuthHeader = request.headers.get('x-test-user-id')
    if (testAuthHeader && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
      userId = testAuthHeader
    } else {
      const auth_result = await auth()
      userId = auth_result.userId ?? undefined
    }

    if (!userId) {
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

    // 2. Parse and validate request body
    const body: CheckoutRequest = await request.json()
    const validation = validateCheckoutRequest(body)

    if (!validation.valid) {
      logCheckoutFailure({
        userId,
        errorCode: 'VALIDATION_FAILED',
        errorMessage: validation.error || 'Invalid checkout request',
        duration: Date.now() - startTime,
      })
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    workspaceId = body.workspaceId
    itemType = body.itemType
    itemId = body.itemId
    licenseTier = body.licenseTier

    // Log attempt
    logCheckoutAttempt({
      userId,
      workspaceId,
      itemType: itemType as 'track' | 'service',
      itemId,
      licenseTier: licenseTier as 'basic' | 'premium' | 'unlimited' | undefined,
      startTime,
    })

    // 3. Fetch workspace data from Convex
    // In test mode, allow using test IDs but still validate they're expected test IDs
    let workspace
    const isTestMode = request.headers.get('x-test-user-id')

    if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
      // Test mode: Validate it's a recognized test workspace ID
      if (workspaceId === 'test_workspace_001') {
        workspace = {
          name: 'Test Workspace',
          slug: 'test-workspace',
          paymentsStatus: 'active' as const,
          stripeAccountId: 'acct_test123',
        }
      } else {
        // Invalid test workspace ID
        workspace = null
      }
    } else {
      workspace = await convex.query(api.platform.workspaces.getWorkspace, {
        workspaceId: workspaceId as Id<'workspaces'>,
      })
    }

    if (!workspace) {
      logCheckoutFailure({
        userId,
        workspaceId,
        itemType: itemType as 'track' | 'service' | undefined,
        itemId,
        errorCode: 'WORKSPACE_NOT_FOUND',
        errorMessage: 'Workspace not found',
        duration: Date.now() - startTime,
      })
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // 4. Validate payments configuration
    const paymentsValidation = validatePaymentsConfiguration(workspace)

    if (!paymentsValidation.valid) {
      logCheckoutFailure({
        userId,
        workspaceId,
        itemType: itemType as 'track' | 'service' | undefined,
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

    // 5. Fetch item data and calculate price
    const isTestModeBoolean = !!isTestMode
    const itemData = itemType === 'track'
      ? await getTrackItemData(itemId, licenseTier as 'basic' | 'premium' | 'unlimited', isTestModeBoolean)
      : await getServiceItemData(itemId, isTestModeBoolean)

    // 6. Build metadata for webhook processing
    const metadata: Record<string, string> = {
      workspaceId,
      itemType,
      itemId,
      buyerClerkUserId: userId,
    }

    if (licenseTier) {
      metadata.licenseTier = licenseTier
    }

    // 7. Build success/cancel URLs
    const finalSuccessUrl =
      body.successUrl ||
      `${SITE_CONFIG.url}/_t/${workspace.slug}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const finalCancelUrl = body.cancelUrl || `${SITE_CONFIG.url}/_t/${workspace.slug}/${itemType === 'track' ? 'beats' : 'services'}/${itemId}`

    // 8. Create Stripe Checkout Session
    // In test mode, create a mock session
    let session: Stripe.Checkout.Session
    if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
      // Test mode: Return mock Stripe session
      session = {
        id: `cs_test_${Date.now()}`,
        url: `https://checkout.stripe.com/test/${Date.now()}`,
      } as Stripe.Checkout.Session
    } else {
      session = await createCheckoutSession(
        {
          name: workspace.name,
          slug: workspace.slug,
          stripeAccountId: workspace.stripeAccountId!, // Already validated in step 4
        },
        itemData,
        metadata,
        finalSuccessUrl,
        finalCancelUrl
      )
    }

    // Log success
    const duration = Date.now() - startTime
    logCheckoutSuccess({
      userId,
      workspaceId,
      sessionId: session.id,
      itemType: itemType as 'track' | 'service',
      itemId,
      priceInCents: itemData.priceInCents,
      currency: itemData.currency,
      duration,
    })

    // 9. Cache idempotency key in test mode
    if (idempotencyKey && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
      idempotencyCache.set(idempotencyKey, {
        url: session.url!,
        sessionId: session.id,
      })
    }

    // 10. Return checkout session URL
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('Stripe checkout error:', error)

    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
      logCheckoutFailure({
        userId,
        workspaceId,
        itemType: itemType as 'track' | 'service' | undefined,
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

    // Handle validation errors from helper functions
    if (error instanceof Error) {
      logCheckoutFailure({
        userId,
        workspaceId,
        itemType: itemType as 'track' | 'service' | undefined,
        itemId,
        errorCode: 'VALIDATION_ERROR',
        errorMessage: error.message,
        duration,
        stack: error.stack,
      })
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Generic error
    logCheckoutFailure({
      userId,
      workspaceId,
      itemType: itemType as 'track' | 'service' | undefined,
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
}
