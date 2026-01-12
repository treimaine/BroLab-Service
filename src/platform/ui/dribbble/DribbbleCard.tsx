'use client'

import { motion } from 'framer-motion'
import { forwardRef, type ReactNode } from 'react'

/**
 * DribbbleCard - Glass morphism card with gradient edge and hover lift
 * 
 * Enhanced card component with Dribbble-style visual effects:
 * - Glass background with backdrop blur
 * - Subtle gradient border on hover
 * - Lift animation on hover
 * - Optional glow effect
 */

interface DribbbleCardProps {
  children: ReactNode
  /** Enable glow effect */
  glow?: boolean
  /** Enable hover lift animation */
  hoverLift?: boolean
  /** Card padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg'
  /** Enable gradient border on hover */
  gradientBorder?: boolean
  /** Make card interactive (button-like) */
  interactive?: boolean
  /** Additional CSS classes */
  className?: string
  /** Click handler */
  onClick?: () => void
}

const paddingStyles = {
  none: '',
  sm: 'p-4',
  md: 'p-6',
  lg: 'p-8',
}

export const DribbbleCard = forwardRef<HTMLDivElement, DribbbleCardProps>(
  (
    {
      children,
      glow = false,
      hoverLift = true,
      padding = 'md',
      gradientBorder = true,
      interactive = false,
      className = '',
      onClick,
    },
    ref
  ) => {
    return (
      <motion.div
        ref={ref}
        className={`
          relative overflow-hidden
          rounded-2xl
          glass
          ${paddingStyles[padding]}
          ${glow ? 'glow' : ''}
          ${interactive ? 'cursor-pointer text-left w-full' : ''}
          ${className}
        `}
        whileHover={hoverLift ? { y: -4 } : undefined}
        whileTap={interactive ? { scale: 0.98 } : undefined}
        transition={{ duration: 0.2 }}
        onClick={onClick}
        role={interactive ? 'button' : undefined}
        tabIndex={interactive ? 0 : undefined}
      >
        {/* Gradient border overlay (visible on hover) */}
        {gradientBorder && (
          <div
            className="
              absolute inset-0 rounded-2xl
              opacity-0 hover:opacity-100
              transition-opacity duration-300
              pointer-events-none
            "
            style={{
              background: `linear-gradient(135deg, 
                rgba(var(--accent), 0.2) 0%, 
                transparent 50%, 
                rgba(var(--accent-2), 0.2) 100%
              )`,
              padding: '1px',
              mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
              maskComposite: 'xor',
              WebkitMaskComposite: 'xor',
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    )
  }
)

DribbbleCard.displayName = 'DribbbleCard'
