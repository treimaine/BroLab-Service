'use client'

import { ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { type ReactNode } from 'react'

/**
 * SectionHeader - Dense section header with horizontal rule (Dribbble style)
 * 
 * Compact header with uppercase label, optional action link,
 * and horizontal rule. Used to introduce content sections.
 */

interface SectionHeaderProps {
  /** Section title */
  title: string
  /** Optional subtitle */
  subtitle?: string
  /** Action link */
  action?: {
    label: string
    href: string
  }
  /** Custom action element */
  actionElement?: ReactNode
  /** Show horizontal rule */
  showRule?: boolean
  /** Additional CSS classes */
  className?: string
}

export function SectionHeader({
  title,
  subtitle,
  action,
  actionElement,
  showRule = true,
  className = '',
}: Readonly<SectionHeaderProps>) {
  return (
    <div className={`mb-6 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        {/* Title area */}
        <div className="flex items-center gap-4 min-w-0">
          <h2 className="text-xs font-bold text-muted uppercase tracking-wider whitespace-nowrap">
            {title}
          </h2>
          
          {/* Horizontal rule */}
          {showRule && (
            <div className="flex-1 h-px bg-border min-w-[40px]" />
          )}
        </div>

        {/* Action */}
        {action && (
          <Link
            href={action.href}
            className="flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-2 transition-colors whitespace-nowrap"
          >
            {action.label}
            <ChevronRight className="w-4 h-4" />
          </Link>
        )}

        {actionElement}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      )}
    </div>
  )
}

SectionHeader.displayName = 'SectionHeader'
