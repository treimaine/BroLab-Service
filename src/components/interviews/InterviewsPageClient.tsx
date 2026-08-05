'use client'

import { InterviewRequestForm } from '@/components/interviews/InterviewRequestForm'
import { Check, CreditCard, Rocket, Store } from 'lucide-react'

const outcomes = [
  {
    icon: Store,
    title: 'Storefront configured',
    description: 'Name, URL and the essential settings — without migrating your whole catalog.'
  },
  {
    icon: CreditCard,
    title: 'Stripe connected',
    description: 'Customer payments go directly to you. BroLab takes 0% commission.'
  },
  {
    icon: Rocket,
    title: 'First offer published',
    description: 'One beat or one audio service live and ready to share today.'
  }
]

export function InterviewsPageClient() {
  return (
    <main className="min-h-screen bg-bg px-4 py-14 text-text sm:px-8 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <section className="grid items-start gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <div className="pt-4">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-accent">
              Free concierge onboarding
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Publish your first offer with us in 15 minutes.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-muted">
              Bring one beat or one service. We help you configure the storefront,
              connect Stripe and get that first offer ready to sell. You leave with
              a concrete result, not another product demo.
            </p>

            <div className="mt-8 space-y-4">
              {outcomes.map(({ icon: Icon, title, description }) => (
                <div key={title} className="flex gap-4">
                  <div className="mt-0.5 rounded-xl bg-accent/15 p-2.5 text-accent">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="font-bold">{title}</h2>
                    <p className="mt-1 text-sm leading-6 text-muted">
                      {description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 rounded-2xl border border-border bg-surface p-5">
              <p className="font-semibold">What to have ready</p>
              <ul className="mt-3 space-y-2 text-sm text-muted">
                {[
                  'One beat file or one service package you already sell',
                  'A Stripe account, or the information needed to create one',
                  'Your current price and basic terms'
                ].map((item) => (
                  <li key={item} className="flex gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <InterviewRequestForm />
        </section>

        <section className="mx-auto mt-16 max-w-3xl border-t border-border pt-10">
          <h2 className="text-2xl font-bold">A small, hands-on early-access cohort</h2>
          <p className="mt-3 leading-7 text-muted">
            We are opening this to producers and audio engineers while we refine
            BroLab’s onboarding. The setup is free; the BroLab plan still includes
            its normal one-month free trial. We will never ask for passwords or
            take control of your Stripe account.
          </p>
        </section>
      </div>
    </main>
  )
}
