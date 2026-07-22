'use client'

import { DribbbleCard, DribbbleSectionEnter, PillCTA } from '@/platform/ui'
import Link from 'next/link'
import { useId, useState } from 'react'

/**
 * CommissionCalculator - Section "What a commission actually costs you"
 *
 * Replaces the old CreatorStatsCounter, which dressed three product features
 * ("0%", "Your Stripe", "Automatic PDF") up as if they were usage metrics.
 *
 * The 0%-commission claim is BroLab's primary differentiator and was never
 * quantified anywhere on the page. This puts a number on it.
 *
 * The commission rate is chosen by the visitor rather than asserted about a
 * named competitor: marketplace rates change and vary by plan and deal type,
 * so stating one as fact would be a claim we cannot stand behind.
 */

/** PRO billed monthly — the conservative comparison. Annual billing is cheaper. */
const BROLAB_PRO_MONTHLY = 29.99
const BROLAB_PRO_ANNUAL_TOTAL = 107.99

const COMMISSION_RATES = [10, 15, 20, 30] as const

const formatUsd = (value: number) =>
  value.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

export function CommissionCalculator() {
  const [monthlySales, setMonthlySales] = useState(2000)
  const [rate, setRate] = useState<number>(15)
  const salesInputId = useId()

  const annualSales = monthlySales * 12
  const commissionLost = annualSales * (rate / 100)
  const brolabCost = BROLAB_PRO_MONTHLY * 12
  const difference = commissionLost - brolabCost

  return (
    <section className="px-4 py-16 lg:py-20 bg-[rgb(var(--bg-2))]" aria-labelledby="calculator-heading">
      <div className="container mx-auto max-w-5xl">
        <DribbbleSectionEnter>
          <div className="text-center mb-10">
            <p className="text-xs font-bold text-accent uppercase tracking-widest mb-3">
              What commission really costs
            </p>
            <h2 id="calculator-heading" className="text-2xl md:text-3xl font-bold text-text mb-3">
              Move the slider. See what you&apos;re giving away.
            </h2>
            <p className="text-muted text-sm max-w-xl mx-auto">
              Most beat marketplaces take a cut of every sale, forever. BroLab charges a
              flat subscription and takes nothing from your sales.
            </p>
          </div>
        </DribbbleSectionEnter>

        <DribbbleSectionEnter>
          <DribbbleCard padding="lg" hoverLift={false}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">

              {/* Inputs */}
              <div className="space-y-8">
                <div>
                  <label htmlFor={salesInputId} className="flex items-baseline justify-between mb-3">
                    <span className="text-sm font-medium text-text">Your monthly sales</span>
                    <span className="text-2xl font-black text-accent tabular-nums">
                      {formatUsd(monthlySales)}
                    </span>
                  </label>
                  <input
                    id={salesInputId}
                    type="range"
                    min={200}
                    max={20000}
                    step={100}
                    value={monthlySales}
                    onChange={(e) => setMonthlySales(Number(e.target.value))}
                    className="w-full h-2 rounded-full appearance-none cursor-pointer bg-[rgb(var(--text)/0.12)] accent-[rgb(var(--accent))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  />
                  <div className="flex justify-between text-[11px] text-muted mt-1.5">
                    <span>$200</span>
                    <span>$20,000</span>
                  </div>
                </div>

                <fieldset>
                  <legend className="text-sm font-medium text-text mb-3">
                    Their commission rate
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {COMMISSION_RATES.map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => setRate(option)}
                        aria-pressed={rate === option}
                        className={`px-4 py-2 rounded-full text-sm font-bold transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                          rate === option
                            ? 'bg-[rgb(var(--accent))] text-white'
                            : 'border border-border text-muted hover:text-text hover:border-accent/40'
                        }`}
                      >
                        {option}%
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-muted mt-2.5">
                    Marketplace rates vary by platform, plan and sale type — pick the one that matches yours.
                  </p>
                </fieldset>
              </div>

              {/* Results */}
              <div className="space-y-4">
                <div className="rounded-xl border border-border p-4">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">
                    Commission taken per year
                  </p>
                  <p className="text-3xl font-black text-text tabular-nums">
                    {formatUsd(commissionLost)}
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    on {formatUsd(annualSales)} of annual sales at {rate}%
                  </p>
                </div>

                <div className="rounded-xl border border-accent/40 bg-[rgb(var(--accent)/0.08)] p-4">
                  <p className="text-xs text-muted uppercase tracking-wide mb-1">
                    BroLab PRO per year
                  </p>
                  <p className="text-3xl font-black text-accent tabular-nums">
                    {formatUsd(brolabCost)}
                  </p>
                  <p className="text-[11px] text-muted mt-1">
                    flat — {formatUsd(BROLAB_PRO_ANNUAL_TOTAL)} if you pay annually
                  </p>
                </div>

                <div className="rounded-xl border border-border p-4">
                  {difference > 0 ? (
                    <>
                      <p className="text-xs text-muted uppercase tracking-wide mb-1">
                        You keep an extra
                      </p>
                      <p className="text-4xl font-black text-accent tabular-nums">
                        {formatUsd(difference)}
                      </p>
                      <p className="text-[11px] text-muted mt-1">every year, at this sales volume</p>
                    </>
                  ) : (
                    <>
                      <p className="text-xs text-muted uppercase tracking-wide mb-1">
                        At this volume
                      </p>
                      <p className="text-lg font-bold text-text">
                        A commission marketplace is still cheaper.
                      </p>
                      <p className="text-[11px] text-muted mt-1">
                        BroLab pays off once your sales pass roughly{' '}
                        {formatUsd(brolabCost / (rate / 100) / 12)}/month — and you own your
                        storefront either way.
                      </p>
                    </>
                  )}
                </div>

                <Link href="/pricing" className="block">
                  <PillCTA variant="primary" size="md" className="w-full justify-center">
                    See full pricing
                  </PillCTA>
                </Link>
              </div>
            </div>

            <p className="text-[11px] text-muted mt-8 pt-6 border-t border-border">
              Standard Stripe processing fees (about 2.9% + $0.30 per transaction) apply on
              any platform, including BroLab, and are not included above.
            </p>
          </DribbbleCard>
        </DribbbleSectionEnter>
      </div>
    </section>
  )
}
