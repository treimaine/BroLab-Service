'use client'

import { type ReactNode } from 'react'

/**
 * WavyBackground - Art-directed background with wavy lines, noise, and glow blobs
 * 
 * Provides the signature Dribbble aesthetic with layered visual effects.
 * All effects are purely decorative and don't affect content interaction.
 */

interface WavyBackgroundProps {
  children: ReactNode
  /** Show wavy line pattern */
  showWaves?: boolean
  /** Show noise texture overlay */
  showNoise?: boolean
  /** Show glow blobs */
  showBlobs?: boolean
  /** Additional CSS classes */
  className?: string
}

// Inline SVG for wavy lines pattern (avoids external file)
const wavySvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Cpath d='M0 50 Q25 30 50 50 T100 50' fill='none' stroke='%23ffffff' stroke-width='0.5' opacity='0.15'/%3E%3Cpath d='M0 70 Q25 50 50 70 T100 70' fill='none' stroke='%23ffffff' stroke-width='0.3' opacity='0.1'/%3E%3Cpath d='M0 30 Q25 10 50 30 T100 30' fill='none' stroke='%23ffffff' stroke-width='0.3' opacity='0.1'/%3E%3C/svg%3E")`

// Inline SVG for noise texture
const noiseSvg = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`

export function WavyBackground({
  children,
  showWaves = true,
  showNoise = true,
  showBlobs = true,
  className = '',
}: Readonly<WavyBackgroundProps>) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Layer 1: Glow blobs */}
      {showBlobs && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {/* Primary blob - top right */}
          <div 
            className="absolute -top-1/4 -right-1/4 w-[600px] h-[600px] rounded-full blur-[120px]"
            style={{ background: 'rgba(var(--accent), 0.12)' }}
          />
          {/* Secondary blob - bottom left */}
          <div 
            className="absolute -bottom-1/4 -left-1/4 w-[500px] h-[500px] rounded-full blur-[100px]"
            style={{ background: 'rgba(var(--accent-2), 0.08)' }}
          />
          {/* Tertiary blob - center */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full blur-[80px]"
            style={{ background: 'rgba(var(--accent), 0.06)' }}
          />
        </div>
      )}

      {/* Layer 2: Wavy lines pattern */}
      {showWaves && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: wavySvg,
            backgroundSize: '150px 150px',
            backgroundRepeat: 'repeat',
          }}
        />
      )}

      {/* Layer 3: Noise texture */}
      {showNoise && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.025] mix-blend-overlay"
          style={{
            backgroundImage: noiseSvg,
            backgroundSize: '200px 200px',
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}

WavyBackground.displayName = 'WavyBackground'
