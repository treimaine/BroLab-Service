'use client'

import { type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import { type ReactNode } from 'react'

// Import IconRail from @/platform/ui (Dribbble kit)
import { IconRail, type IconRailItem } from '@/platform/ui'

export interface LeftRailNavItem {
  /** Unique identifier */
  id: string
  /** Icon component - LucideIcon for Dribbble style, ReactNode for legacy */
  icon: LucideIcon | ReactNode
  /** Label for accessibility */
  label: string
  /** Navigation href */
  href: string
  /** Match exact path only */
  exact?: boolean
}

export interface LeftRailProps {
  /** Navigation items to display */
  navItems?: LeftRailNavItem[]
  /** Workspace branding - name displayed as initial in logo */
  workspaceName?: string
  /** Optional workspace logo URL */
  workspaceLogo?: string
  /** Base path for route matching (e.g., '/tenant-demo' or '/_t/workspace-slug') */
  basePath?: string
}

/**
 * @deprecated Use IconRail from @/platform/ui directly for new code.
 * This component is a wrapper for backward compatibility.
 * 
 * LeftRail - Desktop navigation component for tenant storefronts (Dribbble style)
 * 
 * Features:
 * - Icon-based navigation with Dribbble hover/active states
 * - Active route highlighting with glow effect and accent indicator
 * - Workspace branding area with gradient logo
 * - Fixed position (80px width on desktop via IconRail)
 * - Glass morphism styling with dribbbleHoverLift motion
 * - Tooltips on hover
 * 
 * Requirements: 22.4 (Desktop fixed left icon rail)
 * Requirements: Tenant Dribbble (same visual language as Hub)
 */
export function LeftRail({
  navItems = [],
  workspaceName = 'BroLab',
  workspaceLogo,
}: Readonly<LeftRailProps>) {
  // Helper to check if icon is a LucideIcon component
  const isLucideIcon = (icon: ReactNode | LucideIcon): icon is LucideIcon => {
    return typeof icon === 'function'
  }

  // Convert LeftRailNavItem[] to IconRailItem[] (requires LucideIcon)
  // Filter out items with ReactNode icons as IconRail requires LucideIcon
  const iconRailItems: IconRailItem[] = navItems
    .filter((item) => isLucideIcon(item.icon))
    .map((item) => ({
      icon: item.icon as LucideIcon,
      label: item.label,
      href: item.href,
      exact: item.exact,
    }))

  // Brand element for IconRail - Dribbble gradient style
  const brandElement = workspaceLogo ? (
    <Image
      src={workspaceLogo}
      alt={`${workspaceName} logo`}
      width={40}
      height={40}
      className="rounded-xl object-cover"
    />
  ) : (
    <div 
      className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center text-white font-bold text-lg select-none shadow-lg"
      aria-label={workspaceName}
    >
      {workspaceName.charAt(0).toUpperCase()}
    </div>
  )

  // Render IconRail from Dribbble kit with converted items
  // IconRail provides: 80px width, dribbbleHoverLift, active glow, tooltips
  return (
    <IconRail
      items={iconRailItems}
      brand={brandElement}
    />
  )
}

LeftRail.displayName = 'LeftRail'
