'use client'

import { type Transition, type Variants } from 'framer-motion'

/**
 * Dribbble Motion Language
 * 
 * Enhanced motion utilities following the Dribbble design language.
 * All animations include blur transitions and staggered reveals.
 */

// ============================================================================
// Page Enter (with blur)
// ============================================================================

export const dribbblePageEnter: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    // Note: filter blur removed - too expensive on large containers like <main>
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

// ============================================================================
// Stagger Container (enhanced)
// ============================================================================

export const dribbbleStaggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const dribbbleStaggerChild: Variants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
}

// ============================================================================
// Scroll Reveal
// ============================================================================

export const dribbbleScrollReveal: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export const scrollRevealViewport = {
  once: true,
  margin: '-50px' as const,
}

// ============================================================================
// Hover Effects
// ============================================================================

export const dribbbleHoverLift = {
  whileHover: {
    y: -4,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const dribbbleHoverGlow = {
  whileHover: {
    boxShadow: '0 0 30px rgba(var(--accent), 0.3)',
    transition: { duration: 0.2 },
  },
}

export const dribbbleHoverScale = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
  },
}

// ============================================================================
// Hero Float (enhanced)
// ============================================================================

export const dribbbleHeroFloat: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

// ============================================================================
// Blob Animation (for background elements)
// ============================================================================

export const dribbbleBlobFloat: Variants = {
  initial: {
    scale: 1,
    x: 0,
    y: 0,
  },
  animate: {
    scale: [1, 1.1, 1],
    x: [-20, 20, -20],
    y: [-10, 10, -10],
    transition: {
      duration: 20,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

// ============================================================================
// Card Enter (for grid items)
// ============================================================================

export const dribbbleCardEnter: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

// ============================================================================
// Slide In (for sidebars, modals)
// ============================================================================

export const dribbbleSlideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
}

export const dribbbleSlideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
}

// ============================================================================
// Fade Scale (for modals, overlays)
// ============================================================================

export const dribbbleFadeScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
}

// ============================================================================
// Reduced Motion Variants
// ============================================================================

export const dribbbleReducedMotion: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.2 } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15 } 
  },
}

// ============================================================================
// Transition Presets
// ============================================================================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
}

// ============================================================================
// Helper: Get motion props based on reduced motion preference
// ============================================================================

export function getMotionProps(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (prefersReducedMotion) {
    return dribbbleReducedMotion
  }
  return variants
}
