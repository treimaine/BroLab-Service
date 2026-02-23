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
import { AuthLoading, Authenticated, Unauthenticated, useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { AlertTriangle, CreditCard, ExternalLink, Globe, Loader2, Music, Wrench } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { api } from '../../../convex/_generated/api'
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

export function StudioDashboard() {
  const { user } = useUser()
  const router = useRouter()
  const role = user?.unsafeMetadata?.role as string | undefined

  const workspaces = useQuery(api.platform.workspaces.listUserWorkspaces)
  const workspace = workspaces?.[0]
  const paymentsStatus = workspace?.paymentsStatus

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
          </div>
        </motion.div>
      </Authenticated>
    </>
  )
}
