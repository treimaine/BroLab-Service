'use client'

/**
 * Metrics Dashboard Client Component
 *
 * Displays real-time product metrics for the team:
 * - Conversion metrics (signup → checkout → payment)
 * - Revenue metrics
 * - Timing metrics (time-to-first-upload, etc)
 * - Abandonment analytics
 * - Feature adoption
 */

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { AuthLoading, Authenticated, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { AlertCircle, BarChart3, Clock, Loader2, ShoppingCart, TrendingUp, Users, Zap } from 'lucide-react'
import { api } from '../../../convex/_generated/api'
import { StudioHeader } from './StudioHeader'

// Metric card component
function MetricCard({
  title,
  value,
  unit = '',
  icon: Icon,
  trend = null,
  description = '',
}: Readonly<{
  title: string
  value: string | number
  unit?: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; direction: 'up' | 'down' } | null
  description?: string
}>) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <DribbbleCard padding="md" className="h-full">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-sm text-muted uppercase tracking-wide font-semibold mb-1">
              {title}
            </p>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl md:text-3xl font-bold text-text">
                {value}
              </span>
              {unit && <span className="text-sm text-muted">{unit}</span>}
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
            <Icon className="w-5 h-5 text-accent" />
          </div>
        </div>

        {description && (
          <p className="text-xs text-muted mb-2">{description}</p>
        )}

        {trend && (
          <div className={`flex items-center gap-1 text-xs ${
            trend.direction === 'up' ? 'text-green-400' : 'text-red-400'
          }`}>
            <TrendingUp className="w-3 h-3" />
            {trend.direction === 'up' ? '+' : '-'}
            {Math.abs(trend.value).toFixed(1)}%
          </div>
        )}
      </DribbbleCard>
    </motion.div>
  )
}

// Format time duration in human-readable format
function formatDuration(ms: number): string {
  if (ms === 0) return 'N/A'
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const days = Math.floor(hours / 24)

  if (days > 0) return `${days}d ${hours % 24}h`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}

// Format currency
function formatCurrency(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`
}

// Format percentage
function formatPercent(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`
}

