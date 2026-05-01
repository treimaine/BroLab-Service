/**
 * Studio Services Client Component
 *
 * Client-side component for service management.
 * Handles active/inactive filtering and service list display.
 *
 * Follows the same pattern as StudioTracksClient.
 *
 * Requirements: 19.3
 */

'use client'

import { StudioHeader } from '@/components/hub/StudioHeader'
import { ServiceList } from '@/modules/services/components/ServiceList'
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { api } from 'convex/_generated/api'

type FilterStatus = 'all' | 'active' | 'inactive'

export function StudioServicesClient() {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')

  const workspaces = useQuery(api.platform.workspaces.listUserWorkspaces)
  const workspace = workspaces?.[0]

  const allServices = useQuery(
    api.modules.services.getServicesByWorkspace,
    workspace ? { workspaceId: workspace._id } : 'skip'
  )

  if (!workspace) {
    return (
      <div className="min-h-screen bg-[rgb(var(--bg))] pt-24">
        <StudioHeader />
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
            <h1 className="text-4xl font-bold uppercase tracking-wide">Services</h1>
          </div>
          <DribbbleCard className="max-w-2xl mx-auto p-8 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-xl font-bold mb-2">No Workspace Found</h3>
            <p className="text-muted mb-6">
              You need to create a workspace before managing your services.
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

  const allCount = allServices?.length ?? 0
  const activeCount = allServices?.filter((s) => s.isActive).length ?? 0
  const inactiveCount = allServices?.filter((s) => !s.isActive).length ?? 0

  return (
    <motion.div
      className="min-h-screen bg-[rgb(var(--bg))] pt-24 p-6"
      variants={dribbblePageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <StudioHeader />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Page title */}
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">Studio</p>
          <h1 className="text-4xl font-bold uppercase tracking-wide">Services</h1>
        </div>

        {/* Filter Tabs */}
        <DribbbleCard padding="none" className="overflow-hidden">
          <div className="flex items-center gap-2 p-1">
            {(
              [
                { key: 'all', label: 'All Services', count: allCount },
                { key: 'active', label: 'Active', count: activeCount },
                { key: 'inactive', label: 'Inactive', count: inactiveCount },
              ] as const
            ).map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilterStatus(key)}
                className={`
                  flex-1 px-4 py-2 font-semibold uppercase tracking-wide text-sm transition-all rounded-lg cursor-pointer
                  ${
                    filterStatus === key
                      ? 'bg-[rgb(var(--accent))] text-white shadow-lg shadow-[rgb(var(--accent))]/30'
                      : 'text-muted hover:bg-card/60'
                  }
                `}
              >
                {label}{' '}
                <span
                  className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                    filterStatus === key ? 'bg-white/20' : 'bg-card'
                  }`}
                >
                  {count}
                </span>
              </button>
            ))}
          </div>
        </DribbbleCard>

        {/* Service List */}
        <DribbbleCard padding="lg">
          <ServiceList
            workspaceId={workspace._id}
            filterStatus={filterStatus === 'all' ? undefined : filterStatus}
          />
        </DribbbleCard>
      </div>
    </motion.div>
  )
}
