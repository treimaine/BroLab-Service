/**
 * Public Pricing Query
 * 
 * Returns plan information for public pricing pages.
 * No authentication required - this is public marketing data.
 * 
 * Requirements: 3.2, 3.3, Architecture
 */

import { query } from "../../_generated/server";
import { PLAN_FEATURES, PRICING, getAnnualSavingsPercent, type PlanKey } from "./plans";

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
