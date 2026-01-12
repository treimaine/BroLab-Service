import { Award, Check, TrendingUp, Users, type LucideIcon } from 'lucide-react'

/**
 * MicroInfoModule - ELECTRI-X style info module with bullet list
 * 
 * Compact glass module with icon bullets.
 * Example: "Best Music Platform", "1000+ creators", "Award winning"
 */

interface InfoItem {
  text: string
  icon?: LucideIcon
}

interface MicroInfoModuleProps {
  /** List of info items */
  items: InfoItem[]
  /** Additional CSS classes */
  className?: string
}

// Default icons for items without custom icon
const defaultIcons = [Award, Users, TrendingUp, Check]

export function MicroInfoModule({ 
  items, 
  className = '' 
}: Readonly<MicroInfoModuleProps>) {
  return (
    <div
      className={`
        glass border border-[rgba(var(--border),0.3)]
        rounded-2xl px-5 py-4
        max-w-[280px]
        ${className}
      `}
    >
      <ul className="space-y-2.5">
        {items.map((item, index) => {
          const Icon = item.icon || defaultIcons[index % defaultIcons.length]
          return (
            <li
              key={item.text}
              className="flex items-center gap-3 text-sm"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                <Icon className="w-3 h-3 text-accent" />
              </span>
              <span className="text-muted">{item.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

MicroInfoModule.displayName = 'MicroInfoModule'
