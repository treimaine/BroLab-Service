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
import { ArrowRight, BarChart3, Check, CheckCircle2, ContactRound, CreditCard, ExternalLink, Globe, Loader2, LockKeyhole, Music, Radio, Receipt, Wrench } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { StudioHeader } from './StudioHeader'

const PRODUCER_NAV_ITEMS = [
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
    href: '/studio/contact',
    icon: ContactRound,
    label: 'Contact',
    description: 'Choose your public contact details',
  },
  {
    href: '/studio/billing',
    icon: CreditCard,
    label: 'Billing',
    description: 'Subscription & plan details',
  },
  {
    href: '/studio/metrics',
    icon: BarChart3,
    label: 'Analytics',
    description: 'Views, sales, revenue & conversion',
  },
  {
    href: '/studio/domains',
    icon: Globe,
    label: 'Domains',
    description: 'Connect a custom domain (PRO)',
  },
]

const ENGINEER_NAV_ITEMS = [
  {
    href: '/studio/services',
    icon: Wrench,
    label: 'Services',
    description: 'Publish mixing, mastering & more',
  },
  {
    href: '/studio/tracks',
    icon: Music,
    label: 'Tracks',
    description: 'Manage audio examples and beats',
  },
  ...PRODUCER_NAV_ITEMS.slice(2),
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
  subscription_synced: 'Subscription synced',
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

export function StudioDashboard() {
  const { user } = useUser()
  const router = useRouter()
  const role = user?.unsafeMetadata?.role as string | undefined
  const isEngineer = role === 'engineer'

  const workspaces = useQuery(api.platform.workspaces.listUserWorkspaces)
  const workspace = workspaces?.[0]
  const services = useQuery(
    api.modules.services.getServicesByWorkspace,
    workspace?._id ? { workspaceId: workspace._id } : 'skip'
  )
  const activeServicesCount = services?.filter((service) => service.isActive).length ?? 0
  const paymentsStatus = workspace?.paymentsStatus
  const subscriptionData = useQuery(
    api.platform.billing.subscriptionQueries.getSubscriptionByClerkUserId,
    user?.id ? { clerkUserId: user.id } : 'skip'
  )
  const hasActiveSubscription = subscriptionData?.subscription?.status === 'active'
  const publishedTracksCount = subscriptionData?.usage?.publishedTracksCount ?? 0
  const hasPublishedOffer = isEngineer
    ? activeServicesCount > 0
    : publishedTracksCount > 0
  const navigationItems = isEngineer ? ENGINEER_NAV_ITEMS : PRODUCER_NAV_ITEMS
  const activationSteps = workspace
    ? [
        {
          label: 'Create storefront',
          description: `${workspace.slug}.brolabentertainment.com is reserved`,
          complete: true,
          available: true,
          href: '/studio',
          cta: 'Done',
        },
        {
          label: 'Start BASIC or PRO',
          description: 'One free month, then your selected billing period',
          complete: hasActiveSubscription,
          available: true,
          href: '/studio/billing',
          cta: 'Start free month',
        },
        {
          label: 'Connect Stripe',
          description: 'Receive customer payments directly',
          complete: paymentsStatus === 'active',
          available: hasActiveSubscription,
          href: workspace._id
            ? `/api/stripe/connect?workspaceId=${workspace._id}`
            : '/studio/billing',
          cta: 'Connect',
        },
        {
          label: isEngineer ? 'Publish your first service' : 'Publish your first beat',
          description: isEngineer
            ? 'Turn your expertise into a bookable offer'
            : 'Give visitors something they can buy',
          complete: hasPublishedOffer,
          available: hasActiveSubscription && paymentsStatus === 'active',
          href: isEngineer ? '/studio/services' : '/studio/tracks',
          cta: isEngineer ? 'Add a service' : 'Add a beat',
        },
      ]
    : []
  const completedActivationSteps = activationSteps.filter((step) => step.complete).length
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
  const nextActivationStep = activationSteps.find((step) => !step.complete && step.available)
  const eventSummaries = recentEvents?.reduce<Array<{
    type: string
    count: number
    latestAt: number
  }>>((summaries, event) => {
    const existingSummary = summaries.find((summary) => summary.type === event.type)

    if (existingSummary) {
      existingSummary.count += 1
      existingSummary.latestAt = Math.max(existingSummary.latestAt, event.createdAt)
      return summaries
    }

    summaries.push({
      type: event.type,
      count: 1,
      latestAt: event.createdAt,
    })
    return summaries
  }, []) ?? []

  useEffect(() => {
    if (user === null) {
      router.push('/sign-in')
    }
  }, [user, router])

  useEffect(() => {
    if (user && workspaces !== undefined && workspaces.length === 0) {
      router.replace('/onboarding?resume=1&step=workspace')
    }
  }, [router, user, workspaces])

  // Do not render an empty Studio while Convex resolves the workspace or while
  // the recovery redirect is in flight.
  if (user && (workspaces === undefined || !workspace)) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[rgb(var(--accent))]" />
      </div>
    )
  }

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
          <div className="mx-auto max-w-7xl space-y-7">
            <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  {role ?? 'Studio'}
                </p>
                <h1 className="text-3xl font-bold uppercase tracking-wide sm:text-4xl">
                  Dashboard
                </h1>
                <p className="mt-2 text-sm text-muted">
                  Welcome back,{' '}
                  <span className="font-semibold text-text">
                    {user?.firstName ?? user?.username ?? 'Creator'}
                  </span>
                  . {isEngineer
                    ? 'Your services, bookings, and next launch step are together here.'
                    : 'Here’s what needs your attention.'}
                </p>
              </div>
              {workspace && (
                <a
                  href={`https://${workspace.slug}.brolabentertainment.com`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex w-fit items-center gap-2 rounded-full border border-border bg-[rgb(var(--bg-2)/0.55)] px-4 py-2 text-xs font-semibold text-muted transition-colors hover:border-[rgb(var(--accent))]/40 hover:text-[rgb(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
                >
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  {workspace.slug}.brolabentertainment.com
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </header>

            {workspace && (
              <DribbbleCard padding="lg" glow className="space-y-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--accent))]">
                      Self-serve launch
                    </p>
                    <h2 className="text-2xl font-bold uppercase tracking-wide">
                      {isEngineer
                        ? 'Open your engineering desk'
                        : 'Get your storefront sell-ready'}
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-muted">
                      {isEngineer
                        ? 'Set up payments, publish a service, and start taking client work.'
                        : 'Four essentials, completed in order. We’ll keep the next move clear.'}
                    </p>
                  </div>
                  <div className="min-w-44">
                    <div className="mb-2 flex items-center justify-between text-xs font-semibold">
                      <span className="text-muted">Launch progress</span>
                      <span className="text-[rgb(var(--accent))]">{completedActivationSteps} of 4</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[rgb(var(--border)/0.35)]">
                      <div
                        className="h-full rounded-full bg-[rgb(var(--accent))] transition-all"
                        style={{ width: `${(completedActivationSteps / 4) * 100}%` }}
                      />
                    </div>
                  </div>
                </div>

                {nextActivationStep ? (
                  <div className="flex flex-col gap-4 rounded-2xl border border-[rgb(var(--accent))]/30 bg-[rgb(var(--accent))]/8 p-5 sm:flex-row sm:items-center">
                    <div className="flex min-w-0 flex-1 items-start gap-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[rgb(var(--accent))] text-sm font-bold text-[rgb(var(--bg))]">
                        {completedActivationSteps + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgb(var(--accent))]">
                          Your next move
                        </p>
                        <p className="mt-1 text-lg font-bold text-text">{nextActivationStep.label}</p>
                        <p className="mt-0.5 text-sm text-muted">{nextActivationStep.description}</p>
                      </div>
                    </div>
                    <a
                      href={nextActivationStep.href}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-[rgb(var(--accent))] px-5 py-3 text-sm font-bold text-[rgb(var(--bg))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2"
                    >
                      {nextActivationStep.cta}
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/5 p-5">
                    <CheckCircle2 className="h-6 w-6 text-green-400" />
                    <div>
                      <p className="font-bold text-text">Your storefront is sell-ready</p>
                      <p className="text-sm text-muted">You&apos;ve completed every launch step.</p>
                    </div>
                  </div>
                )}

                <ol className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  {activationSteps.map((step, index) => {
                    const isCurrent = step.label === nextActivationStep?.label

                    return (
                      <li
                        key={step.label}
                        className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${
                          step.complete
                            ? 'border-green-500/20 bg-green-500/5'
                            : isCurrent
                              ? 'border-[rgb(var(--accent))]/30 bg-[rgb(var(--accent))]/5'
                              : 'border-border bg-[rgb(var(--bg-2)/0.35)]'
                        }`}
                      >
                        <span
                          className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-bold ${
                            step.complete
                              ? 'border-green-400/40 bg-green-400/10 text-green-400'
                              : isCurrent
                                ? 'border-[rgb(var(--accent))]/40 text-[rgb(var(--accent))]'
                                : 'border-border text-muted'
                          }`}
                        >
                          {step.complete ? (
                            <Check className="h-3.5 w-3.5" />
                          ) : step.available ? (
                            index + 1
                          ) : (
                            <LockKeyhole className="h-3 w-3" />
                          )}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-text">{step.label}</p>
                          <p className="mt-0.5 text-[10px] font-medium uppercase tracking-wider text-muted">
                            {step.complete ? 'Complete' : isCurrent ? 'In progress' : 'Up next'}
                          </p>
                        </div>
                      </li>
                    )
                  })}
                </ol>

                <div className="flex flex-col gap-2 border-t border-border pt-4 text-sm sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-muted">Reminders focus only on your next unfinished step.</p>
                  <a
                    href={`mailto:support@brolabentertainment.com?subject=${
                      subscriptionData?.subscription?.planKey === 'pro'
                        ? 'PRO%20priority%20support'
                        : 'BroLab%20setup%20help'
                    }`}
                    className="font-semibold text-[rgb(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
                  >
                    {subscriptionData?.subscription?.planKey === 'pro'
                      ? 'Priority support'
                      : 'Get async help'}
                  </a>
                </div>
              </DribbbleCard>
            )}

            {workspace && (
              <div className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
                <DribbbleCard padding="lg" className="space-y-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        {isEngineer ? 'Client work pulse' : 'Sales pulse'}
                      </p>
                      <h2 className="text-xl font-bold uppercase tracking-wide">
                        At a glance
                      </h2>
                    </div>
                    <Radio className="h-5 w-5 text-[rgb(var(--accent))]" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.45)] p-4">
                      <p className="text-3xl font-bold text-text">{checkoutSuccessCount ?? 0}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                        {isEngineer ? 'Paid bookings' : 'Completed sales'}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.45)] p-4">
                      <p className="text-3xl font-bold text-text">
                        {isEngineer ? activeServicesCount : publishedTracksCount}
                      </p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                        {isEngineer ? 'Live services' : 'Published beats'}
                      </p>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.45)] p-4 md:col-span-1">
                      <p className="text-3xl font-bold text-text">{paymentsConnectedCount ?? 0}</p>
                      <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-muted">
                        Stripe connections
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted">
                    {(checkoutSuccessCount ?? 0) > 0
                      ? isEngineer
                        ? 'Paid client work is flowing through your storefront.'
                        : 'Completed purchases are flowing through your storefront.'
                      : hasPublishedOffer
                        ? isEngineer
                          ? 'Your service desk is live. Your first paid booking will appear here.'
                          : 'Your catalog is live. Your first completed sale will appear here.'
                        : isEngineer
                          ? 'Publish your first service to start taking client work.'
                          : 'Publish your first beat to start tracking sales activity.'}
                  </p>
                  <Link
                    href="/studio/metrics"
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[rgb(var(--accent))] hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
                  >
                    Open analytics
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </DribbbleCard>

                <DribbbleCard padding="lg" className="space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                        Activity
                      </p>
                      <h2 className="text-xl font-bold uppercase tracking-wide">
                        Recent signals
                      </h2>
                    </div>
                    <Receipt className="h-5 w-5 text-[rgb(var(--accent))]" />
                  </div>

                  <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.35)]">
                    {eventSummaries.length > 0 ? (
                      eventSummaries.map((event) => (
                        <div
                          key={event.type}
                          className="flex items-center justify-between gap-4 px-4 py-3.5"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text">
                              {EVENT_LABELS[event.type] ?? event.type.replaceAll('_', ' ')}
                            </p>
                            <p className="mt-0.5 text-xs text-muted">
                              {formatRelativeTime(event.latestAt)}
                            </p>
                          </div>
                          {event.count > 1 && (
                            <span className="shrink-0 rounded-full border border-border px-2.5 py-1 text-xs font-semibold text-muted">
                              {event.count} events
                            </span>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="px-5 py-10 text-center">
                        <p className="text-sm font-medium text-text">No activity yet</p>
                        <p className="mt-1 text-xs text-muted">
                          Storefront, payment, and purchase signals will appear here.
                        </p>
                      </div>
                    )}
                  </div>
                </DribbbleCard>
              </div>
            )}

            <section aria-labelledby="workspace-heading" className="space-y-3">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                    Workspace
                  </p>
                  <h2 id="workspace-heading" className="text-xl font-bold uppercase tracking-wide">
                    Jump back in
                  </h2>
                </div>
                <p className="hidden text-xs text-muted sm:block">Your studio tools, one click away.</p>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {navigationItems.map(({ href, icon: Icon, label, description }) => (
                  <Link
                    key={href}
                    href={href}
                    className="group rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))]"
                  >
                  <DribbbleCard
                    padding="md"
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
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </motion.div>
      </Authenticated>
    </>
  )
}
