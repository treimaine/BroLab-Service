/**
 * Billing Plans Configuration
 * 
 * This file defines the plan features and pricing for BroLab Entertainment.
 * It serves as the single source of truth for plan limits and entitlements.
 * 
 * Requirements:
 * - Requirement 3.2: BASIC plan limits (25 tracks, 1GB, 0 domains)
 * - Requirement 3.3: PRO plan limits (unlimited tracks, 50GB, 2 domains)
 */

// ============ Types ============

export interface PlanFeatures {
  /** Maximum number of published tracks (-1 = unlimited) */
  max_published_tracks: number
  /** Storage limit in GB */
  storage_gb: number
  /** Maximum number of custom domains */
  max_custom_domains: number
}

export type PlanKey = 'basic' | 'pro'

// ============ Constants ============

/**
 * Preview duration in seconds for all audio tracks
 * Used by the preview generation job worker
 */
export const PREVIEW_DURATION_SEC = 30

/**
 * Plan features configuration
 * Defines the limits and entitlements for each subscription plan
 */
export const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  basic: {
    max_published_tracks: 25,
    storage_gb: 1,
    max_custom_domains: 0,
  },
  pro: {
    max_published_tracks: -1, // unlimited
    storage_gb: 50,
    max_custom_domains: 2,
  },
} as const

/**
 * Pricing configuration (monthly and annual)
 * Annual pricing follows discount rules:
 * - BASIC: 50% off vs 12 months
 * - PRO: 70% off vs 12 months
 */
export const PRICING = {
  basic: { 
    monthly: 9.99, 
    annual: 59.99 
  },
  pro: { 
    monthly: 29.99, 
    annual: 107.99 
  },
} as const

// ============ Helper Functions ============

/**
 * Calculate annual savings percentage for a plan
 * @param plan - The plan key ('basic' or 'pro')
 * @returns The savings percentage (e.g., 50 for 50% off)
 */
export function getAnnualSavingsPercent(plan: PlanKey): number {
  const monthly = PRICING[plan].monthly * 12
  const annual = PRICING[plan].annual
  return Math.round((1 - annual / monthly) * 100)
}

/**
 * Get plan features for a given plan key
 * @param plan - The plan key ('basic' or 'pro')
 * @returns The plan features object
 */
export function getPlanFeatures(plan: PlanKey): PlanFeatures {
  return PLAN_FEATURES[plan]
}

/**
 * Check if a plan allows custom domains
 * @param plan - The plan key ('basic' or 'pro')
 * @returns True if custom domains are allowed
 */
export function allowsCustomDomains(plan: PlanKey): boolean {
  return PLAN_FEATURES[plan].max_custom_domains > 0
}

/**
 * Check if a plan has unlimited tracks
 * @param plan - The plan key ('basic' or 'pro')
 * @returns True if tracks are unlimited
 */
export function hasUnlimitedTracks(plan: PlanKey): boolean {
  return PLAN_FEATURES[plan].max_published_tracks === -1
}

/**
 * Get the maximum number of published tracks for a plan
 * @param plan - The plan key ('basic' or 'pro')
 * @returns The max tracks number, or Infinity if unlimited
 */
export function getMaxPublishedTracks(plan: PlanKey): number {
  const max = PLAN_FEATURES[plan].max_published_tracks
  return max === -1 ? Infinity : max
}

/**
 * Get storage limit in bytes for a plan
 * @param plan - The plan key ('basic' or 'pro')
 * @returns The storage limit in bytes
 */
export function getStorageLimitBytes(plan: PlanKey): number {
  return PLAN_FEATURES[plan].storage_gb * 1024 * 1024 * 1024 // GB to bytes
}
