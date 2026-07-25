'use client'

import { DribbbleCard, PillCTA } from '@/platform/ui'
import { ArrowRight, Clock, Headphones } from 'lucide-react'
import Link from 'next/link'

interface StorefrontServiceCardProps {
  title: string
  description: string
  turnaround: string
  price: number
  href: string
  featured?: boolean
}

export function StorefrontServiceCard({
  title,
  description,
  turnaround,
  price,
  href,
  featured = false,
}: Readonly<StorefrontServiceCardProps>) {
  return (
    <DribbbleCard glow={featured} hoverLift padding="lg" className="flex h-full flex-col">
      <div className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${
        featured
          ? 'bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] text-white'
          : 'bg-[rgb(var(--accent)/0.12)] text-accent'
      }`}>
        <Headphones className="h-6 w-6" />
      </div>
      <h2 className="text-2xl font-black text-text">{title}</h2>
      <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">{description}</p>
      <div className="mt-6 flex items-center gap-2 text-xs font-semibold text-muted">
        <Clock className="h-4 w-4 text-accent" />
        {turnaround}
      </div>
      <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-5">
        <span>
          <span className="block text-xs text-muted">From</span>
          <span className="text-2xl font-black text-text">${price}</span>
        </span>
        <Link href={href}>
          <PillCTA as="span" variant="primary" size="sm" iconAfter={ArrowRight}>View service</PillCTA>
        </Link>
      </div>
    </DribbbleCard>
  )
}
