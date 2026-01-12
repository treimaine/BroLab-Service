'use client'

import { type ElementType, type HTMLAttributes, type ReactNode } from 'react'

/**
 * OutlineStackTitle - Dribbble signature typography with stacked outline layers
 * 
 * Creates the distinctive layered text effect with multiple outline copies
 * offset behind the main text. Each layer has decreasing opacity.
 */

type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div'

interface OutlineStackTitleProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode
  /** HTML tag to render */
  as?: HeadingElement
  /** Size variant */
  size?: 'hero' | 'display' | 'section' | 'card'
  /** Number of outline layers (2-6) */
  layers?: number
  /** Offset distance per layer in pixels */
  offset?: number
  /** Additional CSS classes */
  className?: string
}

// Size configurations
const sizeConfig = {
  hero: {
    fontSize: 'clamp(48px, 10vw, 120px)',
    fontWeight: 900,
    strokeWidth: 2,
    letterSpacing: '-0.02em',
  },
  display: {
    fontSize: 'clamp(36px, 6vw, 72px)',
    fontWeight: 800,
    strokeWidth: 1.5,
    letterSpacing: '-0.02em',
  },
  section: {
    fontSize: 'clamp(28px, 4vw, 48px)',
    fontWeight: 700,
    strokeWidth: 1,
    letterSpacing: '-0.01em',
  },
  card: {
    fontSize: 'clamp(20px, 2vw, 28px)',
    fontWeight: 700,
    strokeWidth: 0.75,
    letterSpacing: '0',
  },
}

// Layer opacity values (back to front)
const layerOpacities = [0.05, 0.08, 0.12, 0.18, 0.25, 0.35]

export function OutlineStackTitle({
  children,
  as = 'h1',
  size = 'hero',
  layers = 4,
  offset = 2,
  className = '',
  ...props
}: Readonly<OutlineStackTitleProps>) {
  const Component = as as ElementType
  const config = sizeConfig[size]
  const clampedLayers = Math.min(Math.max(layers, 2), 6)

  // Generate layer styles
  const renderLayers = () => {
    const layerElements = []
    
    for (let i = clampedLayers - 1; i >= 0; i--) {
      const layerOffset = (clampedLayers - 1 - i) * offset
      const opacity = layerOpacities[i] || 0.05
      
      layerElements.push(
        <span
          key={i}
          className="absolute inset-0 select-none"
          style={{
            transform: `translate(${-layerOffset}px, ${-layerOffset}px)`,
            WebkitTextStroke: `${config.strokeWidth}px rgba(var(--text), ${opacity})`,
            color: 'transparent',
          }}
          aria-hidden="true"
        >
          {children}
        </span>
      )
    }
    
    return layerElements
  }

  return (
    <Component
      className={`relative inline-block ${className}`}
      style={{
        fontSize: config.fontSize,
        fontWeight: config.fontWeight,
        letterSpacing: config.letterSpacing,
        lineHeight: 1,
      }}
      {...props}
    >
      {/* Outline layers (behind) */}
      {renderLayers()}
      
      {/* Main text (front) */}
      <span className="relative text-text">
        {children}
      </span>
    </Component>
  )
}

OutlineStackTitle.displayName = 'OutlineStackTitle'
