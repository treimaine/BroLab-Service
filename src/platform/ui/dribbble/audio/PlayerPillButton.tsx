'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { forwardRef } from 'react'

/**
 * PlayerPillButton - Dribbble-style play/pause button in pill style
 *
 * Features:
 * - Gradient background like PillCTA (from-accent to-accent-2)
 * - Hover lift (y: -4) + glow effects matching dribbbleHoverLift
 * - Touch target ≥44px for accessibility (WCAG compliant)
 * - Play/pause icon toggle with smooth transitions
 * - Disabled state for "no track" scenarios
 * - Reduced motion support
 *
 * Requirements: Audio UI Dribbble, PlayerBar Dribbble
 */

interface PlayerPillButtonProps {
  /** Whether audio is currently playing */
  isPlaying?: boolean
  /** Click handler for play/pause toggle */
  onClick?: () => void
  /** Disabled state (e.g., no track loaded) */
  disabled?: boolean
  /** Button size variant */
  size?: 'sm' | 'md' | 'lg'
  /** Additional CSS classes */
  className?: string
  /** Accessible label */
  'aria-label'?: string
}

const sizeStyles = {
  sm: {
    button: 'w-10 h-10 min-w-[44px] min-h-[44px]',
    icon: 'w-4 h-4',
    playOffset: 'ml-0.5',
  },
  md: {
    button: 'w-12 h-12 min-w-[44px] min-h-[44px]',
    icon: 'w-5 h-5',
    playOffset: 'ml-0.5',
  },
  lg: {
    button: 'w-14 h-14 min-w-[44px] min-h-[44px]',
    icon: 'w-6 h-6',
    playOffset: 'ml-1',
  },
}

export const PlayerPillButton = forwardRef<HTMLButtonElement, PlayerPillButtonProps>(
  (
    {
      isPlaying = false,
      onClick,
      disabled = false,
      size = 'md',
      className = '',
      'aria-label': ariaLabel,
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const sizeConfig = sizeStyles[size]
    const label = ariaLabel ?? (isPlaying ? 'Pause' : 'Play')

    // dribbbleHoverLift motion: y: -4 on hover, scale: 0.98 on tap
    const hoverLiftProps = disabled || prefersReducedMotion
      ? undefined
      : {
          whileHover: { y: -4, transition: { duration: 0.2 } },
          whileTap: { scale: 0.98, transition: { duration: 0.1 } },
        }

    return (
      <motion.button
        ref={ref}
        type="button"
        onClick={onClick}
        disabled={disabled}
        aria-label={label}
        className={`
          relative inline-flex items-center justify-center
          rounded-full
          transition-[background-color,color,box-shadow,transform] duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]
          ${sizeConfig.button}
          ${
            disabled
              ? 'bg-[rgba(var(--border),0.1)] text-[rgb(var(--muted))] cursor-not-allowed opacity-50'
              : `
                bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]
                text-white
                shadow-[0_4px_14px_rgba(var(--accent),0.3)]
                hover:shadow-[0_8px_24px_rgba(var(--accent),0.4)]
              `
          }
          ${className}
        `}
        {...hoverLiftProps}
      >
        {/* Glow effect layer - dribbbleHoverGlow style */}
        {!disabled && (
          <motion.span
            className="absolute inset-0 rounded-full pointer-events-none"
            initial={{ opacity: 0 }}
            whileHover={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'radial-gradient(circle, rgba(var(--glow), 0.25) 0%, transparent 70%)',
              filter: 'blur(10px)',
            }}
            aria-hidden="true"
          />
        )}

        {/* Icon with smooth transition */}
        <motion.span
          className="relative z-10 flex items-center justify-center"
          initial={false}
          animate={{ scale: 1 }}
          key={isPlaying ? 'pause' : 'play'}
        >
          {isPlaying ? (
            <Pause className={sizeConfig.icon} strokeWidth={2.5} />
          ) : (
            <Play className={`${sizeConfig.icon} ${sizeConfig.playOffset}`} strokeWidth={2.5} />
          )}
        </motion.span>
      </motion.button>
    )
  }
)

PlayerPillButton.displayName = 'PlayerPillButton'
