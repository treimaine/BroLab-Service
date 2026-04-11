/**
 * ServiceCard Component
 *
 * Displays a single service with toggle active/inactive and delete controls.
 * Follows the same pattern as TrackListItem in beats module.
 *
 * Requirements: 19.3, 16.1, 16.2
 */

'use client'

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { useMutation } from 'convex/react'
import { Clock, DollarSign, Edit2, Eye, EyeOff, Trash2, Wrench } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

interface Service {
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

interface ServiceCardProps {
  readonly service: Service
  readonly onEdit?: (service: Service) => void
  readonly onError?: (error: string) => void
  readonly onSuccess?: (message: string) => void
}

export function ServiceCard({ service, onEdit, onError, onSuccess }: ServiceCardProps) {
  const [isToggling, setIsToggling] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const toggleServiceActive = useMutation(api.modules.services.toggleServiceActive)
  const deleteService = useMutation(api.modules.services.deleteService)

  const handleToggle = async () => {
    setIsToggling(true)
    try {
      const result = await toggleServiceActive({ serviceId: service._id })
      onSuccess?.(result.isActive ? 'Service activated' : 'Service deactivated')
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to toggle service')
    } finally {
      setIsToggling(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Delete "${service.title}"? This cannot be undone.`)) return
    setIsDeleting(true)
    try {
      await deleteService({ serviceId: service._id })
      onSuccess?.('Service deleted')
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to delete service')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DribbbleCard padding="md" hoverLift className="flex items-start gap-4">
      {/* Icon */}
      <div className="shrink-0 w-12 h-12 bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] rounded-lg flex items-center justify-center shadow-lg shadow-[rgb(var(--accent))]/20">
        <Wrench className="w-6 h-6 text-white" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="text-base font-semibold truncate">{service.title}</h3>
          <span
            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
              service.isActive
                ? 'bg-green-500/10 text-green-500'
                : 'bg-gray-500/10 text-muted'
            }`}
          >
            {service.isActive ? 'Active' : 'Inactive'}
          </span>
        </div>

        <p className="text-sm text-muted line-clamp-2 mb-2">{service.description}</p>

        <div className="flex items-center gap-4 text-sm text-muted">
          <span className="flex items-center gap-1">
            <DollarSign className="w-3.5 h-3.5" />
            ${service.priceUSD.toFixed(2)}
            {service.priceEUR && ` / €${service.priceEUR.toFixed(2)}`}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {service.turnaround}
          </span>
        </div>

        {service.features.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {service.features.slice(0, 3).map((f) => (
              <span
                key={f}
                className="text-xs px-2 py-0.5 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-full"
              >
                {f}
              </span>
            ))}
            {service.features.length > 3 && (
              <span className="text-xs text-muted">+{service.features.length - 3} more</span>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => onEdit?.(service)}
          className="p-2 text-muted hover:text-[rgb(var(--text))] hover:bg-card/60 rounded-lg transition-colors cursor-pointer"
          title="Edit service"
        >
          <Edit2 className="w-4 h-4" />
        </button>

        <PillCTA
          variant="secondary"
          size="sm"
          onClick={handleToggle}
          disabled={isToggling}
          loading={isToggling}
          icon={service.isActive ? EyeOff : Eye}
        >
          {service.isActive ? 'Deactivate' : 'Activate'}
        </PillCTA>

        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
          title="Delete service"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </DribbbleCard>
  )
}
