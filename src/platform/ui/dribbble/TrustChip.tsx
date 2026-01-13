'use client'

import type { LucideIcon } from 'lucide-react'
import { forwardRef } from 'react'

/**
 * TrustChip - Small pill for trust signals and badges
 *
 * Features:
 * - Glass background with subtle border
 * - Muted text for understated trust signals
 * - Icon + label layout
 * - Compact pill design
 * - Non-interactive (display only)
 *
 * Use cases:
 * - Trust row badges ("No credit card", "Cancel anytime")
 * - Security indicators
 * - Feature highlights
 * - Social proof elements
 *
 * Requirements: 31
 */

export interface TrustChipProps {
  /** Lucide icon component */
  icon: LucideIcon
  /** Label text */
  label: string
  /** Additional CSS classes */
  className?: string
  /** Accessible label override */
  'aria-label'?: string
}

export const TrustChip = forwardRef<HTMLDivElement, TrustChipProps>(
  ({ icon: Icon, label, className = '', 'aria-label': ariaLabel }, ref) => {
    return (
      <div
        ref={ref}
        className={`
          inline-flex items-center gap-2
          h-9 px-3
          rounded-full
          bg-[rgba(var(--bg-2),0.6)]
          backdrop-blur-sm
          border border-[rgba(var(--border),var(--border-alpha))]
          ${className}
        `}
        aria-label={ariaLabel ?? label}
      >
        {/* Icon */}
        <Icon
          className="w-3.5 h-3.5 text-[rgb(var(--muted))] flex-shrink-0"
          aria-hidden="true"
        />

        {/* Label */}
        <span className="text-sm text-[rgb(var(--muted))] font-medium leading-tight whitespace-nowrap">
          {label}
        </span>
      </div>
    )
  }
)

TrustChip.displayName = 'TrustChip'
