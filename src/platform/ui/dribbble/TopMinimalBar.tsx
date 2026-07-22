'use client'

import { ChromeSurface } from '@/platform/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'
import { PillCTA } from './PillCTA'


/**
 * TopMinimalBar - Minimal top bar with centered brand and CTA pill (Dribbble style)
 *
 * Clean, minimal header with brand centered and primary CTA on the right.
 * Below `navBreakpoint`: hamburger menu. Above: inline navigation.
 *
 * CRITICAL: Header is a CHROME surface, not a CARD surface.
 * It must use bg tokens (--bg) to stay theme-coherent.
 * - Transparent at top (unscrolled)
 * - Theme-coherent tinted glass on scroll
 *
 * Layout is a 3-column grid (`1fr auto 1fr`) so the brand is optically centered
 * while staying IN FLOW. An absolutely-positioned brand cannot be seen by the
 * flex/grid algorithm and collides with the action cluster on narrow screens.
 *
 * Scroll state is managed internally; pass `isScrolled` only to override it.
 */

export interface TopMinimalBarNavItem {
  label: string
  href: string
}

interface TopMinimalBarProps {
  /** Brand element (logo/text) */
  brand: ReactNode
  /** Brand link href (defaults to '/') */
  brandHref?: string
  /** Navigation items — rendered inline on desktop AND inside the mobile menu */
  navItems?: TopMinimalBarNavItem[]
  /** Custom left slot (replaces navItems on desktop only; navItems still drive the mobile menu) */
  left?: ReactNode
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
  /** Extra content appended to the mobile menu (e.g., auth actions) */
  mobileExtra?: ReactNode
  /**
   * Viewport at which inline nav replaces the hamburger.
   * 'md' (768px) by default so tablets get real navigation.
   * Use 'lg' when a sidebar/rail takes over at that width.
   */
  navBreakpoint?: 'md' | 'lg'
  /** Override the internal scroll detection (transparent → opaque transition) */
  isScrolled?: boolean
  /** Additional CSS classes */
  className?: string
}

/**
 * Static class maps — Tailwind needs literal class names at build time,
 * so these cannot be interpolated.
 */
const BREAKPOINT_CLASSES = {
  md: { below: 'md:hidden', above: 'hidden md:flex' },
  lg: { below: 'lg:hidden', above: 'hidden lg:flex' },
} as const

export function TopMinimalBar({
  brand,
  brandHref = '/',
  navItems = [],
  left,
  cta,
  secondaryAction,
  right,
  mobileExtra,
  navBreakpoint = 'md',
  isScrolled,
  className = '',
}: Readonly<TopMinimalBarProps>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolledInternal, setScrolledInternal] = useState(false)
  const pathname = usePathname()

  const bp = BREAKPOINT_CLASSES[navBreakpoint]
  const scrolled = isScrolled ?? scrolledInternal

  // Only offer a menu when there is something to put in it.
  const hasMobileMenu = navItems.length > 0 || Boolean(secondaryAction) || Boolean(cta) || Boolean(mobileExtra)

  useEffect(() => {
    if (isScrolled !== undefined) return
    const handleScroll = () => setScrolledInternal(window.scrollY > 50)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [isScrolled])

  // Close the menu on navigation
  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  // Escape to close + lock body scroll while the menu is open
  useEffect(() => {
    if (!mobileMenuOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [mobileMenuOpen])

  const isActive = (href: string) => pathname === href

  return (
    <ChromeSurface
      as="header"
      mode={scrolled ? 'base' : 'transparent'}
      opacity={scrolled ? 75 : 95}
      blur={scrolled ? 'md' : 'none'}
      className={`fixed top-0 left-0 right-0 z-50 transition-[background-color,backdrop-filter] duration-300 ${className}`}
    >
      <div className="container mx-auto px-4">
        {/* 1fr auto 1fr keeps the brand optically centered without leaving the flow */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 h-16">

          {/* Left: hamburger (mobile) / nav (desktop) */}
          <div className="flex items-center justify-start min-w-0">
            {hasMobileMenu && (
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`${bp.below} p-2.5 -ml-2.5 min-h-[44px] min-w-[44px] items-center justify-center text-muted hover:text-text transition-colors rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent flex`}
                aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={mobileMenuOpen}
                aria-controls="top-bar-mobile-menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            )}

            <div className={`${bp.above} items-center gap-6 min-w-0`}>
              {left ?? (
                <nav className="flex items-center gap-6" aria-label="Main">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={isActive(item.href) ? 'page' : undefined}
                      className={`relative text-sm font-medium transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                        isActive(item.href) ? 'text-accent' : 'text-muted hover:text-text'
                      }`}
                    >
                      {item.label}
                      {isActive(item.href) && (
                        <span className="block h-0.5 mt-1 bg-accent rounded-full shadow-[0_0_8px_rgb(var(--accent)/0.6)]" />
                      )}
                    </Link>
                  ))}
                </nav>
              )}
            </div>
          </div>

          {/* Center: Brand — in flow, truncates instead of overlapping */}
          <Link
            href={brandHref}
            className="min-w-0 justify-self-center truncate rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {brand}
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-3 min-w-0">
            {right}

            {secondaryAction && (
              <Link
                href={secondaryAction.href}
                className="hidden sm:block text-sm font-medium text-muted hover:text-text transition-colors"
              >
                {secondaryAction.label}
              </Link>
            )}

            {cta && (
              <Link href={cta.href} className="hidden sm:block">
                <PillCTA as="span" size="sm" variant="primary">
                  {cta.label}
                </PillCTA>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="top-bar-mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`${bp.below} overflow-hidden border-t border-border bg-[rgb(var(--bg)/0.98)] backdrop-blur-md`}
          >
            <nav className="container mx-auto px-4 py-4 flex flex-col gap-1" aria-label="Mobile">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={isActive(item.href) ? 'page' : undefined}
                  className={`py-3 min-h-[44px] flex items-center text-base font-medium transition-colors rounded ${
                    isActive(item.href) ? 'text-accent' : 'text-muted hover:text-text'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}

              {secondaryAction && (
                <Link
                  href={secondaryAction.href}
                  className="py-3 min-h-[44px] flex items-center text-base font-medium text-muted hover:text-text transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {secondaryAction.label}
                </Link>
              )}

              {mobileExtra}

              {cta && (
                <Link
                  href={cta.href}
                  className="mt-2"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <PillCTA as="span" size="md" variant="primary" className="w-full justify-center">
                    {cta.label}
                  </PillCTA>
                </Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </ChromeSurface>
  )
}

TopMinimalBar.displayName = 'TopMinimalBar'
