/**
 * Stripe Connect - Account Onboarding Link
 *
 * For Standard accounts (OAuth), generates an account_link to continue
 * onboarding if the account is pending verification.
 * Requirements: 27.1, 27.2
 */

import { SITE_CONFIG, STRIPE_CONFIG } from '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(STRIPE_CONFIG.secretKey, {
  apiVersion: '2026-06-24.dahlia',
})

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export async function GET(request: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const workspaceId = searchParams.get('workspaceId')

    if (!workspaceId) {
      return NextResponse.json({ error: 'Missing workspaceId' }, { status: 400 })
    }

    const workspace = await convex.query(api.platform.workspaces.getWorkspace, {
      workspaceId: workspaceId as Id<'workspaces'>,
    })

    if (!workspace?.stripeAccountId) {
      return NextResponse.json({ error: 'No Stripe account connected' }, { status: 404 })
    }

    // Standard accounts don't support login links — generate an account_link
    // so the creator can complete their onboarding verification
    const accountLink = await stripe.accountLinks.create({
      account: workspace.stripeAccountId,
      refresh_url: `${SITE_CONFIG.url}/studio/billing`,
      return_url: `${SITE_CONFIG.url}/studio/billing?stripe_onboarding=complete`,
      type: 'account_onboarding',
    })

    return NextResponse.redirect(accountLink.url)
  } catch (error) {
    console.error('Stripe onboarding link error:', error)
    return NextResponse.json({ error: 'Failed to generate onboarding link' }, { status: 500 })
  }
}
