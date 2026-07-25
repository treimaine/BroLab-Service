'use client'

import { useAudioStore } from '@/stores/audio-store'
import {
  DribbbleCard,
  GlassSkeletonCard,
  dribbbleStaggerChild,
  dribbbleStaggerContainer,
} from '@/platform/ui'
import { motion } from 'framer-motion'
import { ArrowRight, Music, Pause, Play, ShieldCheck } from 'lucide-react'
import Link from 'next/link'

export interface MarketplaceBeat {
  trackId: string
  title: string
  bpm: number | null
  musicalKey: string | null
  tags: string[]
  priceUsdByTier: {
    basic: number
    premium: number
    unlimited: number
  }
  previewUrl: string | null
  previewDurationSec: number
  createdAt: number
  workspace: {
    slug: string
    name: string
    paymentsReady: boolean
  }
}

interface MarketplaceBeatGridProps {
  beats: MarketplaceBeat[] | undefined
  hasActiveFilters: boolean
}

const usdFormatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2,
})

export default function MarketplaceBeatGrid({
  beats,
  hasActiveFilters,
}: Readonly<MarketplaceBeatGridProps>) {
  const play = useAudioStore((state) => state.play)
  const pause = useAudioStore((state) => state.pause)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)

  if (beats === undefined) {
    return (
      <div className="grid grid-cols-1 gap-grid-3 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <GlassSkeletonCard key={item} rows={4} hasImage />
        ))}
      </div>
    )
  }

  if (beats.length === 0) {
    return (
      <motion.div
        className="rounded-3xl border border-dashed border-border px-6 py-grid-10 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <Music className="mx-auto mb-grid-3 h-10 w-10 text-muted" />
        <h3 className="mb-grid-2 text-2xl font-bold">
          {hasActiveFilters ? 'No matching beats' : 'The catalog is warming up'}
        </h3>
        <p className="mx-auto max-w-md text-muted">
          {hasActiveFilters
            ? 'Try another title, producer, tag, or sort option.'
            : 'Published beats from BroLab producers will appear here automatically.'}
        </p>
      </motion.div>
    )
  }

  function handlePreview(beat: MarketplaceBeat) {
    if (!beat.previewUrl) return

    if (currentTrack?.id === beat.trackId && isPlaying) {
      pause()
      return
    }

    play({
      id: beat.trackId,
      title: beat.title,
      artistName: beat.workspace.name,
      previewUrl: beat.previewUrl,
      bpm: beat.bpm ?? undefined,
      trackKey: beat.musicalKey ?? undefined,
      duration: beat.previewDurationSec,
    })
  }

  return (
    <motion.div
      className="grid grid-cols-1 gap-grid-3 md:grid-cols-2 lg:grid-cols-3"
      variants={dribbbleStaggerContainer}
      initial="initial"
      animate="animate"
    >
      {beats.map((beat) => {
        const isCurrentBeat = currentTrack?.id === beat.trackId
        const isBeatPlaying = isCurrentBeat && isPlaying
        const primaryTag = beat.tags[0] ?? 'Beat'

        return (
          <motion.div key={beat.trackId} variants={dribbbleStaggerChild}>
            <DribbbleCard className="group h-full overflow-hidden transition-all hover:shadow-glow-strong">
              <div className="relative mb-grid-3 flex aspect-[4/3] items-center justify-center overflow-hidden rounded-xl bg-linear-to-br from-accent/20 via-accent-2/10 to-transparent">
                <div className="absolute inset-0 opacity-50 [background-image:radial-gradient(circle_at_20%_25%,rgb(var(--accent)/0.25),transparent_30%),radial-gradient(circle_at_80%_75%,rgb(var(--accent-2)/0.2),transparent_28%)]" />

                <button
                  type="button"
                  onClick={() => handlePreview(beat)}
                  disabled={!beat.previewUrl}
                  className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-accent text-white shadow-glow transition-transform hover:scale-105 disabled:cursor-not-allowed disabled:opacity-35"
                  aria-label={
                    beat.previewUrl
                      ? isBeatPlaying
                        ? `Pause ${beat.title}`
                        : `Preview ${beat.title}`
                      : `Preview unavailable for ${beat.title}`
                  }
                >
                  {isBeatPlaying ? (
                    <Pause className="h-6 w-6 fill-white" />
                  ) : (
                    <Play className="ml-1 h-6 w-6 fill-white" />
                  )}
                </button>

                <span className="absolute left-grid-2 top-grid-2 rounded-full bg-card/85 px-grid-2 py-grid-1 text-xs font-medium text-text">
                  {primaryTag}
                </span>
                {(beat.bpm || beat.musicalKey) && (
                  <span className="absolute right-grid-2 top-grid-2 rounded-full bg-card/85 px-grid-2 py-grid-1 text-xs font-medium text-text">
                    {[beat.bpm ? `${beat.bpm} BPM` : null, beat.musicalKey]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                )}
                {!beat.previewUrl && (
                  <span className="absolute bottom-grid-2 text-xs font-medium text-muted">
                    Preview unavailable
                  </span>
                )}
              </div>

              <div className="px-grid-2 pb-grid-1">
                <h3 className="mb-grid-1 truncate text-lg font-semibold text-text">
                  {beat.title}
                </h3>
                <p className="mb-grid-3 truncate text-sm text-muted">
                  by {beat.workspace.name}
                </p>

                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-widest text-muted">
                      Licenses from
                    </p>
                    <p className="text-2xl font-bold text-accent">
                      {usdFormatter.format(beat.priceUsdByTier.basic)}
                    </p>
                  </div>
                  <Link
                    href={`/${beat.workspace.slug}/beats/${beat.trackId}`}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-bold text-text transition-colors hover:border-accent/40 hover:bg-accent/10 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    {beat.workspace.paymentsReady && <ShieldCheck className="h-3.5 w-3.5" />}
                    View
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </DribbbleCard>
          </motion.div>
        )
      })}
    </motion.div>
  )
}
