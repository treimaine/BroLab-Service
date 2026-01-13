'use client'

import { GlassSkeletonCard, GlassSkeletonPulse } from '@/platform/ui'
import { motion } from 'framer-motion'

/**
 * Marketing Pages Loading State
 * 
 * Glass skeleton loader with premium, minimal feel.
 * Respects theme (dark/light) via CSS custom properties.
 * Improves perceived performance during navigation.
 * 
 * Requirements: 19 (Marketing Pages)
 */

export default function MarketingLoading() {
  return (
    <div className="min-h-screen bg-app">
      {/* Hero skeleton */}
      <motion.section
        className="container mx-auto px-4 lg:px-8 py-16 md:py-24"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Hero title skeleton */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <GlassSkeletonPulse className="h-12 md:h-16 w-3/4 mx-auto" />
          <GlassSkeletonPulse className="h-5 w-2/3 mx-auto" />
          <GlassSkeletonPulse className="h-5 w-1/2 mx-auto" />
        </div>

        {/* CTA skeleton */}
        <div className="flex justify-center gap-4 mt-10">
          <GlassSkeletonPulse className="h-12 w-32 rounded-full" />
          <GlassSkeletonPulse className="h-12 w-32 rounded-full" />
        </div>
      </motion.section>

      {/* Content cards skeleton */}
      <motion.section
        className="container mx-auto px-4 lg:px-8 pb-24"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.35, delay: 0.1 }}
      >
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={`skeleton-card-${i}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
            >
              <GlassSkeletonCard rows={3} />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
