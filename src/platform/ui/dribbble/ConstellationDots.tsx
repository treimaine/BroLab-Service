/**
 * ConstellationDots - ELECTRI-X style decorative constellation
 * 
 * Creates a decorative constellation pattern with connected dots.
 * Used as a subtle accent in hero sections.
 */

interface ConstellationDotsProps {
  /** Additional CSS classes */
  className?: string
}

export function ConstellationDots({ className = '' }: Readonly<ConstellationDotsProps>) {
  const dots = [
    { id: 'dot-top-left', x: 20, y: 15, size: 3, opacity: 0.6 },
    { id: 'dot-top-right', x: 80, y: 25, size: 2, opacity: 0.68 },
    { id: 'dot-center', x: 45, y: 60, size: 4, opacity: 0.76 },
    { id: 'dot-mid-right', x: 90, y: 70, size: 2, opacity: 0.84 },
    { id: 'dot-bottom-left', x: 30, y: 85, size: 3, opacity: 0.92 },
  ]
  
  return (
    <div 
      className={`absolute pointer-events-none ${className}`}
      aria-hidden="true"
    >
      <svg viewBox="0 0 100 100" className="w-full h-full" fill="none">
        {/* Dots */}
        {dots.map((dot) => (
          <circle
            key={dot.id}
            cx={dot.x}
            cy={dot.y}
            r={dot.size}
            fill="rgb(var(--accent))"
            opacity={dot.opacity}
          />
        ))}
        
        {/* Connecting lines */}
        <path
          d="M20 15 L45 60 M45 60 L80 25 M45 60 L30 85 M45 60 L90 70"
          stroke="rgb(var(--accent))"
          strokeWidth="0.5"
          opacity="0.3"
        />
      </svg>
    </div>
  )
}

ConstellationDots.displayName = 'ConstellationDots'
