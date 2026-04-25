'use client';

import { CreatorStatsCounter } from './CreatorStatsCounter';
import { TrustBadges } from './TrustBadges';
import { CreatorSuccessStories } from './CreatorSuccessStories';

/**
 * Phase 2A: Trust Signals & Social Proof
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
export function Phase2ASection() {
  return (
    <>
      <CreatorStatsCounter />
      <TrustBadges />
      <CreatorSuccessStories />
    </>
  );
}
