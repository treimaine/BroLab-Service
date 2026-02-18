'use client'

import { useWorkspace } from '@/components/tenant'
import {
  DribbbleCard,
  DribbbleSectionEnter,
  DribbbleStaggerItem,
  PillCTA,
} from '@/platform/ui'
import { useAudioStore } from '@/stores/audio-store'
import { useQuery } from 'convex/react'
import { Music, Pause, Play } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

/**
 * Beats List Page
 *
 * Displays all published beats for this workspace with preview play buttons.
 * Integrates with global audio store for playback.
 *
 * Requirements: 21.2 (beats list page with preview play buttons)
 */
export default function BeatsListPage() {
  const { workspace, isLoading: workspaceLoading } = useWorkspace()
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string

  const play = useAudioStore((s) => s.play)
  const pause = useAudioStore((s) => s.pause)
  const currentTrack = useAudioStore((s) => s.currentTrack)
  const isPlaying = useAudioStore((s) => s.isPlaying)

  const tracks = useQuery(
    api.modules.beats.getPublishedTracks,
    workspace ? { workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

  const isLoading = workspaceLoading || tracks === undefined

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

  const handlePlay = (track: NonNullable<typeof tracks>[number]) => {
    if (!track.previewUrl) return
    if (currentTrack?.id === track._id) {
      if (isPlaying) {
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
  }

  const beatPlural = tracks.length === 1 ? 'beat' : 'beats'
  const beatCountLabel = tracks.length > 0
    ? `${tracks.length} ${beatPlural} available`
    : `Browse ${workspace?.name}'s collection`

  return (
    <div className="min-h-screen bg-[rgb(var(--bg))]">
      {/* Header */}
      <section className="px-4 lg:px-8 py-12">
        <div className="container mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-text mb-2">All Beats</h1>
              <p className="text-muted">{beatCountLabel}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Beats Grid */}
      <section className="px-4 lg:px-8 pb-20">
        <div className="container mx-auto">
          {tracks.length === 0 ? (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-muted mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-text mb-2">No Beats Yet</h2>
              <p className="text-muted mb-8">Check back soon for new releases</p>
            </div>
          ) : (
            <DribbbleSectionEnter stagger>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tracks.map((track) => {
                  const isCurrentTrack = currentTrack?.id === track._id
                  const isTrackPlaying = isCurrentTrack && isPlaying
                  const hasPreview = Boolean(track.previewUrl)

                  return (
                    <DribbbleStaggerItem key={track._id}>
                      <DribbbleCard hoverLift padding="lg" className="h-full">
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => handlePlay(track)}
                            disabled={!hasPreview}
                            className="w-12 h-12 rounded-xl bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))] flex items-center justify-center flex-shrink-0 hover:scale-105 transition-transform disabled:opacity-40 disabled:cursor-not-allowed"
                            aria-label={isTrackPlaying ? `Pause ${track.title}` : `Play ${track.title}`}
                          >
                            {isTrackPlaying ? (
                              <Pause className="w-5 h-5 text-white" />
                            ) : (
                              <Play className="w-5 h-5 text-white ml-0.5" />
                            )}
                          </button>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-lg font-bold text-text mb-1 truncate">{track.title}</h3>
                            <div className="flex items-center gap-2 text-xs text-muted mb-2">
                              {track.bpm && <span>{track.bpm} BPM</span>}
                              {track.bpm && track.key && <span>•</span>}
                              {track.key && <span>{track.key}</span>}
                            </div>
                            {track.tags.length > 0 && (
                              <div className="mb-3">
                                <span className="inline-block px-2 py-1 text-xs bg-[rgba(var(--accent),0.1)] text-accent rounded-md">
                                  {track.tags[0]}
                                </span>
                              </div>
                            )}
                            {!hasPreview && (
                              <p className="text-xs text-muted mb-2">No preview available</p>
                            )}
                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-text">${track.priceUsdByTier.basic}</span>
                              <Link href={`/${workspaceSlug}/beats/${track._id}`}>
                                <PillCTA variant="ghost" size="sm">View</PillCTA>
                              </Link>
                            </div>
                          </div>
                        </div>
                      </DribbbleCard>
                    </DribbbleStaggerItem>
                  )
                })}
              </div>
            </DribbbleSectionEnter>
          )}
        </div>
      </section>
    </div>
  )
}
