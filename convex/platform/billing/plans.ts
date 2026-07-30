/**
 * Billing Plans - Source of Truth
 * 
 * This file defines the canonical plan features and pricing for BroLab Entertainment.
 * All plan-related logic should reference these constants.
 * 
 * Requirements: 3.2, 3.3
 */

import { query } from "../../_generated/server";
import {
  CLERK_PLAN_IDS,
  type PlanKey,
  type PublicPlanInfo,
} from "../../../shared/billing/plans";

export { CLERK_PLAN_IDS };
export type { PlanKey, PublicPlanInfo };

// ============================================================================
// TYPES
// ============================================================================

/**
 * Plan feature limits and entitlements
 */
export interface PlanFeatures {
  /**
   * Maximum number of published tracks allowed
   * -1 = unlimited
   */
  maxPublishedTracks: number;
  
  /**
   * Storage limit in gigabytes
   */
  storageGb: number;
  
  /**
   * Maximum number of custom domains allowed
   */
  maxCustomDomains: number;

  /**
   * Reporting depth exposed in the provider dashboard
   */
  analyticsLevel: "basic" | "advanced";

  /**
   * Whether support requests are routed as priority
   */
  prioritySupport: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Preview duration for all tracks (in seconds)
 * Fixed at 30 seconds for MVP
 */
export const PREVIEW_DURATION_SEC = 30;
export const PAID_PLAN_TRIAL_DAYS = 30;

export function resolvePlanKeyFromClerkPlanId(planId?: string): PlanKey | null {
  if (!planId) return null;

  for (const environment of Object.values(CLERK_PLAN_IDS)) {
    if (environment.basic === planId) return "basic";
    if (environment.pro === planId) return "pro";
  }

  return null;
}

/**
 * Plan features configuration
 * This is the canonical source for plan limits and entitlements
 */
export const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  basic: {
    maxPublishedTracks: 25,
    storageGb: 1,
    maxCustomDomains: 0,
    analyticsLevel: "basic",
    prioritySupport: false,
  },
  pro: {
    maxPublishedTracks: -1, // unlimited
    storageGb: 50,
    maxCustomDomains: 2,
    analyticsLevel: "advanced",
    prioritySupport: true,
  },
};

/**
 * Pricing configuration (USD)
 * 
 * Annual pricing rules:
 * - BASIC: 50% OFF vs (monthly * 12)
 * - PRO: 70% OFF vs (monthly * 12)
 * 
 * Clerk stores annual pricing as a monthly equivalent, so annual totals are
 * exact multiples of 12.
 */
export const PRICING = {
  basic: {
    monthly: 9.99,   // USD per month
    annual: 60,      // USD per year (50% off vs 12 months)
  },
  pro: {
    monthly: 29.99,  // USD per month
    annual: 108,     // USD per year (70% off vs 12 months)
  },
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Calculate the annual savings percentage for a plan
 * 
 * @param plan - The plan key to calculate savings for
 * @returns The savings percentage (e.g., 50 for 50% off)
 */
export function getAnnualSavingsPercent(plan: PlanKey): number {
  const monthly = PRICING[plan].monthly * 12;
  const annual = PRICING[plan].annual;
  return Math.round((1 - annual / monthly) * 100);
}

/**
 * Check if a plan has a specific feature enabled
 * 
 * @param plan - The plan key to check
 * @param feature - The feature to check for
 * @returns True if the feature is enabled for this plan
 */
export function hasPlanFeature(plan: PlanKey, feature: keyof PlanFeatures): boolean {
  const value = PLAN_FEATURES[plan][feature];
  
  // For numeric features, check if > 0 or unlimited (-1)
  if (typeof value === "number") {
    return value !== 0;
  }
  
  return Boolean(value);
}

/**
 * Check if a plan allows unlimited usage of a feature
 * 
 * @param plan - The plan key to check
 * @param feature - The feature to check for
 * @returns True if the feature is unlimited (-1) for this plan
 */
export function isUnlimited(plan: PlanKey, feature: keyof PlanFeatures): boolean {
  const value = PLAN_FEATURES[plan][feature];
  return typeof value === "number" && value === -1;
}

// ============================================================================
// CONVEX QUERIES
// ============================================================================

/**
 * Get all available plans for public pricing display
 * 
 * This query is public (no auth required) and returns plan information
 * that can be injected into marketing copy on pricing pages.
 * 
 * @returns Array of public plan information
 */
export const getPlansPublic = query({
  args: {},
  handler: async (): Promise<PublicPlanInfo[]> => {
    // Define plan display names
    const planNames: Record<PlanKey, string> = {
      basic: "Basic",
      pro: "Pro",
    };
    
    // Build public plan info for each plan
    const plans: PublicPlanInfo[] = (Object.keys(PLAN_FEATURES) as PlanKey[]).map((planKey) => {
      const features = PLAN_FEATURES[planKey];
      const pricing = PRICING[planKey];
      const annualSavings = getAnnualSavingsPercent(planKey);
      
      return {
        slug: planKey,
        name: planNames[planKey],
        features: {
          maxPublishedTracks: features.maxPublishedTracks,
          storageGb: features.storageGb,
          maxCustomDomains: features.maxCustomDomains,
          analyticsLevel: features.analyticsLevel,
          prioritySupport: features.prioritySupport,
        },
        pricing: {
          monthly: pricing.monthly,
          annual: pricing.annual,
        },
        annualSavings,
        trialDays: PAID_PLAN_TRIAL_DAYS,
      };
    });
    
    return plans;
  },
});
