/**
 * ProcessingStatusBadge Component
 * 
 * Displays the processing status of a track's preview generation.
 * Shows different states: idle, processing, completed, failed.
 * 
 * REFACTORED: Now uses Dribbble design system
 * - DribbbleCard for container
 * - Glow effect for processing state
 * - CSS tokens for colors
 * 
 * Requirements: 10.6, 11.5
 */

'use client'

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { CheckCircle2, Clock, Loader2, XCircle } from 'lucide-react'

interface ProcessingStatusBadgeProps {
  readonly status: 'idle' | 'processing' | 'completed' | 'failed'
  readonly error?: string
  readonly className?: string
}

export function ProcessingStatusBadge({ 
  status, 
  error,
  className = '' 
}: ProcessingStatusBadgeProps) {
  const statusConfig = {
    idle: {
      icon: Clock,
      label: 'No Preview',
      glow: false,
    },
    processing: {
      icon: Loader2,
      label: 'Generating Preview...',
      glow: true,
      animate: true,
    },
    completed: {
      icon: CheckCircle2,
      label: 'Preview Ready',
      glow: false,
    },
    failed: {
      icon: XCircle,
      label: 'Preview Failed',
      glow: false,
    },
  }

  const config = statusConfig[status]
  const Icon = config.icon
  const shouldAnimate = 'animate' in config && config.animate

  return (
    <DribbbleCard 
      padding="none" 
      glow={config.glow}
      hoverLift={false}
      className={`inline-flex items-center gap-2 px-3 py-1.5 ${className}`}
    >
      <Icon 
        className={`w-4 h-4 ${shouldAnimate ? 'animate-spin' : ''} text-[rgb(var(--accent))]`}
      />
      <span className="text-sm font-medium">{config.label}</span>
      {status === 'failed' && error && (
        <span className="text-xs opacity-75" title={error}>
          (hover for details)
        </span>
      )}
    </DribbbleCard>
  )
}
