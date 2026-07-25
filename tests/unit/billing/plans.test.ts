import { describe, expect, it } from 'vitest'
import {
  CLERK_PLAN_IDS,
  PAID_PLAN_TRIAL_DAYS,
  PLAN_FEATURES,
  resolvePlanKeyFromClerkPlanId,
} from '../../../convex/platform/billing/plans'

describe('billing plan contract', () => {
  it.each([
    [CLERK_PLAN_IDS.development.basic, 'basic'],
    [CLERK_PLAN_IDS.development.pro, 'pro'],
    [CLERK_PLAN_IDS.production.basic, 'basic'],
    [CLERK_PLAN_IDS.production.pro, 'pro'],
  ] as const)('maps Clerk plan %s to %s', (planId, planKey) => {
    expect(resolvePlanKeyFromClerkPlanId(planId)).toBe(planKey)
  })

  it('grants a 30-day trial to paid plans', () => {
    expect(PAID_PLAN_TRIAL_DAYS).toBe(30)
  })

  it('differentiates BASIC and PRO promises', () => {
    expect(PLAN_FEATURES.basic.analyticsLevel).toBe('basic')
    expect(PLAN_FEATURES.basic.prioritySupport).toBe(false)
    expect(PLAN_FEATURES.pro.analyticsLevel).toBe('advanced')
    expect(PLAN_FEATURES.pro.prioritySupport).toBe(true)
  })
})
