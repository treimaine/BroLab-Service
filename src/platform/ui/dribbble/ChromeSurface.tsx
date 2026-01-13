/**
 * ChromeSurface - Glass surface for Chrome UI elements (header, footer, nav, player)
 * 
 * CRITICAL RULE: Chrome elements use rgb(var(--bg)) + alpha, NEVER bg-card.
 * bg-card has a grey tint that is visible on fixed UI elements.
 * 
 * Use ChromeSurface for:
 * - Headers (sticky/fixed)
 * - Footers
 * - Navigation bars (left rail, bottom nav)
 * - Player bars
 * 
 * Use GlassSurface/DribbbleCard for:
 * - Content cards
 * - Chips and badges
 * - Modules and widgets
 */

import React from 'react'

export interface ChromeSurfaceProps {
  children: React.ReactNode
  /**
   * Backdrop blur intensity
   * @default 'sm'
   */
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl'
  /**
   * Border position
   * @default 'none'
   */
  border?: 'top' | 'bottom' | 'all' | 'none'
  /**
   * Background opacity (0-100)
   * @default 95
   */
  opacity?: number
  /**
   * Visual mode (for compatibility with existing usage)
   * - 'base': Standard chrome surface
   * - 'elevated': Higher opacity for scrolled state
   * - 'transparent': Fully transparent (no background)
   * @default 'base'
   */
  mode?: 'base' | 'elevated' | 'transparent'
  /**
   * Additional CSS classes
   */
  className?: string
  /**
   * HTML element to render
   * @default 'div'
   */
  as?: 'div' | 'header' | 'footer' | 'nav' | 'section'
}

export function ChromeSurface({
  children,
  blur = 'sm',
  border = 'none',
  opacity = 95,
  mode = 'base',
  className = '',
  as: Component = 'div',
}: Readonly<ChromeSurfaceProps>) {
  const blurClass = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  }[blur]

  const borderClass = {
    top: 'border-t border-[rgba(var(--border),var(--border-alpha))]',
    bottom: 'border-b border-[rgba(var(--border),var(--border-alpha))]',
    all: 'border border-[rgba(var(--border),var(--border-alpha))]',
    none: '',
  }[border]

  // Mode-based background
  let bgClass: string
  if (mode === 'transparent') {
    bgClass = 'bg-transparent'
  } else if (mode === 'elevated') {
    bgClass = 'bg-[rgb(var(--bg))]/98'
  } else {
    bgClass = `bg-[rgb(var(--bg))]/${opacity}`
  }

  return (
    <Component
      className={`
        ${bgClass}
        ${blurClass}
        ${borderClass}
        ${className}
      `.trim().replaceAll(/\s+/g, ' ')}
    >
      {children}
    </Component>
  )
}
