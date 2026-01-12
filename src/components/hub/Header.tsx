'use client'

import { PillCTA } from '@/platform/ui'
import { Menu, X } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * Hub Header Component (ELECTRI-X Style)
 * 
 * ELECTRI-X composition:
 * - Brand label centered (not logo, just text)
 * - "Explore →" pill CTA on the right
 * - NO horizontal nav links (Home, Pricing removed)
 * - Glass background
 */
export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  // Toggle theme using next-themes
  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  // Check if a link is active
  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.startsWith(href)
  }

  // Link styles with active state and focus-visible ring
  const linkStyles = (href: string) => {
    const active = isActive(href)
    return `py-2 text-base font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm ${
      active 
        ? 'text-text underline underline-offset-4 decoration-accent' 
        : 'text-muted hover:text-text'
    }`
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-[rgba(var(--border),0.3)]">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left: Mobile menu button (mobile only) */}
          <div className="flex items-center gap-4 lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Left spacer for desktop (to balance the layout) */}
          <div className="hidden lg:flex items-center gap-4 w-32">
            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
          </div>

          {/* Center: Brand label (ELECTRI-X style - just text, centered) */}
          <Link 
            href="/" 
            className="absolute left-1/2 -translate-x-1/2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
          >
            <span className="text-sm font-medium text-muted uppercase tracking-[0.3em] hover:text-text transition-colors">
              BROLAB
            </span>
          </Link>

          {/* Right: Explore CTA (ELECTRI-X style - prominent pill) */}
          <div className="flex items-center gap-3">
            {/* Sign In link (subtle) */}
            <Link
              href="/sign-in"
              className={`hidden sm:block text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm ${
                isActive('/sign-in') 
                  ? 'text-text underline underline-offset-4 decoration-accent' 
                  : 'text-muted hover:text-text'
              }`}
            >
              Sign In
            </Link>

            {/* Explore CTA (prominent pill) */}
            <Link href="/sign-up" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-full">
              <PillCTA variant="primary" size="sm" className="group">
                <span>Explore</span>
                <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
              </PillCTA>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-[rgba(var(--border),0.3)] glass">
          <nav className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link
              href="/"
              className={linkStyles('/')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/pricing"
              className={linkStyles('/pricing')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              href="/about"
              className={linkStyles('/about')}
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link
              href="/contact"
              className={linkStyles('/contact')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Contact
            </Link>
            <Link
              href="/sign-in"
              className={linkStyles('/sign-in')}
              onClick={() => setMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <div className="pt-2">
              <button
                onClick={toggleTheme}
                className="py-2 text-base font-medium text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-bg rounded-sm"
              >
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
