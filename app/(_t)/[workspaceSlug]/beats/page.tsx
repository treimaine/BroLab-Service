'use client'

import { useWorkspace } from '@/components/tenant'
import {
  StorefrontBeatCard,
  StorefrontFooter,
  StorefrontPageHeader,
} from '@/components/tenant/storefront'
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { useAudioStore } from '@/stores/audio-store'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { useQuery } from 'convex/react'
import { Music, Search } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useMemo, useState } from 'react'

export default function BeatsListPage() {
  const { workspace, isLoading: workspaceLoading } = useWorkspace()
  const params = useParams()
  const workspaceSlug = params.workspaceSlug as string
  const basePath = `/${workspaceSlug}`

  const play = useAudioStore((state) => state.play)
  const pause = useAudioStore((state) => state.pause)
  const currentTrack = useAudioStore((state) => state.currentTrack)
  const isPlaying = useAudioStore((state) => state.isPlaying)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('All')

  const tracks = useQuery(
    api.modules.beats.getPublishedTracks,
    workspace ? { workspaceId: workspace._id as Id<'workspaces'> } : 'skip'
  )

  const filters = useMemo(
    () => ['All', ...Array.from(new Set((tracks ?? []).flatMap((track) => track.tags))).slice(0, 5)],
    [tracks]
  )

  const filteredTracks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return (tracks ?? []).filter((track) => {
      const matchesFilter = activeFilter === 'All' || track.tags.includes(activeFilter)
      const matchesQuery =
        normalizedQuery.length === 0 ||
        track.title.toLowerCase().includes(normalizedQuery) ||
        track.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      return matchesFilter && matchesQuery
    })
  }, [activeFilter, query, tracks])

  if (workspaceLoading || tracks === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-16 w-16 animate-spin rounded-full border-4 border-accent border-t-transparent" />
          <p className="text-muted">Loading beat catalog…</p>
        </div>
      </div>
    )
  }

  const workspaceName = workspace?.name ?? workspaceSlug

  const handlePlay = (track: NonNullable<typeof tracks>[number]) => {
    if (!track.previewUrl) return
    if (currentTrack?.id === track._id && isPlaying) {
      pause()
      return
    }
    play({
      id: track._id,
      title: track.title,
      artistName: workspaceName,
      previewUrl: track.previewUrl,
      bpm: track.bpm,
      trackKey: track.key,
    })
  }

  return (
    <>
      <div className="min-h-screen bg-[rgb(var(--bg))]">
        <StorefrontPageHeader
          eyebrow={`${workspaceName} catalog`}
          title="THE BEAT VAULT"
          description="Preview every beat, inspect the musical details, then choose the license that fits your release."
        />

        <section className="px-4 pb-20 lg:px-8">
          <div className="container mx-auto">
            {tracks.length === 0 ? (
              <DribbbleCard padding="lg" className="mx-auto max-w-md py-16 text-center">
                <Music className="mx-auto mb-4 h-16 w-16 text-muted" />
                <h2 className="text-2xl font-black text-text">The vault is being prepared</h2>
                <p className="mb-8 mt-2 text-muted">No published beats are available yet.</p>
                <Link href={basePath}>
                  <PillCTA as="span" variant="secondary">Back to storefront</PillCTA>
                </Link>
              </DribbbleCard>
            ) : (
              <>
                <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.45)] p-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex flex-wrap gap-2" aria-label="Filter beats by genre">
                    {filters.map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setActiveFilter(filter)}
                        className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          activeFilter === filter
                            ? 'bg-accent text-white'
                            : 'bg-[rgb(var(--bg))] text-muted hover:text-text'
                        }`}
                        aria-pressed={activeFilter === filter}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                  <label className="flex min-w-0 items-center gap-3 rounded-xl border border-border bg-[rgb(var(--bg))] px-4 py-3 md:w-72">
                    <Search className="h-4 w-4 shrink-0 text-muted" />
                    <span className="sr-only">Search beats</span>
                    <input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="Search title or genre"
                      className="min-w-0 flex-1 bg-transparent text-sm text-text outline-none placeholder:text-muted"
                    />
                  </label>
                </div>

                <p className="mb-5 text-xs font-bold uppercase tracking-[0.18em] text-muted">
                  {filteredTracks.length} {filteredTracks.length === 1 ? 'beat' : 'beats'} available
                </p>
                {filteredTracks.length > 0 ? (
                  <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {filteredTracks.map((track) => (
                      <StorefrontBeatCard
                        key={track._id}
                        title={track.title}
                        bpm={track.bpm}
                        trackKey={track.key}
                        tags={track.tags}
                        price={track.priceUsdByTier.basic}
                        detailHref={`${basePath}/beats/${track._id}`}
                        isPlaying={currentTrack?.id === track._id && isPlaying}
                        hasPreview={Boolean(track.previewUrl)}
                        onPlay={() => handlePlay(track)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="rounded-2xl border border-dashed border-border py-16 text-center">
                    <p className="font-bold text-text">No beat matches this search.</p>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery('')
                        setActiveFilter('All')
                      }}
                      className="mt-2 text-sm font-semibold text-accent hover:underline"
                    >
                      Reset filters
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
      <StorefrontFooter workspaceName={workspaceName} basePath={basePath} />
    </>
  )
}
