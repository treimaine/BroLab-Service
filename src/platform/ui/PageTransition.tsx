'use client'

import { motion, type Variants } from 'framer-motion'
import { type ReactNode } from 'react'

export interface PageTransitionProps {
  children: ReactNode
  /** Additional CSS classes */
  className?: string
}

/**
 * Page enter animation variants
 * Requirements: 24.1 (pageEnter: opacity 0→1, y 12→0, duration 0.35s easeOut)
 */
const pageEnterVariants: Variants = {
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
    y: -12,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}

/**
 * PageTransition - Animated page wrapper component
 * 
 * Wraps page content with framer-motion animations for smooth transitions.
 * Respects prefers-reduced-motion via framer-motion's built-in support.
 * Requirements: 24.1 (pageEnter animation), 24.4 (reduced motion)
 */
export function PageTransition({ children, className = '' }: Readonly<PageTransitionProps>) {
  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={pageEnterVariants}
      className={className}
    >
      {children}
    </motion.div>
  )
}

PageTransition.displayName = 'PageTransition'
