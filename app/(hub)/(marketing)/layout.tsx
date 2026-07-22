'use client'

import { SiteHeader } from '@/components/hub/SiteHeader'
import { usePathname } from 'next/navigation'
import type { ReactNode } from 'react'

/**
 * Marketing Pages Layout
 *
 * Mounts the single public header (SiteHeader) for the landing page and every
 * marketing page, so no page declares its own chrome. Footer comes from the
 * parent hub layout.
 *
 * Requirements: 19 (Marketing Pages)
 */

interface MarketingLayoutProps {
  readonly children: ReactNode
}

export default function MarketingLayout({ children }: MarketingLayoutProps) {
  const pathname = usePathname()

  // The landing hero is full-bleed and sits under the transparent fixed header.
  // Every other marketing page needs clearance for it.
  const isLanding = pathname === '/'

  return (
    <>
      <SiteHeader />
      <div className={isLanding ? undefined : 'pt-24'}>{children}</div>
    </>
  )
}
