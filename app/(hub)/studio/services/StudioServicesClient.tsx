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

import { ServiceList } from '@/modules/services/components/ServiceList'
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { dribbblePageEnter } from '@/platform/ui/dribbble/motion'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { Wrench } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'

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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Wrench className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">No workspace found</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please complete onboarding to create a workspace.
          </p>
        </div>
      </div>
    )
  }

  const allCount = allServices?.length ?? 0
  const activeCount = allServices?.filter((s) => s.isActive).length ?? 0
  const inactiveCount = allServices?.filter((s) => !s.isActive).length ?? 0

  return (
    <motion.div
      className="min-h-screen bg-[rgb(var(--bg))] p-6"
      variants={dribbblePageEnter}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-wide mb-2">Services</h1>
            <p className="text-muted">Manage your service listings</p>
          </div>
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
