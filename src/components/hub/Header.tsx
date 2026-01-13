'use client'

import { GlassHeader, TopMinimalBar } from '@/platform/ui'
import { useEffect, useState } from 'react'
import { ThemeToggle } from './ThemeToggle'

/**
 * Hub Header Component (ELECTRI-X Style)
 * 
 * Uses TopMinimalBar with Hub-specific configuration:
 * - Brand label "BROLAB" centered
 * - ThemeToggle in the right slot
 * - "Sign In" secondary action
 * - "Explore →" pill CTA
 * - Mobile menu with nav items
 * 
 * Wrapped in GlassHeader for scroll-based glass effect.
 * 
 * Requirements: 31 (Marketing Visual Consistency)
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <GlassHeader isScrolled={isScrolled}>
      <TopMinimalBar
        brand={
          <span className="text-sm font-medium text-muted uppercase tracking-[0.3em] hover:text-text transition-colors">
            BROLAB
          </span>
        }
        brandHref="/"
        navItems={[
          { label: 'Home', href: '/' },
          { label: 'Pricing', href: '/pricing' },
          { label: 'About', href: '/about' },
          { label: 'Contact', href: '/contact' },
        ]}
        secondaryAction={{
          label: 'Sign In',
          href: '/sign-in',
        }}
        cta={{
          label: 'Explore →',
          href: '/sign-up',
        }}
        right={<ThemeToggle />}
      />
    </GlassHeader>
  )
}
