'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { type LucideIcon } from 'lucide-react'
import { forwardRef, type ReactNode } from 'react'

/**
 * PillCTA - Dribbble-style pill button with gradient and glow
 * 
 * Rounded pill shape with gradient background, hover lift effect (y: -4),
 * and subtle glow. Used for primary CTAs throughout the app.
 * 
 * Motion: Uses dribbbleHoverLift pattern (y: -4 on hover, scale: 0.98 on tap)
 */

interface PillCTAProps {
  children: ReactNode
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost'
  /** Button size */
  size?: 'sm' | 'md' | 'lg'
  /** Icon to show before text */
  icon?: LucideIcon
  /** Icon to show after text */
  iconAfter?: LucideIcon
  /** Full width button */
  fullWidth?: boolean
  /** Loading state */
  loading?: boolean
  /** Disabled state */
  disabled?: boolean
  /** Click handler */
  onClick?: () => void
  /** Button type */
  type?: 'button' | 'submit' | 'reset'
  /** Additional CSS classes */
  className?: string
}

const variantStyles = {
  primary: `
    bg-gradient-to-r from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]
    text-white font-semibold
    shadow-[0_4px_14px_rgba(var(--accent),0.3)]
    hover:shadow-[0_8px_24px_rgba(var(--accent),0.4)]
  `,
  secondary: `
    glass border border-border
    text-text font-medium
    hover:border-[rgba(var(--accent),0.3)]
    hover:shadow-[0_0_20px_rgba(var(--accent),0.15)]
  `,
  ghost: `
    bg-transparent
    text-muted font-medium
    hover:text-text
    hover:bg-[rgba(var(--card),0.5)]
  `,
}

const sizeStyles = {
  sm: 'px-4 py-2 text-sm gap-1.5',
  md: 'px-6 py-3 text-base gap-2',
  lg: 'px-8 py-4 text-lg gap-2.5',
}

const iconSizes = {
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
}

export const PillCTA = forwardRef<HTMLButtonElement, PillCTAProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconAfter: IconAfter,
      fullWidth = false,
      loading = false,
      disabled,
      onClick,
      type = 'button',
      className = '',
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const isDisabled = disabled || loading

    // dribbbleHoverLift motion: y: -4 on hover, scale: 0.98 on tap
    const hoverLiftProps = isDisabled || prefersReducedMotion
      ? undefined
      : {
          whileHover: { y: -4, transition: { duration: 0.2 } },
          whileTap: { scale: 0.98, transition: { duration: 0.1 } },
        }

    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        className={`
          relative inline-flex items-center justify-center
          rounded-full
          transition-[background-color,color,box-shadow,transform] duration-200
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${variantStyles[variant]}
          ${sizeStyles[size]}
          ${fullWidth ? 'w-full' : ''}
          ${className}
        `}
        {...hoverLiftProps}
        disabled={isDisabled}
      >
        {/* Loading spinner */}
        {loading && (
          <svg
            className={`animate-spin ${iconSizes[size]} mr-2`}
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}

        {/* Icon before */}
        {Icon && !loading && <Icon className={iconSizes[size]} />}

        {/* Text */}
        <span>{children}</span>

        {/* Icon after */}
        {IconAfter && !loading && <IconAfter className={iconSizes[size]} />}
      </motion.button>
    )
  }
)

PillCTA.displayName = 'PillCTA'
