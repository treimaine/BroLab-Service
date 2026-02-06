/**
 * Stripe Connect OAuth Initiation
 * 
 * Redirects provider to Stripe Connect OAuth flow for Standard account onboarding.
 * Requirements: 27.1, 27.2
 */

import { getStripeConnectOAuthUrl, SITE_CONFIG } from '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    // Authenticate user
    const { userId } = await auth()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get workspace ID from query params
    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')
    
    if (!workspaceId) {
      return NextResponse.json(
        { error: 'Missing workspaceId parameter' },
        { status: 400 }
      )
    }

    // Build redirect URI (callback endpoint)
    const redirectUri = `${SITE_CONFIG.url}/api/stripe/connect/callback`

    // Build OAuth URL with state parameter (contains workspaceId)
    const state = Buffer.from(
      JSON.stringify({ workspaceId, userId })
    ).toString('base64')

    const oauthUrl = getStripeConnectOAuthUrl(redirectUri)
    const urlWithState = `${oauthUrl}&state=${encodeURIComponent(state)}`

    // Redirect to Stripe Connect OAuth
    return NextResponse.redirect(urlWithState)
  } catch (error) {
    console.error('Stripe Connect OAuth initiation error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate Stripe Connect onboarding' },
      { status: 500 }
    )
  }
}
