import { Award, Check, TrendingUp, Users, type LucideIcon } from 'lucide-react'

/**
 * ConstellationInfo - ELECTRI-X style info module with connected dots
 * 
 * Like MicroInfoModule but with constellation-style connecting lines.
 */

interface InfoItem {
  text: string
  icon?: LucideIcon
}

interface ConstellationInfoProps {
  items: InfoItem[]
  className?: string
}

const defaultIcons = [Award, Users, TrendingUp, Check]

export function ConstellationInfo({ 
  items, 
  className = '' 
}: Readonly<ConstellationInfoProps>) {
  return (
    <div className={`relative ${className}`}>
      {/* Connecting lines SVG */}
      <svg 
        className="absolute left-0 top-0 w-full h-full pointer-events-none"
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
      >
        {/* Horizontal line */}
        <line 
          x1="0" y1="100" x2="40" y2="100" 
          stroke="rgb(var(--accent))" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          opacity="0.6"
        />
        {/* Vertical connecting lines between items */}
        <line 
          x1="50" y1="30" x2="50" y2="170" 
          stroke="rgb(var(--accent))" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          opacity="0.4"
        />
        {/* Dots at intersections */}
        <circle cx="50" cy="30" r="3" fill="rgb(var(--accent))" />
        <circle cx="50" cy="70" r="3" fill="rgb(var(--accent))" />
        <circle cx="50" cy="110" r="3" fill="rgb(var(--accent))" />
        <circle cx="50" cy="150" r="3" fill="rgb(var(--accent))" />
      </svg>
      
      {/* Info items */}
      <ul className="space-y-4 pl-16 relative z-10">
        {items.map((item, index) => {
          const Icon = item.icon || defaultIcons[index % defaultIcons.length]
          return (
            <li key={item.text} className="flex items-center gap-3 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                <Icon className="w-3 h-3 text-accent" />
              </span>
              <span className="text-muted text-xs">{item.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

ConstellationInfo.displayName = 'ConstellationInfo'
