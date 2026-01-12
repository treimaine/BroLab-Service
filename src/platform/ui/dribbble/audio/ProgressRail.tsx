'use client'

import { motion } from 'framer-motion'
import { forwardRef, useCallback, useRef, useState } from 'react'

/**
 * ProgressRail - Dribbble-style progress bar for audio playback
 *
 * Features:
 * - Accent gradient fill
 * - Hover glow effect
 * - Seek functionality support (click + drag)
 * - Touch-friendly (≥44px touch target)
 * - Reduced motion compliant
 * - Native input[type=range] for accessibility
 *
 * Requirements: Audio UI Dribbble
 */

interface ProgressRailProps {
  /** Current progress value (0-1) */
  value?: number
  /** Buffered progress value (0-1) */
  buffered?: number
  /** Callback when user seeks to a new position */
  onSeek?: (value: number) => void
  /** Callback during drag (for live preview) */
  onSeekPreview?: (value: number) => void
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show time tooltip on hover */
  showTooltip?: boolean
  /** Duration in seconds (for tooltip display) */
  duration?: number
  /** Additional CSS classes */
  className?: string
  /** Accessible label */
  'aria-label'?: string
}

const sizeStyles = {
  sm: {
    track: 'h-1',
    touchTarget: 'h-6',
    thumbSize: 12,
  },
  md: {
    track: 'h-1.5',
    touchTarget: 'h-8',
    thumbSize: 16,
  },
  lg: {
    track: 'h-2',
    touchTarget: 'h-10',
    thumbSize: 20,
  },
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export const ProgressRail = forwardRef<HTMLFieldSetElement, ProgressRailProps>(
  (
    {
      value = 0,
      buffered = 0,
      onSeek,
      onSeekPreview,
      disabled = false,
      size = 'md',
      showTooltip = true,
      duration = 0,
      className = '',
      'aria-label': ariaLabel = 'Playback progress',
    },
    ref
  ) => {
    const sizeConfig = sizeStyles[size]
    const trackRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [hoverPosition, setHoverPosition] = useState(0)

    // Clamp value between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, value))
    const clampedBuffered = Math.max(0, Math.min(1, buffered))

    const getPositionFromEvent = useCallback(
      (clientX: number): number => {
        if (!trackRef.current) return 0
        const rect = trackRef.current.getBoundingClientRect()
        const position = (clientX - rect.left) / rect.width
        return Math.max(0, Math.min(1, position))
      },
      []
    )

    const handleMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return
        e.preventDefault()
        setIsDragging(true)
        const position = getPositionFromEvent(e.clientX)
        onSeekPreview?.(position)
      },
      [disabled, getPositionFromEvent, onSeekPreview]
    )

    const handleMouseMove = useCallback(
      (e: React.MouseEvent) => {
        const position = getPositionFromEvent(e.clientX)
        setHoverPosition(position)

        if (isDragging && !disabled) {
          onSeekPreview?.(position)
        }
      },
      [disabled, getPositionFromEvent, isDragging, onSeekPreview]
    )

    const handleMouseUp = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return
        const position = getPositionFromEvent(e.clientX)
        if (isDragging) {
          onSeek?.(position)
        }
        setIsDragging(false)
      },
      [disabled, getPositionFromEvent, isDragging, onSeek]
    )

    const handleMouseLeave = useCallback(() => {
      setIsHovering(false)
      if (isDragging) {
        // If dragging and mouse leaves, commit the seek
        onSeek?.(hoverPosition)
        setIsDragging(false)
      }
    }, [isDragging, hoverPosition, onSeek])

    const handleTouchStart = useCallback(
      (e: React.TouchEvent) => {
        if (disabled) return
        setIsDragging(true)
        const touch = e.touches[0]
        const position = getPositionFromEvent(touch.clientX)
        onSeekPreview?.(position)
      },
      [disabled, getPositionFromEvent, onSeekPreview]
    )

    const handleTouchMove = useCallback(
      (e: React.TouchEvent) => {
        if (disabled || !isDragging) return
        const touch = e.touches[0]
        const position = getPositionFromEvent(touch.clientX)
        setHoverPosition(position)
        onSeekPreview?.(position)
      },
      [disabled, getPositionFromEvent, isDragging, onSeekPreview]
    )

    const handleTouchEnd = useCallback(() => {
      if (disabled) return
      if (isDragging) {
        onSeek?.(hoverPosition)
      }
      setIsDragging(false)
    }, [disabled, isDragging, hoverPosition, onSeek])

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return
        const position = getPositionFromEvent(e.clientX)
        onSeek?.(position)
      },
      [disabled, getPositionFromEvent, onSeek]
    )

    // Handle native input change for accessibility
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return
        const newValue = Number.parseFloat(e.target.value) / 100
        onSeek?.(newValue)
      },
      [disabled, onSeek]
    )

    const showThumb = isHovering || isDragging
    const tooltipTime = duration > 0 ? formatTime(hoverPosition * duration) : null

    return (
      <fieldset
        ref={ref}
        aria-label={ariaLabel}
        className={`relative w-full border-0 p-0 m-0 ${className}`}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={handleMouseLeave}
      >
        {/* Native range input for accessibility (visually hidden but accessible) */}
        <input
          type="range"
          min={0}
          max={100}
          step={1}
          value={Math.round(clampedValue * 100)}
          onChange={handleInputChange}
          disabled={disabled}
          aria-label={ariaLabel}
          className="sr-only"
        />

        {/* Custom visual track (touch target area) */}
        <div
          ref={trackRef}
          aria-hidden="true"
          className={`
            relative flex items-center cursor-pointer
            ${sizeConfig.touchTarget}
            ${disabled ? 'cursor-not-allowed opacity-50' : ''}
          `}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onClick={handleClick}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Track background */}
          <div
            className={`
              absolute inset-x-0 rounded-full
              bg-[rgba(var(--border),0.15)]
              ${sizeConfig.track}
            `}
          />

          {/* Buffered progress */}
          {clampedBuffered > 0 && (
            <div
              className={`
                absolute left-0 rounded-full
                bg-[rgba(var(--border),0.25)]
                ${sizeConfig.track}
              `}
              style={{ width: `${clampedBuffered * 100}%` }}
            />
          )}

          {/* Progress fill with gradient */}
          <motion.div
            className={`
              absolute left-0 rounded-full
              bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]
              ${sizeConfig.track}
            `}
            style={{ width: `${clampedValue * 100}%` }}
            initial={false}
            animate={{
              boxShadow: isHovering || isDragging
                ? '0 0 12px rgba(var(--accent), 0.5)'
                : '0 0 0px rgba(var(--accent), 0)',
            }}
            transition={{ duration: 0.2 }}
          />

          {/* Thumb */}
          <motion.div
            className={`
              absolute rounded-full
              bg-white
              shadow-[0_2px_8px_rgba(0,0,0,0.2)]
              ${disabled ? 'hidden' : ''}
            `}
            style={{
              width: sizeConfig.thumbSize,
              height: sizeConfig.thumbSize,
              left: `calc(${clampedValue * 100}% - ${sizeConfig.thumbSize / 2}px)`,
            }}
            initial={{ scale: 0, opacity: 0 }}
            animate={{
              scale: showThumb ? 1 : 0,
              opacity: showThumb ? 1 : 0,
            }}
            transition={{ duration: 0.15 }}
          />

          {/* Hover position indicator */}
          {isHovering && !isDragging && !disabled && (
            <motion.div
              className="absolute w-0.5 h-full bg-white/50 rounded-full pointer-events-none"
              style={{ left: `${hoverPosition * 100}%` }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
            />
          )}

          {/* Time tooltip */}
          {showTooltip && tooltipTime && isHovering && !disabled && (
            <motion.div
              className="
                absolute -top-8 px-2 py-1
                text-xs font-medium
                bg-[rgba(var(--card),0.95)] backdrop-blur-sm
                border border-[rgba(var(--border),var(--border-alpha))]
                rounded-md shadow-lg
                pointer-events-none
                whitespace-nowrap
              "
              style={{
                left: `${hoverPosition * 100}%`,
                transform: 'translateX(-50%)',
              }}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
            >
              {tooltipTime}
            </motion.div>
          )}
        </div>

        {/* Glow effect on hover/drag */}
        {(isHovering || isDragging) && !disabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: `radial-gradient(ellipse 100% 200% at ${clampedValue * 100}% 50%, rgba(var(--glow), 0.15) 0%, transparent 50%)`,
            }}
          />
        )}
      </fieldset>
    )
  }
)

ProgressRail.displayName = 'ProgressRail'
