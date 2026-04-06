'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, ShoppingCart, ExternalLink } from 'lucide-react'
import {
  DribbbleCard,
  PillCTA,
  GlassSkeletonCard,
  dribbbleStaggerContainer,
  dribbbleStaggerChild,
} from '@/platform/ui'
import { WaveformVisualizer } from '@/components/beats/WaveformVisualizer'

interface MarketplaceBeatGridProps {
  searchQuery: string
  selectedGenre: string | null
  sortBy: 'newest' | 'price-low' | 'price-high'
}

// Mock beat data (will be replaced with Convex query)
const MOCK_BEATS = [
  {
    id: '1',
    title: 'Midnight Dreams',
    producer: 'BeatMaker Pro',
    price: 29.99,
    genre: 'Hip Hop',
    bpm: 140,
    createdAt: new Date('2026-04-01'),
    coverUrl: null,
  },
  {
    id: '2',
    title: 'Summer Vibes',
    producer: 'Producer X',
    price: 39.99,
    genre: 'Trap',
    bpm: 160,
    createdAt: new Date('2026-04-05'),
    coverUrl: null,
  },
  {
    id: '3',
    title: 'City Lights',
    producer: 'Metro Sound',
    price: 24.99,
    genre: 'R&B',
    bpm: 85,
    createdAt: new Date('2026-03-28'),
    coverUrl: null,
  },
  {
    id: '4',
    title: 'Dark Energy',
    producer: 'BeatMaker Pro',
    price: 34.99,
    genre: 'Drill',
    bpm: 145,
    createdAt: new Date('2026-04-03'),
    coverUrl: null,
  },
  {
    id: '5',
    title: 'Smooth Operator',
    producer: 'Smooth Beats',
    price: 44.99,
    genre: 'Pop',
    bpm: 120,
    createdAt: new Date('2026-04-02'),
    coverUrl: null,
  },
  {
    id: '6',
    title: 'Lagos Nights',
    producer: 'Afro Rhythms',
    price: 49.99,
    genre: 'Afrobeat',
    bpm: 110,
    createdAt: new Date('2026-04-04'),
    coverUrl: null,
  },
]

export default function MarketplaceBeatGrid({
  searchQuery,
  selectedGenre,
  sortBy,
}: MarketplaceBeatGridProps) {
  const [playingId, setPlayingId] = useState<string | null>(null)
  const [isLoading] = useState(false)

  // Filter and sort beats
  const filteredBeats = useMemo(() => {
    let beats = [...MOCK_BEATS]

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      beats = beats.filter(
        (beat) =>
          beat.title.toLowerCase().includes(query) ||
          beat.producer.toLowerCase().includes(query) ||
          beat.genre.toLowerCase().includes(query)
      )
    }

    // Filter by genre
    if (selectedGenre) {
      beats = beats.filter((beat) => beat.genre === selectedGenre)
    }

    // Sort beats
    beats.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return b.createdAt.getTime() - a.createdAt.getTime()
        case 'price-low':
          return a.price - b.price
        case 'price-high':
          return b.price - a.price
        default:
          return 0
      }
    })

    return beats
  }, [searchQuery, selectedGenre, sortBy])

  const togglePlay = (beatId: string) => {
    setPlayingId(playingId === beatId ? null : beatId)
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <GlassSkeletonCard key={i} height={300} />
        ))}
      </div>
    )
  }

  if (filteredBeats.length === 0) {
    return (
      <motion.div
        className="text-center py-grid-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="text-6xl mb-grid-4">🎵</div>
        <h3 className="text-2xl font-bold mb-grid-2">No beats found</h3>
        <p className="text-muted">
          Try adjusting your search or filter criteria
        </p>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid-3"
      variants={dribbbleStaggerContainer}
      initial="initial"
      animate="animate"
    >
      {filteredBeats.map((beat) => (
        <motion.div key={beat.id} variants={dribbbleStaggerChild}>
          <DribbbleCard className="group overflow-hidden hover:shadow-glow-strong transition-all">
            {/* Beat Cover Art */}
            <div className="relative aspect-square bg-gradient-to-br from-accent/20 via-accent-2/10 to-transparent rounded-xl mb-grid-3 flex items-center justify-center overflow-hidden">
              {/* Play/Pause Button */}
              <button
                onClick={() => togglePlay(beat.id)}
                className="relative z-10 w-16 h-16 rounded-full bg-accent/90 backdrop-blur-sm flex items-center justify-center hover:scale-110 transition-transform shadow-glow"
                aria-label={playingId === beat.id ? 'Pause' : 'Play'}
              >
                {playingId === beat.id ? (
                  <Pause className="w-6 h-6 text-white fill-white" />
                ) : (
                  <Play className="w-6 h-6 text-white fill-white ml-1" />
                )}
              </button>

              {/* Genre Badge */}
              <div className="absolute top-grid-2 left-grid-2">
                <span className="px-grid-2 py-grid-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium text-text">
                  {beat.genre}
                </span>
              </div>

              {/* BPM Badge */}
              <div className="absolute top-grid-2 right-grid-2">
                <span className="px-grid-2 py-grid-1 rounded-full bg-card/80 backdrop-blur-sm text-xs font-medium text-text">
                  {beat.bpm} BPM
                </span>
              </div>

              {/* Waveform visualization */}
              <div className="absolute inset-0 opacity-30 p-4">
                <WaveformVisualizer
                  audioUrl={`/api/beats/${beat.id}/audio`}
                  animated={playingId === beat.id}
                  barCount={50}
                />
              </div>
            </div>

            {/* Beat Info */}
            <div className="px-grid-2">
              <h3 className="text-lg font-semibold text-text mb-grid-1 truncate">
                {beat.title}
              </h3>
              <p className="text-sm text-muted mb-grid-3 flex items-center gap-grid-1">
                <ExternalLink className="w-4 h-4" />
                {beat.producer}
              </p>

              {/* Price and CTA */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-2xl font-bold text-accent">
                    ${beat.price}
                  </span>
                </div>
                <PillCTA
                  size="sm"
                  variant="secondary"
                  className="flex items-center gap-grid-1"
                >
                  <ShoppingCart className="w-4 h-4" />
                  Buy
                </PillCTA>
              </div>
            </div>
          </DribbbleCard>
        </motion.div>
      ))}
    </motion.div>
  )
}
