'use client'

import { AuthNav } from '@/components/hub/AuthNav'
import { ThemeToggle, TopMinimalBar } from '@/platform/ui'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

/**
 * Marketing Pages Layout
 * 
 * Provides consistent header for marketing pages (pricing, about, contact, etc.)
 * Uses ELECTRI-X design language with TopMinimalBar pattern.
 * Footer is provided by parent layout.
 * 
 * Uses next-themes for theme management (no manual localStorage/classList manipulation).
 * 
 * Requirements: 19 (Marketing Pages)
 */

interface MarketingLayoutProps {
  readonly children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Navigation links with active state
  const navLinks = [
    { href: '/pricing', label: 'Pricing' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <>
      <TopMinimalBar
        brand={
          <Link
            href="/"
            className="text-sm font-medium text-muted uppercase tracking-[0.4em] hover:text-text transition-colors"
          >
            BROLAB
          </Link>
        }
        brandHref="/"
        left={
          <nav className="flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded ${
                    isActive ? 'text-accent' : 'text-muted hover:text-text'
                  }`}
                  style={isActive ? { textShadow: '0 0 12px rgba(var(--accent), 0.4)' } : undefined}
                >
                  {link.label}
                  {isActive && (
                    <span className="block h-0.5 mt-1 bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent),0.6)]" />
                  )}
                </Link>
              )
            })}
          </nav>
        }
        right={
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <AuthNav ctaLabel="Get Started" />
          </div>
        }
        isScrolled={isScrolled}
      />

      {/* Main content with top padding for fixed header */}
      <div className="pt-24">
        {children}
      </div>
    </>
  )
}
