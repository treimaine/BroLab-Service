'use client'

import {
  DribbbleCard,
  OutlineStackTitle,
  PillCTA,
  dribbblePageEnter,
  dribbbleStaggerChild,
  dribbbleStaggerContainer,
} from '@/platform/ui'
import { useUser } from '@clerk/nextjs'
import { useQuery } from 'convex/react'
import { motion } from 'framer-motion'
import { ArrowRight, BadgeCheck, Music, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useDeferredValue, useState } from 'react'
import { api } from 'convex/_generated/api'
import MarketplaceBeatGrid from './MarketplaceBeatGrid'
import MarketplaceSearchBar from './MarketplaceSearchBar'

export default function MarketplaceClient() {
  const { isSignedIn } = useUser()
  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearchQuery = useDeferredValue(searchQuery)
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')

  const beats = useQuery(api.modules.marketplace.getMarketplaceBeats, {
    searchQuery: deferredSearchQuery.trim() || undefined,
    genre: selectedGenre ?? undefined,
    sortBy,
    limit: 60,
  })
  const marketplaceGenres = useQuery(api.modules.marketplace.getMarketplaceGenres)
  const featuredProducers = useQuery(api.modules.marketplace.getFeaturedProducers, {
    limit: 3,
  })

  const genres = ['All Beats', ...(marketplaceGenres ?? []).slice(0, 12)]
  const hasActiveFilters =
    deferredSearchQuery.trim().length > 0 || selectedGenre !== null

  return (
    <motion.div className="min-h-screen bg-bg text-text" {...dribbblePageEnter}>
      <section className="relative overflow-hidden px-grid-3 pb-grid-6 pt-grid-10">
        <div className="pointer-events-none absolute inset-0 bg-linear-to-b from-accent/5 via-transparent to-transparent" />

        <div className="container relative z-10 mx-auto max-w-7xl">
          <motion.div
            className="mb-grid-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="mb-grid-2 text-xs font-bold uppercase tracking-widest text-accent">
              Direct from BroLab producers
            </p>
            <OutlineStackTitle className="mb-grid-3" size="display">
              Find Your Next Sound
            </OutlineStackTitle>
            <p className="mx-auto mb-grid-4 max-w-2xl text-lg text-muted md:text-xl">
              Preview published beats, compare license prices, and buy securely from each producer&apos;s storefront.
            </p>

            <div className="mb-grid-4 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted">
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Live Convex catalog
              </span>
              <span className="flex items-center gap-2">
                <BadgeCheck className="h-4 w-4 text-accent" />
                Official licenses
              </span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-yellow-500" />
                Stripe checkout
              </span>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={isSignedIn ? '/artist' : '/sign-up?role=artist'}>
                <PillCTA variant="primary" size="lg">
                  {isSignedIn ? 'Open My Library' : 'Create Free Account'}
                </PillCTA>
              </Link>
              <Link href="#beats">
                <PillCTA variant="secondary" size="lg">
                  Browse Beats
                </PillCTA>
              </Link>
            </div>
          </motion.div>

          <MarketplaceSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          <motion.div
            className="mb-grid-6 flex flex-wrap justify-center gap-grid-1"
            variants={dribbbleStaggerContainer}
            initial="initial"
            animate="animate"
          >
            {genres.map((genre) => (
              <motion.button
                key={genre}
                type="button"
                variants={dribbbleStaggerChild}
                onClick={() => setSelectedGenre(genre === 'All Beats' ? null : genre)}
                className={`rounded-full px-grid-3 py-grid-1 text-sm font-medium transition-all ${
                  (genre === 'All Beats' && !selectedGenre) || selectedGenre === genre
                    ? 'bg-[rgb(var(--accent))] text-[rgb(var(--bg))] shadow-glow'
                    : 'bg-card/60 text-muted hover:bg-accent/10 hover:text-accent'
                }`}
              >
                {genre}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      <section id="beats" className="px-grid-3 pb-grid-10">
        <div className="container mx-auto max-w-7xl">
          <div className="mb-grid-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                Live catalog
              </p>
              <h2 className="text-2xl font-bold uppercase tracking-wide">Published beats</h2>
            </div>
            <p className="text-sm text-muted">
              {beats === undefined
                ? 'Loading current releases…'
                : `${beats.length} ${beats.length === 1 ? 'result' : 'results'}`}
            </p>
          </div>
          <MarketplaceBeatGrid beats={beats} hasActiveFilters={hasActiveFilters} />
        </div>
      </section>

      {featuredProducers && featuredProducers.length > 0 && (
        <section className="px-grid-3 pb-grid-10">
          <div className="container mx-auto max-w-7xl">
            <div className="mb-grid-4 flex items-center gap-grid-2">
              <TrendingUp className="h-6 w-6 text-accent" />
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Most active
                </p>
                <h2 className="text-2xl font-bold">Featured Producers</h2>
              </div>
            </div>

            <motion.div
              className="grid grid-cols-1 gap-grid-3 md:grid-cols-3"
              variants={dribbbleStaggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-100px' }}
            >
              {featuredProducers.map((producer) => (
                <motion.div key={producer.id} variants={dribbbleStaggerChild}>
                  <Link
                    href={`/${producer.slug}`}
                    className="group block rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    <DribbbleCard className="h-full p-grid-4">
                      <div className="flex items-center gap-4">
                        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br from-accent/20 to-accent-2/20 text-accent">
                          <Music className="h-6 w-6" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-lg font-semibold">{producer.name}</h3>
                          <p className="text-sm text-muted">
                            {producer.trackCount} published {producer.trackCount === 1 ? 'beat' : 'beats'}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1 group-hover:text-accent" />
                      </div>
                    </DribbbleCard>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      <section className="px-grid-3 pb-grid-10">
        <div className="container mx-auto max-w-7xl">
          <DribbbleCard className="border-2 border-accent/30 bg-linear-to-br from-accent/10 to-accent-2/10 p-grid-8 text-center">
            <h2 className="mb-grid-3 text-3xl font-bold md:text-4xl">
              Ready to Sell Your Beats?
            </h2>
            <p className="mx-auto mb-grid-4 max-w-2xl text-lg text-muted">
              Publish from your own storefront and receive customer payments through your connected Stripe account.
            </p>
            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link
                href="/sign-up?role=producer&plan=pro&period=month&source=marketplace"
                data-growth-cta
              >
                <PillCTA size="lg" variant="primary">Start PRO Free</PillCTA>
              </Link>
              <Link href="/pricing">
                <PillCTA size="lg" variant="secondary">View Pricing</PillCTA>
              </Link>
            </div>
            <p className="mt-grid-3 text-xs text-muted">
              One month free · Publish in minutes · Cancel anytime
            </p>
          </DribbbleCard>
        </div>
      </section>
    </motion.div>
  )
}
