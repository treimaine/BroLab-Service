'use client'

/**
 * ArtistHeader - Shared header for all Artist pages
 *
 * Mirrors StudioHeader pattern: TopMinimalBar with theme toggle,
 * UserButton, scroll detection, and a link back to the artist dashboard.
 */

import { ThemeToggle, TopMinimalBar } from '@/platform/ui'
import { UserButton } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function ArtistHeader() {
  const [isScrolled, setIsScrolled] = useState(false)

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
            href="/artist"
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
