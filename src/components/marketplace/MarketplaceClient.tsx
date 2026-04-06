'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, TrendingUp } from 'lucide-react'
import {
  DribbbleCard,
  OutlineStackTitle,
  PillCTA,
  GlassChip,
  dribbblePageEnter,
  dribbbleStaggerContainer,
  dribbbleStaggerChild
} from '@/platform/ui'
import MarketplaceBeatGrid from './MarketplaceBeatGrid'
import MarketplaceSearchBar from './MarketplaceSearchBar'

export default function MarketplaceClient() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'newest' | 'price-low' | 'price-high'>('newest')

  const genres = [
    'All Beats',
    'Hip Hop',
    'Trap',
    'R&B',
    'Pop',
    'Drill',
    'Afrobeat',
    'Electronic',
    'Rock',
  ]

  return (
    <motion.div
      className="min-h-screen bg-bg text-text"
      {...dribbblePageEnter}
    >
      {/* Hero Section */}
      <section className="relative pt-grid-10 pb-grid-8 px-grid-3 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="text-center mb-grid-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <OutlineStackTitle
              className="mb-grid-3"
              text="Beat Marketplace"
            />
            <p className="text-xl md:text-2xl text-muted max-w-2xl mx-auto">
              Discover premium beats from top producers worldwide.
              Preview, purchase, and download instantly.
            </p>
          </motion.div>

          {/* Search & Filter Bar */}
          <MarketplaceSearchBar
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            sortBy={sortBy}
            onSortChange={setSortBy}
          />

          {/* Genre Pills */}
          <motion.div
            className="flex flex-wrap gap-grid-1 justify-center mb-grid-6"
            variants={dribbbleStaggerContainer}
            initial="initial"
            animate="animate"
          >
            {genres.map((genre) => (
              <motion.button
                key={genre}
                variants={dribbbleStaggerChild}
                onClick={() => setSelectedGenre(genre === 'All Beats' ? null : genre)}
                className={`px-grid-3 py-grid-1 rounded-full text-sm font-medium transition-all ${
                  (genre === 'All Beats' && !selectedGenre) || selectedGenre === genre
                    ? 'bg-accent text-white shadow-glow'
                    : 'bg-card/60 backdrop-blur-glass text-muted hover:text-accent hover:bg-accent/10'
                }`}
              >
                {genre}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Marketplace Grid */}
      <section className="px-grid-3 pb-grid-10">
        <div className="container mx-auto max-w-7xl">
          <MarketplaceBeatGrid
            searchQuery={searchQuery}
            selectedGenre={selectedGenre}
            sortBy={sortBy}
          />
        </div>
      </section>

      {/* Featured Producers Section */}
      <section className="px-grid-3 pb-grid-10">
        <div className="container mx-auto max-w-7xl">
          <div className="flex items-center gap-grid-2 mb-grid-4">
            <TrendingUp className="w-6 h-6 text-accent" />
            <h2 className="text-2xl md:text-3xl font-bold">Featured Producers</h2>
          </div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-3 gap-grid-3"
            variants={dribbbleStaggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
          >
            {[1, 2, 3].map((i) => (
              <motion.div key={i} variants={dribbbleStaggerChild}>
                <DribbbleCard className="p-grid-4 text-center">
                  <div className="w-20 h-20 mx-auto mb-grid-3 rounded-full bg-gradient-to-br from-accent/20 to-accent-2/20 flex items-center justify-center">
                    <span className="text-3xl">🎵</span>
                  </div>
                  <h3 className="text-lg font-semibold mb-grid-1">Producer {i}</h3>
                  <p className="text-sm text-muted mb-grid-3">50+ Premium Beats</p>
                  <PillCTA size="sm" variant="secondary">View Profile</PillCTA>
                </DribbbleCard>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-grid-3 pb-grid-10">
        <div className="container mx-auto max-w-7xl">
          <DribbbleCard className="p-grid-8 text-center bg-gradient-to-br from-accent/10 to-accent-2/10">
            <h2 className="text-3xl md:text-4xl font-bold mb-grid-3">
              Ready to Sell Your Beats?
            </h2>
            <p className="text-lg text-muted mb-grid-4 max-w-2xl mx-auto">
              Join thousands of producers earning 100% of their revenue.
              Set up your storefront in minutes.
            </p>
            <PillCTA size="lg" href="/onboarding">
              Start Selling Today
            </PillCTA>
          </DribbbleCard>
        </div>
      </section>
    </motion.div>
  )
}
