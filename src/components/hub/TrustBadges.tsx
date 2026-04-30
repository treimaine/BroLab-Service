import React from 'react'

export interface Badge {
  id: string
  label: string
  icon: React.ReactNode
  description?: string
}

interface TrustBadgesProps {
  badges: Badge[]
  layout?: 'row' | 'grid'
  size?: 'sm' | 'md'
  className?: string
}

/**
 * TrustBadges Component
 *
 * Displays security and trust verification badges
 * Reassures users about payment safety and data protection
 *
 * Features:
 * - Security/compliance badge icons
 * - Payment processor verification
 * - HTTPS/SSL indicators
 * - Responsive layout
 * - Subtle, professional styling
 */
export const TrustBadges: React.FC<TrustBadgesProps> = ({
  badges,
  layout = 'row',
  size = 'md',
  className = ''
}) => {
  const isSm = size === 'sm'
  const isGrid = layout === 'grid'

  return (
    <div
      className={`flex ${
        isGrid ? 'flex-wrap' : 'flex-wrap sm:flex-nowrap'
      } gap-3 sm:gap-6 items-center justify-center ${className}`}
    >
      {badges.map((badge) => (
        <div
          key={badge.id}
          className={`flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity ${
            isSm ? '' : ''
          }`}
          title={badge.description}
        >
          {/* Icon */}
          <div className={`flex-shrink-0 text-muted ${
            isSm ? 'w-4 h-4' : 'w-5 h-5'
          }`}>
            {badge.icon}
          </div>

          {/* Label */}
          <span className={`text-muted ${
            isSm ? 'text-xs' : 'text-sm'
          } font-medium`}>
            {badge.label}
          </span>
        </div>
      ))}
    </div>
  )
}

// Default trust badges for checkout/footer
export const DEFAULT_TRUST_BADGES: Badge[] = [
  {
    id: 'ssl',
    label: '🔒 SSL Encrypted',
    icon: '🔐',
    description: 'Secure HTTPS connection'
  },
  {
    id: 'stripe',
    label: '💳 Stripe Verified',
    icon: '✓',
    description: 'Payment processing by Stripe'
  },
  {
    id: 'secure-checkout',
    label: '🛡️ Secure Checkout',
    icon: '🛡️',
    description: 'PCI DSS compliant'
  }
]

interface TrustFooterProps {
  className?: string
}

/**
 * TrustFooter Component
 *
 * Display trust badges in footer context
 * Minimal, subtle design suitable for page footers
 */
export const TrustFooter: React.FC<TrustFooterProps> = ({ className = '' }) => {
  return (
    <div className={`w-full py-6 px-4 border-t border-border ${className}`}>
      <TrustBadges
        badges={DEFAULT_TRUST_BADGES}
        size="sm"
        layout="row"
      />
    </div>
  )
}

export default TrustBadges
