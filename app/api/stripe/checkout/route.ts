/**
 * Stripe Checkout API - Artist Purchases
 * 
 * Creates Stripe Checkout Sessions as Direct Charges on provider's connected account.
 * Payments go directly to provider's Stripe account (0% platform fee for MVP).
 * 
 * Requirements: 13.1, 13.2, 13.3, 13.7, 13.8
 */

import { CONVEX_CONFIG, SITE_CONFIG, STRIPE_CONFIG } from '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

// Initialize Stripe with platform secret key
const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2024-12-18.acacia',
})

// Initialize Convex client for server-side queries
const convex = new ConvexHttpClient(CONVEX_CONFIG.url)

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
  licenseTier: 'basic' | 'premium' | 'unlimited'
): Promise<ItemData> {
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
async function getServiceItemData(itemId: string): Promise<ItemData> {
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
  try {
    // 1. Authenticate user (buyer)
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized. Please sign in to make a purchase.' },
        { status: 401 }
      )
    }

    // 2. Parse and validate request body
    const body: CheckoutRequest = await request.json()
    const validation = validateCheckoutRequest(body)
    
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    const { workspaceId, itemType, itemId, licenseTier, successUrl, cancelUrl } = body

    // 3. Fetch workspace data from Convex
    const workspace = await convex.query(api.platform.workspaces.getWorkspace, {
      workspaceId: workspaceId as Id<'workspaces'>,
    })

    if (!workspace) {
      return NextResponse.json(
        { error: 'Workspace not found' },
        { status: 404 }
      )
    }

    // 4. Validate payments configuration
    const paymentsValidation = validatePaymentsConfiguration(workspace)
    
    if (!paymentsValidation.valid) {
      return NextResponse.json(
        { 
          error: 'Payments not configured',
          message: paymentsValidation.error,
        },
        { status: 400 }
      )
    }

    // 5. Fetch item data and calculate price
    const itemData = itemType === 'track'
      ? await getTrackItemData(itemId, licenseTier!)
      : await getServiceItemData(itemId)

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
    const finalSuccessUrl = successUrl || `${SITE_CONFIG.url}/artist?purchase=success`
    const finalCancelUrl = cancelUrl || `${SITE_CONFIG.url}/_t/${workspace.slug}/${itemType === 'track' ? 'beats' : 'services'}/${itemId}`

    // 8. Create Stripe Checkout Session
    const session = await createCheckoutSession(
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

    // 9. Return checkout session URL
    return NextResponse.json({
      url: session.url,
      sessionId: session.id,
    })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    
    // Handle Stripe-specific errors
    if (error instanceof Stripe.errors.StripeError) {
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
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    // Generic error
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
