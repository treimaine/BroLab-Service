'use client'

import {
  ChromeSurface,
  GlassChip,
  NowPlayingChip,
  PlayerPillButton,
  ProgressRail,
  VolumePill,
  WaveformPlaceholder,
  dribbbleHoverLift,
  dribbblePlayerBarEnter,
  dribbbleReducedMotion
} from '@/platform/ui'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Clock, Music } from 'lucide-react'
import { useState } from 'react'

export interface PlayerBarProps {
  /** Whether the player bar is visible */
  isVisible?: boolean
  /** Current track title (placeholder for future integration) */
  trackTitle?: string
  /** Artist/producer name */
  artistName?: string
  /** Whether audio is currently playing */
  isPlaying?: boolean
  /** Callback when play/pause is toggled */
  onPlayPause?: () => void
  /** Current playback progress (0-100) */
  progress?: number
  /** Callback when progress is changed via seek */
  onSeek?: (progress: number) => void
  /** Current volume (0-100) */
  volume?: number
  /** Callback when volume is changed */
  onVolumeChange?: (volume: number) => void
  /** Whether audio is muted */
  isMuted?: boolean
  /** Callback when mute is toggled */
  onMuteToggle?: () => void
  /** Track duration in seconds (for progress tooltip) */
  duration?: number
  /** Cover art URL (optional) */
  coverUrl?: string
  /** Track BPM (optional, for MicroModule display) */
  bpm?: number
  /** Track key (optional, for MicroModule display) */
  trackKey?: string
}

/**
 * PlayerBar - Dribbble-styled sticky audio player for tenant storefronts
 * 
 * Features:
 * - 100% Dribbble design language
 * - Glass background with glow effects
 * - Dribbble spacing rhythm (8px grid)
 * - Sticky at bottom of tenant pages
 * - Proper z-index layering with nav (z-30, below nav z-40)
 * - Never overlaps page content (content has padding)
 * - Uses Dribbble audio primitives:
 *   - PlayerPillButton for play/pause
 *   - ProgressRail for seek bar
 *   - VolumePill for volume control
 *   - NowPlayingChip for track info
 *   - WaveformPlaceholder for visual
 * - MicroModule pattern for compact track metadata (BPM, key)
 * - Enter/exit animations (opacity + y + blur)
 * - Hover lift on controls
 * - Reduced motion compliant
 * 
 * Requirements: 12.1 (sticky bottom), 22.6 (never overlap content), PlayerBar Dribbble
 */
