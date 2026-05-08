'use client'

import { CreatorStatsCounter } from './CreatorStatsCounter'
import { CreatorStories, MOCK_CREATOR_STORIES } from './CreatorStory'
import { TrustSection } from './TrustBadges'

export function SocialProofSection() {
  return (
    <>
      <CreatorStatsCounter />
      <TrustSection />
      <CreatorStories stories={MOCK_CREATOR_STORIES} />
    </>
  )
}

export { SocialProofSection as Phase2ASection }

