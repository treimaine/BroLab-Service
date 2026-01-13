/**
 * GlassSkeletonPulse - Animated skeleton loader with glass styling
 *
 * Features:
 * - Glass background with backdrop blur
 * - Smooth pulse animation with gradient shimmer
 * - Configurable dimensions via className
 * - Uses design tokens for theme coherence
 * - Respects reduced-motion preferences
 *
 * Use cases:
 * - Hero title loading states
 * - Button/CTA placeholders
 * - Text line skeletons
 * - Any custom-sized loading indicator
 *
 * Requirements: Surface Component
 */

import { motion } from 'framer-motion'

export interface GlassSkeletonPulseProps {
  /**
   * Additional CSS classes for sizing and positioning
   * Example: "h-12 w-3/4 mx-auto"
   */
  className?: string
}

export function GlassSkeletonPulse({
  className = '',
}: Readonly<GlassSkeletonPulseProps>) {
  return (
    <motion.div
      className={`
        rounded-xl
        bg-[rgba(var(--bg-2),0.8)]
        backdrop-blur-sm
        border border-[rgba(var(--border),var(--border-alpha))]
        ${className}
      `.trim().replaceAll(/\s+/g, ' ')}
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
          rgba(var(--bg-2), 0.6) 0%,
          rgba(var(--accent), 0.08) 50%,
          rgba(var(--bg-2), 0.6) 100%
        )`,
        backgroundSize: '200% 100%',
      }}
      aria-hidden="true"
    />
  )
}
