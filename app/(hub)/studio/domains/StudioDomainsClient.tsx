'use client'

/**
 * Studio Domains Client Component
 *
 * Custom domain management for PRO providers.
 * - assertEntitlement check (maxCustomDomains > 0) enforced server-side via connectDomain mutation
 * - DNS verification instructions (CNAME record)
 * - Status tracking: pending, verified, failed
 * - Audit log created on domain_connect
 *
 * Requirements: 4.4, 19.4, 1.3
 */

import { StudioHeader } from '@/components/hub/StudioHeader'
import { useSubscriptionSync } from '@/platform/billing'
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { useUser } from '@clerk/nextjs'
import { useAction, useMutation, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock, Globe, Plus, RefreshCw, Trash2, X } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'

type DomainStatus = 'pending' | 'verified' | 'failed'

const STATUS_CONFIG: Record<DomainStatus, { label: string; icon: React.ReactNode; className: string }> = {
  pending: {
    label: 'Pending',
    icon: <Clock className="w-4 h-4" />,
    className: 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20',
  },
  verified: {
    label: 'Verified',
    icon: <CheckCircle2 className="w-4 h-4" />,
    className: 'text-green-500 bg-green-500/10 border-green-500/20',
  },
  failed: {
    label: 'Failed',
    icon: <AlertCircle className="w-4 h-4" />,
    className: 'text-red-500 bg-red-500/10 border-red-500/20',
  },
}

