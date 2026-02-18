'use client'

import { useWorkspace } from '@/components/tenant'
import {
  DribbbleCard,
  DribbbleSectionEnter,
  PillCTA,
} from '@/platform/ui'
import {
  LICENSE_TERMS_BY_TIER,
  LICENSE_TIERS,
  formatCap,
  type LicenseTier
} from '@/shared/licenses'
import { useQuery } from 'convex/react'
import { AlertCircle, ArrowLeft, Check, Download, Play, Share2 } from 'lucide-react'
import Link from 'next/link'
import { use, useState } from 'react'
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

/**
 * Beat Detail Page
 * 
 * Displays detailed information about a specific beat with license tier selection.
 * Includes preview player, license options with features/caps comparison, and purchase button.
 * 
 * Requirements: 21.3 (beat detail with track info, preview player, purchase button)
 * Requirements: 13.8, 27.4 (payments not configured state)
 * Requirements: 29.2 (license tier selector with features/caps, licenseTier in checkout metadata)
 */
export default function BeatDetailPage({
  params,
}: {
  readonly params: Promise<{ workspaceSlug: string; id: string }>
}) {
  const { workspaceSlug, id } = use(params)
  const { workspace, isLoading: workspaceLoading } = useWorkspace()
  const [selectedTier, setSelectedTier] = useState<LicenseTier>('premium')
  const [isPurchasing, setIsPurchasing] = useState(false)

  // Fetch track data from Convex
  const track = useQuery(
    api.modules.beats.getTrack,
    workspace ? { trackId: id as Id<'tracks'> } : 'skip'
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
          <h1 className="text-2xl font-bold text-text mb-2">Beat Not Found</h1>
          <p className="text-muted mb-6">This beat doesn't exist or has been removed.</p>
          <Link href={`/_t/${workspaceSlug}/beats`}>
            <PillCTA variant="primary">Back to Beats</PillCTA>
          </Link>
        </div>
      </div>
    )
  }

  if (track.status !== 'published') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text mb-2">Beat Unavailable</h1>
          <p className="text-muted mb-6">This beat is not currently available for purchase.</p>
          <Link href={`/_t/${workspaceSlug}/beats`}>
            <PillCTA variant="primary">Back to Beats</PillCTA>
          </Link>
        </div>
      </div>
    )
  }

  // Check if payments are configured
  const isPaymentsConfigured = 
    workspace?.paymentsStatus === 'active' && 
    workspace?.stripeAccountId !== undefined

  // Handle purchase
  const handlePurchase = async (tier: LicenseTier) => {
    if (!isPaymentsConfigured || isPurchasing) return

    setIsPurchasing(true)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId: workspace._id,
          itemType: 'track',
          itemId: track._id,
          licenseTier: tier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create checkout session')
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        globalThis.location.href = data.url
      }
    } catch (error) {
      console.error('Purchase error:', error)
      alert(error instanceof Error ? error.message : 'Failed to start checkout')
      setIsPurchasing(false)
    }
  }

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Back Button */}
      <section className="px-4 lg:px-8 py-6">
        <div className="container mx-auto">
          <Link 
            href={`/_t/${workspaceSlug}/beats`}
            className="inline-flex items-center gap-2 text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Beats</span>
          </Link>
        </div>
      </section>

      {/* Beat Details */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto max-w-6xl">
          <DribbbleSectionEnter>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Left Column - Player & Info */}
              <div>
                <DribbbleCard glow padding="lg" className="mb-8">
                  <div className="aspect-square bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] rounded-2xl flex items-center justify-center mb-6">
                    <button 
                      className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center hover:scale-110 transition-transform"
                      aria-label="Play preview"
                      style={{ backdropFilter: 'blur(8px)' }}
                    >
                      <Play className="w-10 h-10 text-white ml-1" />
                    </button>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-muted mb-2">
                      {track.previewStorageId ? 'Preview Available' : 'No Preview Available'}
                    </p>
                    {track.previewStorageId && (
                      <p className="text-xs text-muted">30 seconds • High Quality</p>
                    )}
                  </div>
                </DribbbleCard>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-text mb-2">{track.title}</h1>
                    <p className="text-muted">by {workspace?.name}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    {track.bpm && (
                      <DribbbleCard padding="sm" className="flex-1">
                        <div className="text-center">
                          <span className="text-xs text-muted block">BPM</span>
                          <p className="text-lg font-bold text-text">{track.bpm}</p>
                        </div>
                      </DribbbleCard>
                    )}
                    {track.key && (
                      <DribbbleCard padding="sm" className="flex-1">
                        <div className="text-center">
                          <span className="text-xs text-muted block">Key</span>
                          <p className="text-lg font-bold text-text">{track.key}</p>
                        </div>
                      </DribbbleCard>
                    )}
                  </div>

                  {track.tags && track.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {track.tags.map((tag: string) => (
                        <span 
                          key={tag}
                          className="px-3 py-1 text-sm bg-[rgba(var(--accent),0.1)] text-accent rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-3">
                    <DribbbleCard padding="sm" className="flex-1 cursor-pointer hover:bg-[rgba(var(--card),0.8)] transition-colors">
                      <button className="w-full flex items-center justify-center gap-2 text-text">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </DribbbleCard>
                    {track.previewStorageId && (
                      <DribbbleCard padding="sm" className="flex-1 cursor-pointer hover:bg-[rgba(var(--card),0.8)] transition-colors">
                        <button className="w-full flex items-center justify-center gap-2 text-text">
                          <Download className="w-4 h-4" />
                          <span>Preview</span>
                        </button>
                      </DribbbleCard>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Licenses */}
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Choose Your License</h2>
                
                {/* Payments Not Configured Warning */}
                {!isPaymentsConfigured && (
                  <DribbbleCard padding="lg" className="mb-6 border-2 border-[rgba(var(--accent),0.3)]">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-lg font-bold text-text mb-2">Payments Not Configured</h3>
                        <p className="text-sm text-muted">
                          This creator hasn't completed their payment setup yet. 
                          Purchases are currently unavailable. Please check back later.
                        </p>
                      </div>
                    </div>
                  </DribbbleCard>
                )}

                <div className="space-y-4">
                  {LICENSE_TIERS.map((tier) => {
                    const licenseTerms = LICENSE_TERMS_BY_TIER[tier]
                    const price = track.priceUsdByTier[tier]
                    const isSelected = selectedTier === tier
                    const isPremium = tier === 'premium'

                    // Determine card border style
                    let borderClass = ''
                    if (isSelected) {
                      borderClass = 'border-2 border-accent ring-2 ring-accent/20'
                    } else if (isPremium) {
                      borderClass = 'border-2 border-accent/50'
                    }

                    return (
                      <DribbbleCard 
                        key={tier}
                        hoverLift 
                        padding="lg"
                        className={`cursor-pointer transition-all ${borderClass}`}
                        onClick={() => setSelectedTier(tier)}
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-bold text-text mb-1">
                              {licenseTerms.title}
                            </h3>
                            {isPremium && (
                              <span className="text-xs text-accent font-bold uppercase">
                                Most Popular
                              </span>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="text-3xl font-bold text-text">
                              ${price}
                            </p>
                            <p className="text-xs text-muted">USD</p>
                          </div>
                        </div>

                        {/* Key Features */}
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-text">
                              {licenseTerms.includesStems ? 'WAV + Stems' : 'MP3/WAV Download'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-text">
                              {formatCap(licenseTerms.rights.audioStreamingCap)} Streams
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-text">
                              {formatCap(licenseTerms.rights.musicVideosCap)} Music Video{licenseTerms.rights.musicVideosCap === 1 ? '' : 's'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Check className="w-4 h-4 text-accent flex-shrink-0" />
                            <span className="text-text">
                              {formatCap(licenseTerms.rights.livePerformanceCap)} Live Performance{licenseTerms.rights.livePerformanceCap === 1 ? '' : 's'}
                            </span>
                          </div>
                          {licenseTerms.rights.radioBroadcastCap > 0 && (
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-accent flex-shrink-0" />
                              <span className="text-text">
                                {formatCap(licenseTerms.rights.radioBroadcastCap)} Radio Broadcast{licenseTerms.rights.radioBroadcastCap === 1 ? '' : 's'}
                              </span>
                            </div>
                          )}
                          {licenseTerms.rights.syncAllowed && (
                            <div className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-accent flex-shrink-0" />
                              <span className="text-text">
                                Sync Licensing (TV/Film/Ads/Games)
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Purchase Button */}
                        <button 
                          type="button"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full"
                        >
                          <PillCTA 
                            variant={isSelected ? 'primary' : 'secondary'} 
                            size="lg" 
                            className="w-full"
                            disabled={!isPaymentsConfigured || isPurchasing}
                            onClick={() => handlePurchase(tier)}
                          >
                            {(() => {
                              if (isPurchasing) return 'Processing...'
                              if (isPaymentsConfigured) return `Purchase ${licenseTerms.title}`
                              return 'Unavailable'
                            })()}
                          </PillCTA>
                        </button>
                      </DribbbleCard>
                    )
                  })}
                </div>

                {/* License Comparison Info */}
                <DribbbleCard padding="lg" className="mt-6">
                  <h3 className="text-sm font-bold text-text mb-3 uppercase">License Details</h3>
                  <div className="space-y-2 text-xs text-muted">
                    <p>• All licenses include commercial use rights</p>
                    <p>• 50/50 publishing split (writer & publisher shares)</p>
                    <p>• Producer credit required in all releases</p>
                    <p>• Full license PDF provided after purchase</p>
                  </div>
                </DribbbleCard>
              </div>
            </div>
          </DribbbleSectionEnter>
        </div>
      </section>
    </div>
  )
}
