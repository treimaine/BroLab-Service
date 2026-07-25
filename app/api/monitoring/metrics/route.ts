import { captureServerEvent, isPostHogConfigured } from '@/lib/posthog-server'
import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

export async function GET(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const isConfigured = isPostHogConfigured()
  return NextResponse.json(
    {
      status: isConfigured ? 'configured' : 'unavailable',
      provider: 'posthog',
      timestamp: Date.now(),
    },
    {
      status: isConfigured ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}

export async function POST(): Promise<NextResponse> {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const delivered = await captureServerEvent('monitoring_probe', userId, {
    probe: true,
    route: '/api/monitoring/metrics',
  })
  return NextResponse.json(
    {
      delivered,
      provider: 'posthog',
      timestamp: Date.now(),
    },
    {
      status: delivered ? 202 : 503,
      headers: {
        'Cache-Control': 'no-store',
      },
    }
  )
}
