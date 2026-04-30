import React from 'react'

interface ServicePromoProps {
  title?: string
  description?: string
  features?: string[]
  ctaText?: string
  ctaHref?: string
  variant?: 'prominent' | 'sidebar'
  className?: string
}

/**
 * ServicePromoSection Component
 *
 * Highlights service booking and multi-product features
 * Encourages creators to offer more than just beats
 *
 * Features:
 * - Service offerings highlight
 * - Revenue opportunity showcase
 * - Clear call-to-action
 * - Mobile responsive
 * - Prominent or subtle variants
 */
export const ServicePromoSection: React.FC<ServicePromoProps> = ({
  title = 'Offer More Than Beats',
  description = 'Expand your revenue with production services and consultations',
  features = [
    'Beat licensing & sales',
    'Mixing & mastering services',
    'Music production consulting',
    'Sound design & composition'
  ],
  ctaText = 'Start Offering Services',
  ctaHref = '#service-setup',
  variant = 'prominent',
  className = ''
}) => {
  const isProminent = variant === 'prominent'

  return (
    <section className={`w-full ${className}`}>
      <div
        className={`rounded-2xl border border-border transition-all ${
          isProminent
            ? 'bg-gradient-to-br from-[rgb(var(--accent))]/20 to-[rgb(var(--accent))]/5 border-[rgb(var(--accent))]/30 p-8 sm:p-12'
            : 'bg-[rgba(var(--bg-2),0.45)] border-border p-6 sm:p-8'
        }`}
      >
        {/* Content */}
        <div className={`max-w-2xl ${isProminent ? '' : ''}`}>
          {/* Title */}
          <h3 className={`font-black tracking-tight text-text mb-3 ${
            isProminent ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl'
          }`}>
            {title}
          </h3>

          {/* Description */}
          <p className="text-base text-muted mb-6">
            {description}
          </p>

          {/* Features List */}
          {features.length > 0 && (
            <ul className="space-y-3 mb-8">
              {features.map((feature, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  {/* Checkmark */}
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[rgb(var(--accent))]/20 flex items-center justify-center mt-0.5">
                    <svg
                      className="w-3 h-3 text-[rgb(var(--accent))]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>

                  {/* Feature Text */}
                  <span className="text-sm text-text font-medium">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {/* CTA Button */}
          <a
            href={ctaHref}
            className={`inline-block px-6 sm:px-8 py-3 rounded-lg font-semibold transition-all ${
              isProminent
                ? 'bg-[rgb(var(--accent))] text-black hover:bg-[rgb(var(--accent))]/90 shadow-lg hover:shadow-xl'
                : 'bg-[rgba(var(--accent),0.1)] text-[rgb(var(--accent))] hover:bg-[rgba(var(--accent),0.2)]'
            }`}
          >
            {ctaText} →
          </a>
        </div>
      </div>
    </section>
  )
}

/**
 * ServicePromoRow Component
 *
 * Compact version of service promo for sidebars or grid layouts
 */
interface ServicePromoRowProps {
  items?: Array<{
    icon: React.ReactNode
    title: string
    description: string
  }>
  className?: string
}

export const ServicePromoRow: React.FC<ServicePromoRowProps> = ({
  items = [
    {
      icon: '🎵',
      title: 'Beat Licensing',
      description: 'Sell unlimited licenses'
    },
    {
      icon: '🎚️',
      title: 'Production Services',
      description: 'Mixing, mastering & consulting'
    },
    {
      icon: '💰',
      title: 'Higher Revenue',
      description: 'Diversify your income streams'
    }
  ],
  className = ''
}) => {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 ${className}`}>
      {items.map((item, idx) => (
        <div
          key={idx}
          className="rounded-lg p-4 bg-[rgba(var(--bg-2),0.45)] border border-border hover:border-[rgb(var(--accent))]/30 transition-all"
        >
          <div className="text-2xl mb-2">{item.icon}</div>
          <h4 className="font-bold text-text text-sm mb-1">
            {item.title}
          </h4>
          <p className="text-xs text-muted">
            {item.description}
          </p>
        </div>
      ))}
    </div>
  )
}

export default ServicePromoSection
