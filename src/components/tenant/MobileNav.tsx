'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

// Import Dribbble motion utilities and ChromeSurface from @/platform/ui
import { ChromeSurface, dribbbleHoverLift, springTransition } from '@/platform/ui'

export interface MobileNavItem {
  /** Unique identifier */
  id: string
  /** Pre-rendered icon as ReactNode (TenantLayout handles icon rendering before passing here) */
  icon: ReactNode
  /** Label for accessibility */
  label: string
  /** Navigation href */
  href: string
}

export interface MobileNavProps {
  /** Navigation items to display */
  navItems?: MobileNavItem[]
  /** Base path for route matching (e.g., '/tenant-demo' or '/_t/workspace-slug') */
  basePath?: string
}

/**
 * MobileNav - Mobile bottom navigation component for tenant storefronts (Dribbble style)
 *
 * Icons are always pre-rendered ReactNodes — TenantLayout handles icon instantiation.
 * Requirements: 22.5 (Mobile fixed bottom nav), 22.3 (Touch targets ≥ 44px)
 */
export function MobileNav({
  navItems = [],
  basePath = '',
}: Readonly<MobileNavProps>) {
  const pathname = usePathname()

  const isItemActive = (href: string): boolean => {
    const normalizedHref = href.replace(/\/$/, '')
    const normalizedPathname = pathname?.replace(/\/$/, '') ?? ''
    if (normalizedPathname === normalizedHref) return true
    if (normalizedHref !== basePath && normalizedPathname.startsWith(normalizedHref + '/')) return true
    return false
  }

  return (
    <ChromeSurface
      as="nav"
      blur="sm"
      border="top"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 pb-safe"
      aria-label="Mobile navigation"
    >
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = isItemActive(item.href)

          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative group flex-1 flex items-center justify-center cursor-pointer"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[44px] min-h-[44px] w-14 h-14
                  rounded-2xl transition-colors duration-200
                  ${isActive
                    ? 'bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] text-white'
                    : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgba(var(--bg-2),0.5)]'
                  }
                `}
                whileHover={dribbbleHoverLift.whileHover}
                whileTap={{ scale: 0.95, transition: springTransition }}
              >
                {/* Icon - always a pre-rendered ReactNode */}
                <span className="w-5 h-5 flex items-center justify-center">
                  {item.icon}
                </span>

                {/* Label */}
                <span className={`text-[10px] font-medium mt-0.5 ${isActive ? 'text-white' : 'text-inherit'}`}>
                  {item.label}
                </span>

                {/* Active glow */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{ boxShadow: '0 0 20px rgba(var(--accent), 0.4)' }}
                  />
                )}
              </motion.div>

              {/* Active indicator dot */}
              {isActive && (
                <motion.div
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[rgb(var(--accent))]"
                  layoutId="mobileActiveIndicator"
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={springTransition}
                />
              )}
            </Link>
          )
        })}
      </div>
    </ChromeSurface>
  )
}

MobileNav.displayName = 'MobileNav'
