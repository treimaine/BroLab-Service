import { OnboardingClient } from '@/components/hub/OnboardingClient'
import { CheckCircle2 } from 'lucide-react'
import type { ReactNode } from 'react'

/**
 * What the creator gets once onboarding completes.
 *
 * This replaced a "Success Stories / Real creators, real earnings" panel that
 * listed three invented producers with invented earnings figures ($5,400+,
 * $3,200+, $8,100+). BroLab has no customers yet — the orders table is empty —
 * so those endorsements were fabricated. Presenting invented testimonials as
 * real is both a credibility risk and, in most jurisdictions, unlawful.
 *
 * Restore social proof here only with quotes from real, consenting creators.
 */
const SETUP_CHECKLIST = [
  {
    title: 'Your storefront goes live immediately',
    detail: 'No review queue, no approval step. Pick a subdomain and it works.',
  },
  {
    title: 'Payouts land in your own Stripe account',
    detail: 'BroLab is never in the middle of the transaction and takes 0% of your sales.',
  },
  {
    title: 'Licenses are issued for you',
    detail: 'Every sale generates a PDF license with the terms snapshotted at purchase.',
  },
  {
    title: 'Nothing is locked in',
    detail: 'Your audio and your customer list stay yours. Cancel and keep them.',
  },
]

/**
 * Onboarding Page
 *
 * Requirements: 2.2, 4.1, 4.2, Req 2
 *
 * Flow:
 * 1. Role selection (producer, engineer, artist)
 * 2. For providers: workspace creation (slug, name, type)
 * 3. Store role in user.unsafeMetadata.role
 * 4. Sync to Convex users table
 * 5. Redirect: providers → /studio, artists → /artist
 *
 * NO subscription step (Clerk Billing comes later)
 * NO Stripe Connect step (comes in Phase 9)
 */
export default function OnboardingPage(): ReactNode {
  return (
    <div className="min-h-screen bg-bg">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto px-4 py-8">
        {/* Left: Onboarding Flow */}
        <div className="order-2 lg:order-1">
          <OnboardingClient />
        </div>

        {/* Right: What happens next (hidden on mobile) */}
        <aside className="hidden lg:block order-1 lg:order-2 pt-16">
          <h2 className="text-lg font-bold text-text mb-1">What happens next</h2>
          <p className="text-sm text-muted mb-6">
            Setup takes about five minutes.
          </p>

          <ul className="space-y-4">
            {SETUP_CHECKLIST.map((item) => (
              <li key={item.title} className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-accent shrink-0 mt-0.5" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-text">{item.title}</p>
                  <p className="text-sm text-muted leading-relaxed mt-0.5">{item.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}
