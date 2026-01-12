'use client'

import { motion } from 'framer-motion'
import { Volume, Volume1, Volume2, VolumeX } from 'lucide-react'
import { forwardRef, useCallback, useRef, useState } from 'react'

/**
 * VolumePill - Dribbble-style volume control in pill style
 *
 * Features:
 * - Slider with accent color gradient
 * - Mute toggle button
 * - Hover glow effect
 * - Touch target ≥44px for accessibility
 * - Expandable slider on hover/focus
 * - Reduced motion compliant
 *
 * Requirements: Audio UI Dribbble
 */

interface VolumePillProps {
  /** Current volume value (0-1) */
  value?: number
  /** Whether audio is muted */
  muted?: boolean
  /** Callback when volume changes */
  onVolumeChange?: (value: number) => void
  /** Callback when mute state changes */
  onMuteToggle?: () => void
  /** Disabled state */
  disabled?: boolean
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Show slider always or only on hover */
  expandOnHover?: boolean
  /** Additional CSS classes */
  className?: string
  /** Accessible label */
  'aria-label'?: string
}

const sizeStyles = {
  sm: {
    button: 'w-8 h-8 min-w-[44px] min-h-[44px]',
    icon: 'w-4 h-4',
    sliderWidth: 'w-16',
    sliderHeight: 'h-1',
    thumbSize: 10,
  },
  md: {
    button: 'w-10 h-10 min-w-[44px] min-h-[44px]',
    icon: 'w-5 h-5',
    sliderWidth: 'w-20',
    sliderHeight: 'h-1.5',
    thumbSize: 14,
  },
  lg: {
    button: 'w-12 h-12 min-w-[44px] min-h-[44px]',
    icon: 'w-6 h-6',
    sliderWidth: 'w-24',
    sliderHeight: 'h-2',
    thumbSize: 16,
  },
}

function getVolumeIcon(volume: number, muted: boolean) {
  if (muted || volume === 0) return VolumeX
  if (volume < 0.33) return Volume
  if (volume < 0.66) return Volume1
  return Volume2
}

