import { CONVEX_CONFIG } from '@/lib/env'
import { ConvexHttpClient } from 'convex/browser'
import { NextRequest, NextResponse } from 'next/server'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

const convex = new ConvexHttpClient(CONVEX_CONFIG.url)

function optionalString(value: unknown, maxLength = 120): string | undefined {
  return typeof value === 'string' && value.length > 0
    ? value.slice(0, maxLength)
    : undefined
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, unknown>
    const { type, ...data } = body

    if (type === 'track_view') {
      if (typeof data.trackId !== 'string' || typeof data.workspaceId !== 'string') {
        return NextResponse.json({ error: 'Invalid track view event' }, { status: 400 })
      }
      await convex.mutation(api.modules.analytics.trackView, {
        clerkUserId: optionalString(data.clerkUserId),
        trackId: data.trackId as Id<'tracks'>,
        workspaceId: data.workspaceId as Id<'workspaces'>,
        source: optionalString(data.source),
        referrer: optionalString(data.referrer, 500),
        sessionId: optionalString(data.sessionId),
      })
    } else if (type === 'checkout_funnel') {
      const allowedSteps = [
        'view_checkout',
        'select_license',
        'enter_email',
        'begin_payment',
        'complete_payment',
      ] as const
      if (
        typeof data.workspaceId !== 'string' ||
        typeof data.step !== 'string' ||
        !allowedSteps.includes(data.step as (typeof allowedSteps)[number])
      ) {
        return NextResponse.json({ error: 'Invalid checkout funnel event' }, { status: 400 })
      }
      await convex.mutation(api.modules.analytics.trackCheckoutFunnelStep, {
        clerkUserId: optionalString(data.clerkUserId),
        trackId:
          typeof data.trackId === 'string'
            ? data.trackId as Id<'tracks'>
            : undefined,
        workspaceId: data.workspaceId as Id<'workspaces'>,
        step: data.step as (typeof allowedSteps)[number],
        sessionId: optionalString(data.sessionId),
        amountCents: typeof data.amountCents === 'number' ? data.amountCents : undefined,
      })
    } else if (type === 'search') {
      if (typeof data.query !== 'string' || typeof data.resultsCount !== 'number') {
        return NextResponse.json({ error: 'Invalid search event' }, { status: 400 })
      }
      await convex.mutation(api.modules.analytics.trackSearchQuery, {
        clerkUserId: optionalString(data.clerkUserId),
        query: data.query,
        resultsCount: data.resultsCount,
        sessionId: optionalString(data.sessionId),
      })
    } else if (type === 'growth') {
      const allowedEvents = [
        'landing_view',
        'pricing_view',
        'cta_clicked',
        'signup_view',
      ] as const
      const event = data.event
      const path = data.path
      if (
        typeof event !== 'string' ||
        !allowedEvents.includes(event as (typeof allowedEvents)[number]) ||
        typeof path !== 'string'
      ) {
        return NextResponse.json({ error: 'Invalid growth event' }, { status: 400 })
      }

      const plan = data.plan === 'basic' || data.plan === 'pro' ? data.plan : undefined
      const period =
        data.period === 'month' || data.period === 'annual' ? data.period : undefined
      const role =
        data.role === 'producer' || data.role === 'engineer' || data.role === 'artist'
          ? data.role
          : undefined

      await convex.mutation(api.modules.growth.track, {
        event: event as (typeof allowedEvents)[number],
        path: path.slice(0, 200),
        sessionId: optionalString(data.sessionId),
        plan,
        period,
        role,
        source: optionalString(data.source, 80),
        campaign: optionalString(data.campaign, 80),
      })
    } else {
      return NextResponse.json({ error: 'Unsupported analytics event' }, { status: 400 })
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
