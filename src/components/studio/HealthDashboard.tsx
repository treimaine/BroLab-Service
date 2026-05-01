'use client'

/**
 * Health Dashboard Component
 *
 * Displays operational metrics for platform health monitoring.
 * Shows onboarding completion, payment activation, and recent events.
 */

import { useQuery } from 'convex/react'
import { api } from 'convex/_generated/api'

export function HealthDashboard() {
  // Fetch recent events for health monitoring
  const recentEvents = useQuery(api.platform.events.getRecentEvents, { limit: 50 })

  if (recentEvents === undefined) {
    return (
      <div className="grid gap-6">
        <MetricCardSkeleton />
        <MetricCardSkeleton />
        <MetricCardSkeleton />
      </div>
    )
  }

  // Calculate metrics
  const onboardingCompletedCount = recentEvents.filter(
    (e) => e.type === 'onboarding_completed'
  ).length

  const paymentsConnectedCount = recentEvents.filter(
    (e) => e.type === 'payments_connected'
  ).length

  const checkoutSuccessCount = recentEvents.filter(
    (e) => e.type === 'checkout_success'
  ).length

  const checkoutFailedCount = recentEvents.filter(
    (e) => e.type === 'checkout_failed'
  ).length

  const previewFailedCount = recentEvents.filter(
    (e) => e.type === 'preview_failed'
  ).length

  const licensePdfFailedCount = recentEvents.filter(
    (e) => e.type === 'license_pdf_failed'
  ).length

  const activationRate =
    paymentsConnectedCount > 0
      ? Math.round((onboardingCompletedCount / paymentsConnectedCount) * 100)
      : 0

  const checkoutSuccessRate =
    checkoutSuccessCount + checkoutFailedCount > 0
      ? Math.round(
          (checkoutSuccessCount / (checkoutSuccessCount + checkoutFailedCount)) * 100
        )
      : 0

  // Helper functions for status determination
  const getActivationStatus = (rate: number): 'success' | 'warning' | 'error' => {
    if (rate >= 80) return 'success'
    if (rate >= 50) return 'warning'
    return 'error'
  }

  const getCheckoutStatus = (rate: number): 'success' | 'warning' | 'error' => {
    if (rate >= 90) return 'success'
    if (rate >= 70) return 'warning'
    return 'error'
  }

  const getOnboardingStatus = (count: number): 'success' | 'neutral' => {
    return count > 0 ? 'success' : 'neutral'
  }

  const getPaymentsStatus = (count: number): 'success' | 'warning' => {
    return count > 0 ? 'success' : 'warning'
  }

  return (
    <div className="space-y-8">
      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Onboarding Completed"
          value={onboardingCompletedCount}
          description="Providers fully activated"
          status={getOnboardingStatus(onboardingCompletedCount)}
        />

        <MetricCard
          title="Payments Connected"
          value={paymentsConnectedCount}
          description="Stripe accounts linked"
          status={getPaymentsStatus(paymentsConnectedCount)}
        />

        <MetricCard
          title="Activation Rate"
          value={`${activationRate}%`}
          description="Connected → Active"
          status={getActivationStatus(activationRate)}
        />

        <MetricCard
          title="Checkout Success Rate"
          value={`${checkoutSuccessRate}%`}
          description={`${checkoutSuccessCount} successful`}
          status={getCheckoutStatus(checkoutSuccessRate)}
        />
      </div>

      {/* Failure Alerts */}
      {(checkoutFailedCount > 0 || previewFailedCount > 0 || licensePdfFailedCount > 0) && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6">
          <h3 className="text-lg font-semibold mb-4 text-destructive">⚠️ Recent Failures</h3>
          <div className="grid gap-3 md:grid-cols-3">
            {checkoutFailedCount > 0 && (
              <FailureAlert title="Checkout Failures" count={checkoutFailedCount} />
            )}
            {previewFailedCount > 0 && (
              <FailureAlert title="Preview Generation" count={previewFailedCount} />
            )}
            {licensePdfFailedCount > 0 && (
              <FailureAlert title="License PDF" count={licensePdfFailedCount} />
            )}
          </div>
        </div>
      )}

      {/* Recent Events Timeline */}
      <div className="rounded-lg border p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-3 max-h-[400px] overflow-y-auto">
          {recentEvents.slice(0, 20).map((event) => (
            <EventRow key={event._id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  readonly title: string
  readonly value: string | number
  readonly description: string
  readonly status: 'success' | 'warning' | 'error' | 'neutral'
}

function MetricCard({ title, value, description, status }: MetricCardProps) {
  const statusColors = {
    success: 'border-green-500/50 bg-green-500/10',
    warning: 'border-yellow-500/50 bg-yellow-500/10',
    error: 'border-red-500/50 bg-red-500/10',
    neutral: 'border-border bg-card',
  }

  return (
    <div className={`rounded-lg border p-6 ${statusColors[status]}`}>
      <h3 className="text-sm font-medium text-muted-foreground mb-2">{title}</h3>
      <div className="text-3xl font-bold mb-1">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  )
}

function MetricCardSkeleton() {
  return (
    <div className="rounded-lg border p-6 animate-pulse">
      <div className="h-4 bg-muted rounded w-1/2 mb-2" />
      <div className="h-8 bg-muted rounded w-1/3 mb-1" />
      <div className="h-3 bg-muted rounded w-2/3" />
    </div>
  )
}

interface FailureAlertProps {
  readonly title: string
  readonly count: number
}

function FailureAlert({ title, count }: FailureAlertProps) {
  return (
    <div className="flex items-center justify-between p-3 rounded bg-background/50">
      <span className="text-sm font-medium">{title}</span>
      <span className="text-sm font-bold text-destructive">{count}</span>
    </div>
  )
}

interface EventData {
  readonly _id: string
  readonly _creationTime: number
  readonly type: string
  readonly meta?: Record<string, unknown>
}

interface EventRowProps {
  readonly event: EventData
}

function EventRow({ event }: EventRowProps) {
  const eventIcons: Record<string, string> = {
    onboarding_completed: '✅',
    payments_connected: '🔗',
    checkout_success: '💰',
    checkout_failed: '❌',
    preview_generated: '🎵',
    preview_failed: '⚠️',
    license_pdf_generated: '📄',
    license_pdf_failed: '⚠️',
    workspace_created: '🏪',
    subscription_activated: '📦',
  }

  const icon = eventIcons[event.type] || '•'
  const timestamp = new Date(event._creationTime).toLocaleString()

  return (
    <div className="flex items-start gap-3 p-3 rounded hover:bg-muted/50 transition-colors">
      <span className="text-lg">{icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-sm font-medium">{formatEventType(event.type)}</span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        {event.meta && Object.keys(event.meta).length > 0 && (
          <div className="text-xs text-muted-foreground mt-1 truncate">
            {formatMetadata(event.meta)}
          </div>
        )}
      </div>
    </div>
  )
}

function formatEventType(type: string): string {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

function formatMetadata(meta: Record<string, unknown>): string {
  const keys = Object.keys(meta).slice(0, 3)
  return keys
    .map((key) => {
      const value = meta[key]
      if (typeof value === 'boolean') return `${key}: ${value}`
      if (typeof value === 'string' && value.length > 20)
        return `${key}: ${value.substring(0, 20)}...`
      return `${key}: ${value}`
    })
    .join(' • ')
}
