'use client'

/**
 * Subscription Sync Hook
 *
 * Clerk Billing is the source of truth for plans; Convex mirrors it in
 * `providerSubscriptions` so entitlements can be enforced server-side.
 * Webhooks keep that mirror fresh in real time, but a webhook that is not
 * configured (or simply missed) leaves a paying provider looking unsubscribed.
 *
 * This hook reconciles the mirror on mount for billing-sensitive screens.
 * Convex queries are reactive, so any component reading the subscription
 * re-renders as soon as the sync writes.
 */

import { useAction } from 'convex/react'
import { useEffect, useRef, useState } from 'react'
import { api } from 'convex/_generated/api'

interface SubscriptionSyncState {
  /** True while the initial reconciliation is in flight */
  isSyncing: boolean
  /** Error message if the reconciliation failed, otherwise null */
  error: string | null
}

/**
 * Reconcile the signed-in user's subscription from Clerk into Convex.
 *
 * @param enabled - Skip the sync while false (e.g. auth still loading)
 */
export function useSubscriptionSync(enabled = true): SubscriptionSyncState {
  const syncMySubscription = useAction(
    api.platform.billing.clerkBillingSync.syncMySubscription
  )
  const [isSyncing, setIsSyncing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const hasRun = useRef(false)

  useEffect(() => {
    if (!enabled || hasRun.current) return
    hasRun.current = true

    let cancelled = false
    setIsSyncing(true)

    syncMySubscription({})
      .catch((err: unknown) => {
        if (cancelled) return
        // A failed reconciliation must never block the page — the UI simply
        // falls back to whatever Convex already has.
        console.error('Subscription sync failed:', err)
        setError(err instanceof Error ? err.message : 'Subscription sync failed')
      })
      .finally(() => {
        if (!cancelled) setIsSyncing(false)
      })

    return () => {
      cancelled = true
    }
  }, [enabled, syncMySubscription])

  return { isSyncing, error }
}
