'use client'

import { DribbbleCard, DribbbleSectionEnter, DribbbleStaggerItem } from '@/platform/ui'
import { CheckCircle, CreditCard, Eye, Lock, MessageCircle, Shield, type LucideIcon } from 'lucide-react'
import { useState } from 'react'

// ============================================================================
// TYPES
// ============================================================================

export interface Badge {
  id: string
  label?: string
  icon: LucideIcon
  description?: string
  category?: 'payment' | 'compliance' | 'support'
  title?: string
}

interface TrustBadgesProps {
  badges: Badge[]
  layout?: 'row' | 'grid'
  size?: 'sm' | 'md'
  variant?: 'simple' | 'enhanced'
  className?: string
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get category-specific styles using CSS variables
 */
const getCategoryStyles = (category?: Badge['category']) => {
  switch (category) {
    case 'payment':
      return {
        border: 'border-accent/30 hover:border-accent/60',
        bg: 'bg-linear-to-br from-accent/10 to-transparent',
        shadow: 'hover:shadow-lg hover:shadow-[rgba(var(--accent),0.3)]',
        text: 'text-accent'
      }
    case 'compliance':
      return {
        border: 'border-accent-2/30 hover:border-accent-2/60',
        bg: 'bg-linear-to-br from-accent-2/10 to-transparent',
        shadow: 'hover:shadow-lg hover:shadow-[rgba(var(--accent-2),0.3)]',
        text: 'text-accent-2'
      }
    case 'support':
    default:
      return {
        border: 'border-[rgba(var(--border),0.6)] hover:border-accent/60',
        bg: 'bg-linear-to-br from-[rgba(var(--card),0.4)] to-transparent',
        shadow: 'hover:shadow-lg hover:shadow-[rgba(var(--accent),0.2)]',
        text: 'text-accent'
      }
  }
}

// ============================================================================
// DEFAULT BADGES
// ============================================================================

/**
 * Simple trust badges for checkout/footer
 * Uses Lucide icons (design system compliant)
 */
export const DEFAULT_TRUST_BADGES: Badge[] = [
  {
    id: 'ssl',
    label: 'SSL Encrypted',
    icon: Lock,
    description: 'Secure HTTPS connection'
  },
  {
    id: 'stripe',
    label: 'Stripe Verified',
    icon: CheckCircle,
    description: 'Payment processing by Stripe'
  },
  {
    id: 'secure-checkout',
    label: 'Secure Checkout',
    icon: Shield,
    description: 'PCI DSS compliant'
  }
]

/**
 * Enhanced trust badges with categories and Lucide icons
 */
export const ENHANCED_TRUST_BADGES: Badge[] = [
  {
    id: 'stripe',
    category: 'payment',
    icon: CreditCard,
    title: 'Stripe Certified',
    description: 'Industry-leading payment processing',
  },
  {
    id: 'ssl',
    category: 'payment',
    icon: Shield,
    title: 'SSL Encrypted',
    description: 'Secure data transmission',
  },
  {
    id: 'gdpr',
    category: 'compliance',
    icon: CheckCircle,
    title: 'GDPR Compliant',
    description: 'Your data is protected',
  },
  {
    id: 'privacy',
    category: 'compliance',
    icon: Eye,
    title: 'Data Privacy',
    description: 'Your information stays private',
  },
  {
    id: 'support',
    category: 'support',
    icon: MessageCircle,
    title: '24/7 Support',
    description: "We're always here to help",
  },
]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * TrustBadges Component
 *
 * Displays security and trust verification badges
 * Reassures users about payment safety and data protection
 *
 * Features:
 * - Two variants: simple (minimal) and enhanced (Dribbble design system)
 * - Lucide icons (no emojis)
 * - CSS variables for theming
 * - Dribbble components (DribbbleCard, animations)
 * - Responsive layout
 */
export const TrustBadges: React.FC<TrustBadgesProps> = ({
  badges,
  layout = 'row',
  size = 'md',
  variant = 'simple',
  className = ''
}) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const isSm = size === 'sm'
  const isGrid = layout === 'grid'
  const isEnhanced = variant === 'enhanced'

