'use client'

import { CheckoutButton } from '@clerk/nextjs/experimental'
import { Check, Sparkles } from 'lucide-react'
import { CLERK_PLAN_IDS } from '../../../shared/billing/plans'

type PaidPlan = 'basic' | 'pro'
type BillingPeriod = 'month' | 'annual'

const isProduction =
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY?.startsWith('pk_live_') ?? false

const planIds = isProduction
  ? CLERK_PLAN_IDS.production
  : CLERK_PLAN_IDS.development

const PLAN_COPY = {
  basic: {
    label: 'BASIC',
    monthly: '$9.99/month after trial',
    annual: '$60/year after trial',
    features: ['25 published tracks', '1 GB storage', 'Basic analytics'],
  },
  pro: {
    label: 'PRO',
    monthly: '$29.99/month after trial',
    annual: '$108/year after trial',
    features: ['Unlimited tracks', '50 GB + 2 domains', 'Advanced analytics + priority support'],
  },
} as const

export function PaidPlanCheckout({
  period = 'month',
  highlightedPlan = 'pro',
  redirectUrl,
  proOnly = false,
}: Readonly<{
  period?: BillingPeriod
  highlightedPlan?: PaidPlan
  redirectUrl: string
  proOnly?: boolean
}>) {
  const plans: PaidPlan[] = proOnly ? ['pro'] : ['basic', 'pro']

  return (
    <div className={`grid gap-4 ${proOnly ? 'grid-cols-1' : 'md:grid-cols-2'}`}>
      {plans.map((plan) => {
        const copy = PLAN_COPY[plan]
        const highlighted = plan === highlightedPlan

        return (
          <div
            key={plan}
            className={`relative rounded-2xl border p-5 ${
              highlighted
                ? 'border-[rgb(var(--accent))]/60 bg-[rgb(var(--accent))]/5'
                : 'border-border bg-[rgb(var(--bg-2)/0.45)]'
            }`}
          >
            {highlighted && (
              <span className="absolute right-4 top-4 inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-[rgb(var(--accent))]">
                <Sparkles className="h-3 w-3" /> Recommended
              </span>
            )}
            <p className="text-xl font-black">{copy.label}</p>
            <p className="mt-1 text-sm font-semibold text-[rgb(var(--accent))]">First month free</p>
            <p className="mt-1 text-xs text-muted">
              {period === 'annual' ? copy.annual : copy.monthly}
            </p>
            <ul className="my-5 space-y-2">
              {copy.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm text-muted">
                  <Check className="h-4 w-4 shrink-0 text-[rgb(var(--accent))]" />
                  {feature}
                </li>
              ))}
            </ul>
            <CheckoutButton
              planId={planIds[plan]}
              planPeriod={period}
              for="user"
              newSubscriptionRedirectUrl={redirectUrl}
            >
              <button
                type="button"
                className="w-full rounded-full bg-[rgb(var(--accent))] px-5 py-3 text-sm font-black text-[rgb(var(--bg))] transition-opacity hover:opacity-90"
              >
                Start {copy.label} free
              </button>
            </CheckoutButton>
          </div>
        )
      })}
    </div>
  )
}
