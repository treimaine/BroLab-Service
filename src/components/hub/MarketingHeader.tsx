'use client'

import { GlassHeader, PillCTA } from '@/platform/ui'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'

/**
 * Marketing Header Component (Client Component)
 * 
 * Provides consistent header for marketing pages with theme toggle and navigation.
 * Uses ELECTRI-X design language with TopMinimalBar pattern.
 * 
 * Requirements: 19 (Marketing Pages)
 */

export function MarketingHeader() {
  const pathname = usePathname()
  const { setTheme, resolvedTheme } = useTheme()
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

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
    <GlassHeader isScrolled={isScrolled} className="px-4 lg:px-8 py-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Left: Theme toggle */}
        <div className="flex-1 flex items-center gap-6">
          {(() => {
            const isDark = mounted && resolvedTheme === 'dark'
            let ariaLabel = 'Toggle theme'
            if (mounted) {
              ariaLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode'
            }
            const icon = isDark ? '☀️' : '🌙'
            
            return (
              <button
                onClick={toggleTheme}
                className="p-2 text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] rounded-lg"
                aria-label={ariaLabel}
              >
                {icon}
              </button>
            )
          })()}
          
          {/* Nav links - desktop */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 rounded ${
                    isActive 
                      ? 'text-accent' 
                      : 'text-muted hover:text-text'
                  }`}
                  style={isActive ? {
                    textShadow: '0 0 12px rgba(var(--accent), 0.4)'
                  } : undefined}
                >
                  {link.label}
                  {isActive && (
                    <span className="block h-0.5 mt-1 bg-accent rounded-full shadow-[0_0_8px_rgba(var(--accent),0.6)]" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
        
        {/* Center: Brand */}
        <Link 
          href="/" 
          className="text-sm font-medium text-muted uppercase tracking-[0.4em] hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] rounded px-2 py-1"
        >
          BROLAB
        </Link>
        
        {/* Right: Sign In + CTA */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <Link
            href="/sign-in"
            className="hidden sm:block text-sm font-medium text-muted hover:text-text transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] rounded px-2 py-1"
          >
            Sign In
          </Link>
          <Link href="/sign-up" className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))] rounded-full">
            <PillCTA variant="primary" size="sm" className="group">
              <span>Get Started</span>
              <span className="ml-1 group-hover:translate-x-1 transition-transform inline-block">→</span>
            </PillCTA>
          </Link>
        </div>
      </div>
    </GlassHeader>
  )
}
