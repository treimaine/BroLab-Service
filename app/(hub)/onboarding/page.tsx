import { OnboardingClient } from '@/components/hub/OnboardingClient'
import { CreatorStories } from '@/components/hub'
import type { ReactNode } from 'react'

// Sample creator stories for onboarding motivation
const ONBOARDING_STORIES = [
  {
    id: '1',
    name: 'Marcus J.',
    niche: 'Hip-Hop Producer',
    earnings: '$5,400+ in sales',
    quote: 'Sold my first beat in 2 days. BroLab made it super easy to set up and start earning.',
    profileUrl: '#'
  },
  {
    id: '2',
    name: 'Alex Chen',
    niche: 'Beat Producer',
    earnings: '$3,200+ in first month',
    quote: 'Love that I keep 100% of revenue. No middleman, just direct to my bank account.',
    profileUrl: '#'
  },
  {
    id: '3',
    name: 'Jordan Blake',
    niche: 'Sound Designer',
    earnings: '$8,100+ from services',
    quote: 'Offering mixing services alongside beats tripled my monthly earnings.',
    profileUrl: '#'
  }
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
 *
 * CRO: Added creator success stories sidebar for trust building
 */
export default function OnboardingPage(): ReactNode {
  return (
    <div className="min-h-screen bg-bg">
      <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-start max-w-7xl mx-auto px-4 py-8">
        {/* Left: Onboarding Flow */}
        <div className="order-2 lg:order-1">
          <OnboardingClient />
        </div>

        {/* Right: Creator Success Stories (hidden on mobile) */}
        <aside className="hidden lg:block order-1 lg:order-2 pt-16">
          <CreatorStories
            stories={ONBOARDING_STORIES}
            title="Success Stories"
            subtitle="Real creators, real earnings"
            maxStories={3}
          />
        </aside>
      </div>
    </div>
  )
}
