'use client'

import { ChromeSurface } from '@/platform/ui'
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
 * 
 * CRITICAL: Header is a CHROME surface, not a CARD surface.
 * It must use bg tokens (--bg) to stay theme-coherent.
 * - Transparent at top (unscrolled)
 * - Theme-coherent tinted glass on scroll (bg-[rgb(var(--bg))]/95)
 * 
 * Supports custom right slot for actions like theme toggle, user menu, etc.
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
  /** Custom right slot for actions (theme toggle, user menu, etc.) */
  right?: ReactNode
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
  right,
  isScrolled = false,
  className = '',
}: Readonly<TopMinimalBarProps>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <ChromeSurface
      as="header"
      mode={isScrolled ? 'elevated' : 'transparent'}
      blur={isScrolled ? 'sm' : 'none'}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter] duration-300 ${className}`}
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
            {/* Custom right slot (e.g., theme toggle, user menu) */}
            {right}

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
          className="lg:hidden border-t border-border"
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
    </ChromeSurface>
  )
}

TopMinimalBar.displayName = 'TopMinimalBar'
