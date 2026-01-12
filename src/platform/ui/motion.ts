'use client'

import { type Transition, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * BroLab Entertainment Motion Utilities
 * 
 * Provides animation variants and hooks for consistent motion design.
 * All animations respect prefers-reduced-motion via useReducedMotion hook.
 * 
 * Requirements: 24.1-24.4 (Motion and Animation)
 */

// ============================================================================
// useReducedMotion Hook
// Requirements: 24.4 (WHEN prefers-reduced-motion is set, animations disabled)
// ============================================================================

/**
 * Hook to detect user's reduced motion preference
 * Returns true if user prefers reduced motion
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Check if window is available (SSR safety)
    if (globalThis.window === undefined) return

    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    
    // Set initial value
    setPrefersReducedMotion(mediaQuery.matches)

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// ============================================================================
// Page Enter Animation
// Requirements: 24.1 (pageEnter: opacity 0→1, y 12→0, duration 0.35s easeOut)
// ============================================================================

/**
 * Page enter animation variants
 * Animates content from below with fade-in effect
 */
export const pageEnter: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -12,
  },
}

/**
 * Page enter transition configuration
 */
export const pageEnterTransition: Transition = {
  duration: 0.35,
  ease: 'easeOut',
}

/**
 * Combined page enter variants with transition
 */
export const pageEnterVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: pageEnterTransition,
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// ============================================================================
// Stagger Container Animation
// Requirements: 24.2 (staggerContainer: stagger children by 0.05s)
// ============================================================================

/**
 * Stagger container variants for animating children sequentially
 * Use as parent container with children using child variants
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.03,
      staggerDirection: -1,
    },
  },
}

/**
 * Child variants for use with staggerContainer
 * Apply to direct children of staggerContainer
 */
export const staggerChild: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

// ============================================================================
// Hero Float Animation
// Requirements: 24.3 (heroFloat: y [-10,10,-10], duration 6-10s infinite)
// ============================================================================

/**
 * Hero floating animation variants
 * Creates a gentle floating effect for hero elements
 * Duration varies between 6-10s for natural feel
 */
export const heroFloat: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 8, // Middle of 6-10s range
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

/**
 * Create hero float variants with custom duration
 * @param duration - Animation duration in seconds (6-10 recommended)
 */
export function createHeroFloat(duration: number = 8): Variants {
  return {
    initial: {
      y: 0,
    },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
  }
}

// ============================================================================
// Reduced Motion Variants
// Requirements: 24.4 (respect prefers-reduced-motion)
// ============================================================================

/**
 * Get animation variants that respect reduced motion preference
 * Returns empty variants if reduced motion is preferred
 */
export function getReducedMotionVariants(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (prefersReducedMotion) {
    return {
      initial: {},
      animate: {},
      exit: {},
    }
  }
  return variants
}

/**
 * Fade-only variants for reduced motion fallback
 * Provides subtle feedback without motion
 */
export const fadeOnly: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
}

// ============================================================================
// Utility Types
// ============================================================================

export type MotionVariantKey = 'initial' | 'animate' | 'exit'
