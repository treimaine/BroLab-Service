export type PlanKey = 'basic' | 'pro'

export interface PublicPlanInfo {
  slug: PlanKey
  name: string
  features: {
    maxPublishedTracks: number
    storageGb: number
    maxCustomDomains: number
    analyticsLevel: 'basic' | 'advanced'
    prioritySupport: boolean
  }
  pricing: {
    monthly: number
    annual: number
  }
  annualSavings: number
  trialDays: number
}

/**
 * Clerk plan ids are environment-specific. This shared module is safe to use
 * from both Convex functions and browser components.
 */
export const CLERK_PLAN_IDS = {
  development: {
    basic: 'cplan_38iViM4J5NFfkICiV6aY5jbWiqZ',
    pro: 'cplan_38iVwx1p1mXD9pObGXuRaZVRn0V',
  },
  production: {
    basic: 'cplan_3Ca0BuvMsMWAkdo9UZwXi6P2r5B',
    pro: 'cplan_3Ca0IiYfDoEuF7WvHdGBblhcCbB',
  },
} as const satisfies Record<
  'development' | 'production',
  Record<PlanKey, string>
>
