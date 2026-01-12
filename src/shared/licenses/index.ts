/**
 * License Terms Module
 *
 * Exports license tier definitions and helper functions for the BroLab Entertainment platform.
 * These terms are snapshotted at purchase time to ensure immutability of purchased licenses.
 */

import licenseTermsJson from "./license_terms.v1.1-2026-01.json";

// ============ Types ============

export const LICENSE_TIERS = ["basic", "premium", "unlimited"] as const;
export type LicenseTier = (typeof LICENSE_TIERS)[number];

export interface LicenseRights {
  commercialUse: boolean;
  audioStreamingCap: number; // -1 = unlimited
  musicVideosCap: number;
  livePerformanceCap: number;
  radioBroadcastCap: number;
  syncAllowed: boolean;
}

export interface PublishingSplit {
  licensorWriterSharePercent: number;
  licenseeWriterSharePercent: number;
  licensorPublisherSharePercent: number;
  licenseePublisherSharePercent: number;
}

export interface LicenseTerms {
  title: string;
  includesStems: boolean;
  rights: LicenseRights;
  publishingSplit: PublishingSplit;
}

export interface LicenseSnapshot {
  termsVersion: string;
  tierKey: LicenseTier;
  includesStems: boolean;
  rights: LicenseRights;
  prohibitedUses: string[];
  creditLineTemplate: string;
  publishingSplit: PublishingSplit;
}

// ============ Constants ============

/** Current version of license terms - used for snapshot versioning */
export const LICENSE_TERMS_VERSION = "v1.1-2026-01";

/** Raw JSON data for advanced use cases */
export const LICENSE_TERMS_RAW = licenseTermsJson;

/** License terms by tier - normalized TypeScript structure */
export const LICENSE_TERMS_BY_TIER: Record<LicenseTier, LicenseTerms> = {
  basic: {
    title: "Basic License",
    includesStems: false,
    rights: {
      commercialUse: true,
      audioStreamingCap: 100000,
      musicVideosCap: 1,
      livePerformanceCap: 10,
      radioBroadcastCap: 0,
      syncAllowed: false,
    },
    publishingSplit: {
      licensorWriterSharePercent: 50,
      licenseeWriterSharePercent: 50,
      licensorPublisherSharePercent: 50,
      licenseePublisherSharePercent: 50,
    },
  },
  premium: {
    title: "Premium License",
    includesStems: false,
    rights: {
      commercialUse: true,
      audioStreamingCap: 500000,
      musicVideosCap: 2,
      livePerformanceCap: 25,
      radioBroadcastCap: 10,
      syncAllowed: false,
    },
    publishingSplit: {
      licensorWriterSharePercent: 50,
      licenseeWriterSharePercent: 50,
      licensorPublisherSharePercent: 50,
      licenseePublisherSharePercent: 50,
    },
  },
  unlimited: {
    title: "Unlimited License",
    includesStems: true,
    rights: {
      commercialUse: true,
      audioStreamingCap: -1, // unlimited
      musicVideosCap: -1,
      livePerformanceCap: -1,
      radioBroadcastCap: -1,
      syncAllowed: true,
    },
    publishingSplit: {
      licensorWriterSharePercent: 50,
      licenseeWriterSharePercent: 50,
      licensorPublisherSharePercent: 50,
      licenseePublisherSharePercent: 50,
    },
  },
};

/** Prohibited uses common to all license tiers */
export const PROHIBITED_USES: string[] =
  licenseTermsJson.global.common_terms.prohibited_uses;

/** Credit line template */
export const CREDIT_LINE_TEMPLATE: string =
  licenseTermsJson.global.common_terms.credit.credit_line_template;

// ============ Helper Functions ============

/**
 * Get license terms for a specific tier
 */
export function getLicenseTerms(tier: LicenseTier): LicenseTerms {
  return LICENSE_TERMS_BY_TIER[tier];
}

/**
 * Check if a tier includes stems
 */
export function tierIncludesStems(tier: LicenseTier): boolean {
  return LICENSE_TERMS_BY_TIER[tier].includesStems;
}

/**
 * Check if a tier allows sync licensing (TV/Film/Ads/Games)
 */
export function tierAllowsSync(tier: LicenseTier): boolean {
  return LICENSE_TERMS_BY_TIER[tier].rights.syncAllowed;
}

/**
 * Get the streaming cap for a tier (-1 means unlimited)
 */
export function getStreamingCap(tier: LicenseTier): number {
  return LICENSE_TERMS_BY_TIER[tier].rights.audioStreamingCap;
}

/**
 * Check if a value is unlimited (-1)
 */
export function isUnlimited(cap: number): boolean {
  return cap === -1;
}

/**
 * Format a cap value for display
 */
export function formatCap(cap: number): string {
  if (cap === -1) return "Unlimited";
  if (cap === 0) return "Not included";
  return cap.toLocaleString();
}

/**
 * Validate that a string is a valid license tier
 */
export function isValidLicenseTier(tier: string): tier is LicenseTier {
  return LICENSE_TIERS.includes(tier as LicenseTier);
}

/**
 * Create a license snapshot for purchase time
 * This captures the current terms so future changes don't affect past purchases
 */
export function createLicenseSnapshot(
  tier: LicenseTier,
  providerDisplayName: string
): LicenseSnapshot {
  const terms = LICENSE_TERMS_BY_TIER[tier];
  return {
    termsVersion: LICENSE_TERMS_VERSION,
    tierKey: tier,
    includesStems: terms.includesStems,
    rights: { ...terms.rights },
    prohibitedUses: [...PROHIBITED_USES],
    creditLineTemplate: CREDIT_LINE_TEMPLATE.replace(
      "{PROVIDER_DISPLAY_NAME}",
      providerDisplayName
    ),
    publishingSplit: { ...terms.publishingSplit },
  };
}

/**
 * Get typical price for a tier (from JSON reference data)
 */
export function getTypicalPriceUsd(tier: LicenseTier): number {
  const tierData = licenseTermsJson.tiers[tier];
  return tierData.typical_price_usd;
}

/**
 * Compare two tiers and return which has more rights
 * Returns: -1 if a < b, 0 if equal, 1 if a > b
 */
export function compareTiers(a: LicenseTier, b: LicenseTier): number {
  const tierOrder: Record<LicenseTier, number> = {
    basic: 0,
    premium: 1,
    unlimited: 2,
  };
  return tierOrder[a] - tierOrder[b];
}
