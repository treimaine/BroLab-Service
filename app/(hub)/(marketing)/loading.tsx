'use client'

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

function SkeletonPulse({ className = '' }: { readonly className?: string }) {
  return (
    <motion.div
      className={`rounded-xl glass ${className}`}
      animate={{
        opacity: [0.4, 0.7, 0.4],
      }}
      transition={{
        duration: 1.8,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      style={{
        background: `linear-gradient(
          90deg,
          rgba(var(--card), var(--card-alpha)) 0%,
          rgba(var(--accent), 0.08) 50%,
          rgba(var(--card), var(--card-alpha)) 100%
        )`,
        backgroundSize: '200% 100%',
      }}
    />
  )
}

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
          <SkeletonPulse className="h-12 md:h-16 w-3/4 mx-auto" />
          <SkeletonPulse className="h-5 w-2/3 mx-auto" />
          <SkeletonPulse className="h-5 w-1/2 mx-auto" />
        </div>

        {/* CTA skeleton */}
        <div className="flex justify-center gap-4 mt-10">
          <SkeletonPulse className="h-12 w-32 rounded-full" />
          <SkeletonPulse className="h-12 w-32 rounded-full" />
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
              className="glass rounded-2xl p-6 space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: 0.15 + i * 0.08 }}
            >
              <SkeletonPulse className="h-6 w-1/2" />
              <SkeletonPulse className="h-4 w-full" />
              <SkeletonPulse className="h-4 w-4/5" />
              <SkeletonPulse className="h-4 w-3/5" />
            </motion.div>
          ))}
        </div>
      </motion.section>
    </div>
  )
}