export function MetricsClient() {
  // Core metrics query
  const dashboardMetrics = useQuery(api.modules.analytics.getDashboardMetrics)
  const abandonmentStats = useQuery(api.modules.checkoutAbandonment.getAbandonmentStats)

  // Timing metrics
  const timeToFirstUpload = useQuery(api.modules.analytics.getTimeToFirstUpload)
  const firstTransactionTime = useQuery(api.modules.analytics.getFirstTransactionTime)
  const timeToSignup = useQuery(api.modules.analytics.getTimeToSignup)

  // Revenue per user
  const revenuePerUser = useQuery(api.modules.analytics.getRevenuePerUser)

  // Checkout funnel stats
  const checkoutFunnelStats = useQuery(api.modules.analytics.getCheckoutFunnelStats, {})

  // Search analytics
  const searchAnalytics = useQuery(api.modules.analytics.getSearchAnalytics, { limit: 20 })

  // Track view stats
  const trackViewStats = useQuery(api.modules.analytics.getTrackViewStats, {})

  const isLoading =
    dashboardMetrics === undefined ||
    abandonmentStats === undefined ||
    timeToFirstUpload === undefined ||
    firstTransactionTime === undefined ||
    timeToSignup === undefined ||
    revenuePerUser === undefined ||
    checkoutFunnelStats === undefined ||
    searchAnalytics === undefined ||
    trackViewStats === undefined

  return (
    <>
      <StudioHeader />

      <motion.div className="container mx-auto px-4 py-8" {...dribbblePageEnter}>
        <AuthLoading>
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        </AuthLoading>

        <Authenticated>
          {isLoading ? (
            <div className="flex items-center justify-center min-h-screen">
              <Loader2 className="w-8 h-8 animate-spin text-accent" />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold mb-2">
                  Product Metrics
                </h1>
                <p className="text-lg text-muted">
                  Real-time dashboard for BroLab launch metrics
                </p>
              </motion.div>

              {/* Conversion Funnel Metrics */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-accent" />
                  Conversion Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    title="Total Users"
                    value={dashboardMetrics.userCounts.total}
                    icon={Users}
                    description="All signed-up users"
                  />
                  <MetricCard
                    title="Active Producers"
                    value={dashboardMetrics.userCounts.producer}
                    icon={Users}
                    description="Providers with workspaces"
                  />
                  <MetricCard
                    title="Onboarding Completion"
                    value={formatPercent(dashboardMetrics.onboardingCompletionRate)}
                    icon={TrendingUp}
                    description="Workspaces with at least 1 track"
                  />
                  <MetricCard
                    title="Checkout Completion"
                    value={formatPercent(dashboardMetrics.checkoutCompletionRate)}
                    icon={ShoppingCart}
                    description={`${dashboardMetrics.completedOrders} / ${dashboardMetrics.totalOrders} orders`}
                  />
                </div>
              </div>

              {/* Revenue Metrics */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-accent" />
                  Revenue Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Total Revenue"
                    value={formatCurrency(dashboardMetrics.totalRevenueCents)}
                    icon={TrendingUp}
                    description="From completed orders"
                  />
                  <MetricCard
                    title="Revenue Per Producer"
                    value={formatCurrency(revenuePerUser.revenuePerUserCents)}
                    icon={TrendingUp}
                    description={`${revenuePerUser.activeProducers} active producers`}
                  />
                  <MetricCard
                    title="Avg Order Value"
                    value={
                      dashboardMetrics.completedOrders > 0
                        ? formatCurrency(
                            dashboardMetrics.totalRevenueCents /
                              dashboardMetrics.completedOrders
                          )
                        : '$0.00'
                    }
                    icon={TrendingUp}
                    description="Average per transaction"
                  />
                </div>
              </div>

              {/* Timing Metrics */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-accent" />
                  Timing Metrics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <MetricCard
                    title="Time to Signup"
                    value={formatDuration(timeToSignup.avgMs)}
                    icon={Clock}
                    description={`${timeToSignup.count} users tracked`}
                  />
                  <MetricCard
                    title="Time to First Upload"
                    value={formatDuration(timeToFirstUpload.avgMs)}
                    icon={Clock}
                    description={`${timeToFirstUpload.count} uploads tracked`}
                  />
                  <MetricCard
                    title="Time to First Purchase"
                    value={formatDuration(firstTransactionTime.avgMs)}
                    icon={Clock}
                    description={`${firstTransactionTime.count} transactions tracked`}
                  />
                </div>
              </div>

              {/* Checkout Funnel */}
              {checkoutFunnelStats && checkoutFunnelStats.uniqueUsers > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <ShoppingCart className="w-5 h-5 text-accent" />
                    Checkout Funnel
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <MetricCard
                      title="Checkout Views"
                      value={checkoutFunnelStats.stepCounts.view_checkout}
                      icon={ShoppingCart}
                      description="Users viewed checkout"
                    />
                    <MetricCard
                      title="License Selection"
                      value={checkoutFunnelStats.stepCounts.select_license}
                      icon={ShoppingCart}
                      description="Users selected a license"
                    />
                    <MetricCard
                      title="Completed Purchases"
                      value={checkoutFunnelStats.stepCounts.complete_payment}
                      icon={TrendingUp}
                      description={`${formatCurrency(checkoutFunnelStats.totalRevenue)} revenue`}
                    />
                  </div>
                  <div className="mt-4">
                    <DribbbleCard padding="md">
                      <h3 className="text-sm font-semibold text-muted uppercase mb-3">Conversion Rates</h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-xs text-muted">View → Select</p>
                          <p className="text-lg font-bold">{formatPercent(checkoutFunnelStats.conversionRates.viewToSelect)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Select → Email</p>
                          <p className="text-lg font-bold">{formatPercent(checkoutFunnelStats.conversionRates.selectToEmail)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Email → Payment</p>
                          <p className="text-lg font-bold">{formatPercent(checkoutFunnelStats.conversionRates.emailToPayment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted">Overall</p>
                          <p className="text-lg font-bold text-accent">{formatPercent(checkoutFunnelStats.conversionRates.overall)}</p>
                        </div>
                      </div>
                    </DribbbleCard>
                  </div>
                </div>
              )}

              {/* Search Analytics */}
              {searchAnalytics && searchAnalytics.totalQueries > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Users className="w-5 h-5 text-accent" />
                    Search Analytics
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <MetricCard
                      title="Total Searches"
                      value={searchAnalytics.totalQueries}
                      icon={Users}
                      description="Searches performed"
                    />
                    <MetricCard
                      title="Avg Results"
                      value={searchAnalytics.avgResultsPerQuery.toFixed(1)}
                      icon={BarChart3}
                      description="Results per search"
                    />
                    <MetricCard
                      title="Zero Results"
                      value={formatPercent(searchAnalytics.zeroResultRate)}
                      icon={AlertCircle}
                      description={`${searchAnalytics.zeroResultQueries} searches with no results`}
                    />
                  </div>
                  {searchAnalytics.topQueries.length > 0 && (
                    <DribbbleCard padding="md" className="mt-4">
                      <h3 className="text-sm font-semibold text-muted uppercase mb-3">Top Search Queries</h3>
                      <div className="space-y-2">
                        {searchAnalytics.topQueries.slice(0, 10).map(([query, count]) => (
                          <div key={query} className="flex items-center justify-between">
                            <span className="text-sm truncate max-w-md">{query}</span>
                            <span className="text-xs text-muted">{count}</span>
                          </div>
                        ))}
                      </div>
                    </DribbbleCard>
                  )}
                </div>
              )}

              {/* Abandonment Analytics */}
              {abandonmentStats && abandonmentStats.total > 0 && (
                <div>
                  <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-400" />
                    Abandonment Analytics
                  </h2>
                  <div className="grid grid-cols-1 gap-4">
                    <DribbbleCard padding="md">
                      <div className="space-y-3">
                        <p className="text-sm font-semibold text-muted uppercase mb-4">
                          Total Abandonment Responses: {abandonmentStats.total}
                        </p>
                        <div className="space-y-2">
                          {Object.entries(abandonmentStats.reasonCounts)
                            .sort(([, a], [, b]) => b - a)
                            .map(([reason, count]) => (
                              <div key={reason} className="flex items-center justify-between">
                                <span className="text-sm capitalize">
                                  {reason.replaceAll('_', ' ')}
                                </span>
                                <div className="flex items-center gap-2">
                                  <div className="w-32 h-2 rounded-full bg-border overflow-hidden">
                                    <div
                                      className="h-full bg-accent/60 rounded-full"
                                      style={{
                                        width: `${(count / abandonmentStats.total) * 100}%`,
                                      }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted w-8 text-right">
                                    {count}
                                  </span>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>
                    </DribbbleCard>
                  </div>
                </div>
              )}

              {/* Activity Summary */}
              <div>
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-accent" />
                  Content Activity
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <MetricCard
                    title="Total Tracks"
                    value={dashboardMetrics.totalTracks}
                    icon={Zap}
                    description="Beats uploaded"
                  />
                  <MetricCard
                    title="Total Orders"
                    value={dashboardMetrics.totalOrders}
                    icon={ShoppingCart}
                    description="All purchase attempts"
                  />
                  <MetricCard
                    title="Completed Orders"
                    value={dashboardMetrics.completedOrders}
                    icon={TrendingUp}
                    description="Successful transactions"
                  />
                </div>
              </div>

              {/* Footer note */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="pt-4 border-t border-border"
              >
                <p className="text-xs text-muted">
                  Metrics update in real-time. Last refreshed: {new Date().toLocaleString()}
                </p>
              </motion.div>
            </div>
          )}
        </Authenticated>
      </motion.div>
    </>
  )
}
