'use client'

import { AuthNav } from '@/components/hub/AuthNav'
import { ThemeToggle, TopMinimalBar } from '@/platform/ui'
import Link from 'next/link'
import { useEffect, useState } from 'react'

/**
 * SiteHeader - The single public-facing header for every marketing surface
 * (landing page, pricing, about, contact, privacy, terms).
 *
 * Mounted once in the marketing layout so pages never declare their own chrome.
 * Studio and Artist areas have their own headers (StudioHeader / ArtistHeader);
 * all three compose the same TopMinimalBar primitive.
 */

const NAV_LINKS = [
  { href: '/pricing', label: 'Pricing' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
]

export function SiteHeader({ ctaLabel = 'Start 1 month free' }: Readonly<{ ctaLabel?: string }>) {
  const [mounted, setMounted] = useState(false)

  // ThemeToggle reads the DOM theme, so it must not render during SSR
  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <TopMinimalBar
      brand={
        <span className="text-sm font-medium text-muted uppercase tracking-[0.3em] sm:tracking-[0.4em] hover:text-text transition-colors">
          BROLAB
        </span>
      }
      brandHref="/"
      navItems={NAV_LINKS}
      right={
        <div className="flex items-center gap-3 sm:gap-4">
          {mounted && <ThemeToggle />}
          {/* Below `sm` there is no room for the auth cluster — it moves into the menu */}
          <div className="hidden sm:flex">
            <AuthNav ctaLabel={ctaLabel} />
          </div>
        </div>
      }
      mobileExtra={
        <>
          <Link
            href="/tenant-demo"
            className="py-3 min-h-[44px] flex items-center text-base font-medium text-muted hover:text-text transition-colors"
          >
            View demo storefront
          </Link>
          <div className="sm:hidden border-t border-border mt-2 pt-2">
            <AuthNav ctaLabel={ctaLabel} variant="menu" />
          </div>
        </>
      }
    />
  )
}
