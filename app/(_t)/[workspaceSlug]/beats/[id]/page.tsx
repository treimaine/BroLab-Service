'use client'

import { useWorkspace } from '@/components/tenant'
import {
  DribbbleCard,
  DribbbleSectionEnter,
  PillCTA,
} from '@/platform/ui'
import { ArrowLeft, Download, Music, Play, Share2 } from 'lucide-react'
import Link from 'next/link'
import { use } from 'react'

/**
 * Beat Detail Page
 * 
 * Displays detailed information about a specific beat.
 * Includes preview player, license options, and purchase button.
 * Placeholder implementation - will be replaced with real data.
 * 
 * Requirements: 21.3 (beat detail with track info, preview player, purchase button)
 */
export default function BeatDetailPage({
  params,
}: {
  readonly params: Promise<{ workspaceSlug: string; id: string }>
}) {
  const { workspaceSlug, id } = use(params)
  const { workspace, isLoading } = useWorkspace()

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

  // Placeholder beat data
  const beat = {
    id,
    title: `Beat Title ${id}`,
    bpm: 140,
    key: 'Am',
    tags: ['Trap', 'Dark', 'Modern'],
    description: 'A hard-hitting trap beat with dark atmospheric elements. Perfect for rap and hip-hop artists looking for a modern sound.',
    licenses: [
      { tier: 'Basic', price: 29, features: ['MP3 Download', 'Non-Exclusive', '2,000 Streams'] },
      { tier: 'Premium', price: 99, features: ['WAV Download', 'Non-Exclusive', '10,000 Streams', 'Music Video'] },
      { tier: 'Unlimited', price: 299, features: ['WAV + Stems', 'Exclusive Rights', 'Unlimited Streams', 'All Rights'] },
    ],
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
                    <p className="text-sm text-muted mb-2">Preview Available</p>
                    <p className="text-xs text-muted">30 seconds • High Quality</p>
                  </div>
                </DribbbleCard>

                <div className="space-y-6">
                  <div>
                    <h1 className="text-4xl font-bold text-text mb-2">{beat.title}</h1>
                    <p className="text-muted">by {workspace?.name}</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <DribbbleCard padding="sm" className="flex-1">
                      <div className="text-center">
                        <span className="text-xs text-muted block">BPM</span>
                        <p className="text-lg font-bold text-text">{beat.bpm}</p>
                      </div>
                    </DribbbleCard>
                    <DribbbleCard padding="sm" className="flex-1">
                      <div className="text-center">
                        <span className="text-xs text-muted block">Key</span>
                        <p className="text-lg font-bold text-text">{beat.key}</p>
                      </div>
                    </DribbbleCard>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {beat.tags.map((tag) => (
                      <span 
                        key={tag}
                        className="px-3 py-1 text-sm bg-[rgba(var(--accent),0.1)] text-accent rounded-lg"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <p className="text-muted leading-relaxed">{beat.description}</p>

                  <div className="flex gap-3">
                    <DribbbleCard padding="sm" className="flex-1 cursor-pointer hover:bg-[rgba(var(--card),0.8)] transition-colors">
                      <button className="w-full flex items-center justify-center gap-2 text-text">
                        <Share2 className="w-4 h-4" />
                        <span>Share</span>
                      </button>
                    </DribbbleCard>
                    <DribbbleCard padding="sm" className="flex-1 cursor-pointer hover:bg-[rgba(var(--card),0.8)] transition-colors">
                      <button className="w-full flex items-center justify-center gap-2 text-text">
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </DribbbleCard>
                  </div>
                </div>
              </div>

              {/* Right Column - Licenses */}
              <div>
                <h2 className="text-2xl font-bold text-text mb-6">Choose Your License</h2>
                <div className="space-y-4">
                  {beat.licenses.map((license) => (
                    <DribbbleCard 
                      key={license.tier}
                      hoverLift 
                      padding="lg"
                      className={license.tier === 'Premium' ? 'border-2 border-accent' : ''}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-xl font-bold text-text mb-1">{license.tier}</h3>
                          {license.tier === 'Premium' && (
                            <span className="text-xs text-accent font-bold uppercase">Most Popular</span>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-3xl font-bold text-text">${license.price}</p>
                        </div>
                      </div>
                      <ul className="space-y-2 mb-6">
                        {license.features.map((feature) => (
                          <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                            <Music className="w-4 h-4 text-accent flex-shrink-0" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <PillCTA 
                        variant={license.tier === 'Premium' ? 'primary' : 'secondary'} 
                        size="lg" 
                        className="w-full"
                      >
                        Purchase {license.tier}
                      </PillCTA>
                    </DribbbleCard>
                  ))}
                </div>
              </div>
            </div>
          </DribbbleSectionEnter>
        </div>
      </section>
    </div>
  )
}
