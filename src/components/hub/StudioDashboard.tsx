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
import { AuthLoading, Authenticated, Unauthenticated } from 'convex/react'
import { motion } from 'framer-motion'
import { CreditCard, Globe, Loader2, Music, Wrench } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const NAV_ITEMS = [
  {
    href: '/studio/tracks',
    icon: Music,
    label: 'Tracks',
    description: 'Upload and manage your beats',
    accent: 'text-[rgb(var(--accent))]',
  },
  {
    href: '/studio/services',
    icon: Wrench,
    label: 'Services',
    description: 'Manage mixing, mastering & more',
    accent: 'text-emerald-400',
  },
  {
    href: '/studio/billing',
    icon: CreditCard,
    label: 'Billing',
    description: 'Subscription & plan details',
    accent: 'text-violet-400',
  },
  {
    href: '/studio/domains',
    icon: Globe,
    label: 'Domains',
    description: 'Connect a custom domain (PRO)',
    accent: 'text-sky-400',
  },
]

export function StudioDashboard() {
  const { user } = useUser()
  const router = useRouter()
  const role = user?.unsafeMetadata?.role as string | undefined

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
        <motion.div
          className="min-h-screen bg-[rgb(var(--bg))] p-6"
          variants={dribbblePageEnter}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <div className="max-w-7xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">
                  {role ?? 'Studio'}
                </p>
                <h1 className="text-4xl font-bold uppercase tracking-wide">
                  Dashboard
                </h1>
              </div>
              <Link
                href="/"
                className="text-sm font-semibold uppercase tracking-wide text-muted hover:text-[rgb(var(--accent))] transition-colors"
              >
                ← Back to Hub
              </Link>
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

            {/* Nav Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {NAV_ITEMS.map(({ href, icon: Icon, label, description, accent }) => (
                <Link key={href} href={href} className="group cursor-pointer">
                  <DribbbleCard
                    padding="lg"
                    className="h-full transition-all duration-200 group-hover:border-[rgb(var(--accent))]/50 group-hover:shadow-lg group-hover:shadow-[rgb(var(--accent))]/10"
                  >
                    <div className="space-y-3">
                      <div className={`w-10 h-10 rounded-xl bg-card flex items-center justify-center ${accent}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold uppercase tracking-wide text-sm">{label}</p>
                        <p className="text-xs text-muted mt-0.5">{description}</p>
                      </div>
                      <p className={`text-xs font-semibold uppercase tracking-wide ${accent} opacity-0 group-hover:opacity-100 transition-opacity`}>
                        Open →
                      </p>
                    </div>
                  </DribbbleCard>
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </Authenticated>
    </>
  )
}
