'use client'

import { useWorkspace } from '@/components/tenant'
import {
    DribbbleCard,
    DribbbleSectionEnter,
    DribbbleStaggerItem,
    PillCTA,
} from '@/platform/ui'
import { Music, Play } from 'lucide-react'

/**
 * Beats List Page
 * 
 * Displays all published beats for this workspace.
 * Placeholder implementation - will be replaced with real data.
 * 
 * Requirements: 21.2 (beats list page with preview play buttons)
 */
export default function BeatsListPage() {
  const { workspace, isLoading } = useWorkspace()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted">Loading beats...</p>
        </div>
      </div>
    )
  }

  // Placeholder beats data
  const placeholderBeats = Array.from({ length: 9 }, (_, i) => ({
    id: i + 1,
    title: `Beat Title ${i + 1}`,
    bpm: 120 + (i * 5),
    key: ['Am', 'Fm', 'Gm', 'Dm', 'Em'][i % 5],
    tags: ['Trap', 'Hip-Hop', 'Dark', 'Modern'][i % 4],
    price: 25 + (i * 5),
  }))

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-text mb-2">All Beats</h1>
              <p className="text-muted">Browse {workspace?.name}'s collection</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <DribbbleCard padding="sm">
                <select className="px-4 py-2 bg-transparent text-text text-sm focus:outline-none">
                  <option>Sort by: Latest</option>
                  <option>Sort by: Price</option>
                  <option>Sort by: BPM</option>
                </select>
              </DribbbleCard>
            </div>
          </div>
        </div>
      </section>

      {/* Beats Grid */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto">
          <DribbbleSectionEnter stagger>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {placeholderBeats.map((beat) => (
                <DribbbleStaggerItem key={beat.id}>
                  <DribbbleCard hoverLift padding="lg" className="h-full">
                    <div className="flex items-start gap-4">
                      <button 
                        className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform"
                        aria-label={`Play ${beat.title}`}
                      >
                        <Play className="w-6 h-6 text-white ml-1" />
                      </button>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-text mb-1 truncate">{beat.title}</h3>
                        <div className="flex items-center gap-2 text-xs text-muted mb-2">
                          <span>{beat.bpm} BPM</span>
                          <span>•</span>
                          <span>{beat.key}</span>
                        </div>
                        <div className="mb-3">
                          <span className="inline-block px-2 py-1 text-xs bg-[rgba(var(--accent),0.1)] text-accent rounded-md">
                            {beat.tags}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-xl font-bold text-text">${beat.price}</span>
                          <PillCTA variant="ghost" size="sm">View</PillCTA>
                        </div>
                      </div>
                    </div>
                  </DribbbleCard>
                </DribbbleStaggerItem>
              ))}
            </div>
          </DribbbleSectionEnter>

          {/* Empty State (when no beats) */}
          {placeholderBeats.length === 0 && (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text mb-2">No Beats Yet</h2>
              <p className="text-muted mb-8">Check back soon for new releases</p>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
