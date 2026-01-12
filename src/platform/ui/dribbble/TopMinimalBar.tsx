'use client'

import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { useState, type ReactNode } from 'react'
import { PillCTA } from './PillCTA'

/**
 * TopMinimalBar - Minimal top bar with centered brand and CTA pill (Dribbble style)
 * 
 * Clean, minimal header with brand centered and primary CTA on the right.
 * Mobile: hamburger menu. Desktop: inline navigation.
 */

interface TopMinimalBarProps {
  /** Brand element (logo/text) */
  brand: ReactNode
  /** Brand link href (defaults to '/') */
  brandHref?: string
  /** Navigation items */
  navItems?: Array<{
    label: string
    href: string
  }>
  /** Primary CTA */
  cta?: {
    label: string
    href: string
  }
  /** Secondary action (e.g., sign in) */
  secondaryAction?: {
    label: string
    href: string
  }
  /** Theme toggle handler */
  onThemeToggle?: () => void
  /** Current theme */
  isDark?: boolean
  /** Whether the page is scrolled (for transparent → opaque transition) */
  isScrolled?: boolean
  /** Additional CSS classes */
  className?: string
}

export function TopMinimalBar({
  brand,
  brandHref = '/',
  navItems = [],
  cta,
  secondaryAction,
  onThemeToggle,
  isDark,
  isScrolled = false,
  className = '',
}: Readonly<TopMinimalBarProps>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-[background-color,backdrop-filter] duration-300
        ${isScrolled 
          ? 'bg-[rgb(var(--bg))]/95 backdrop-blur-sm' 
          : 'bg-transparent'
        }
        ${className}
      `}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile menu button (mobile only) */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted hover:text-text transition-colors"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Left: Nav items (desktop only) */}
          <nav className="hidden lg:flex items-center gap-6">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-muted hover:text-text transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Center: Brand */}
          <Link href={brandHref} className="absolute left-1/2 -translate-x-1/2">
            {brand}
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {/* Theme toggle */}
            {onThemeToggle && (
              <button
                onClick={onThemeToggle}
                className="p-2 text-muted hover:text-text transition-colors"
                aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {isDark ? '☀️' : '🌙'}
              </button>
            )}

            {/* Secondary action (desktop only) */}
            {secondaryAction && (
              <Link
                href={secondaryAction.href}
                className="hidden sm:block text-sm font-medium text-muted hover:text-text transition-colors"
              >
                {secondaryAction.label}
              </Link>
            )}

            {/* Primary CTA */}
            {cta && (
              <Link href={cta.href}>
                <PillCTA size="sm" variant="primary">
                  {cta.label}
                </PillCTA>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="lg:hidden border-t border-border glass"
        >
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2 text-base font-medium text-muted hover:text-text transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {secondaryAction && (
              <Link
                href={secondaryAction.href}
                className="py-2 text-base font-medium text-muted hover:text-text transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {secondaryAction.label}
              </Link>
            )}
          </nav>
        </motion.div>
      )}
    </header>
  )
}

TopMinimalBar.displayName = 'TopMinimalBar'
