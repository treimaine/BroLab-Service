/**
 * CyanBlob - ELECTRI-X style organic blob shape
 * 
 * Creates the distinctive organic cyan shape (not a circle).
 * Used in bottom-right of hero section.
 */

interface CyanBlobProps {
  /** Size multiplier (default: 1) */
  size?: number
  /** Additional CSS classes */
  className?: string
}

export function CyanBlob({ 
  size = 1, 
  className = '' 
}: Readonly<CyanBlobProps>) {
  const width = 180 * size
  const height = 140 * size
  
  return (
    <div 
      className={`relative ${className}`}
      style={{ width, height }}
    >
      <svg 
        viewBox="0 0 180 140" 
        fill="none" 
        className="w-full h-full"
      >
        {/* Organic blob shape - like a play button but organic */}
        <path 
          d="M20 70C20 30 50 10 90 10C130 10 160 40 160 70C160 100 140 130 100 130C60 130 20 110 20 70Z"
          fill="url(#cyanGradient)"
          className="drop-shadow-[0_0_40px_rgba(var(--accent),0.6)]"
        />
        <defs>
          <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="rgb(var(--accent))" />
            <stop offset="100%" stopColor="rgb(var(--accent-2))" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  )
}

CyanBlob.displayName = 'CyanBlob'
