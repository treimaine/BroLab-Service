import { CONVEX_CONFIG } from '@/lib/env'
import { ConvexHttpClient } from 'convex/browser'
import { NextRequest, NextResponse } from 'next/server'
import { api } from '../../../../convex/_generated/api'

const convex = new ConvexHttpClient(CONVEX_CONFIG.url)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, ...data } = body

    if (type === 'track_view') {
      await convex.mutation(api.modules.analytics.trackView, {
        clerkUserId: data.clerkUserId || undefined,
        trackId: data.trackId,
        workspaceId: data.workspaceId,
        source: data.source || undefined,
        referrer: data.referrer || undefined,
        sessionId: data.sessionId || undefined,
      })
    } else if (type === 'checkout_funnel') {
      await convex.mutation(api.modules.analytics.trackCheckoutFunnelStep, {
        clerkUserId: data.clerkUserId || undefined,
        trackId: data.trackId || undefined,
        workspaceId: data.workspaceId,
        step: data.step,
        sessionId: data.sessionId || undefined,
        amountCents: data.amountCents || undefined,
      })
    } else if (type === 'search') {
      await convex.mutation(api.modules.analytics.trackSearchQuery, {
        clerkUserId: data.clerkUserId || undefined,
        query: data.query,
        resultsCount: data.resultsCount,
        sessionId: data.sessionId || undefined,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: 'Analytics API' })
}