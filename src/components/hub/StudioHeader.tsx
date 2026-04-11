'use client'

/**
 * StudioHeader - Shared header for all Studio pages
 *
 * Uses TopMinimalBar directly (no GlassHeader wrapper needed —
 * TopMinimalBar already handles fixed positioning via ChromeSurface).
 */

import { ThemeToggle, TopMinimalBar } from '@/platform/ui'
import { UserButton } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface StudioHeaderProps {
  title?: string
}

export function StudioHeader(_props: StudioHeaderProps = {}) {
  const [isScrolled, setIsScrolled] = useState(false)
  const { resolvedTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <TopMinimalBar
      brand={
        <span className="text-sm font-medium text-muted uppercase tracking-[0.3em] hover:text-text transition-colors">
          BROLAB
        </span>
      }
      brandHref="/"
      right={
        <div className="flex items-center gap-3">
          <Link
            href="/studio"
            className="hidden sm:flex items-center gap-1.5 text-sm font-medium text-muted hover:text-text transition-colors"
          >
            Dashboard
          </Link>
          <ThemeToggle />
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox:
                  'w-8 h-8 rounded-full ring-2 ring-accent/20 hover:ring-accent/40 transition-all',
                userButtonPopoverFooter: 'hidden',
              },
            }}
          />
        </div>
      }
      isScrolled={isScrolled}
    />
  )
}