export function StudioDomainsClient() {
  const { user } = useUser()
  const [hostname, setHostname] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [loadingDomainId, setLoadingDomainId] = useState<string | null>(null)

  // Reconcile the Convex mirror with Clerk Billing before gating on it, so an
  // active PRO plan is never shown the upgrade wall.
  const { isSyncing } = useSubscriptionSync(Boolean(user?.id))

  const workspaces = useQuery(api.platform.workspaces.listUserWorkspaces)
  const workspace = workspaces?.[0]

  const subscriptionData = useQuery(
    api.platform.billing.subscriptionQueries.getWorkspaceSubscriptionAndUsage,
    workspace ? { workspaceId: workspace._id } : 'skip'
  )
  const subscription = subscriptionData?.subscription

  const domains = useQuery(
    api.platform.domains.getDomainsByWorkspace,
    workspace ? { workspaceId: workspace._id } : 'skip'
  )

  const connectDomain = useMutation(api.platform.domains.connectDomain)
  const disconnectDomain = useMutation(api.platform.domains.disconnectDomain)
  const checkVerification = useAction(api.platform.domainVerification.checkDomainVerification)

  const isActive = subscription?.status === 'active'
  const isPro = subscription?.planKey === 'pro' && isActive
  // Limits come from the plan definition (server source of truth), not the UI.
  const maxDomains = isActive ? (subscriptionData?.planFeatures?.maxCustomDomains ?? 0) : 0
  const usedDomains = domains?.length ?? 0
  const canAddMore = maxDomains > 0 && usedDomains < maxDomains

  async function handleConnect(e: React.FormEvent) {
    e.preventDefault()
    if (!workspace || !user) return
    setError(null)

    try {
      await connectDomain({
        workspaceId: workspace._id,
        hostname: hostname.trim(),
        actorClerkUserId: user.id,
      })
      setHostname('')
      setIsAdding(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect domain')
    }
  }

  async function handleDisconnect(domainId: Id<'domains'>) {
    if (!workspace || !user) return
    setLoadingDomainId(domainId)
    try {
      await disconnectDomain({
        workspaceId: workspace._id,
        domainId,
        actorClerkUserId: user.id,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to disconnect domain')
    } finally {
      setLoadingDomainId(null)
    }
  }

  async function handleCheckVerification(domainId: Id<'domains'>) {
    if (!workspace || !user) return
    setLoadingDomainId(domainId)
    try {
      await checkVerification({
        workspaceId: workspace._id,
        domainId,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification check failed')
    } finally {
      setLoadingDomainId(null)
    }
  }

  if (workspaces === undefined) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
        <StudioHeader />
        <main className="max-w-7xl mx-auto px-6 py-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-[rgb(var(--accent))]" />
        </main>
      </div>
    )
  }

  if (!workspace) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
        <StudioHeader />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
            <h1 className="text-4xl font-bold uppercase tracking-wide">Domains</h1>
          </div>
          <DribbbleCard className="max-w-2xl mx-auto p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">No Workspace Found</h3>
            <p className="text-muted mb-6">
              You need to create a workspace before managing your domains.
            </p>
            <Link href="/studio/workspace/new">
              <PillCTA variant="primary" size="md">
                Create Workspace
              </PillCTA>
            </Link>
          </DribbbleCard>
        </main>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-[rgb(var(--bg))] pt-24 p-6"
      variants={dribbblePageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <StudioHeader />
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Page title */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
            <h1 className="text-4xl font-bold uppercase tracking-wide">Domains</h1>
          </div>
          {isPro && (
            <span className="px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))] border border-[rgb(var(--accent))]/20">
              PRO
            </span>
          )}
        </div>

        {/* Subscription still being reconciled with Clerk — don't flash the gate */}
        {!isPro && (isSyncing || subscriptionData === undefined) && (
          <DribbbleCard padding="lg">
            <div className="flex items-center gap-3 text-[rgb(var(--muted))]">
              <RefreshCw className="w-5 h-5 animate-spin" />
              <p className="text-sm">Checking your plan…</p>
            </div>
          </DribbbleCard>
        )}

        {/* PRO gate */}
        {!isPro && !isSyncing && subscriptionData !== undefined && (
          <DribbbleCard padding="lg" className="border border-[rgb(var(--accent))]/20">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[rgb(var(--accent))]/10">
                <Globe className="w-6 h-6 text-[rgb(var(--accent))]" />
              </div>
              <div>
                <h2 className="text-lg font-bold mb-1">PRO Feature</h2>
                <p className="text-[rgb(var(--muted))] text-sm mb-4">
                  Custom domains are available on the PRO plan. Upgrade to connect up to 2 custom domains to your storefront.
                </p>
                <Link href="/studio/billing">
                  <PillCTA variant="primary" size="sm">
                    Upgrade to PRO
                  </PillCTA>
                </Link>
              </div>
            </div>
          </DribbbleCard>
        )}

        {/* Quota bar */}
        {isPro && (
          <DribbbleCard padding="md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                Domains Used
              </span>
              <span className="text-sm font-bold">
                {usedDomains} / {maxDomains}
              </span>
            </div>
            <div className="h-2 rounded-full bg-[rgb(var(--card))]">
              <div
                className="h-2 rounded-full bg-[rgb(var(--accent))] transition-all"
                style={{ width: `${(usedDomains / maxDomains) * 100}%` }}
              />
            </div>
          </DribbbleCard>
        )}

        {/* Error banner */}
        {error && (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p className="text-sm flex-1">{error}</p>
            <button onClick={() => setError(null)} className="cursor-pointer hover:opacity-70 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Add domain form */}
        {isPro && canAddMore && (
          <DribbbleCard padding="lg">
            {isAdding ? (
              <form onSubmit={handleConnect} className="space-y-4">
                <div>
                  <label
                    htmlFor="domain-hostname"
                    className="block text-sm font-semibold uppercase tracking-wide text-[rgb(var(--muted))] mb-2"
                  >
                    Domain Hostname
                  </label>
                  <input
                    id="domain-hostname"
                    type="text"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                    placeholder="beats.yourdomain.com"
                    required
                    className="w-full px-4 py-3 rounded-xl bg-[rgb(var(--card))] border border-[rgb(var(--border))] text-[rgb(var(--text))] placeholder:text-[rgb(var(--muted))] focus:outline-none focus:border-[rgb(var(--accent))] transition-colors"
                  />
                  <p className="mt-1 text-xs text-[rgb(var(--muted))]">
                    Enter the full hostname (e.g. beats.yourdomain.com)
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <PillCTA type="submit" variant="primary" size="sm">
                    Connect Domain
                  </PillCTA>
                  <PillCTA
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => { setIsAdding(false); setHostname(''); setError(null) }}
                  >
                    Cancel
                  </PillCTA>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsAdding(true)}
                className="flex items-center gap-2 text-sm font-semibold text-[rgb(var(--accent))] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Connect a domain
              </button>
            )}
          </DribbbleCard>
        )}

        {/* Domain list */}
        {isPro && (
          <div className="space-y-4">
            {domains?.length === 0 && (
              <DribbbleCard padding="lg">
                <div className="text-center py-8">
                  <Globe className="w-12 h-12 mx-auto mb-3 text-[rgb(var(--muted))]" />
                  <p className="text-[rgb(var(--muted))] text-sm">No custom domains connected yet.</p>
                </div>
              </DribbbleCard>
            )}

            {domains?.map((domain) => {
              const status = domain.status as DomainStatus
              const cfg = STATUS_CONFIG[status]
              const isLoading = loadingDomainId === domain._id

              return (
                <DribbbleCard key={domain._id} padding="lg">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-[rgb(var(--card))]">
                      <Globe className="w-5 h-5 text-[rgb(var(--accent))]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <span className="font-mono font-semibold text-[rgb(var(--text))] truncate">
                          {domain.hostname}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.className}`}>
                          {cfg.icon}
                          {cfg.label}
                        </span>
                      </div>

                      {/* DNS instructions for pending domains */}
                      {status === 'pending' && (
                        <div className="mt-3 p-4 rounded-xl bg-[rgb(var(--bg))] border border-[rgb(var(--border))] space-y-3">
                          <p className="text-xs font-semibold uppercase tracking-wide text-[rgb(var(--muted))]">
                            DNS Configuration Required
                          </p>
                          <p className="text-sm text-[rgb(var(--muted))]">
                            Add the following CNAME record to your DNS provider:
                          </p>
                          <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-sm font-mono">
                            <span className="text-[rgb(var(--muted))] font-sans font-semibold uppercase text-xs">Type</span>
                            <span className="text-[rgb(var(--text))]">CNAME</span>
                            <span className="text-[rgb(var(--muted))] font-sans font-semibold uppercase text-xs">Name</span>
                            <span className="text-[rgb(var(--text))]">{domain.hostname}</span>
                            <span className="text-[rgb(var(--muted))] font-sans font-semibold uppercase text-xs">Value</span>
                            <span className="text-[rgb(var(--accent))]">brolabentertainment.com</span>
                          </div>
                          <p className="text-xs text-[rgb(var(--muted))]">
                            DNS changes can take time to propagate. The check reads public CNAME, A, and AAAA records.
                          </p>
                        </div>
                      )}

                      {/* Failed state instructions */}
                      {status === 'failed' && (
                        <div className="mt-2 text-sm text-red-400">
                          <p>
                            Verification failed. Point the domain to{' '}
                            <span className="font-mono">brolabentertainment.com</span> and try again.
                          </p>
                          {domain.verificationError && (
                            <p className="mt-1 text-xs text-[rgb(var(--muted))]">
                              Last check: {domain.verificationError}
                            </p>
                          )}
                        </div>
                      )}

                      {/* Verified state */}
                      {status === 'verified' && (
                        <p className="mt-2 text-sm text-green-400">
                          Domain is active. Your storefront is accessible at{' '}
                          <a
                            href={`https://${domain.hostname}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:opacity-80 transition-opacity"
                          >
                            https://{domain.hostname}
                          </a>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {(status === 'pending' || status === 'failed') && (
                        <button
                          onClick={() => handleCheckVerification(domain._id)}
                          disabled={isLoading}
                          title="Check verification"
                          className="p-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--muted))] hover:text-[rgb(var(--accent))] hover:bg-[rgb(var(--accent))]/10 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                        </button>
                      )}
                      <button
                        onClick={() => handleDisconnect(domain._id)}
                        disabled={isLoading}
                        title="Disconnect domain"
                        className="p-2 rounded-lg bg-[rgb(var(--card))] text-[rgb(var(--muted))] hover:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </DribbbleCard>
              )
            })}
          </div>
        )}

        {/* Subdomain info */}
        <DribbbleCard padding="lg" className="opacity-80">
          <div className="flex items-start gap-3">
            <Globe className="w-5 h-5 text-[rgb(var(--muted))] mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold mb-1">Your free subdomain</p>
              <p className="font-mono text-sm text-[rgb(var(--accent))]">
                {workspace.slug}.brolabentertainment.com
              </p>
              <p className="text-xs text-[rgb(var(--muted))] mt-1">
                Always available on all plans. Custom domains are a PRO feature.
              </p>
            </div>
          </div>
        </DribbbleCard>
      </div>
    </motion.div>
  )
}
