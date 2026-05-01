'use client'

/**
 * Billing Management Client Component
 * 
 * Requirements: 3.6, 19.1, 19.6, Task 7.2
 * 
 * Displays:
 * - Subscription status
 * - Clerk Billing component integration (branded)
 * - Usage vs quota display
 */

import { DribbbleCard, PillCTA } from '@/platform/ui'
import { PricingTable, useUser } from '@clerk/nextjs'
import { SubscriptionDetailsButton } from '@clerk/nextjs/experimental'
import { AuthLoading, Authenticated, Unauthenticated, useQuery } from 'convex/react'
import { AlertCircle, Check, CreditCard, Database, ExternalLink, Loader2, Music, X, Zap } from 'lucide-react'
import Link from 'next/link'
import { api } from 'convex/_generated/api'
import { StudioHeader } from './StudioHeader'

// Helper function to get status badge styles
function getStatusBadgeStyles(status: 'active' | 'inactive' | 'canceled') {
  if (status === 'active') {
    return 'bg-green-500/10 text-green-500'
  }
  if (status === 'canceled') {
    return 'bg-red-500/10 text-red-500'
  }
  return 'bg-yellow-500/10 text-yellow-500'
}

export function BillingManagement() {
  const { user } = useUser()
  const clerkUserId = user?.id

  // Fetch subscription and usage data
  const data = useQuery(
    api.platform.billing.subscriptionQueries.getSubscriptionByClerkUserId,
    clerkUserId ? { clerkUserId } : 'skip'
  )

  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted">Redirecting to sign in...</p>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <StudioHeader />
        <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
          <main className="max-w-7xl mx-auto px-6 py-8">
            {/* Page title — same pattern as Tracks/Services */}
            <div className="mb-8">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
              <h1 className="text-4xl font-bold uppercase tracking-wide">Billing</h1>
            </div>

            {/* Loading State */}
            {data === undefined && (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
                <p className="text-muted">Loading billing information...</p>
              </div>
            )}

            {/* No Workspace State */}
            {data === null && (
              <DribbbleCard className="max-w-2xl mx-auto p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                <h3 className="text-xl font-bold mb-2">No Workspace Found</h3>
                <p className="text-muted mb-6">
                  You need to create a workspace before managing billing.
                </p>
                <Link href="/studio/workspace/new">
                  <PillCTA variant="primary" size="md">
                    Create Workspace
                  </PillCTA>
                </Link>
              </DribbbleCard>
            )}

            {/* Billing Content */}
            {data && (
              <div className="space-y-8">
                {/* Subscription Status Card */}
                <DribbbleCard className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Subscription Status</h2>
                      <p className="text-muted">
                        Workspace: <span className="text-text font-medium">{data.workspace.name}</span>
                      </p>
                    </div>
                    <CreditCard className="w-8 h-8 text-accent" />
                  </div>

                  {data.subscription ? (
                    <div className="space-y-4">
                      {/* Status Badge */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted">Status:</span>
                        <div
                          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyles(data.subscription.status)}`}
                        >
                          {data.subscription.status === 'active' ? (
                            <Check className="w-4 h-4" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                          {data.subscription.status.toUpperCase()}
                        </div>
                      </div>

                      {/* Plan Info */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted">Plan:</span>
                        <span className="text-lg font-bold uppercase">{data.subscription.planKey}</span>
                      </div>

                      {/* Last Updated */}
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-muted">Last Updated:</span>
                        <span className="text-sm">
                          {new Date(data.subscription.updatedAt).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </span>
                      </div>

                      {/* Manage Subscription Button - Using Clerk Component */}
                      <div className="pt-4 border-t border-border">
                        <p className="text-sm text-muted mb-4">
                          Manage your subscription, update payment method, or cancel your plan.
                        </p>
                        <SubscriptionDetailsButton />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center gap-3 text-yellow-500">
                        <AlertCircle className="w-5 h-5" />
                        <span className="font-medium">No Active Subscription</span>
                      </div>
                      <p className="text-muted mb-4">
                        Subscribe to a plan to unlock all features and start selling your beats and services.
                      </p>
                      
                      {/* Clerk Billing PricingTable Component */}
                      <div className="mt-6">
                        <PricingTable 
                          for="user"
                          newSubscriptionRedirectUrl="/studio/billing"
                        />
                      </div>
                    </div>
                  )}
                </DribbbleCard>

                {/* Stripe Connect Card */}
                <DribbbleCard className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold mb-2">Payment Account</h2>
                      <p className="text-muted">Receive payments directly from your customers</p>
                    </div>
                    <Zap className="w-8 h-8 text-accent" />
                  </div>

                  {data.workspace.paymentsStatus === 'active' && (
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-green-500/10 text-green-500">
                          <Check className="w-4 h-4" />
                          CONNECTED
                        </div>
                      </div>
                      <p className="text-sm text-muted">
                        Your Stripe account is connected and ready to accept payments.
                      </p>
                      {data.workspace.stripeAccountId && (
                        <p className="text-xs text-muted font-mono">
                          Account: {data.workspace.stripeAccountId}
                        </p>
                      )}
                    </div>
                  )}

                  {data.workspace.paymentsStatus === 'pending' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-blue-500/10 text-blue-400">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          PENDING VERIFICATION
                        </div>
                      </div>
                      <p className="text-sm text-muted">
                        Your Stripe account is connected but needs to complete verification before you can accept payments. Check your Stripe dashboard for required actions.
                      </p>
                      <a
                        href={`/api/stripe/connect/login-link?workspaceId=${data.workspaceId}`}
                        className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
                      >
                        Open Stripe Dashboard
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  )}

                  {data.workspace.paymentsStatus === 'unconfigured' && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium bg-yellow-500/10 text-yellow-500">
                          <AlertCircle className="w-4 h-4" />
                          NOT CONFIGURED
                        </div>
                      </div>
                      <p className="text-sm text-muted">
                        Connect your Stripe account to start receiving payments. BroLab takes 0% commission — you keep everything minus standard Stripe fees.
                      </p>
                      <ul className="space-y-1.5 text-sm text-muted">
                        {['Direct payouts to your bank', 'Accept cards, Apple Pay, Google Pay', 'Automatic license delivery on purchase'].map((item) => (
                          <li key={item} className="flex items-center gap-2">
                            <Check className="w-3.5 h-3.5 text-accent shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                      <a
                        href={`/api/stripe/connect?workspaceId=${data.workspaceId}`}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white bg-linear-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] shadow-[0_4px_14px_rgba(var(--accent),0.3)] hover:shadow-[0_8px_24px_rgba(var(--accent),0.4)] transition-shadow duration-200"
                      >
                        Connect Stripe Account
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  )}
                </DribbbleCard>

                {/* Usage vs Quota Card - Always show if we have subscription data */}
                {data.subscription && data.planFeatures && (                  <DribbbleCard className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-bold mb-2">Usage & Quotas</h2>
                        <p className="text-muted">Track your usage against plan limits</p>
                      </div>
                      <Database className="w-8 h-8 text-accent" />
                    </div>

                    <div className="space-y-6">
                      {/* Published Tracks */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Music className="w-5 h-5 text-accent" />
                            <span className="font-medium">Published Tracks</span>
                          </div>
                          <span className="text-sm text-muted">
                            {data.usage.publishedTracksCount} /{' '}
                            {data.planFeatures.maxPublishedTracks === -1
                              ? 'Unlimited'
                              : data.planFeatures.maxPublishedTracks}
                          </span>
                        </div>
                        {data.planFeatures.maxPublishedTracks !== -1 && (
                          <div className="w-full bg-[rgba(var(--border),0.3)] rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-accent h-full transition-all duration-300"
                              style={{
                                width: `${Math.min(
                                  (data.usage.publishedTracksCount / data.planFeatures.maxPublishedTracks) * 100,
                                  100
                                )}%`,
                              }}
                            />
                          </div>
                        )}
                      </div>

                      {/* Storage */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Database className="w-5 h-5 text-accent" />
                            <span className="font-medium">Storage</span>
                          </div>
                          <span className="text-sm text-muted">
                            {(data.usage.storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2)} GB /{' '}
                            {data.planFeatures.storageGb} GB
                          </span>
                        </div>
                        <div className="w-full bg-[rgba(var(--border),0.3)] rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-accent h-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                (data.usage.storageUsedBytes / (data.planFeatures.storageGb * 1024 * 1024 * 1024)) *
                                  100,
                                100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* Custom Domains */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <CreditCard className="w-5 h-5 text-accent" />
                            <span className="font-medium">Custom Domains</span>
                          </div>
                          <span className="text-sm text-muted">
                            0 / {data.planFeatures.maxCustomDomains}
                            {data.planFeatures.maxCustomDomains === 0 && ' (Upgrade to PRO)'}
                          </span>
                        </div>
                        {data.planFeatures.maxCustomDomains > 0 && (
                          <div className="w-full bg-[rgba(var(--border),0.3)] rounded-full h-2 overflow-hidden">
                            <div className="bg-accent h-full transition-all duration-300" style={{ width: '0%' }} />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Upgrade CTA - Using Clerk PricingTable */}
                    {data.subscription?.planKey === 'basic' && (
                      <div className="mt-6 pt-6 border-t border-border">
                        <p className="text-sm text-muted mb-4">
                          Need more? Upgrade to PRO for unlimited tracks, 50GB storage, and custom domains.
                        </p>
                        <PricingTable 
                          for="user"
                          newSubscriptionRedirectUrl="/studio/billing"
                        />
                      </div>
                    )}
                  </DribbbleCard>
                )}
              </div>
            )}
          </main>
        </div>
      </Authenticated>
    </>
  )
}
