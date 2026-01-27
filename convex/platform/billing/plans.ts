/**
 * Billing Plans - Source of Truth
 * 
 * This file defines the canonical plan features and pricing for BroLab Entertainment.
 * All plan-related logic should reference these constants.
 * 
 * Requirements: 3.2, 3.3
 */

import { query } from "../../_generated/server";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Available subscription plan keys
 */
export type PlanKey = "basic" | "pro";

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
}

/**
 * Public plan information for pricing UI
 */
export interface PublicPlanInfo {
  /**
   * Plan identifier (e.g., "basic", "pro")
   */
  slug: PlanKey;
  
  /**
   * Display name for the plan
   */
  name: string;
  
  /**
   * Technical feature limits
   */
  features: {
    /**
     * Maximum published tracks (-1 = unlimited)
     */
    maxPublishedTracks: number;
    
    /**
     * Storage limit in GB
     */
    storageGb: number;
    
    /**
     * Maximum custom domains
     */
    maxCustomDomains: number;
  };
  
  /**
   * Pricing information in USD
   */
  pricing: {
    /**
     * Monthly price in USD
     */
    monthly: number;
    
    /**
     * Annual price in USD
     */
    annual: number;
  };
  
  /**
   * Annual savings percentage (e.g., 50 for 50% off)
   */
  annualSavings: number;
}

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Preview duration for all tracks (in seconds)
 * Fixed at 30 seconds for MVP
 */
export const PREVIEW_DURATION_SEC = 30;

/**
 * Plan features configuration
 * This is the canonical source for plan limits and entitlements
 */
export const PLAN_FEATURES: Record<PlanKey, PlanFeatures> = {
  basic: {
    maxPublishedTracks: 25,
    storageGb: 1,
    maxCustomDomains: 0,
  },
  pro: {
    maxPublishedTracks: -1, // unlimited
    storageGb: 50,
    maxCustomDomains: 2,
  },
};

/**
 * Pricing configuration (USD)
 * 
 * Annual pricing rules:
 * - BASIC: 50% OFF vs (monthly * 12)
 * - PRO: 70% OFF vs (monthly * 12)
 * 
 * Prices may be rounded to end with .99 for pricing psychology,
 * while staying within ±$0.10 of the computed value.
 */
export const PRICING = {
  basic: {
    monthly: 9.99,   // USD per month
    annual: 59.99,   // USD per year (50% off vs 12 months)
  },
  pro: {
    monthly: 29.99,  // USD per month
    annual: 107.99,  // USD per year (70% off vs 12 months)
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
        },
        pricing: {
          monthly: pricing.monthly,
          annual: pricing.annual,
        },
        annualSavings,
      };
    });
    
    return plans;
  },
});

