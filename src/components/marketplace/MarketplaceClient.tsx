'use client'

import {
  DribbbleCard,
  OutlineStackTitle,
  PillCTA,
  dribbblePageEnter,
  dribbbleStaggerChild,
  dribbbleStaggerContainer
} from '@/platform/ui'
import { motion } from 'framer-motion'
import { TrendingUp } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
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
      <section className="relative pt-grid-10 pb-grid-6 px-grid-3 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" />

        <div className="container mx-auto max-w-7xl relative z-10">
          <motion.div
            className="text-center mb-grid-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-grid-2">
              0% Commission • Instant Downloads • Secure Payments
            </p>
            <OutlineStackTitle
              className="mb-grid-3"
              size="display"
            >
              Find Your Perfect Beat
            </OutlineStackTitle>
            <p className="text-lg md:text-xl text-muted max-w-2xl mx-auto mb-grid-4">
              Browse thousands of premium beats from world-class producers. 
              Buy instantly, download immediately, get your license automatically.
            </p>
            {/* Social Proof Stats */}
            <div className="flex items-center justify-center gap-6 mb-grid-4 text-sm">
              <div className="flex items-center gap-2 text-muted">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span>500+ Active Beats</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                <span>50+ Producers</span>
              </div>
              <div className="flex items-center gap-2 text-muted">
                <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                <span>1K+ Downloads</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up?role=artist">
                <PillCTA variant="primary" size="lg">
                  Create Free Account
                </PillCTA>
              </Link>
              <Link href="#beats">
                <PillCTA variant="secondary" size="lg">
                  Browse Beats
                </PillCTA>
              </Link>
            </div>
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
                    : 'bg-card/60 text-muted hover:text-accent hover:bg-accent/10'
                }`}
              >
                {genre}
              </motion.button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Marketplace Grid */}
      <section id="beats" className="px-grid-3 pb-grid-10">
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
          <DribbbleCard className="p-grid-8 text-center bg-gradient-to-br from-accent/10 to-accent-2/10 border-2 border-accent/30">
            <h2 className="text-3xl md:text-4xl font-bold mb-grid-3">
              Ready to Sell Your Beats?
            </h2>
            <p className="text-lg text-muted mb-grid-4 max-w-2xl mx-auto">
              Join producers earning 100% of their revenue. No middleman, no fees.
              Your fans pay directly to you via Stripe.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/sign-up?role=producer">
                <PillCTA size="lg" variant="primary">
                  Start Free Storefront
                </PillCTA>
              </Link>
              <Link href="/pricing">
                <PillCTA size="lg" variant="secondary">
                  View Pricing
                </PillCTA>
              </Link>
            </div>
            <p className="text-xs text-muted mt-grid-3">
              No credit card required • Set up in 2 minutes
            </p>
          </DribbbleCard>
        </div>
      </section>
    </motion.div>
  )
}
