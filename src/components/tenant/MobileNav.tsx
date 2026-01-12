'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { type ReactNode } from 'react'

// Import Dribbble motion utilities from @/platform/ui
import { dribbbleHoverLift, springTransition } from '@/platform/ui'

export interface MobileNavItem {
  /** Unique identifier */
  id: string
  /** Icon component - LucideIcon for Dribbble style, ReactNode for legacy/pre-rendered */
  icon: LucideIcon | ReactNode
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
 * Features:
 * - Bottom navigation bar with safe-area padding (.pb-safe)
 * - Same nav items as LeftRail
 * - Touch targets ≥ 44px
 * - Active route highlighting with glow effect
 * - Fixed position (~64px height)
 * - Glass morphism styling with Dribbble motion
 * - PillCTA-style nav items with gradient active state
 * - Hidden on desktop (lg: breakpoint and above)
 * 
 * Requirements: 22.5 (Mobile fixed bottom nav), 22.3 (Touch targets ≥ 44px)
 * Requirements: Tenant Dribbble (same visual language as Hub)
 */
export function MobileNav({
  navItems = [],
  basePath = '',
}: Readonly<MobileNavProps>) {
  const pathname = usePathname()

  /**
   * Determines if a nav item is active based on current pathname
   * Handles both exact matches and nested routes
   */
  const isItemActive = (href: string): boolean => {
    // Normalize paths for comparison
    const normalizedHref = href.replace(/\/$/, '')
    const normalizedPathname = pathname?.replace(/\/$/, '') ?? ''
    
    // Exact match
    if (normalizedPathname === normalizedHref) {
      return true
    }
    
    // For nested routes: check if pathname starts with href
    // But only if href is not the base path (to avoid highlighting base on all pages)
    if (normalizedHref !== basePath && normalizedPathname.startsWith(normalizedHref + '/')) {
      return true
    }
    
    return false
  }

  // Helper to check if icon is a LucideIcon component
  const isLucideIcon = (icon: ReactNode | LucideIcon): icon is LucideIcon => {
    return typeof icon === 'function'
  }

  return (
    <nav 
      className="
        lg:hidden fixed bottom-0 left-0 right-0 z-40
        h-16
        glass border-t border-[rgba(var(--border),var(--border-alpha))]
        pb-safe
      "
      aria-label="Mobile navigation"
    >
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = isItemActive(item.href)
          const IconComponent = isLucideIcon(item.icon) ? item.icon : null
          
          return (
            <Link
              key={item.id}
              href={item.href}
              className="relative group flex-1 flex items-center justify-center"
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                className={`
                  relative flex flex-col items-center justify-center
                  min-w-[44px] min-h-[44px] w-14 h-14
                  rounded-2xl
                  transition-colors duration-200
                  ${
                    isActive
                      ? 'bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] text-white'
                      : 'text-[rgb(var(--muted))] hover:text-[rgb(var(--text))] hover:bg-[rgba(var(--card),0.5)]'
                  }
                `}
                whileHover={dribbbleHoverLift.whileHover}
                whileTap={{ scale: 0.95, transition: springTransition }}
              >
                {/* Icon */}
                {IconComponent ? (
                  <IconComponent className="w-5 h-5" />
                ) : (
                  <span className="w-5 h-5 flex items-center justify-center">
                    {item.icon as ReactNode}
                  </span>
                )}
                
                {/* Label (compact) */}
                <span className={`
                  text-[10px] font-medium mt-0.5
                  ${isActive ? 'text-white' : 'text-inherit'}
                `}>
                  {item.label}
                </span>

                {/* Active glow effect */}
                {isActive && (
                  <motion.div
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                      boxShadow: '0 0 20px rgba(var(--accent), 0.4)',
                    }}
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
    </nav>
  )
}

MobileNav.displayName = 'MobileNav'
