export type CreatorRole = 'producer' | 'engineer' | 'artist'
export type OnboardingStep = 'role' | 'workspace' | 'plan' | 'stripe' | 'complete'

type WorkspaceSnapshot = {
  paymentsStatus: 'unconfigured' | 'pending' | 'active'
}

type SubscriptionSnapshot = {
  status: 'active' | 'inactive' | 'canceled'
} | null

export type OnboardingDestination =
  | { kind: 'step'; step: OnboardingStep }
  | { kind: 'redirect'; path: '/artist' | '/studio' }

/**
 * Resolve onboarding from persisted state instead of treating a Clerk role as
 * proof that onboarding is complete.
 */
export function resolveOnboardingDestination({
  role,
  hasUserProfile,
  workspace,
  subscription,
  requestedStep,
  isResumeIntent,
}: {
  role: string | undefined
  hasUserProfile: boolean
  workspace: WorkspaceSnapshot | null
  subscription: SubscriptionSnapshot
  requestedStep: string | null
  isResumeIntent: boolean
}): OnboardingDestination {
  if (role !== 'producer' && role !== 'engineer' && role !== 'artist') {
    return { kind: 'step', step: 'role' }
  }

  if (role === 'artist') {
    return hasUserProfile
      ? { kind: 'redirect', path: '/artist' }
      : { kind: 'step', step: 'role' }
  }

  // A provider cannot choose a plan or connect Stripe before a storefront
  // exists, even if a stale/deep recovery link requests a later step.
  if (!workspace) {
    return { kind: 'step', step: 'workspace' }
  }

  // Clerk returns here immediately after checkout. The Convex webhook may not
  // have synchronized yet, so this explicit transition is allowed to advance.
  if (isResumeIntent && requestedStep === 'stripe') {
    return { kind: 'step', step: 'stripe' }
  }

  if (!subscription || subscription.status !== 'active') {
    return { kind: 'step', step: 'plan' }
  }

  if (workspace.paymentsStatus !== 'active') {
    return { kind: 'step', step: 'stripe' }
  }

  return { kind: 'redirect', path: '/studio' }
}
