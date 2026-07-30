'use client'

import { DribbbleCard } from '@/platform/ui'
import { formatCap, getLicenseTerms, getTypicalPriceUsd } from '@/shared/licenses'
import { motion } from 'framer-motion'
import { Check, Info } from 'lucide-react'
import Link from 'next/link'

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
          commercial rights, immediate audio delivery, and an automatically generated PDF.
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
              <button
                type="button"
                onClick={() => onSelect(tier.id)}
                aria-pressed={isSelected}
                aria-label={`Select ${tier.name} for $${tier.price}`}
                className="block w-full rounded-xl text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
              <DribbbleCard
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
              </button>
            </motion.div>
          )
        })}
      </div>

      {/* License Info Footer */}
      <div className="text-center pt-2">
        <Link
          href="/terms#licensing"
          className="text-xs text-accent hover:underline"
        >
          Learn more about license types →
        </Link>
      </div>
    </div>
  )
}

// Contract-backed fallback tiers. Track-specific prices override these values.
export const DEFAULT_LICENSE_TIERS: LicenseTier[] = [
  {
    id: 'basic',
    name: 'Basic License',
    price: getTypicalPriceUsd('basic'),
    description: 'Commercial release with defined usage limits',
    features: [
      'MP3 + WAV files',
      `Up to ${formatCap(getLicenseTerms('basic').rights.audioStreamingCap)} streams`,
      '1 music video and 10 live performances',
      'Commercial use included',
      'Stems and sync rights not included',
    ],
  },
  {
    id: 'premium',
    name: 'Premium License',
    price: getTypicalPriceUsd('premium'),
    description: 'For serious artists ready to distribute',
    popular: true,
    features: [
      'WAV + MP3 formats',
      `Up to ${formatCap(getLicenseTerms('premium').rights.audioStreamingCap)} streams`,
      'Up to 2 music videos',
      'Commercial use',
      'Up to 10 radio broadcasts',
      'Stems and sync rights not included',
    ],
  },
  {
    id: 'unlimited',
    name: 'Unlimited License',
    price: getTypicalPriceUsd('unlimited'),
    description: 'Maximum non-exclusive rights and all deliverables',
    features: [
      'WAV + MP3 + stems',
      'Unlimited audio streams',
      'Unlimited music videos',
      'Unlimited live and radio use',
      'Sync rights included',
      'Producer credit remains required',
    ],
  },
]
