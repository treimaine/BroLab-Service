import { describe, expect, it } from 'vitest'
import { resolveOnboardingDestination } from '../../../src/lib/onboarding-state'

const activeWorkspace = { paymentsStatus: 'active' as const }
const unconfiguredWorkspace = { paymentsStatus: 'unconfigured' as const }
const activeSubscription = { status: 'active' as const }

describe('resolveOnboardingDestination', () => {
  it('starts users without a recognized role at role selection', () => {
    expect(resolveOnboardingDestination({
      role: undefined,
      hasUserProfile: false,
      workspace: null,
      subscription: null,
      requestedStep: null,
      isResumeIntent: false,
    })).toEqual({ kind: 'step', step: 'role' })
  })

  it('resumes a provider with a role but no workspace at storefront creation', () => {
    expect(resolveOnboardingDestination({
      role: 'producer',
      hasUserProfile: true,
      workspace: null,
      subscription: null,
      requestedStep: 'stripe',
      isResumeIntent: true,
    })).toEqual({ kind: 'step', step: 'workspace' })
  })

  it('resumes at plan selection when a workspace has no active subscription', () => {
    expect(resolveOnboardingDestination({
      role: 'engineer',
      hasUserProfile: true,
      workspace: unconfiguredWorkspace,
      subscription: null,
      requestedStep: null,
      isResumeIntent: false,
    })).toEqual({ kind: 'step', step: 'plan' })
  })

  it('honors the explicit post-checkout Stripe transition while sync catches up', () => {
    expect(resolveOnboardingDestination({
      role: 'producer',
      hasUserProfile: true,
      workspace: unconfiguredWorkspace,
      subscription: null,
      requestedStep: 'stripe',
      isResumeIntent: true,
    })).toEqual({ kind: 'step', step: 'stripe' })
  })

  it('resumes at Stripe after an active plan is present', () => {
    expect(resolveOnboardingDestination({
      role: 'producer',
      hasUserProfile: true,
      workspace: unconfiguredWorkspace,
      subscription: activeSubscription,
      requestedStep: null,
      isResumeIntent: true,
    })).toEqual({ kind: 'step', step: 'stripe' })
  })

  it('redirects fully onboarded providers and artists to their dashboards', () => {
    expect(resolveOnboardingDestination({
      role: 'producer',
      hasUserProfile: true,
      workspace: activeWorkspace,
      subscription: activeSubscription,
      requestedStep: null,
      isResumeIntent: false,
    })).toEqual({ kind: 'redirect', path: '/studio' })

    expect(resolveOnboardingDestination({
      role: 'artist',
      hasUserProfile: true,
      workspace: null,
      subscription: null,
      requestedStep: null,
      isResumeIntent: false,
    })).toEqual({ kind: 'redirect', path: '/artist' })
  })
})
