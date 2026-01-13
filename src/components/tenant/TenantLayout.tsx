'use client'

import { motion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { useTheme } from 'next-themes'
import Image from 'next/image'
import { useCallback, useEffect, useState, type ReactNode } from 'react'

// Import all UI from @/platform/ui (Dribbble kit)
import {
    IconRail,
    TopMinimalBar,
    dribbblePageEnter,
    dribbbleReducedMotion,
    type IconRailItem
} from '@/platform/ui'

import { PlayerBar, type PlayerBarProps } from '../audio'
import { MobileNav, type MobileNavItem } from './MobileNav'

export interface TenantLayoutProps {
  children: ReactNode
  /** Navigation items to display in the rail/bottom nav */
  navItems?: NavItem[]
  /** Workspace branding (logo/name) */
  workspaceName?: string
  /** Optional workspace logo URL */
  workspaceLogo?: string
  /** Base path for route matching */
  basePath?: string
  /** Whether to show the player bar */
  showPlayerBar?: boolean
  /** Props to pass to the PlayerBar component */
  playerBarProps?: Omit<PlayerBarProps, 'isVisible'>
  /** Optional CTA for the top bar */
  topBarCta?: {
    label: string
    href: string
  }
}

/**
 * NavItem - Navigation item for TenantLayout
 * Supports both ReactNode icons (legacy) and LucideIcon components (Dribbble)
 */
export interface NavItem {
  /** Unique identifier */
  id: string
  /** Icon - can be ReactNode (legacy) or LucideIcon (Dribbble) */
  icon: ReactNode | LucideIcon
  /** Label for accessibility */
  label: string
  /** Navigation href */
  href: string
  /** Whether this item is currently active (optional - auto-detected if not provided) */
  isActive?: boolean
  /** Match exact path only */
  exact?: boolean
}

/** @deprecated Use NavItem instead */
export type TenantNavItem = NavItem

/**
 * TenantLayout - Responsive layout for tenant storefronts (Dribbble style)
 * 
 * Desktop: Fixed left IconRail (~80px) from Dribbble kit
 * Mobile: Fixed bottom nav (~64px) with safe-area padding
 * TopMinimalBar pattern with centered brand and CTA pill
 * Dribbble motion utilities applied throughout
 * 
 * Requirements: 22.4 (desktop left rail), 22.5 (mobile bottom nav), 22.6 (player bar never overlaps)
 * Requirements: Tenant Dribbble (same visual language as Hub)
 */
export function TenantLayout({
  children,
  navItems = [],
  workspaceName = 'BroLab',
  workspaceLogo,
  basePath = '',
  showPlayerBar = true,
  playerBarProps,
  topBarCta,
}: Readonly<TenantLayoutProps>) {
  const [mounted, setMounted] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, setTheme } = useTheme()

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    setMounted(true)
    
    // Check reduced motion preference
    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
    
    const handleChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }
    mediaQuery.addEventListener('change', handleChange)
    
    // Scroll detection for navbar transparency
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleTheme = useCallback(() => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }, [theme, setTheme])

  // Helper to check if icon is a LucideIcon component
  const isLucideIcon = (icon: ReactNode | LucideIcon): icon is LucideIcon => {
    return typeof icon === 'function'
  }

  // Convert nav items to IconRail format (requires LucideIcon)
  const iconRailItems: IconRailItem[] = navItems
    .filter((item) => isLucideIcon(item.icon))
    .map((item) => ({
      icon: item.icon as LucideIcon,
      label: item.label,
      href: item.href,
      exact: item.exact,
    }))

  // Convert nav items to MobileNav format (supports ReactNode)
  const mobileNavItems: MobileNavItem[] = navItems.map((item) => ({
    id: item.id,
    icon: isLucideIcon(item.icon) 
      ? <item.icon className="w-6 h-6" /> 
      : item.icon,
    label: item.label,
    href: item.href,
  }))

  // Brand element for IconRail and TopMinimalBar
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

  // Motion variants based on reduced motion preference
  const motionVariants = prefersReducedMotion ? dribbbleReducedMotion : dribbblePageEnter

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-app">
        <div className="animate-pulse" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-app">
      {/* TopMinimalBar - Dribbble style header */}
      {/* On desktop: no brand (IconRail shows it), on mobile: show brand */}
      <TopMinimalBar
        brand={
          <div className="flex items-center gap-2 lg:hidden">
            {brandElement}
            <span className="font-bold text-lg text-[rgb(var(--text))]">
              {workspaceName}
            </span>
          </div>
        }
        brandHref={basePath || '/'}
        cta={topBarCta}
        right={
          <button
            onClick={toggleTheme}
            className="p-2 text-muted hover:text-text transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        }
        isScrolled={isScrolled}
        className="lg:pl-20" // Offset for IconRail on desktop
      />

      {/* Desktop IconRail - Dribbble kit component */}
      <IconRail
        items={iconRailItems}
        brand={brandElement}
      />

      {/* Mobile Bottom Nav - Hidden on desktop */}
      <MobileNav
        navItems={mobileNavItems}
        basePath={basePath}
      />

      {/* Player Bar - Sticky at bottom, above content, below nav */}
      {showPlayerBar && (
        <PlayerBar isVisible={showPlayerBar} {...playerBarProps} />
      )}

      {/* Main Content Area with Dribbble motion */}
      {/* Desktop: padding-left for left rail, padding-top for TopMinimalBar, padding-bottom for player bar */}
      {/* Mobile: padding-bottom for bottom nav + player bar space */}
      {/* Player bar height: 64px (grid-8), Mobile nav height: 64px (grid-8), TopBar height: 64px */}
      <motion.main 
        className={`
          lg:pl-20 pt-16 min-h-screen
          ${showPlayerBar 
            ? 'pb-[calc(128px+env(safe-area-inset-bottom,0px))] lg:pb-16' 
            : 'pb-[calc(64px+env(safe-area-inset-bottom,0px))] lg:pb-0'
          }
        `}
        variants={motionVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.main>
    </div>
  )
}

TenantLayout.displayName = 'TenantLayout'