export function PlayerBar({
  isVisible = true,
  trackTitle,
  artistName,
  isPlaying = false,
  onPlayPause,
  progress = 0,
  onSeek,
  volume = 100,
  onVolumeChange,
  isMuted = false,
  onMuteToggle,
  duration = 0,
  coverUrl,
  bpm,
  trackKey,
}: Readonly<PlayerBarProps>) {
  const prefersReducedMotion = useReducedMotion()
  const [localVolume, setLocalVolume] = useState(volume / 100)
  const [localProgress, setLocalProgress] = useState(progress / 100)

  const handlePlayPause = () => {
    onPlayPause?.()
  }

  const handleSeek = (value: number) => {
    setLocalProgress(value)
    onSeek?.(value * 100)
  }

  const handleVolumeChange = (value: number) => {
    setLocalVolume(value)
    onVolumeChange?.(value * 100)
  }

  const handleMuteToggle = () => {
    onMuteToggle?.()
  }

  const hasTrack = Boolean(trackTitle)

  // Motion variants for enter/exit - using Dribbble motion utility
  const playerBarVariants = prefersReducedMotion
    ? dribbbleReducedMotion
    : dribbblePlayerBarEnter

  // Hover lift for controls (reduced motion compliant)
  const controlHoverProps = prefersReducedMotion
    ? {}
    : dribbbleHoverLift

  // Micro module hover animation
  const microModuleHover = prefersReducedMotion
    ? {}
    : {
        whileHover: {
          y: -2,
          scale: 1.02,
          transition: { duration: 0.2 },
        },
        whileTap: {
          scale: 0.98,
          transition: { duration: 0.1 },
        },
      }

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.div
          key="player-bar"
          className="
            fixed bottom-[64px] md:bottom-0 left-0 right-0 md:left-[80px]
            h-[72px] md:h-[80px]
            z-30
          "
          style={{
            boxShadow: hasTrack 
              ? '0 -4px 30px rgba(var(--accent), 0.1), 0 0 0 1px rgba(var(--border), 0.05)'
              : '0 -2px 20px rgba(0, 0, 0, 0.1)',
          }}
          variants={playerBarVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <ChromeSurface
            as="section"
            blur="xl"
            border="top"
            opacity={80}
            className="h-full"
            aria-label="Audio player"
          >
          {/* Glow effect layer (only when track is playing) */}
          {hasTrack && isPlaying && (
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              style={{
                background: 'radial-gradient(ellipse 50% 100% at 20% 100%, rgba(var(--glow), 0.08) 0%, transparent 60%)',
              }}
            />
          )}

          {/* Main content container - Dribbble spacing rhythm */}
          <div className="h-full flex items-center gap-3 md:gap-4 px-4 md:px-6">
            
            {/* Play/Pause Button - Using PlayerPillButton with hover lift */}
            <motion.div {...controlHoverProps}>
              <PlayerPillButton
                isPlaying={isPlaying}
                onClick={handlePlayPause}
                disabled={!hasTrack}
                size="md"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              />
            </motion.div>

            {/* Track Info Section - MicroModule pattern for compact layout */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* NowPlayingChip for track info with hover lift */}
              <motion.div {...controlHoverProps}>
                <NowPlayingChip
                  title={trackTitle}
                  artist={artistName}
                  isPlaying={isPlaying && hasTrack}
                  coverUrl={coverUrl}
                  size="md"
                />
              </motion.div>

              {/* MicroModule-style track metadata (BPM, Key) - Hidden on mobile */}
              {hasTrack && (bpm || trackKey) && (
                <div className="hidden lg:flex items-center gap-2">
                  {/* BPM Chip with hover */}
                  {bpm && (
                    <motion.div {...microModuleHover}>
                      <GlassChip
                        icon={Clock}
                        label={bpm.toString()}
                        sublabel="BPM"
                        size="sm"
                        aria-label={`${bpm} BPM`}
                      />
                    </motion.div>
                  )}

                  {/* Key Chip with hover */}
                  {trackKey && (
                    <motion.div {...microModuleHover}>
                      <GlassChip
                        icon={Music}
                        label={trackKey}
                        sublabel="KEY"
                        size="sm"
                        aria-label={`Key: ${trackKey}`}
                      />
                    </motion.div>
                  )}
                </div>
              )}
            </div>

            {/* Waveform + Progress Section */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-1">
              {/* Waveform Placeholder - Hidden on mobile for space */}
              <div className="hidden md:block">
                <WaveformPlaceholder
                  barCount={48}
                  isPlaying={isPlaying && hasTrack}
                  size="sm"
                  variant={hasTrack ? 'gradient' : 'muted'}
                />
              </div>

              {/* Progress Rail with subtle hover effect */}
              <motion.div
                whileHover={prefersReducedMotion ? {} : { scale: 1.01 }}
                transition={{ duration: 0.15 }}
              >
                <ProgressRail
                  value={hasTrack ? localProgress : 0}
                  onSeek={handleSeek}
                  disabled={!hasTrack}
                  size="sm"
                  showTooltip={hasTrack}
                  duration={duration}
                  aria-label="Playback progress"
                />
              </motion.div>
            </div>

            {/* Volume Controls - Hidden on mobile for space, with hover lift */}
            <motion.div 
              className="hidden sm:flex items-center"
              {...controlHoverProps}
            >
              <VolumePill
                value={localVolume}
                muted={isMuted}
                onVolumeChange={handleVolumeChange}
                onMuteToggle={handleMuteToggle}
                disabled={!hasTrack}
                size="md"
                expandOnHover={true}
                aria-label="Volume control"
              />
            </motion.div>
          </div>
          </ChromeSurface>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

PlayerBar.displayName = 'PlayerBar'
