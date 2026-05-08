'use client'

import { CreatorStatsCounter } from './CreatorStatsCounter'
import { CreatorStories, MOCK_CREATOR_STORIES } from './CreatorStory'
import { TrustSection } from './TrustBadges'

/**
 * SocialProofSection (formerly Phase2ASection)
 *
 * Composite component integrating three trust-building sections:
 * 1. Creator Stats Counter (homepage hero) - builds confidence through scale
 * 2. Trust Badges (security/compliance) - reduces payment friction
 * 3. Creator Success Stories (social proof) - authentic testimonials
 *
 * All components feature:
 * - Fully responsive design (mobile, tablet, desktop)
 * - WCAG AA accessibility compliance
 * - GPU-accelerated animations
 * - Semantic HTML with ARIA labels
 * - Performance optimized (lazy loading via Intersection Observer)
 */
export function SocialProofSection() {
  return (
    <>
      <CreatorStatsCounter />
      <TrustSection />
      <CreatorStories stories={MOCK_CREATOR_STORIES} />
    </>
  )
}

// Backward compatibility alias
export { SocialProofSection as Phase2ASection }
