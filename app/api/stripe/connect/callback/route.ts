/**
 * Stripe Connect OAuth Callback
 * 
 * Handles the OAuth redirect from Stripe after provider completes onboarding.
 * Exchanges authorization code for Stripe account ID and updates workspace.
 * Requirements: 27.1, 27.2, 27.3, 27.5
 */

import { SITE_CONFIG, STRIPE_CONFIG } from '@/lib/env'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2026-03-25.dahlia',
})

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Get authorization code from Stripe
    const code = searchParams.get('code')
    const stateParam = searchParams.get('state')
    const error = searchParams.get('error')
    const errorDescription = searchParams.get('error_description')

    // Handle OAuth errors
    if (error) {
      console.error('Stripe Connect OAuth error:', error, errorDescription)
      return NextResponse.redirect(
        `${SITE_CONFIG.url}/studio?error=stripe_connect_failed&message=${encodeURIComponent(errorDescription || error)}`
      )
    }

    // Validate required parameters
    if (!code || !stateParam) {
      return NextResponse.redirect(
        `${SITE_CONFIG.url}/studio?error=invalid_callback`
      )
    }

    // Decode state parameter
    let state: { workspaceId: string; userId: string }
    try {
      state = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'))
    } catch {
      return NextResponse.redirect(
        `${SITE_CONFIG.url}/studio?error=invalid_state`
      )
    }

    const { workspaceId, userId } = state

    if (!workspaceId || !userId) {
      return NextResponse.redirect(
        `${SITE_CONFIG.url}/studio?error=missing_state_data`
      )
    }

    // Exchange authorization code for Stripe account ID
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code,
    })

    const stripeAccountId = response.stripe_user_id

    if (!stripeAccountId) {
      throw new Error('No stripe_user_id returned from OAuth token exchange')
    }

    // Verify the connected account exists and get its details
    const account = await stripe.accounts.retrieve(stripeAccountId)

    // Determine payments status based on account details
    // Standard accounts need to complete onboarding before they can accept payments
    let paymentsStatus: 'pending' | 'active' = 'pending'
    
    if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
      paymentsStatus = 'active'
    }

    // Update workspace with Stripe account ID and payments status
    await convex.mutation(api.platform.workspaces.updateWorkspaceStripeAccount, {
      workspaceId: workspaceId as Id<'workspaces'>,
      stripeAccountId,
      paymentsStatus,
    })

    // Record "payments_connected" event
    await convex.mutation(api.platform.events.recordEvent, {
      workspaceId: workspaceId as Id<'workspaces'>,
      type: 'payments_connected',
      meta: {
        stripeAccountId,
        paymentsStatus,
        accountType: account.type,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      },
    })

    // Record "onboarding_completed" event if provider is fully activated
    if (paymentsStatus === 'active') {
      await convex.mutation(api.platform.events.recordEvent, {
        workspaceId: workspaceId as Id<'workspaces'>,
        type: 'onboarding_completed',
        meta: {
          stripeAccountId,
          accountType: account.type,
          completedAt: new Date().toISOString(),
        },
      })
    }

    // Redirect to studio with success message
    return NextResponse.redirect(
      `${SITE_CONFIG.url}/studio?success=stripe_connected&status=${paymentsStatus}`
    )
  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    
    // Redirect to studio with error
    return NextResponse.redirect(
      `${SITE_CONFIG.url}/studio?error=stripe_connect_callback_failed`
    )
  }
}
