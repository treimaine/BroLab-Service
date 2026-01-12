/**
 * WavyLines - ELECTRI-X style decorative wavy lines
 * 
 * Creates the flowing wavy lines visible on the right side of the hero.
 */

interface WavyLinesProps {
  /** Additional CSS classes */
  className?: string
}

export function WavyLines({ className = '' }: Readonly<WavyLinesProps>) {
  return (
    <div 
      className={`absolute pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg 
        viewBox="0 0 200 600" 
        fill="none" 
        className="w-full h-full opacity-20"
      >
        {/* Multiple wavy lines */}
        {Array.from({ length: 12 }, (_, i) => (
          <path
            key={i}
            d={`M${10 + i * 15} 0 Q${30 + i * 15} 100 ${10 + i * 15} 200 T${10 + i * 15} 400 T${10 + i * 15} 600`}
            stroke="white"
            strokeWidth="1"
            fill="none"
            opacity={0.3 + (i * 0.05)}
          />
        ))}
      </svg>
    </div>
  )
}

WavyLines.displayName = 'WavyLines'
