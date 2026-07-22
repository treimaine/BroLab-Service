import React from 'react'

interface StatsItem {
  stat: string | number
  label: string
  highlight?: boolean
}

interface StatsBannerProps {
  title?: string
  subtitle?: string
  stats: StatsItem[]
  variant?: 'prominent' | 'subtle'
  className?: string
}

/**
 * StatsBanner Component
 *
 * Displays creator trust signals and platform stats
 * Used to build confidence in potential creators
 *
 * Features:
 * - Large, readable numbers
 * - Mobile responsive layout
 * - Optional highlight styling
 * - Customizable variant (prominent for hero, subtle for sidebars)
 */
export const StatsBanner: React.FC<StatsBannerProps> = ({
  title = 'Join Our Creator Community',
  subtitle,
  stats,
  variant = 'prominent',
  className = ''
}) => {
  const isProminent = variant === 'prominent'

  return (
    <section className={`w-full py-8 sm:py-12 px-4 sm:px-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-8 sm:mb-12">
        <h2 className={`font-black tracking-tight text-text ${
          isProminent ? 'text-3xl sm:text-4xl' : 'text-2xl sm:text-3xl'
        }`}>
          {title}
        </h2>
        {subtitle && (
          <p className="text-base sm:text-lg text-muted mt-2 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 max-w-4xl mx-auto">
        {stats.map((item, idx) => (
          <div
            key={idx}
            className={`rounded-xl p-4 sm:p-6 text-center transition-all ${
              item.highlight
                ? 'bg-gradient-to-br from-[rgb(var(--accent))]/20 to-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/30'
                : 'bg-[rgb(var(--bg-2)/0.45)] border border-border'
            }`}
          >
            {/* Number */}
            <div className={`font-black tracking-tight text-text mb-1 ${
              isProminent ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
            }`}>
              {item.stat}
            </div>

            {/* Label */}
            <p className="text-xs sm:text-sm text-muted font-medium">
              {item.label}
            </p>
          </div>
        ))}
      </div>
    </section>
  )
}

// Default export
export default StatsBanner
