'use client'

import { motion } from 'framer-motion'
import { Music } from 'lucide-react'
import { forwardRef } from 'react'

/**
 * NowPlayingChip - Compact chip for displaying current track info
 *
 * Features:
 * - Glass background with backdrop blur
 * - Truncated title with ellipsis
 * - Optional artist name
 * - Compact pill-style design
 * - Hover glow effect
 * - Animated equalizer bars when playing
 *
 * Requirements: Audio UI Dribbble
 */

interface NowPlayingChipProps {
  /** Track title */
  title?: string
  /** Artist/producer name */
  artist?: string
  /** Whether audio is currently playing (shows animated bars) */
  isPlaying?: boolean
  /** Cover art URL (optional) */
  coverUrl?: string
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Click handler */
  onClick?: () => void
  /** Additional CSS classes */
  className?: string
  /** Accessible label */
  'aria-label'?: string
}

const sizeStyles = {
  sm: {
    chip: 'h-8 px-2 gap-1.5',
    icon: 'w-4 h-4',
    cover: 'w-5 h-5',
    title: 'text-xs max-w-[100px]',
    artist: 'text-[10px] max-w-[80px]',
    bars: 'h-3 gap-[2px]',
    barWidth: 'w-[2px]',
  },
  md: {
    chip: 'h-10 px-3 gap-2',
    icon: 'w-5 h-5',
    cover: 'w-6 h-6',
    title: 'text-sm max-w-[140px]',
    artist: 'text-xs max-w-[100px]',
    bars: 'h-4 gap-[2px]',
    barWidth: 'w-[3px]',
  },
  lg: {
    chip: 'h-12 px-4 gap-2.5',
    icon: 'w-6 h-6',
    cover: 'w-8 h-8',
    title: 'text-base max-w-[180px]',
    artist: 'text-sm max-w-[140px]',
    bars: 'h-5 gap-[3px]',
    barWidth: 'w-[3px]',
  },
}

/** Animated equalizer bars component */
function EqualizerBars({ 
  isPlaying, 
  size 
}: Readonly<{ 
  isPlaying: boolean
  size: 'sm' | 'md' | 'lg' 
}>) {
  const config = sizeStyles[size]
  
  const barVariants = {
    playing: (i: number) => ({
      scaleY: [0.3, 1, 0.5, 0.8, 0.3],
      transition: {
        duration: 0.8 + i * 0.1,
        repeat: Infinity,
        ease: 'easeInOut',
      },
    }),
    paused: {
      scaleY: 0.3,
      transition: { duration: 0.2 },
    },
  }

  return (
    <div className={`flex items-end ${config.bars}`}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className={`${config.barWidth} bg-[rgb(var(--accent))] rounded-full origin-bottom`}
          style={{ height: '100%' }}
          custom={i}
          variants={barVariants}
          animate={isPlaying ? 'playing' : 'paused'}
        />
      ))}
    </div>
  )
}

export const NowPlayingChip = forwardRef<HTMLDivElement, NowPlayingChipProps>(
  (
    {
      title,
      artist,
      isPlaying = false,
      coverUrl,
      size = 'md',
      onClick,
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const config = sizeStyles[size]
    const hasContent = title || artist
    const label = ariaLabel ?? (title ? `Now playing: ${title}` : 'No track playing')

    return (
      <motion.div
        ref={ref}
        className={`
          relative inline-flex items-center
          rounded-full
          bg-[rgba(var(--bg-2),0.8)]
          backdrop-blur-md
          border border-[rgba(var(--border),var(--border-alpha))]
          transition-[background-color,box-shadow,transform] duration-200
          ${config.chip}
          ${onClick ? 'cursor-pointer' : ''}
          ${className}
        `}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
        aria-label={label}
        whileHover={onClick ? { 
          y: -2,
          boxShadow: '0 4px 20px rgba(var(--accent), 0.15)',
        } : undefined}
        whileTap={onClick ? { scale: 0.98 } : undefined}
      >
        {/* Glow effect layer */}
        <span
          className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(var(--glow), 0.1) 0%, transparent 60%)',
          }}
          aria-hidden="true"
        />

        {/* Cover art or icon */}
        {coverUrl ? (
          <div 
            className={`${config.cover} rounded-full overflow-hidden flex-shrink-0 bg-[rgba(var(--border),0.1)] relative`}
          >
            {/* Using img for dynamic external URLs (Convex storage) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={coverUrl} 
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div 
            className={`${config.cover} rounded-full flex items-center justify-center flex-shrink-0 bg-[rgba(var(--accent),0.1)]`}
          >
            <Music className={`${config.icon} text-[rgb(var(--accent))]`} />
          </div>
        )}

        {/* Track info */}
        {hasContent ? (
          <div className="flex flex-col min-w-0 flex-1">
            {title && (
              <span 
                className={`
                  ${config.title}
                  font-medium text-[rgb(var(--text))]
                  truncate
                `}
                title={title}
              >
                {title}
              </span>
            )}
            {artist && (
              <span 
                className={`
                  ${config.artist}
                  text-[rgb(var(--muted))]
                  truncate
                `}
                title={artist}
              >
                {artist}
              </span>
            )}
          </div>
        ) : (
          <span className={`${config.title} text-[rgb(var(--muted))] italic`}>
            No track
          </span>
        )}

        {/* Equalizer bars (when playing) */}
        {hasContent && (
          <div className="flex-shrink-0 ml-1">
            <EqualizerBars isPlaying={isPlaying} size={size} />
          </div>
        )}
      </motion.div>
    )
  }
)

NowPlayingChip.displayName = 'NowPlayingChip'
