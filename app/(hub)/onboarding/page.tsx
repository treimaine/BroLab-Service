import { OnboardingClient } from '@/components/hub/OnboardingClient'

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
export default function OnboardingPage() {
  return <OnboardingClient />
}
