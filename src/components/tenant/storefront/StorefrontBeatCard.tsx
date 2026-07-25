'use client'

import { DribbbleCard, PillCTA } from '@/platform/ui'
import { Pause, Play } from 'lucide-react'
import Link from 'next/link'

interface StorefrontBeatCardProps {
  title: string
  bpm?: number
  trackKey?: string
  tags: string[]
  mood?: string
  description?: string
  price: number
  detailHref: string
  isPlaying: boolean
  hasPreview?: boolean
  onPlay: () => void
  actionLabel?: string
  onAction?: () => void
}

export function StorefrontBeatCard({
  title,
  bpm,
  trackKey,
  tags,
  mood,
  description,
  price,
  detailHref,
  isPlaying,
  hasPreview = true,
  onPlay,
  actionLabel = 'Choose license',
  onAction,
}: Readonly<StorefrontBeatCardProps>) {
  return (
    <DribbbleCard hoverLift padding="lg" className="h-full">
      <div className="mb-6 flex items-start justify-between gap-4">
        <button
          type="button"
          onClick={onPlay}
          disabled={!hasPreview}
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] text-white transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent disabled:cursor-not-allowed disabled:opacity-40"
          aria-label={isPlaying ? `Pause ${title}` : `Play ${title}`}
        >
          {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="ml-0.5 h-6 w-6" />}
        </button>
        <span className="rounded-full border border-border px-3 py-1 text-xs font-bold uppercase tracking-wider text-muted">
          {mood ?? tags[0] ?? 'Beat'}
        </span>
      </div>
      <Link href={detailHref}>
        <h2 className="text-xl font-black text-text transition-colors hover:text-accent">{title}</h2>
      </Link>
      <p className="mt-1 text-sm text-muted">
        {[bpm ? `${bpm} BPM` : null, trackKey].filter(Boolean).join(' · ') || 'Audio preview'}
      </p>
      <div className="mt-4 flex min-h-6 flex-wrap gap-2">
        {tags.slice(0, 3).map((tag) => (
          <span key={tag} className="rounded-md bg-[rgb(var(--accent)/0.1)] px-2 py-1 text-xs font-medium text-accent">
            {tag}
          </span>
        ))}
      </div>
      <p className="mt-5 line-clamp-2 min-h-10 text-sm leading-relaxed text-muted">
        {description ?? (hasPreview ? 'Preview the beat and compare the available license options.' : 'Preview coming soon. License details remain available.')}
      </p>
      <div className="mt-6 flex items-center justify-between gap-3">
        <span>
          <span className="block text-xs text-muted">From</span>
          <span className="text-2xl font-black text-text">${price}</span>
        </span>
        {onAction ? (
          <PillCTA variant="primary" size="sm" onClick={onAction}>{actionLabel}</PillCTA>
        ) : (
          <Link href={detailHref}>
            <PillCTA as="span" variant="primary" size="sm">{actionLabel}</PillCTA>
          </Link>
        )}
      </div>
    </DribbbleCard>
  )
}
