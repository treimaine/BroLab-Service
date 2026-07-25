'use client'

import { DemoBeatCard } from '@/components/tenant-demo/DemoBeatCard'
import { DemoStorefrontShell } from '@/components/tenant-demo/DemoStorefrontShell'
import { demoBeats } from '@/components/tenant-demo/demo-data'
import { StorefrontPageHeader } from '@/components/tenant/storefront'
import { Search } from 'lucide-react'
import { useMemo, useState } from 'react'

const filters = ['All', 'Trap', 'Synthwave', 'Hip-Hop'] as const

export default function DemoBeatsPage() {
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<(typeof filters)[number]>('All')

  const filteredBeats = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    return demoBeats.filter((beat) => {
      const matchesFilter = activeFilter === 'All' || beat.tags.includes(activeFilter)
      const matchesQuery =
        normalizedQuery.length === 0 ||
        beat.title.toLowerCase().includes(normalizedQuery) ||
        beat.tags.some((tag) => tag.toLowerCase().includes(normalizedQuery))
      return matchesFilter && matchesQuery
    })
  }, [activeFilter, query])

  return (
    <DemoStorefrontShell>
      <StorefrontPageHeader
        eyebrow="Demo Studio catalog"
        title="THE BEAT VAULT"
        description="Preview every beat, inspect the musical details, then choose the license that fits your release."
      />

      <section className="px-4 pb-20 lg:px-8">
        <div className="container mx-auto">
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
            {filteredBeats.length} {filteredBeats.length === 1 ? 'beat' : 'beats'} available
          </p>
          {filteredBeats.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredBeats.map((beat) => <DemoBeatCard key={beat.id} beat={beat} />)}
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
        </div>
      </section>
    </DemoStorefrontShell>
  )
}
