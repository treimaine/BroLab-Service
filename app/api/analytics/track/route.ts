import { CONVEX_CONFIG } from '@/lib/env'
import { captureServerEvent } from '@/lib/posthog-server'
import { auth } from '@clerk/nextjs/server'
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
    const { userId } = await auth()
    const body = await request.json() as Record<string, unknown>
    const { type, ...data } = body
    let eventName: string
    let eventProperties: Record<string, unknown>

    if (type === 'track_view') {
      if (typeof data.trackId !== 'string' || typeof data.workspaceId !== 'string') {
        return NextResponse.json({ error: 'Invalid track view event' }, { status: 400 })
      }
      await convex.mutation(api.modules.analytics.trackView, {
        clerkUserId: userId ?? undefined,
        trackId: data.trackId as Id<'tracks'>,
        workspaceId: data.workspaceId as Id<'workspaces'>,
        source: optionalString(data.source),
        referrer: optionalString(data.referrer, 500),
        sessionId: optionalString(data.sessionId),
      })
      eventName = 'track_viewed'
      eventProperties = {
        track_id: data.trackId,
        workspace_id: data.workspaceId,
        source: optionalString(data.source),
      }
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
        clerkUserId: userId ?? undefined,
        trackId:
          typeof data.trackId === 'string'
            ? data.trackId as Id<'tracks'>
            : undefined,
        workspaceId: data.workspaceId as Id<'workspaces'>,
        step: data.step as (typeof allowedSteps)[number],
        sessionId: optionalString(data.sessionId),
        amountCents: typeof data.amountCents === 'number' ? data.amountCents : undefined,
      })
      eventName = 'checkout_funnel_step'
      eventProperties = {
        workspace_id: data.workspaceId,
        track_id: optionalString(data.trackId),
        step: data.step,
        amount_cents: typeof data.amountCents === 'number' ? data.amountCents : undefined,
      }
    } else if (type === 'search') {
      if (typeof data.query !== 'string' || typeof data.resultsCount !== 'number') {
        return NextResponse.json({ error: 'Invalid search event' }, { status: 400 })
      }
      await convex.mutation(api.modules.analytics.trackSearchQuery, {
        clerkUserId: userId ?? undefined,
        query: data.query,
        resultsCount: data.resultsCount,
        sessionId: optionalString(data.sessionId),
      })
      eventName = 'marketplace_searched'
      eventProperties = {
        query_length: data.query.length,
        results_count: data.resultsCount,
      }
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
      eventName = event
      eventProperties = {
        path: path.slice(0, 200),
        plan,
        period,
        role,
        source: optionalString(data.source, 80),
        campaign: optionalString(data.campaign, 80),
      }
    } else {
      return NextResponse.json({ error: 'Unsupported analytics event' }, { status: 400 })
    }

    const sessionId = optionalString(data.sessionId)
    try {
      await captureServerEvent(
        eventName,
        userId ?? (sessionId ? `anonymous:${sessionId}` : `anonymous:${crypto.randomUUID()}`),
        eventProperties,
      )
    } catch (postHogError) {
      console.error('PostHog analytics delivery error:', postHogError)
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
