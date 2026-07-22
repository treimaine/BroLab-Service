'use client'

import { DribbbleCard, DribbbleSectionEnter, DribbbleStaggerItem } from '@/platform/ui'

const facts = [
  { id: 'commission', label: 'BroLab platform commission', value: '0%' },
  { id: 'payouts', label: 'Payout destination', value: 'Your Stripe' },
  { id: 'licenses', label: 'License delivery', value: 'Automatic PDF' },
]

export function CreatorStatsCounter() {
  return (
    <section className="px-4 py-10 bg-[rgb(var(--bg))]" aria-label="BroLab product facts">
      <div className="container mx-auto max-w-6xl">
        <DribbbleSectionEnter stagger>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {facts.map((fact) => (
              <DribbbleStaggerItem key={fact.id}>
                <DribbbleCard padding="md" hoverLift className="text-center h-full">
                  <p className="text-2xl md:text-3xl font-black text-accent mb-1">{fact.value}</p>
                  <p className="text-xs text-muted uppercase tracking-wide">{fact.label}</p>
                </DribbbleCard>
              </DribbbleStaggerItem>
            ))}
          </div>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}