  // Simple variant (minimal design for footer/checkout)
  if (!isEnhanced) {
    return (
      <div
        className={`flex ${
          isGrid ? 'flex-wrap' : 'flex-wrap sm:flex-nowrap'
        } gap-3 sm:gap-6 items-center justify-center ${className}`}
      >
        {badges.map((badge) => {
          const Icon = badge.icon
          return (
            <div
              key={badge.id}
              className="flex items-center gap-2 opacity-75 hover:opacity-100 transition-opacity"
              title={badge.description}
            >
              {/* Icon */}
              <Icon className={`shrink-0 text-muted ${isSm ? 'w-4 h-4' : 'w-5 h-5'}`} />

              {/* Label */}
              <span className={`text-muted ${isSm ? 'text-xs' : 'text-sm'} font-medium`}>
                {badge.label || badge.title}
              </span>
            </div>
          )
        })}
      </div>
    )
  }

  // Enhanced variant (Dribbble design system)
  return (
    <DribbbleSectionEnter stagger>
      <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-6 ${className}`}>
        {badges.map((badge) => {
          const styles = getCategoryStyles(badge.category)
          const Icon = badge.icon
          
          return (
            <DribbbleStaggerItem key={badge.id}>
              <DribbbleCard
                hoverLift
                glow={badge.category === 'payment'}
                padding="lg"
                className="h-full"
              >
                <button
                  onMouseEnter={() => setHoveredId(badge.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  className="w-full h-full"
                  aria-label={`${badge.title || badge.label}: ${badge.description}`}
                >
                  <div className="flex flex-col items-center gap-3">
                    {/* Icon */}
                    <div className={`transition-all duration-300 ${styles.text}`}>
                      <Icon className="w-8 h-8 md:w-10 md:h-10" />
                    </div>

                    {/* Title */}
                    <h3 className="font-semibold text-text text-sm md:text-base text-center">
                      {badge.title || badge.label}
                    </h3>

                    {/* Description (visible on hover) */}
                    <p
                      className={`text-xs md:text-sm text-muted text-center transition-all duration-300 ${
                        hoveredId === badge.id
                          ? 'opacity-100'
                          : 'opacity-0 hidden md:block'
                      }`}
                    >
                      {badge.description}
                    </p>
                  </div>
                </button>
              </DribbbleCard>
            </DribbbleStaggerItem>
          )
        })}
      </div>
    </DribbbleSectionEnter>
  )
}

// ============================================================================
// SECTION COMPONENTS
// ============================================================================

interface TrustFooterProps {
  readonly className?: string
}

/**
 * TrustFooter Component
 *
 * Display trust badges in footer context
 * Minimal, subtle design suitable for page footers
 */
export const TrustFooter: React.FC<TrustFooterProps> = ({ className = '' }) => {
  return (
    <div className={`w-full py-6 px-4 border-t border-[rgba(var(--border),0.3)] ${className}`}>
      <TrustBadges
        badges={DEFAULT_TRUST_BADGES}
        size="sm"
        layout="row"
        variant="simple"
      />
    </div>
  )
}

interface TrustSectionProps {
  readonly title?: string
  readonly subtitle?: string
  readonly className?: string
}

/**
 * TrustSection Component
 *
 * Full section with enhanced trust badges
 * Includes heading, badges grid, and trust message
 * Uses Dribbble design system
 */
export const TrustSection: React.FC<TrustSectionProps> = ({
  title = 'Your Trust Matters',
  subtitle = 'Built with the highest security and compliance standards',
  className = ''
}) => {
  return (
    <section
      className={`py-12 md:py-16 lg:py-20 px-4 md:px-8 bg-[rgb(var(--bg))] ${className}`}
      aria-label="Trust and security badges"
    >
      <div className="max-w-6xl mx-auto">
        {/* Heading */}
        <div className="text-center mb-10 md:mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-text mb-3 md:mb-4">
            {title}
          </h2>
          <p className="text-muted text-base md:text-lg">
            {subtitle}
          </p>
        </div>

        {/* Badges Grid */}
        <TrustBadges
          badges={ENHANCED_TRUST_BADGES}
          variant="enhanced"
        />

        {/* Trust Message */}
        <div className="mt-12 md:mt-16">
          <DribbbleCard glow padding="lg" className="text-center">
            <p className="text-text text-base md:text-lg">
              <span className="text-accent font-semibold">✓ Verified & Secure</span>
              {' '}— All transactions are protected with industry-leading encryption and compliance standards.
            </p>
          </DribbbleCard>
        </div>
      </div>
    </section>
  )
}

export default TrustBadges
