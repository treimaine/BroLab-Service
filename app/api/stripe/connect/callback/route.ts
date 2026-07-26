/**
 * Stripe Connect OAuth Callback
 * 
 * Handles the OAuth redirect from Stripe after provider completes onboarding.
 * Exchanges authorization code for Stripe account ID and updates workspace.
 * Requirements: 27.1, 27.2, 27.3, 27.5
 */

import { CONVEX_CONFIG, getAppOrigin } from '@/lib/env'
import { getPostHogClient } from '@/lib/posthog-server'
import { auth } from '@clerk/nextjs/server'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  // Redirect back to the origin the callback was reached on (localhost in dev)
  const origin = getAppOrigin(request)

  try {
    const authResult = await auth()
    if (!authResult.userId) {
      return NextResponse.redirect(`${origin}/sign-in?redirect_url=/studio`)
    }

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
        `${origin}/studio?error=stripe_connect_failed&message=${encodeURIComponent(errorDescription || error)}`
      )
    }

    // Validate required parameters
    if (!code || !stateParam) {
      return NextResponse.redirect(
        `${origin}/studio?error=invalid_callback`
      )
    }

    // Decode state parameter
    let state: { workspaceId: string; userId: string }
    try {
      state = JSON.parse(Buffer.from(stateParam, 'base64').toString('utf-8'))
    } catch {
      return NextResponse.redirect(
        `${origin}/studio?error=invalid_state`
      )
    }

    const { workspaceId, userId } = state

    if (!workspaceId || !userId) {
      return NextResponse.redirect(
        `${origin}/studio?error=missing_state_data`
      )
    }

    if (userId !== authResult.userId) {
      return NextResponse.redirect(`${origin}/studio?error=invalid_state_owner`)
    }

    const convexToken = await authResult.getToken({ template: 'convex' })
    if (!convexToken) {
      return NextResponse.redirect(`${origin}/studio?error=convex_auth_unavailable`)
    }

    const convex = new ConvexHttpClient(CONVEX_CONFIG.url)
    convex.setAuth(convexToken)
    const account = await convex.action(api.platform.stripeConnect.completeOAuth, {
      workspaceId: workspaceId as Id<'workspaces'>,
      code,
    })

    const phClient = getPostHogClient()
    if (phClient) {
      phClient.capture({
        distinctId: userId,
        event: 'stripe_connect_completed',
        properties: {
          workspace_id: workspaceId,
          payments_status: account.paymentsStatus,
          charges_enabled: account.chargesEnabled,
          payouts_enabled: account.payoutsEnabled,
        },
      })
      await phClient.flush()
    }

    // Redirect to studio with success message
    return NextResponse.redirect(
      `${origin}/studio?success=stripe_connected&status=${account.paymentsStatus}`
    )
  } catch (error) {
    console.error('Stripe Connect callback error:', error)
    
    // Redirect to studio with error
    return NextResponse.redirect(
      `${origin}/studio?error=stripe_connect_callback_failed`
    )
  }
}
