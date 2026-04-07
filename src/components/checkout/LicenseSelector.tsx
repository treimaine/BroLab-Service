'use client'

import { DribbbleCard } from '@/platform/ui'
import { motion } from 'framer-motion'
import { Check, Info } from 'lucide-react'

export interface LicenseTier {
  id: string
  name: string
  price: number
  description: string
  features: string[]
  popular?: boolean
}

interface LicenseSelectorProps {
  tiers: LicenseTier[]
  selectedTierId: string | null
  onSelect: (tierId: string) => void
}

export function LicenseSelector({
  tiers,
  selectedTierId,
  onSelect,
}: Readonly<LicenseSelectorProps>) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-3 rounded-lg bg-accent/5 border border-accent/20">
        <Info className="w-4 h-4 text-accent shrink-0 mt-0.5" />
        <p className="text-xs text-muted">
          Select a license tier based on your distribution needs. All licenses include
          commercial rights and instant delivery.
        </p>
      </div>

      <div className="space-y-3">
        {tiers.map((tier) => {
          const isSelected = selectedTierId === tier.id

          return (
            <motion.div
              key={tier.id}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <DribbbleCard
                onClick={() => onSelect(tier.id)}
                className={`cursor-pointer transition-all p-5 relative overflow-hidden ${
                  isSelected
                    ? 'border-2 border-accent shadow-glow'
                    : 'border border-border hover:border-accent/50'
                } ${tier.popular ? 'shadow-glow-subtle' : ''}`}
              >
                {/* Popular Badge */}
                {tier.popular && (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-accent text-white">
                      Popular
                    </span>
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-bold">{tier.name}</h3>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-muted">{tier.description}</p>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-2xl font-bold text-accent">
                      ${tier.price}
                    </div>
                  </div>
                </div>

                {/* Features */}
                <ul className="space-y-1.5">
                  {tier.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2 text-xs text-muted"
                    >
                      <Check className="w-3.5 h-3.5 text-accent shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </DribbbleCard>
            </motion.div>
          )
        })}
      </div>

      {/* License Info Footer */}
      <div className="text-center pt-2">
        <button
          type="button"
          className="text-xs text-accent hover:underline"
        >
          Learn more about license types →
        </button>
      </div>
    </div>
  )
}

// Default license tiers (can be overridden by producer)
export const DEFAULT_LICENSE_TIERS: LicenseTier[] = [
  {
    id: 'basic',
    name: 'Basic License',
    price: 24.99,
    description: 'Perfect for non-profit or personal projects',
    features: [
      'MP3 format (320kbps)',
      'Non-profit use only',
      'Up to 5,000 streams',
      'No music videos',
      'Tagged version',
    ],
  },
  {
    id: 'premium',
    name: 'Premium License',
    price: 49.99,
    description: 'For serious artists ready to distribute',
    popular: true,
    features: [
      'WAV + MP3 formats',
      'Unlimited streams',
      'Up to 2 music videos',
      'Commercial use',
      'Untagged stems available',
      'Priority support',
    ],
  },
  {
    id: 'exclusive',
    name: 'Exclusive License',
    price: 499.99,
    description: 'Full ownership and exclusive rights',
    features: [
      'All file formats (WAV, MP3, stems)',
      'Unlimited distribution',
      'Unlimited music videos',
      'Commercial + broadcast rights',
      'Beat removed from marketplace',
      'Producer credit optional',
      'Negotiable terms',
    ],
  },
]
