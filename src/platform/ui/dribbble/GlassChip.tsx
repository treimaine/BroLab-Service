'use client'

import type { LucideIcon } from 'lucide-react'
import { forwardRef } from 'react'

/**
 * GlassChip - Compact glass chip for badges and content labels
 *
 * Features:
 * - Glass background with backdrop blur
 * - Icon + label + optional sublabel
 * - Two size variants (sm, md)
 * - Compact pill-style design
 * - Uses bg-2 tokens for theme coherence
 *
 * Use cases:
 * - Trust badges
 * - Feature tags
 * - Status indicators
 * - Info chips
 * - Metadata labels
 *
 * Requirements: Surface Component
 */

export interface GlassChipProps {
  /** Lucide icon component */
  icon: LucideIcon
  /** Primary label text */
  label: string
  /** Optional secondary label text */
  sublabel?: string
  /** Size variant */
  size?: 'sm' | 'md'
  /** Additional CSS classes */
  className?: string
  /** Click handler (makes chip interactive) */
  onClick?: () => void
  /** Accessible label override */
  'aria-label'?: string
}

const sizeStyles = {
  sm: {
    chip: 'h-8 px-2.5 gap-1.5',
    icon: 'w-3.5 h-3.5',
    label: 'text-xs',
    sublabel: 'text-[10px]',
  },
  md: {
    chip: 'h-10 px-3 gap-2',
    icon: 'w-4 h-4',
    label: 'text-sm',
    sublabel: 'text-xs',
  },
}

export const GlassChip = forwardRef<HTMLButtonElement | HTMLDivElement, GlassChipProps>(
  (
    {
      icon: Icon,
      label,
      sublabel,
      size = 'md',
      onClick,
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const config = sizeStyles[size]
    const isInteractive = !!onClick
    const accessibleLabel = ariaLabel ?? (sublabel ? `${label}: ${sublabel}` : label)

    const sharedClassName = `
      inline-flex items-center
      rounded-full
      bg-[rgba(var(--bg-2),0.8)]
      backdrop-blur-sm
      border border-[rgba(var(--border),var(--border-alpha))]
      transition-[background-color,box-shadow,transform] duration-200
      ${config.chip}
      ${isInteractive ? 'cursor-pointer hover:bg-[rgba(var(--bg-2),0.9)] hover:shadow-[0_2px_12px_rgba(var(--accent),0.1)] active:scale-[0.98]' : ''}
      ${className}
    `

    const content = (
      <>
        {/* Icon */}
        <Icon 
          className={`${config.icon} text-[rgb(var(--accent))] flex-shrink-0`}
          aria-hidden="true"
        />

        {/* Labels */}
        <div className="flex flex-col min-w-0">
          <span 
            className={`
              ${config.label}
              font-medium text-[rgb(var(--text))]
              leading-tight
            `}
          >
            {label}
          </span>
          {sublabel && (
            <span 
              className={`
                ${config.sublabel}
                text-[rgb(var(--muted))]
                leading-tight
              `}
            >
              {sublabel}
            </span>
          )}
        </div>
      </>
    )

    if (isInteractive) {
      return (
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          className={sharedClassName}
          onClick={onClick}
          aria-label={accessibleLabel}
        >
          {content}
        </button>
      )
    }

    return (
      <div
        ref={ref as React.Ref<HTMLDivElement>}
        className={sharedClassName}
        aria-label={accessibleLabel}
      >
        {content}
      </div>
    )
  }
)

GlassChip.displayName = 'GlassChip'
