'use client'

/**
 * Studio Dashboard Client Component
 *
 * Main hub for producer/engineer studio.
 * Provides navigation to all studio sub-sections:
 * - Tracks (beats management)
 * - Services (service listings)
 * - Billing (subscription & plan)
 * - Domains (custom domain management)
 *
 * Requirements: 2.3, 19, Task 5.10
 */

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { useUser } from '@clerk/nextjs'
import { api } from 'convex/_generated/api'
import { AuthLoading, Authenticated, Unauthenticated, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle2, CreditCard, ExternalLink, Globe, Loader2, Music, Receipt, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { StudioHeader } from './StudioHeader'

const NAV_ITEMS = [
  {
    href: '/studio/tracks',
    icon: Music,
    label: 'Tracks',
    description: 'Upload and manage your beats',
  },
  {
    href: '/studio/services',
    icon: Wrench,
    label: 'Services',
    description: 'Manage mixing, mastering & more',
  },
  {
    href: '/studio/billing',
    icon: CreditCard,
    label: 'Billing',
    description: 'Subscription & plan details',
  },
  {
    href: '/studio/domains',
    icon: Globe,
    label: 'Domains',
    description: 'Connect a custom domain (PRO)',
  },
]

const EVENT_LABELS: Record<string, string> = {
  checkout_success: 'Checkout completed',
  checkout_failed: 'Checkout failed',
  domain_verified: 'Domain verified',
  domain_verification_failed: 'Domain verification failed',
  license_pdf_generated: 'License generated',
  license_pdf_failed: 'License generation failed',
  payments_connected: 'Stripe connected',
  payments_disconnected: 'Stripe disconnected',
  preview_generated: 'Preview generated',
  preview_failed: 'Preview generation failed',
  subscription_activated: 'Subscription activated',
  subscription_canceled: 'Subscription canceled',
  workspace_created: 'Storefront created',
}

function formatRelativeTime(timestamp: number) {
  const diffMs = Date.now() - timestamp
  const diffMinutes = Math.max(1, Math.floor(diffMs / 60000))

  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    return `${diffHours}h ago`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) {
    return `${diffDays}d ago`
  }

  return new Date(timestamp).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

function getStatusTone(status: 'healthy' | 'warning' | 'idle') {
  if (status === 'healthy') {
    return 'border-green-500/30 bg-green-500/5 text-green-400'
  }
  if (status === 'warning') {
    return 'border-yellow-500/30 bg-yellow-500/5 text-yellow-400'
  }
  return 'border-border bg-[rgb(var(--bg-2)/0.45)] text-muted'
}

export function StudioDashboard() {
  const { user } = useUser()
  const router = useRouter()
  const role = user?.unsafeMetadata?.role as string | undefined

  const workspaces = useQuery(api.platform.workspaces.listUserWorkspaces)
  const workspace = workspaces?.[0]
  const paymentsStatus = workspace?.paymentsStatus
  const recentEvents = useQuery(
    api.platform.events.getEvents,
    workspace?._id ? { workspaceId: workspace._id, limit: 5 } : 'skip'
  )
  const checkoutSuccessCount = useQuery(
    api.platform.events.countEventsByType,
    workspace?._id ? { workspaceId: workspace._id, type: 'checkout_success' } : 'skip'
  )
  const paymentsConnectedCount = useQuery(
    api.platform.events.countEventsByType,
    workspace?._id ? { workspaceId: workspace._id, type: 'payments_connected' } : 'skip'
  )

  useEffect(() => {
    if (user === null) {
      router.push('/sign-in')
    }
  }, [user, router])

  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--accent))]" />
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--accent))]" />
        </div>
      </Unauthenticated>

      <Authenticated>
        <StudioHeader />
        <motion.div
          className="min-h-screen bg-[rgb(var(--bg))] pt-24 p-6"
          variants={dribbblePageEnter}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Page title */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">
                {role ?? 'Studio'}
              </p>
              <h1 className="text-4xl font-bold uppercase tracking-wide">
                Dashboard
              </h1>
            </div>

            {/* Welcome */}
            <DribbbleCard padding="lg" glow>
              <p className="text-lg font-medium">
                Welcome back,{' '}
                <span className="text-[rgb(var(--accent))]">
                  {user?.firstName ?? user?.username ?? 'Creator'}
                </span>
              </p>
              <p className="text-sm text-muted mt-1">
                Manage your beats, services, billing, and domains from here.
              </p>
            </DribbbleCard>

            {workspace && (
              <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
                <DribbbleCard padding="lg" className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">
                        Activation health
                      </p>
                      <h2 className="text-2xl font-bold uppercase tracking-wide">
                        Storefront readiness
                      </h2>
                    </div>
                    <CheckCircle2 className="w-6 h-6 text-[rgb(var(--accent))]" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className={`rounded-2xl border p-4 ${getStatusTone('healthy')}`}>
                      <p className="text-xs font-semibold uppercase tracking-widest mb-2">Storefront</p>
                      <p className="text-lg font-bold text-text">{workspace.name}</p>
                      <p className="text-xs mt-1">Live at {workspace.slug}.brolabentertainment.com</p>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${getStatusTone(
                        paymentsStatus === 'active' ? 'healthy' : 'warning'
                      )}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest mb-2">Payments</p>
                      <p className="text-lg font-bold text-text">
                        {(() => {
                          if (paymentsStatus === 'active') return 'Ready'
                          if (paymentsStatus === 'pending') return 'Pending review'
                          return 'Action required'
                        })()}
                      </p>
                      <p className="text-xs mt-1">
                        {(() => {
                          if (paymentsStatus === 'active') return 'Stripe can accept payouts and charges.'
                          if (paymentsStatus === 'pending') return 'Stripe is connected but still needs verification.'
                          return 'Connect Stripe before artist purchases can complete.'
                        })()}
                      </p>
                    </div>

                    <div
                      className={`rounded-2xl border p-4 ${getStatusTone(
                        (checkoutSuccessCount ?? 0) > 0 ? 'healthy' : 'idle'
                      )}`}
                    >
                      <p className="text-xs font-semibold uppercase tracking-widest mb-2">Checkout activity</p>
                      <p className="text-lg font-bold text-text">{checkoutSuccessCount ?? 0}</p>
                      <p className="text-xs mt-1">
                        {(checkoutSuccessCount ?? 0) > 0
                          ? 'Completed purchases recorded through webhook flow.'
                          : 'No completed purchases recorded yet.'}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.45)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
                        Stripe connection events
                      </p>
                      <p className="text-2xl font-bold text-text">{paymentsConnectedCount ?? 0}</p>
                      <p className="text-xs text-muted mt-1">
                        Tracks how often providers complete the Stripe onboarding handoff.
                      </p>
                    </div>

                    <div className="rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.45)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-2">
                        Latest lifecycle event
                      </p>
                      <p className="text-base font-semibold text-text">
                        {recentEvents?.[0] ? (EVENT_LABELS[recentEvents[0].type] ?? recentEvents[0].type) : 'No events yet'}
                      </p>
                      <p className="text-xs text-muted mt-1">
                        {recentEvents?.[0] ? formatRelativeTime(recentEvents[0].createdAt) : 'Events will appear here after onboarding and billing actions.'}
                      </p>
                    </div>
                  </div>
                </DribbbleCard>

                <DribbbleCard padding="lg" className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">
                        Observability
                      </p>
                      <h2 className="text-2xl font-bold uppercase tracking-wide">
                        Recent events
                      </h2>
                    </div>
                    <Receipt className="w-6 h-6 text-[rgb(var(--accent))]" />
                  </div>

                  <div className="space-y-3">
                    {recentEvents && recentEvents.length > 0 ? (
                      recentEvents.map((event) => (
                        <div
                          key={event._id}
                          className="rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.45)] px-4 py-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-sm text-text">
                                {EVENT_LABELS[event.type] ?? event.type}
                              </p>
                              <p className="text-xs text-muted mt-1">
                                {formatRelativeTime(event.createdAt)}
                              </p>
                            </div>
                            <span className="text-[10px] uppercase tracking-widest text-muted">
                              {event.type.replaceAll('_', ' ')}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-2xl border border-dashed border-border px-4 py-8 text-center">
                        <p className="text-sm font-medium text-text">No lifecycle events yet</p>
                        <p className="text-xs text-muted mt-1">
                          Workspace creation, Stripe connection, and checkout activity will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </DribbbleCard>
              </div>
            )}

            {/* Stripe Connect Banner */}
            {paymentsStatus === 'unconfigured' && (
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-yellow-500/30 bg-yellow-500/5">
                <AlertTriangle className="w-5 h-5 text-yellow-500 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-yellow-500 text-sm">Payments not configured</p>
                  <p className="text-sm text-muted mt-0.5">
                    Connect your Stripe account to start receiving payments from your customers.
                  </p>
                </div>
                <a
                  href={workspace?._id ? `/api/stripe/connect?workspaceId=${workspace._id}` : '/studio/billing'}
                  className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-xl bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-sm font-semibold transition-colors cursor-pointer"
                >
                  Connect Stripe
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {paymentsStatus === 'pending' && (
              <div className="flex items-start gap-4 p-4 rounded-2xl border border-blue-500/30 bg-blue-500/5">
                <AlertTriangle className="w-5 h-5 text-blue-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-blue-400 text-sm">Stripe account pending verification</p>
                  <p className="text-sm text-muted mt-0.5">
                    Your Stripe account is connected but needs to complete verification before you can accept payments.
                  </p>
                </div>
              </div>
            )}

            {/* Nav Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NAV_ITEMS.map(({ href, icon: Icon, label, description }) => (
                <a key={href} href={href} className="group cursor-pointer">
                  <DribbbleCard
                    padding="lg"
                    className="h-full transition-all duration-200 group-hover:border-[rgb(var(--accent))]/50 group-hover:shadow-lg group-hover:shadow-[rgb(var(--accent))]/10"
                  >
                    <div className="space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-[rgb(var(--card))] flex items-center justify-center text-[rgb(var(--accent))]">
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wide text-sm">{label}</p>
                        <p className="text-xs text-muted mt-0.5">{description}</p>
                      </div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--accent))] opacity-0 group-hover:opacity-100 transition-opacity">
                        Open →
                      </p>
                    </div>
                  </DribbbleCard>
                </a>
              ))}
            </div>

            {/* Revenue Diversification Promo - REMOVED: This section was appearing twice on the dashboard */}
            {/* 
            <ServicePromoSection
              title="Expand Your Revenue"
              description="Offer production services alongside your beats to increase earnings and create more value for artists."
              features={[
                'Beat licensing & sales',
                'Mixing & mastering services',
                'Music production consulting',
                'Sound design & composition'
              ]}
              ctaText="Manage Services"
              ctaHref="/studio/services"
              variant="prominent"
            />
            */}
          </div>
        </motion.div>
      </Authenticated>
    </>
  )
}
