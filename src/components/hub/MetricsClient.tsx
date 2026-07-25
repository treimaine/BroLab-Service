'use client'

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { api } from 'convex/_generated/api'
import {
  AuthLoading,
  Authenticated,
  Unauthenticated,
  useConvexAuth,
  useQuery,
} from 'convex/react'
import { motion } from 'framer-motion'
import { ArrowRight, BarChart3, Eye, Loader2, Music, ShoppingCart, Sparkles, Users } from 'lucide-react'
import Link from 'next/link'
import { StudioHeader } from './StudioHeader'

function formatCurrency(cents: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(cents / 100)
}

function Metric({
  label,
  value,
  icon: Icon,
}: Readonly<{
  label: string
  value: string | number
  icon: typeof Eye
}>) {
  return (
    <DribbbleCard padding="md">
      <Icon className="mb-4 h-5 w-5 text-[rgb(var(--accent))]" />
      <p className="text-3xl font-black text-text">{value}</p>
      <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-muted">{label}</p>
    </DribbbleCard>
  )
}

export function MetricsClient() {
  const { isAuthenticated } = useConvexAuth()
  const analytics = useQuery(
    api.modules.providerAnalytics.getMyAnalytics,
    isAuthenticated ? {} : 'skip'
  )

  return (
    <>
      <StudioHeader />
      <motion.main
        className="min-h-screen bg-[rgb(var(--bg))] px-6 pb-16 pt-24"
        variants={dribbblePageEnter}
        initial="initial"
        animate="animate"
      >
        <AuthLoading>
          <div className="flex min-h-[60vh] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--accent))]" />
          </div>
        </AuthLoading>

        <Unauthenticated>
          <div className="flex min-h-[60vh] items-center justify-center">
            <Link href="/sign-in" className="text-[rgb(var(--accent))]">Sign in to view analytics</Link>
          </div>
        </Unauthenticated>

        <Authenticated>
          {analytics === undefined ? (
            <div className="flex min-h-[60vh] items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-[rgb(var(--accent))]" />
            </div>
          ) : (
            <div className="mx-auto max-w-6xl space-y-8">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-[rgb(var(--accent))]">
                  {analytics?.planKey ? `${analytics.planKey} analytics` : 'Analytics'}
                </p>
                <h1 className="mt-1 text-4xl font-black uppercase tracking-wide">Storefront performance</h1>
                <p className="mt-2 text-muted">
                  {analytics?.workspace.name ?? 'Your storefront'} — private metrics scoped to your workspace.
                </p>
              </div>

              {!analytics?.basic ? (
                <DribbbleCard padding="lg" glow className="text-center">
                  <BarChart3 className="mx-auto mb-4 h-9 w-9 text-[rgb(var(--accent))]" />
                  <h2 className="text-2xl font-bold">Start BASIC or PRO to unlock analytics</h2>
                  <p className="mx-auto mt-2 max-w-lg text-sm text-muted">
                    Both paid plans include a sales dashboard and one free month. PRO also adds conversion, source and top-track breakdowns.
                  </p>
                  <Link
                    href="/studio/billing"
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-bold text-[rgb(var(--bg))]"
                  >
                    Start free month <ArrowRight className="h-4 w-4" />
                  </Link>
                </DribbbleCard>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
                    <Metric label="Views" value={analytics.basic.storefrontViews} icon={Eye} />
                    <Metric label="Visitors" value={analytics.basic.uniqueVisitors} icon={Users} />
                    <Metric label="Sales" value={analytics.basic.completedSales} icon={ShoppingCart} />
                    <Metric label="Revenue" value={formatCurrency(analytics.basic.revenueCents)} icon={BarChart3} />
                    <Metric label="Published" value={analytics.basic.publishedTracks} icon={Music} />
                  </div>

                  {analytics.advanced ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      <DribbbleCard padding="lg" className="space-y-5">
                        <div className="flex items-center gap-2">
                          <Sparkles className="h-5 w-5 text-[rgb(var(--accent))]" />
                          <h2 className="text-xl font-bold">PRO conversion</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="rounded-2xl border border-border p-4">
                            <p className="text-2xl font-black">
                              {(analytics.advanced.conversionRate * 100).toFixed(1)}%
                            </p>
                            <p className="text-xs uppercase tracking-widest text-muted">View to sale</p>
                          </div>
                          <div className="rounded-2xl border border-border p-4">
                            <p className="text-2xl font-black">
                              {formatCurrency(analytics.advanced.averageOrderCents)}
                            </p>
                            <p className="text-xs uppercase tracking-widest text-muted">Average order</p>
                          </div>
                        </div>
                        <div>
                          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted">Traffic sources</p>
                          <div className="space-y-2">
                            {analytics.advanced.viewsBySource.length > 0
                              ? analytics.advanced.viewsBySource.map((source) => (
                                  <div key={source.source} className="flex justify-between rounded-xl bg-[rgb(var(--bg-2)/0.55)] px-4 py-3 text-sm">
                                    <span className="capitalize">{source.source}</span>
                                    <span className="font-bold">{source.count}</span>
                                  </div>
                                ))
                              : <p className="text-sm text-muted">Traffic sources will appear after your first views.</p>}
                          </div>
                        </div>
                      </DribbbleCard>

                      <DribbbleCard padding="lg">
                        <h2 className="mb-5 text-xl font-bold">Top-selling tracks</h2>
                        <div className="space-y-3">
                          {analytics.advanced.topTracks.length > 0
                            ? analytics.advanced.topTracks.map((track) => (
                                <div key={track.trackId} className="flex items-center justify-between rounded-2xl border border-border p-4">
                                  <div>
                                    <p className="font-semibold">{track.title}</p>
                                    <p className="text-xs text-muted">{track.sales} sale{track.sales === 1 ? '' : 's'}</p>
                                  </div>
                                  <p className="font-bold text-[rgb(var(--accent))]">{formatCurrency(track.revenueCents)}</p>
                                </div>
                              ))
                            : <p className="text-sm text-muted">Your rankings will appear after the first completed sale.</p>}
                        </div>
                      </DribbbleCard>
                    </div>
                  ) : (
                    <DribbbleCard padding="lg" className="flex flex-col gap-4 sm:flex-row sm:items-center">
                      <div className="flex-1">
                        <p className="font-bold">Need deeper acquisition insights?</p>
                        <p className="mt-1 text-sm text-muted">
                          PRO adds conversion rate, average order value, traffic sources and top-track rankings.
                        </p>
                      </div>
                      <Link href="/studio/billing" className="font-bold text-[rgb(var(--accent))] hover:underline">
                        Upgrade to PRO
                      </Link>
                    </DribbbleCard>
                  )}
                </>
              )}
            </div>
          )}
        </Authenticated>
      </motion.main>
    </>
  )
}
