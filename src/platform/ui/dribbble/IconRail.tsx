'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

/**
 * IconRail - Vertical icon navigation for desktop (Dribbble style)
 * 
 * Fixed left rail with icon-based navigation. Shows active state with
 * glow effect and accent background. Hidden on mobile (use MobileNav instead).
 */

export interface IconRailItem {
  icon: LucideIcon
  label: string
  href: string
  /** Match exact path only */
  exact?: boolean
}

interface IconRailProps {
  items: IconRailItem[]
  /** Brand element to show at top */
  brand?: React.ReactNode
  /** Additional CSS classes */
  className?: string
}

export function IconRail({ items, brand, className = '' }: Readonly<IconRailProps>) {
  const pathname = usePathname()

  const isActive = (item: IconRailItem) => {
    if (item.exact) {
      return pathname === item.href
    }
    return pathname.startsWith(item.href)
  }

  return (
    <nav
      className={`
        fixed left-0 top-0 bottom-0 z-40
        hidden lg:flex flex-col
        w-20 py-6
        glass border-r border-border
        ${className}
      `}
      aria-label="Main navigation"
    >
      {/* Brand area */}
      {brand && (
        <div className="flex items-center justify-center mb-8 px-2">
          {brand}
        </div>
      )}

      {/* Navigation items */}
      <div className="flex-1 flex flex-col items-center gap-2">
        {items.map((item, index) => {
          const active = isActive(item)
          const Icon = item.icon

          return (
            <Link
              key={`${item.href}-${index}`}
              href={item.href}
              className="relative group"
              aria-current={active ? 'page' : undefined}
            >
              <motion.div
                className={`
                  relative flex items-center justify-center
                  w-12 h-12 rounded-xl
                  transition-colors duration-200
                  ${active 
                    ? 'bg-[rgba(var(--accent),0.15)] text-accent' 
                    : 'text-muted hover:text-text hover:bg-[rgba(var(--bg-2),0.5)]'
                  }
                `}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon className="w-6 h-6" />
                
                {/* Active glow */}
                {active && (
                  <motion.div
                    className="absolute inset-0 rounded-xl"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      boxShadow: '0 0 20px rgba(var(--accent), 0.3)',
                    }}
                  />
                )}
              </motion.div>

              {/* Active indicator bar */}
              {active && (
                <motion.div
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 rounded-r-full bg-accent"
                  layoutId="activeIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                />
              )}

              {/* Tooltip */}
              <div
                className="
                  absolute left-full ml-3 top-1/2 -translate-y-1/2
                  px-3 py-1.5 rounded-lg
                  bg-[rgba(var(--bg-2),0.95)] border border-border
                  text-sm font-medium text-text
                  opacity-0 group-hover:opacity-100
                  pointer-events-none
                  transition-opacity duration-200
                  whitespace-nowrap
                "
              >
                {item.label}
              </div>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

IconRail.displayName = 'IconRail'
