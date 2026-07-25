'use client'

import { useWorkspace } from '@/components/tenant'
import { formatCap, getLicenseTerms } from '@/shared/licenses'
import {
    DribbbleCard,
    DribbbleSectionEnter,
    PillCTA,
} from '@/platform/ui'
import { useAudioStore } from '@/stores/audio-store'
import { useQuery } from 'convex/react'
import { AlertCircle, ArrowLeft, Clock, Pause, Play, ShieldCheck, Zap } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useState } from 'react'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'
import posthog from 'posthog-js'

type LicenseTier = 'basic' | 'premium' | 'unlimited'

/**
 * Beat Detail Page
 *
 * Displays track info, preview player, license tier selector, and purchase button.
 *
 * Requirements: 21.3 (track info, preview player, purchase button)
 * Requirements: 13.8, 27.4 (payments not configured state)
 */
export function BeatDetailClient() {
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string
  const trackId = params.id as string

  const { workspace, isLoading: workspaceLoading } = useWorkspace()

  const play = useAudioStore((s) => s.play)
  const pause = useAudioStore((s) => s.pause)
  const currentTrack = useAudioStore((s) => s.currentTrack)
  const isPlaying = useAudioStore((s) => s.isPlaying)

  const [selectedTier, setSelectedTier] = useState<LicenseTier>('basic')
  const [isPurchasing, setIsPurchasing] = useState(false)

  const track = useQuery(
    api.modules.beats.getPublishedTrack,
    trackId && workspace ? { trackId: trackId as Id<'tracks'>, workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

  const isLoading = workspaceLoading || track === undefined

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading beat...</p>
        </div>
      </div>
    )
  }

  if (!track) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-text mb-2">Beat Not Found</h2>
          <p className="text-muted mb-6">This beat may have been removed or is no longer available.</p>
          <Link href={`/${workspaceSlug}/beats`}>
            <PillCTA variant="secondary">Back to Beats</PillCTA>
          </Link>
        </div>
      </div>
    )
  }

  const isPaymentsConfigured =
    workspace?.paymentsStatus === 'active' && workspace?.stripeAccountId !== undefined

  const isCurrentTrack = currentTrack?.id === track._id
  const isTrackPlaying = isCurrentTrack && isPlaying
  const hasPreview = Boolean(track.previewUrl)

  const handlePlayPause = () => {
    if (!track.previewUrl) return
    if (isCurrentTrack) {
      if (isTrackPlaying) {
        pause()
      } else {
        play({
          id: track._id,
          title: track.title,
          artistName: workspace?.name ?? '',
          previewUrl: track.previewUrl,
          bpm: track.bpm,
          trackKey: track.key,
        })
        posthog.capture('beat_preview_played', {
          track_id: track._id,
          workspace_slug: workspaceSlug,
          bpm: track.bpm,
          track_key: track.key,
        })
      }
      return
    }
    play({
      id: track._id,
      title: track.title,
      artistName: workspace?.name ?? '',
      previewUrl: track.previewUrl,
      bpm: track.bpm,
      trackKey: track.key,
    })
    posthog.capture('beat_preview_played', {
      track_id: track._id,
      workspace_slug: workspaceSlug,
      bpm: track.bpm,
      track_key: track.key,
    })
  }

  const isPaymentsNotConfigured = !isPaymentsConfigured
  const handleBuyOrContact = () => {
    if (isPaymentsConfigured && !isPurchasing) {
      posthog.capture('beat_purchase_initiated', {
        track_id: track._id,
        workspace_slug: workspaceSlug,
        license_tier: selectedTier,
        price_usd: tierPrices[selectedTier],
      })
      handlePurchase()
    } else if (!isPaymentsConfigured) {
      globalThis.location.href = `/${workspaceSlug}/contact`
    }
  }
  const buyLabel = (() => {
    if (isPurchasing) return 'Processing...'
    if (isPaymentsConfigured) return 'Buy Now — Instant Download'
    return 'Contact Producer'
  })()
  const tierPrices = track.priceUsdByTier
  const tierLabels: Record<LicenseTier, string> = {
    basic: 'Basic',
    premium: 'Premium',
    unlimited: 'Unlimited',
  }
  const tierDescriptions: Record<LicenseTier, string> = {
    basic: `MP3 + WAV · ${formatCap(getLicenseTerms('basic').rights.audioStreamingCap)} streams`,
    premium: `MP3 + WAV · ${formatCap(getLicenseTerms('premium').rights.audioStreamingCap)} streams`,
    unlimited: 'MP3 + WAV + stems · Unlimited usage',
  }

  const handlePurchase = async () => {
    if (!isPaymentsConfigured || !workspace) return
    setIsPurchasing(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemType: 'track',
          itemId: track._id,
          licenseTier: selectedTier,
          workspaceId: workspace._id,
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Unable to start checkout')
      }
      if (data.url) {
        globalThis.location.href = data.url
      }
    } catch {
      // silently fail — user stays on page
    } finally {
      setIsPurchasing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Back Button */}
      <section className="px-4 lg:px-8 py-6">
        <div className="container mx-auto">
          <Link
            href={`/${workspaceSlug}/beats`}
            className="inline-flex items-center gap-2 text-muted hover:text-text transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Beats</span>
          </Link>
        </div>
      </section>

      {/* Beat Details */}
      <section className="px-4 lg:px-8 py-8">
        <div className="container mx-auto max-w-6xl">
          <DribbbleSectionEnter>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
              {/* Left Column - Track Info */}
              <div className="lg:col-span-2 space-y-8">
                {/* Title + Play */}
                <div className="flex items-start gap-6">
                  <button
                    onClick={handlePlayPause}
                    disabled={!hasPreview}
                    className="w-20 h-20 rounded-2xl bg-linear-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center shrink-0 hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                  >
                    {isTrackPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-4xl font-bold text-text mb-2 truncate">{track.title}</h1>
                    <p className="text-muted mb-3">by {workspace?.name}</p>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-muted">
                      {track.bpm && (
                        <span className="px-2 py-1 bg-[rgb(var(--accent)/0.1)] text-accent rounded-md">
                          {track.bpm} BPM
                        </span>
                      )}
                      {track.key && (
                        <span className="px-2 py-1 bg-[rgb(var(--accent)/0.1)] text-accent rounded-md">
                          {track.key}
                        </span>
                      )}
                      {track.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 bg-[rgb(var(--border)/0.3)] text-muted rounded-md">
                          {tag}
                        </span>
                      ))}
                    </div>
                    {!hasPreview && (
                      <p className="text-sm text-muted mt-3">No preview available</p>
                    )}
                  </div>
                </div>

                {/* License Tier Selector */}
                <DribbbleCard padding="lg">
                  <h2 className="text-xl font-bold text-text mb-4">Choose License</h2>
                  <div className="space-y-3">
                    {(['basic', 'premium', 'unlimited'] as const).map((tier) => (
                      <button
                        key={tier}
                        onClick={() => {
                          setSelectedTier(tier)
                          posthog.capture('license_tier_selected', {
                            track_id: track._id,
                            workspace_slug: workspaceSlug,
                            license_tier: tier,
                            price_usd: tierPrices[tier],
                          })
                        }}
                        className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                          selectedTier === tier
                            ? 'border-accent bg-[rgb(var(--accent)/0.08)]'
                            : 'border-border/50 hover:border-[rgb(var(--accent)/0.4)]'
                        }`}
                      >
                        <div className="text-left">
                          <p className="font-semibold text-text">{tierLabels[tier]}</p>
                          <p className="text-sm text-muted">{tierDescriptions[tier]}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xl font-bold text-text">${tierPrices[tier]}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </DribbbleCard>
              </div>

              {/* Right Column - Purchase Card */}
                <div className="lg:col-span-1">
                <div className="sticky top-24 space-y-6">
                  <DribbbleCard glow padding="lg">
                    <div className="text-center mb-6">
                      <p className="text-sm text-muted mb-1">Selected License</p>
                      <p className="text-2xl font-bold text-text mb-1">{tierLabels[selectedTier]}</p>
                      <p className="text-4xl font-bold text-text">${tierPrices[selectedTier]}</p>
                    </div>

                    <PillCTA
                      variant={isPaymentsNotConfigured ? 'secondary' : 'primary'}
                      size="lg"
                      className="w-full mb-4"
                      disabled={isPurchasing}
                      onClick={handleBuyOrContact}
                    >
                      {buyLabel}
                    </PillCTA>
                    
                    {/* Trust Badges */}
                    <div className="flex items-center justify-center gap-3 text-xs text-muted mb-4">
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3 text-green-500" />
                        Secure Payment
                      </span>
                      <span className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-accent" />
                        Instant Delivery
                      </span>
                    </div>

                    <div className="space-y-3 pt-4">
                      <div className="h-px bg-border/50" />
                      
                      {/* Value Propositions */}
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-text">Instant Download</p>
                          <p className="text-xs text-muted">Get your files immediately</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-accent/10 flex items-center justify-center">
                          <ShieldCheck className="w-4 h-4 text-accent" />
                        </div>
                        <div>
                          <p className="font-medium text-text">Licensed & Verified</p>
                          <p className="text-xs text-muted">Official PDF license included</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 text-sm">
                        <div className="w-8 h-8 rounded-full bg-yellow-500/10 flex items-center justify-center">
                          <Clock className="w-4 h-4 text-yellow-500" />
                        </div>
                        <div>
                          <p className="font-medium text-text">24/7 Support</p>
                          <p className="text-xs text-muted">Producer available for questions</p>
                        </div>
                      </div>
                    </div>
                  </DribbbleCard>

                  {/* Payments Not Configured Warning */}
                  {!isPaymentsConfigured && (
                    <DribbbleCard padding="lg" className="border-2 border-[rgb(var(--accent)/0.3)]">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-base font-bold text-text mb-2">Payments Not Configured</h3>
                          <p className="text-sm text-muted">
                            This creator hasn&apos;t completed their payment setup yet.
                            Purchases are currently unavailable.
                          </p>
                        </div>
                      </div>
                    </DribbbleCard>
                  )}
                </div>
              </div>
            </div>
          </DribbbleSectionEnter>
        </div>
      </section>
    </div>
  )
}