export const VolumePill = forwardRef<HTMLFieldSetElement, VolumePillProps>(
  (
    {
      value = 1,
      muted = false,
      onVolumeChange,
      onMuteToggle,
      disabled = false,
      size = 'md',
      expandOnHover = true,
      className = '',
      'aria-label': ariaLabel = 'Volume control',
    },
    ref
  ) => {
    const sizeConfig = sizeStyles[size]
    const sliderRef = useRef<HTMLDivElement>(null)
    const [isDragging, setIsDragging] = useState(false)
    const [isHovering, setIsHovering] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    // Clamp value between 0 and 1
    const clampedValue = Math.max(0, Math.min(1, value))
    const effectiveVolume = muted ? 0 : clampedValue

    const VolumeIcon = getVolumeIcon(clampedValue, muted)

    const showSlider = !expandOnHover || isHovering || isDragging || isFocused

    const getPositionFromEvent = useCallback(
      (clientX: number): number => {
        if (!sliderRef.current) return clampedValue
        const rect = sliderRef.current.getBoundingClientRect()
        const position = (clientX - rect.left) / rect.width
        return Math.max(0, Math.min(1, position))
      },
      [clampedValue]
    )

    const handleSliderMouseDown = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return
        e.preventDefault()
        e.stopPropagation()
        setIsDragging(true)
        const position = getPositionFromEvent(e.clientX)
        onVolumeChange?.(position)
      },
      [disabled, getPositionFromEvent, onVolumeChange]
    )

    const handleSliderMouseMove = useCallback(
      (e: React.MouseEvent) => {
        if (!isDragging || disabled) return
        const position = getPositionFromEvent(e.clientX)
        onVolumeChange?.(position)
      },
      [disabled, getPositionFromEvent, isDragging, onVolumeChange]
    )

    const handleSliderMouseUp = useCallback(() => {
      setIsDragging(false)
    }, [])

    const handleSliderClick = useCallback(
      (e: React.MouseEvent) => {
        if (disabled) return
        e.stopPropagation()
        const position = getPositionFromEvent(e.clientX)
        onVolumeChange?.(position)
      },
      [disabled, getPositionFromEvent, onVolumeChange]
    )

    // Handle native input change for accessibility
    const handleInputChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        if (disabled) return
        const newValue = Number.parseFloat(e.target.value) / 100
        onVolumeChange?.(newValue)
      },
      [disabled, onVolumeChange]
    )

    const handleMuteClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation()
        if (disabled) return
        onMuteToggle?.()
      },
      [disabled, onMuteToggle]
    )

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (disabled) return
        const step = e.shiftKey ? 0.1 : 0.05
        
        switch (e.key) {
          case 'ArrowRight':
          case 'ArrowUp':
            e.preventDefault()
            onVolumeChange?.(Math.min(1, clampedValue + step))
            break
          case 'ArrowLeft':
          case 'ArrowDown':
            e.preventDefault()
            onVolumeChange?.(Math.max(0, clampedValue - step))
            break
          case 'm':
          case 'M':
            e.preventDefault()
            onMuteToggle?.()
            break
        }
      },
      [disabled, clampedValue, onVolumeChange, onMuteToggle]
    )

    return (
      <fieldset
        ref={ref}
        aria-label={ariaLabel}
        className={`
          relative inline-flex items-center gap-1 border-0 p-0 m-0
          ${className}
        `}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false)
          setIsDragging(false)
        }}
      >
        {/* Mute toggle button */}
        <motion.button
          type="button"
          onClick={handleMuteClick}
          disabled={disabled}
          aria-label={muted ? 'Unmute' : 'Mute'}
          aria-pressed={muted}
          className={`
            relative inline-flex items-center justify-center
            rounded-full
            transition-[background-color,color,box-shadow,transform] duration-200
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2
            ${sizeConfig.button}
            ${
              disabled
                ? 'text-[rgb(var(--muted))] cursor-not-allowed opacity-50'
                : `
                  text-[rgb(var(--text))]
                  hover:text-[rgb(var(--accent))]
                  hover:bg-[rgba(var(--accent),0.1)]
                `
            }
          `}
          whileHover={disabled ? undefined : { scale: 1.05 }}
          whileTap={disabled ? undefined : { scale: 0.95 }}
        >
          <VolumeIcon className={sizeConfig.icon} />
        </motion.button>

        {/* Volume slider container */}
        <motion.div
          className="overflow-hidden"
          initial={false}
          animate={{
            width: showSlider ? 'auto' : 0,
            opacity: showSlider ? 1 : 0,
          }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <div
            className={`
              flex items-center
              ${sizeConfig.sliderWidth}
              px-2
            `}
          >
            {/* Native range input for accessibility (visually hidden) */}
            <input
              type="range"
              min={0}
              max={100}
              step={1}
              value={Math.round(effectiveVolume * 100)}
              onChange={handleInputChange}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onKeyDown={handleKeyDown}
              disabled={disabled}
              aria-label="Volume"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(effectiveVolume * 100)}
              className="sr-only"
            />

            {/* Custom visual slider */}
            <div
              ref={sliderRef}
              aria-hidden="true"
              className={`
                relative w-full h-6 flex items-center cursor-pointer
                ${disabled ? 'cursor-not-allowed opacity-50' : ''}
              `}
              onMouseDown={handleSliderMouseDown}
              onMouseMove={handleSliderMouseMove}
              onMouseUp={handleSliderMouseUp}
              onClick={handleSliderClick}
            >
              {/* Track background */}
              <div
                className={`
                  absolute inset-x-0 rounded-full
                  bg-[rgba(var(--border),0.2)]
                  ${sizeConfig.sliderHeight}
                `}
              />

              {/* Volume fill with gradient */}
              <motion.div
                className={`
                  absolute left-0 rounded-full
                  bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]
                  ${sizeConfig.sliderHeight}
                `}
                style={{ width: `${effectiveVolume * 100}%` }}
                initial={false}
                animate={{
                  boxShadow: isHovering || isDragging
                    ? '0 0 8px rgba(var(--accent), 0.4)'
                    : '0 0 0px rgba(var(--accent), 0)',
                }}
                transition={{ duration: 0.2 }}
              />

              {/* Thumb */}
              <motion.div
                className={`
                  absolute rounded-full
                  bg-white
                  shadow-[0_1px_4px_rgba(0,0,0,0.2)]
                  ${disabled ? 'hidden' : ''}
                `}
                style={{
                  width: sizeConfig.thumbSize,
                  height: sizeConfig.thumbSize,
                  left: `calc(${effectiveVolume * 100}% - ${sizeConfig.thumbSize / 2}px)`,
                }}
                initial={{ scale: 0.8, opacity: 0.5 }}
                animate={{
                  scale: isHovering || isDragging ? 1 : 0.8,
                  opacity: isHovering || isDragging ? 1 : 0.5,
                }}
                transition={{ duration: 0.15 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Glow effect on hover */}
        {(isHovering || isDragging) && !disabled && (
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'radial-gradient(circle at 30% 50%, rgba(var(--glow), 0.1) 0%, transparent 60%)',
            }}
          />
        )}
      </fieldset>
    )
  }
)

VolumePill.displayName = 'VolumePill'
