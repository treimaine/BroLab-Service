'use client'

import { TrendingDown, TrendingUp, type LucideIcon } from 'lucide-react'
import { type ReactNode } from 'react'

/**
 * MicroModule - Compact stat/info card (Dribbble style)
 * 
 * Small, dense cards for displaying stats, metrics, or compact info.
 * Used in sidebars, dashboards, and module grids.
 */

interface MicroModuleProps {
  /** Icon to display */
  icon?: LucideIcon
  /** Module label/title */
  label: string
  /** Main value to display */
  value: ReactNode
  /** Optional delta/change indicator */
  delta?: {
    value: string
    positive?: boolean
  }
  /** Optional subtitle/description */
  subtitle?: string
  /** Additional CSS classes */
  className?: string
}

export function MicroModule({
  icon: Icon,
  label,
  value,
  delta,
  subtitle,
  className = '',
}: Readonly<MicroModuleProps>) {
  return (
    <div
      className={`
        glass rounded-xl p-4
        border border-border
        ${className}
      `}
    >
      {/* Header with icon and label */}
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-[rgba(var(--accent),0.1)] flex items-center justify-center">
            <Icon className="w-4 h-4 text-accent" />
          </div>
        )}
        <span className="text-xs font-medium text-muted uppercase tracking-wide">
          {label}
        </span>
      </div>

      {/* Value */}
      <div className="text-2xl font-bold text-text mb-1">
        {value}
      </div>

      {/* Delta or subtitle */}
      {delta && (
        <div className={`flex items-center gap-1 text-sm ${delta.positive ? 'text-green-500' : 'text-red-500'}`}>
          {delta.positive ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{delta.value}</span>
        </div>
      )}

      {subtitle && !delta && (
        <p className="text-sm text-muted">{subtitle}</p>
      )}
    </div>
  )
}

MicroModule.displayName = 'MicroModule'

/**
 * MicroModuleList - Compact list variant of MicroModule
 */

interface MicroModuleListProps {
  /** Module title */
  title: string
  /** List items */
  items: Array<{
    icon?: LucideIcon
    label: string
    value?: string
    href?: string
  }>
  /** Max items to show */
  maxItems?: number
  /** Additional CSS classes */
  className?: string
}

export function MicroModuleList({
  title,
  items,
  maxItems = 5,
  className = '',
}: Readonly<MicroModuleListProps>) {
  const displayItems = items.slice(0, maxItems)

  return (
    <div
      className={`
        glass rounded-xl overflow-hidden
        border border-border
        ${className}
      `}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-border">
        <h4 className="text-sm font-semibold text-text">{title}</h4>
      </div>

      {/* List */}
      <div className="divide-y divide-border">
        {displayItems.map((item, index) => {
          const Icon = item.icon
          const content = (
            <div className="flex items-center justify-between px-4 py-2.5 hover:bg-[rgba(var(--bg-2),0.5)] transition-colors">
              <div className="flex items-center gap-2">
                {Icon && <Icon className="w-4 h-4 text-muted" />}
                <span className="text-sm text-text">{item.label}</span>
              </div>
              {item.value && (
                <span className="text-sm font-medium text-muted">{item.value}</span>
              )}
            </div>
          )

          const key = item.href || `${item.label}-${index}`

          if (item.href) {
            return (
              <a key={key} href={item.href} className="block">
                {content}
              </a>
            )
          }

          return <div key={key}>{content}</div>
        })}
      </div>

      {/* Show more indicator */}
      {items.length > maxItems && (
        <div className="px-4 py-2 text-center border-t border-border">
          <span className="text-xs text-muted">
            +{items.length - maxItems} more
          </span>
        </div>
      )}
    </div>
  )
}

MicroModuleList.displayName = 'MicroModuleList'
