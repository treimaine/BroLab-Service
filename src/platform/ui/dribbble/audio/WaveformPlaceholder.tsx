'use client'

import { motion } from 'framer-motion'
import { forwardRef, useMemo } from 'react'

/**
 * WaveformPlaceholder - SVG/CSS waveform visual for audio tracks
 *
 * Features:
 * - Accent color gradient bars
 * - Static waveform pattern (MVP)
 * - Optional subtle animation when playing
 * - Multiple size variants
 * - Reduced motion compliant
 *
 * Requirements: Audio UI Dribbble
 */

interface WaveformPlaceholderProps {
  /** Number of bars in the waveform */
  barCount?: number
  /** Whether audio is currently playing (enables subtle animation) */
  isPlaying?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Color variant */
  variant?: 'accent' | 'muted' | 'gradient'
  /** Additional CSS classes */
  className?: string
  /** Accessible label */
  'aria-label'?: string
}

const sizeStyles = {
  sm: {
    height: 24,
    barWidth: 2,
    gap: 1,
    borderRadius: 1,
  },
  md: {
    height: 40,
    barWidth: 3,
    gap: 2,
    borderRadius: 1.5,
  },
  lg: {
    height: 64,
    barWidth: 4,
    gap: 3,
    borderRadius: 2,
  },
}

/**
 * Generate a pseudo-random waveform pattern
 * Uses a seeded approach for consistent rendering
 */
function generateWaveformHeights(count: number): number[] {
  const heights: number[] = []
  // Create a natural-looking waveform pattern
  for (let i = 0; i < count; i++) {
    // Use sine waves with different frequencies for organic look
    const base = 0.3
    const wave1 = Math.sin((i / count) * Math.PI * 2) * 0.25
    const wave2 = Math.sin((i / count) * Math.PI * 4 + 0.5) * 0.15
    const wave3 = Math.sin((i / count) * Math.PI * 8 + 1) * 0.1
    // Add some pseudo-random variation
    const noise = Math.sin(i * 12.9898 + 78.233) * 0.1
    
    const height = Math.max(0.15, Math.min(1, base + wave1 + wave2 + wave3 + noise))
    heights.push(height)
  }
  return heights
}

export const WaveformPlaceholder = forwardRef<HTMLDivElement, WaveformPlaceholderProps>(
  (
    {
      barCount = 32,
      isPlaying = false,
      size = 'md',
      variant = 'gradient',
      className = '',
      'aria-label': ariaLabel = 'Audio waveform',
    },
    ref
  ) => {
    const config = sizeStyles[size]
    
    // Memoize waveform heights for consistent rendering
    const heights = useMemo(() => generateWaveformHeights(barCount), [barCount])
    
    // Calculate total width
    const totalWidth = barCount * config.barWidth + (barCount - 1) * config.gap

    // Get fill color/gradient based on variant
    const getFill = (index: number) => {
      switch (variant) {
        case 'accent':
          return 'rgb(var(--accent))'
        case 'muted':
          return 'rgba(var(--muted), 0.5)'
        case 'gradient':
        default:
          // Return a gradient ID reference
          return `url(#waveform-gradient-${index % 2})`
      }
    }

    return (
      <div
        ref={ref}
        className={`relative inline-flex items-center ${className}`}
        aria-label={ariaLabel}
        aria-hidden="true"
      >
        <svg
          width={totalWidth}
          height={config.height}
          viewBox={`0 0 ${totalWidth} ${config.height}`}
          className="overflow-visible"
        >
          {/* Gradient definitions */}
          <defs>
            <linearGradient id="waveform-gradient-0" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent))" stopOpacity="1" />
              <stop offset="100%" stopColor="rgb(var(--accent-2))" stopOpacity="0.7" />
            </linearGradient>
            <linearGradient id="waveform-gradient-1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(var(--accent-2))" stopOpacity="0.9" />
              <stop offset="100%" stopColor="rgb(var(--accent))" stopOpacity="0.6" />
            </linearGradient>
            {/* Glow filter for playing state */}
            <filter id="waveform-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Waveform bars */}
          <g filter={isPlaying ? 'url(#waveform-glow)' : undefined}>
            {heights.map((height, index) => {
              const barHeight = height * config.height
              const x = index * (config.barWidth + config.gap)
              const y = (config.height - barHeight) / 2
              // Generate stable key from position and height
              const barKey = `waveform-bar-${x.toFixed(0)}-${barHeight.toFixed(2)}`

              return (
                <motion.rect
                  key={barKey}
                  x={x}
                  y={y}
                  width={config.barWidth}
                  height={barHeight}
                  rx={config.borderRadius}
                  ry={config.borderRadius}
                  fill={getFill(index)}
                  initial={false}
                  animate={
                    isPlaying
                      ? {
                          scaleY: [1, 0.6 + Math.random() * 0.4, 1],
                          transition: {
                            duration: 0.4 + Math.random() * 0.3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                            delay: index * 0.02,
                          },
                        }
                      : { scaleY: 1 }
                  }
                  style={{ transformOrigin: `${x + config.barWidth / 2}px ${config.height / 2}px` }}
                />
              )
            })}
          </g>
        </svg>
      </div>
    )
  }
)

WaveformPlaceholder.displayName = 'WaveformPlaceholder'
