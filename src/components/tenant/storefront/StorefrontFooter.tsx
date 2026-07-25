'use client'

import { GlassFooter } from '@/platform/ui'
import Link from 'next/link'

interface StorefrontFooterProps {
  workspaceName: string
  basePath: string
  beatsPath?: string
  year?: number
}

export function StorefrontFooter({
  workspaceName,
  basePath,
  beatsPath = `${basePath}/beats`,
  year = new Date().getFullYear(),
}: Readonly<StorefrontFooterProps>) {
  const displayName = workspaceName.toUpperCase()

  return (
    <GlassFooter className="border-t border-border/20 px-4 py-10 lg:px-8">
      <div className="container mx-auto flex flex-col items-center justify-between gap-6 md:flex-row">
        <Link href={basePath} className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] font-black text-white">
            {displayName.charAt(0)}
          </span>
          <span>
            <span className="block font-bold text-text">{displayName}</span>
            <span className="block text-xs text-muted">Powered by BroLab Entertainment</span>
          </span>
        </Link>
        <nav className="flex gap-6 text-sm text-muted" aria-label={`${displayName} footer navigation`}>
          <Link href={beatsPath} className="transition-colors hover:text-text">Beats</Link>
          <Link href={`${basePath}/services`} className="transition-colors hover:text-text">Services</Link>
          <Link href={`${basePath}/contact`} className="transition-colors hover:text-text">Contact</Link>
        </nav>
        <p className="text-xs text-muted">© {year} {displayName}</p>
      </div>
    </GlassFooter>
  )
}
