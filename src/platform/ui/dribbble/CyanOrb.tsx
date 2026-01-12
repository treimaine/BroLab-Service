/**
 * CyanOrb - Decorative cyan circle with glow effect
 * 
 * ELECTRI-X style floating orb decoration.
 * Positioned near EditionBadge in hero section.
 * 
 * Performance: Uses CSS glow instead of filter blur.
 * Pulse animation respects prefers-reduced-motion.
 */

interface CyanOrbProps {
  /** Size in pixels (default: 120) */
  size?: number
  /** Additional CSS classes */
  className?: string
}

export function CyanOrb({ 
  size = 120, 
  className = '',
}: Readonly<CyanOrbProps>) {
  return (
    <div
      className={`
        rounded-full
        bg-gradient-to-br from-[rgb(var(--accent))] to-[rgb(var(--accent-2))]
        motion-safe:animate-pulse
        ${className}
      `}
      style={{
        width: size,
        height: size,
        // Use box-shadow for glow instead of filter blur (GPU-friendly)
        boxShadow: `
          0 0 ${size / 3}px rgba(var(--accent), 0.5),
          0 0 ${size / 1.5}px rgba(var(--accent), 0.25)
        `,
      }}
    />
  )
}

CyanOrb.displayName = 'CyanOrb'
