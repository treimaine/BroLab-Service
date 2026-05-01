/**
 * ServiceList Component
 *
 * Displays all services for a workspace with create/edit/delete controls.
 * Follows the same pattern as TrackList in beats module.
 *
 * Requirements: 19.3, 16.1, 16.2
 */

'use client'

import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { dribbbleStaggerChild, dribbbleStaggerContainer } from '@/platform/ui/dribbble/motion'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { Plus, Wrench } from 'lucide-react'
import { useState } from 'react'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import { ServiceCard } from './ServiceCard'
import { ServiceForm } from './ServiceForm'

interface ServiceListProps {
  readonly workspaceId: Id<'workspaces'>
  /** When provided, only show services matching this status */
  readonly filterStatus?: 'active' | 'inactive'
}

type EditingService = {
  _id: Id<'services'>
  title: string
  description: string
  priceUSD: number
  priceEUR?: number
  turnaround: string
  features: string[]
  isActive: boolean
  createdAt: number
}

export function ServiceList({ workspaceId, filterStatus }: ServiceListProps) {
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingService, setEditingService] = useState<EditingService | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const services = useQuery(api.modules.services.getServicesByWorkspace, { workspaceId })

  const filteredServices = services?.filter((s) => {
    if (filterStatus === 'active') return s.isActive
    if (filterStatus === 'inactive') return !s.isActive
    return true
  })

  const showMessage = (message: string, type: 'error' | 'success') => {
    if (type === 'error') {
      setError(message)
      setTimeout(() => setError(null), 5000)
    } else {
      setSuccess(message)
      setTimeout(() => setSuccess(null), 5000)
    }
  }

  const handleCreateSuccess = (_serviceId: Id<'services'>) => {
    setShowCreateForm(false)
    showMessage('Service created successfully', 'success')
  }

  const handleEditSuccess = (_serviceId: Id<'services'>) => {
    setEditingService(null)
    showMessage('Service updated successfully', 'success')
  }

  if (services === undefined) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[rgb(var(--accent))]" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted">
          {filteredServices?.length ?? 0}{' '}
          {(filteredServices?.length ?? 0) === 1 ? 'service' : 'services'}
        </p>
        {!showCreateForm && !editingService && (
          <PillCTA
            variant="primary"
            size="sm"
            icon={Plus}
            onClick={() => setShowCreateForm(true)}
          >
            Add Service
          </PillCTA>
        )}
      </div>

      {/* Feedback messages */}
      {success && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm text-green-800 dark:text-green-200">{success}</p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
        </div>
      )}

      {/* Create form */}
      {showCreateForm && (
        <div className="p-5 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">New Service</h3>
          <ServiceForm
            workspaceId={workspaceId}
            onSuccess={handleCreateSuccess}
            onCancel={() => setShowCreateForm(false)}
            onError={(msg) => showMessage(msg, 'error')}
          />
        </div>
      )}

      {/* Edit form */}
      {editingService && (
        <div className="p-5 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-xl">
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-4">Edit Service</h3>
          <ServiceForm
            workspaceId={workspaceId}
            serviceId={editingService._id}
            initialValues={{
              title: editingService.title,
              description: editingService.description,
              priceUSD: editingService.priceUSD,
              priceEUR: editingService.priceEUR,
              turnaround: editingService.turnaround,
              features: editingService.features,
              isActive: editingService.isActive,
            }}
            onSuccess={handleEditSuccess}
            onCancel={() => setEditingService(null)}
            onError={(msg) => showMessage(msg, 'error')}
          />
        </div>
      )}

      {/* Empty state */}
      {(filteredServices?.length ?? 0) === 0 && !showCreateForm && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
            <Wrench className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No services yet</h3>
          <p className="text-gray-600 dark:text-gray-400 max-w-sm mb-4">
            Create your first service listing — mixing, mastering, vocal tuning, or anything you offer.
          </p>
          <PillCTA variant="primary" size="sm" icon={Plus} onClick={() => setShowCreateForm(true)}>
            Add Your First Service
          </PillCTA>
        </div>
      )}

      {/* Service list */}
      {(filteredServices?.length ?? 0) > 0 && !editingService && (
        <motion.div
          className="space-y-3"
          variants={dribbbleStaggerContainer}
          initial="initial"
          animate="animate"
        >
          {filteredServices?.map((service) => (
            <motion.div key={service._id} variants={dribbbleStaggerChild}>
              <ServiceCard
                service={service}
                onEdit={(svc) => setEditingService(svc)}
                onError={(msg) => showMessage(msg, 'error')}
                onSuccess={(msg) => showMessage(msg, 'success')}
              />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  )
}
