'use client'

import { formatDate } from '@/lib/format'
import {
  DribbbleCard,
  GlassSkeletonCard,
  OutlineStackTitle,
  PillCTA,
  dribbblePageEnter,
  dribbbleStaggerChild,
  dribbbleStaggerContainer,
} from '@/platform/ui'
import { motion } from 'framer-motion'
import { Calendar, Download, ExternalLink, FileText, Music, ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface Purchase {
  id: string
  beatId: string
  beatTitle: string
  producerName: string
  producerSlug: string
  licenseType: string
  price: number
  purchaseDate: Date
  downloadUrl: string
  licenseUrl: string
  coverUrl?: string
  genre?: string
  bpm?: number
}

// Mock data (will be replaced with Convex query)
const MOCK_PURCHASES: Purchase[] = [
  {
    id: '1',
    beatId: 'beat-1',
    beatTitle: 'Midnight Dreams',
    producerName: 'BeatMaker Pro',
    producerSlug: 'beatmaker-pro',
    licenseType: 'Premium License',
    price: 49.99,
    purchaseDate: new Date('2026-04-05'),
    downloadUrl: '#',
    licenseUrl: '#',
    genre: 'Hip Hop',
    bpm: 140,
  },
  {
    id: '2',
    beatId: 'beat-2',
    beatTitle: 'Summer Vibes',
    producerName: 'Producer X',
    producerSlug: 'producer-x',
    licenseType: 'Basic License',
    price: 24.99,
    purchaseDate: new Date('2026-04-01'),
    downloadUrl: '#',
    licenseUrl: '#',
    genre: 'Trap',
    bpm: 160,
  },
]

export function MyPurchasesClient() {
  const [isLoading] = useState(false)
  const purchases = MOCK_PURCHASES

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg text-text py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <div className="mb-8">
            <GlassSkeletonCard rows={2} className="mb-4" />
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <GlassSkeletonCard key={i} rows={4} hasImage />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      className="min-h-screen bg-bg text-text py-16 px-4"
      {...dribbblePageEnter}
    >
      <div className="container mx-auto max-w-5xl">
        {/* Header */}
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-linear-to-br from-accent to-accent-2 flex items-center justify-center">
              <ShoppingBag className="w-6 h-6 text-white" />
            </div>
            <div>
              <OutlineStackTitle size="section" className="text-3xl">
                My Purchases
              </OutlineStackTitle>
              <p className="text-sm text-muted mt-1">
                {purchases.length} {purchases.length === 1 ? 'beat' : 'beats'} in your library
              </p>
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        {purchases.length === 0 && (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="text-6xl mb-4">🎵</div>
            <h3 className="text-2xl font-bold mb-2">No purchases yet</h3>
            <p className="text-muted mb-6">
              Start building your beat library by browsing the marketplace.
            </p>
            <Link href="/marketplace">
              <PillCTA icon={Music}>
                Browse Marketplace
              </PillCTA>
            </Link>
          </motion.div>
        )}

        {/* Purchases List */}
        {purchases.length > 0 && (
          <motion.div
            className="space-y-4"
            variants={dribbbleStaggerContainer}
            initial="initial"
            animate="animate"
          >
            {purchases.map((purchase) => (
              <motion.div key={purchase.id} variants={dribbbleStaggerChild}>
                <DribbbleCard className="p-6 hover:shadow-glow-subtle transition-shadow">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Beat Cover */}
                    <div className="w-full md:w-32 h-32 rounded-xl bg-linear-to-br from-accent/20 to-accent-2/10 flex items-center justify-center shrink-0">
                      <span className="text-4xl">🎵</span>
                    </div>

                    {/* Beat Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xl font-bold mb-1 truncate">
                            {purchase.beatTitle}
                          </h3>
                          <a
                            href={`/${purchase.producerSlug}`}
                            className="text-sm text-accent hover:underline flex items-center gap-1"
                          >
                            by {purchase.producerName}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-sm text-muted mb-1">Paid</div>
                          <div className="text-lg font-bold text-accent">
                            ${purchase.price}
                          </div>
                        </div>
                      </div>

                      {/* Metadata */}
                      <div className="flex flex-wrap items-center gap-2 mb-4">
                        <span className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                          {purchase.licenseType}
                        </span>
                        {purchase.genre && (
                          <span className="px-3 py-1 rounded-full bg-card text-muted text-xs font-medium">
                            {purchase.genre}
                          </span>
                        )}
                        {purchase.bpm && (
                          <span className="px-3 py-1 rounded-full bg-card text-muted text-xs font-medium">
                            {purchase.bpm} BPM
                          </span>
                        )}
                        <span className="px-3 py-1 rounded-full bg-card text-muted text-xs font-medium flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(purchase.purchaseDate)}
                        </span>
                      </div>

                      {/* Download Actions */}
                      <div className="flex flex-wrap gap-2">
                        <a href={purchase.downloadUrl} download>
                          <PillCTA
                            size="sm"
                            variant="primary"
                            icon={Download}
                          >
                            Download Beat
                          </PillCTA>
                        </a>
                        <a href={purchase.licenseUrl} download>
                          <PillCTA
                            size="sm"
                            variant="secondary"
                            icon={FileText}
                          >
                            Download License
                          </PillCTA>
                        </a>
                      </div>
                    </div>
                  </div>
                </DribbbleCard>
              </motion.div>
            ))}
          </motion.div>
        )}

        {/* Help Section */}
        {purchases.length > 0 && (
          <motion.div
            className="mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <DribbbleCard className="p-6 bg-accent/5 border-accent/20">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <FileText className="w-5 h-5 text-accent" />
                Need Help?
              </h3>
              <p className="text-sm text-muted mb-3">
                Your purchases are stored securely and can be re-downloaded anytime.
                Keep your license agreements safe for official releases.
              </p>
              <a
                href="mailto:support@brolabentertainment.com"
                className="text-sm text-accent hover:underline font-semibold"
              >
                Contact Support →
              </a>
            </DribbbleCard>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}
