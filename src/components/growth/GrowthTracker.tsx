'use client'

import { useEffect } from 'react'

interface GrowthTrackerProps {
  viewEvent: 'landing_view' | 'pricing_view' | 'signup_view'
}

interface GrowthEventPayload {
  event: 'landing_view' | 'pricing_view' | 'cta_clicked' | 'signup_view'
  path: string
  sessionId?: string
  plan?: 'basic' | 'pro'
  period?: 'month' | 'annual'
  role?: 'producer' | 'engineer' | 'artist'
  source?: string
  campaign?: string
}

const SESSION_KEY = 'brolab_growth_session'

function getSessionId(): string {
  const existingSessionId = window.localStorage.getItem(SESSION_KEY)
  if (existingSessionId) return existingSessionId

  const sessionId = crypto.randomUUID()
  window.localStorage.setItem(SESSION_KEY, sessionId)
  return sessionId
}

function getOptionalValue<T extends string>(
  value: string | null,
  allowedValues: readonly T[]
): T | undefined {
  return value && allowedValues.includes(value as T) ? (value as T) : undefined
}

function sendGrowthEvent(event: GrowthEventPayload['event'], target?: HTMLElement) {
  const url = new URL(window.location.href)
  const targetUrl = target?.closest<HTMLAnchorElement>('a')?.href
  const targetSearchParams = targetUrl
    ? new URL(targetUrl, window.location.origin).searchParams
    : url.searchParams

  const payload: GrowthEventPayload = {
    event,
    path: url.pathname,
    sessionId: getSessionId(),
    plan: getOptionalValue(targetSearchParams.get('plan'), ['basic', 'pro']),
    period: getOptionalValue(targetSearchParams.get('period'), ['month', 'annual']),
    role: getOptionalValue(targetSearchParams.get('role'), [
      'producer',
      'engineer',
      'artist',
    ]),
    source: targetSearchParams.get('source')?.slice(0, 80) || undefined,
    campaign: targetSearchParams.get('campaign')?.slice(0, 80) || undefined,
  }

  const body = JSON.stringify({ type: 'growth', ...payload })
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/analytics/track', new Blob([body], { type: 'application/json' }))
    return
  }

  void fetch('/api/analytics/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true,
  })
}

export function GrowthTracker({ viewEvent }: Readonly<GrowthTrackerProps>) {
  useEffect(() => {
    sendGrowthEvent(viewEvent)

    function handleClick(event: MouseEvent) {
      const target = event.target
      if (!(target instanceof HTMLElement)) return
      if (!target.closest('[data-growth-cta]')) return
      sendGrowthEvent('cta_clicked', target)
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [viewEvent])

  return null
}
