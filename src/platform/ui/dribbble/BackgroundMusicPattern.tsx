'use client'

import { type CSSProperties, type ReactNode } from 'react'

/**
 * BackgroundMusicPattern - ELECTRI-X style background pattern
 * 
 * Displays a repeated word pattern (like "MUSIC", "ABOUT", "PRICING")
 * as a subtle background decoration.
 * 
 * Used in MarketingPageShell and landing page heroes.
 */

interface BackgroundMusicPatternProps {
  /** Word to repeat (e.g., "MUSIC", "ABOUT", "PRICING") */
  word?: string
  /** Number of rows to display */
  rows?: number
  /** Opacity of the pattern (0-1) */
  opacity?: number
  /** Additional CSS classes */
  className?: string
  /** Custom styles */
  style?: CSSProperties
}

export function BackgroundMusicPattern({
  word = 'MUSIC',
  rows = 6,
  opacity = 0.025,
  className = '',
  style,
}: Readonly<BackgroundMusicPatternProps>): ReactNode {
  // Repeat word 4 times per row for coverage
  const repeatedWord = `${word} ${word} ${word} ${word}`

  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={style}
      aria-hidden="true"
    >
      <div className="absolute inset-0 flex flex-col justify-center">
        {Array.from({ length: rows }, (_, row) => (
          <div 
            key={`pattern-row-${row}`}
            className="whitespace-nowrap font-black tracking-[0.15em] text-white leading-[0.85]"
            style={{ 
              fontSize: 'clamp(80px, 15vw, 180px)',
              opacity,
              transform: `translateX(${(row % 2) * -100}px)`,
            }}
          >
            {repeatedWord}
          </div>
        ))}
      </div>
    </div>
  )
}

BackgroundMusicPattern.displayName = 'BackgroundMusicPattern'
