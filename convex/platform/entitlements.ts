/**
 * Platform Core: Entitlements and Quotas
 * 
 * Centralized access control helpers for feature gating and usage limits.
 * All provider mutations and actions MUST call these checks server-side.
 * 
 * Requirements:
 * - Requirement 6.1: getWorkspacePlan(workspaceId) returning entitlements snapshot
 * - Requirement 6.2: assertEntitlement(workspaceId, key) for feature gating
 * - Requirement 6.3: assertQuota(workspaceId, metric) for usage limits
 * - Requirement 6.4: Server-side enforcement in all provider mutations
 * - Requirement 6.5: Never trust client-side state for authorization
 * 
 * CRITICAL: These functions enforce server-side authorization.
 * Client-side checks are for UX only. Server-side checks are mandatory.
 */

import { PLAN_FEATURES, PlanFeatures } from "../../src/platform/billing/plans";
import { Id } from "../_generated/dataModel";
import { MutationCtx, QueryCtx } from "../_generated/server";

// ============ TYPES ============

/**
 * Context type that can be used for both queries and mutations
 * (read-only operations use QueryCtx, write operations use MutationCtx)
 */
type ConvexContext = QueryCtx | MutationCtx;

/**
 * Subscription status
 */
export type SubscriptionStatus = "active" | "inactive" | "canceled";

/**
 * Plan key
 */
export type PlanKey = "basic" | "pro";

/**
 * Workspace plan snapshot
 * Contains subscription status and feature entitlements
 */
export interface WorkspacePlan {
  /** Plan key (basic, pro, or null if no subscription) */
  planKey: PlanKey | null;
  /** Subscription status */
  status: SubscriptionStatus | null;
  /** Plan features (limits and entitlements) */
  features: PlanFeatures;
}

/**
 * Feature keys that can be checked with assertEntitlement
 */
export type FeatureKey = keyof PlanFeatures;

/**
 * Quota metrics that can be checked with assertQuota
 */
export type QuotaMetric = "tracks" | "storage" | "domains";

// ============ CORE FUNCTIONS ============

/**
 * Get workspace plan with entitlements snapshot
 * 
 * Returns the current subscription status and feature limits for a workspace.
 * This is the single source of truth for authorization decisions.
 * 
 * @param ctx - Convex context
 * @param workspaceId - Workspace ID
 * @returns WorkspacePlan with status and features
 * 
 * @example
 * ```typescript
 * const plan = await getWorkspacePlan(ctx, workspaceId);
 * if (plan.status !== "active") {
 *   throw new Error("Subscription required");
 * }
 * ```
 */
export async function getWorkspacePlan(
  ctx: ConvexContext,
  workspaceId: Id<"workspaces">
): Promise<WorkspacePlan> {
  // Get workspace
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  // Get subscription
  const subscription = await ctx.db
    .query("providerSubscriptions")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  // If no subscription, return null plan with no features
  if (!subscription) {
    return {
      planKey: null,
      status: null,
      features: {
        max_published_tracks: 0,
        storage_gb: 0,
        max_custom_domains: 0,
      },
    };
  }

  // Return plan with features
  return {
    planKey: subscription.planKey,
    status: subscription.status,
    features: PLAN_FEATURES[subscription.planKey as PlanKey],
  };
}

/**
 * Assert entitlement for feature gating
 * 
 * Checks if a workspace has access to a specific feature.
 * Throws an error if the feature is not available.
 * 
 * Use this for binary feature checks (e.g., custom domains allowed/not allowed).
 * 
 * @param ctx - Convex context
 * @param workspaceId - Workspace ID
 * @param key - Feature key to check
 * @throws Error if feature is not available or subscription is inactive
 * 
 * @example
 * ```typescript
 * // Check if custom domains are allowed
 * await assertEntitlement(ctx, workspaceId, "max_custom_domains");
 * ```
 */
export async function assertEntitlement(
  ctx: ConvexContext,
  workspaceId: Id<"workspaces">,
  key: FeatureKey
): Promise<void> {
  const plan = await getWorkspacePlan(ctx, workspaceId);

  // Check if subscription is active
  if (plan.status !== "active") {
    throw new Error(
      "Active subscription required. Please subscribe to access this feature."
    );
  }

  // Check if feature is available
  const featureValue = plan.features[key];

  // For numeric features, check if > 0 (or -1 for unlimited)
  if (typeof featureValue === "number") {
    if (featureValue === 0) {
      throw new Error(
        `This feature is not available on your current plan. Please upgrade to access ${key}.`
      );
    }
  }

  // Feature is available
}

/**
 * Assert quota for usage limits
 * 
 * Checks if a workspace has remaining quota for a specific metric.
 * Throws an error if the quota is exceeded.
 * 
 * Use this before operations that consume quota (e.g., publishing a track, uploading a file).
 * 
 * @param ctx - Convex context
 * @param workspaceId - Workspace ID
 * @param metric - Quota metric to check (tracks, storage, domains)
 * @throws Error if quota is exceeded or subscription is inactive
 * 
 * @example
 * ```typescript
 * // Check if workspace can publish another track
 * await assertQuota(ctx, workspaceId, "tracks");
 * 
 * // Check if workspace has storage space
 * await assertQuota(ctx, workspaceId, "storage");
 * ```
 */
export async function assertQuota(
  ctx: ConvexContext,
  workspaceId: Id<"workspaces">,
  metric: QuotaMetric
): Promise<void> {
  const plan = await getWorkspacePlan(ctx, workspaceId);

  // Check if subscription is active
  if (plan.status !== "active") {
    throw new Error(
      "Active subscription required. Please subscribe to continue."
    );
  }

  // Get current usage
  const usage = await ctx.db
    .query("usage")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!usage) {
    throw new Error("Usage tracking not found for workspace");
  }

  // Check quota based on metric
  switch (metric) {
    case "tracks": {
      const maxTracks = plan.features.max_published_tracks;
      const currentTracks = usage.publishedTracksCount;

      // -1 means unlimited
      if (maxTracks === -1) {
        return;
      }

      if (currentTracks >= maxTracks) {
        throw new Error(
          `Track limit reached (${currentTracks}/${maxTracks}). Please upgrade your plan to publish more tracks.`
        );
      }
      break;
    }

    case "storage": {
      const maxStorageBytes = plan.features.storage_gb * 1024 * 1024 * 1024; // GB to bytes
      const currentStorageBytes = usage.storageUsedBytes;

      if (currentStorageBytes >= maxStorageBytes) {
        const currentGB = (currentStorageBytes / (1024 * 1024 * 1024)).toFixed(2);
        const maxGB = plan.features.storage_gb;
        throw new Error(
          `Storage limit reached (${currentGB}GB/${maxGB}GB). Please upgrade your plan for more storage.`
        );
      }
      break;
    }

    case "domains": {
      const maxDomains = plan.features.max_custom_domains;

      // If max is 0, custom domains are not allowed
      if (maxDomains === 0) {
        throw new Error(
          "Custom domains are not available on your current plan. Please upgrade to PRO."
        );
      }

      // Count current domains
      const currentDomains = await ctx.db
        .query("domains")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();

      if (currentDomains.length >= maxDomains) {
        throw new Error(
          `Domain limit reached (${currentDomains.length}/${maxDomains}). Please upgrade your plan to add more domains.`
        );
      }
      break;
    }

    default:
      throw new Error(`Unknown quota metric: ${metric}`);
  }
}

// ============ HELPER FUNCTIONS ============

/**
 * Check if workspace has active subscription
 * 
 * @param ctx - Convex context
 * @param workspaceId - Workspace ID
 * @returns True if subscription is active
 */
export async function hasActiveSubscription(
  ctx: ConvexContext,
  workspaceId: Id<"workspaces">
): Promise<boolean> {
  const plan = await getWorkspacePlan(ctx, workspaceId);
  return plan.status === "active";
}

/**
 * Get remaining quota for a metric
 * 
 * @param ctx - Convex context
 * @param workspaceId - Workspace ID
 * @param metric - Quota metric
 * @returns Remaining quota (or Infinity if unlimited)
 */
export async function getRemainingQuota(
  ctx: ConvexContext,
  workspaceId: Id<"workspaces">,
  metric: QuotaMetric
): Promise<number> {
  const plan = await getWorkspacePlan(ctx, workspaceId);

  if (plan.status !== "active") {
    return 0;
  }

  const usage = await ctx.db
    .query("usage")
    .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
    .first();

  if (!usage) {
    return 0;
  }

  switch (metric) {
    case "tracks": {
      const maxTracks = plan.features.max_published_tracks;
      if (maxTracks === -1) return Infinity;
      return Math.max(0, maxTracks - usage.publishedTracksCount);
    }

    case "storage": {
      const maxStorageBytes = plan.features.storage_gb * 1024 * 1024 * 1024;
      return Math.max(0, maxStorageBytes - usage.storageUsedBytes);
    }

    case "domains": {
      const maxDomains = plan.features.max_custom_domains;
      if (maxDomains === 0) return 0;
      
      const currentDomains = await ctx.db
        .query("domains")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
        .collect();
      
      return Math.max(0, maxDomains - currentDomains.length);
    }

    default:
      return 0;
  }
}

/**
 * Check if a specific feature is available
 * 
 * @param ctx - Convex context
 * @param workspaceId - Workspace ID
 * @param key - Feature key
 * @returns True if feature is available
 */
export async function hasFeature(
  ctx: ConvexContext,
  workspaceId: Id<"workspaces">,
  key: FeatureKey
): Promise<boolean> {
  try {
    await assertEntitlement(ctx, workspaceId, key);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if quota is available for a metric
 * 
 * @param ctx - Convex context
 * @param workspaceId - Workspace ID
 * @param metric - Quota metric
 * @returns True if quota is available
 */
export async function hasQuota(
  ctx: ConvexContext,
  workspaceId: Id<"workspaces">,
  metric: QuotaMetric
): Promise<boolean> {
  try {
    await assertQuota(ctx, workspaceId, metric);
    return true;
  } catch {
    return false;
  }
}


// ============ CONVEX QUERIES (Client-accessible) ============

import { v } from "convex/values";
import { query } from "../_generated/server";

/**
 * Query: Get workspace plan (client-accessible)
 * 
 * Returns the workspace plan for UI display purposes.
 * This is safe to expose to clients for showing subscription status and limits.
 * 
 * IMPORTANT: This is for UI display only. Server-side mutations MUST use
 * the internal getWorkspacePlan function for authorization decisions.
 */
export const getWorkspacePlanQuery = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await getWorkspacePlan(ctx, args.workspaceId);
  },
});

/**
 * Query: Get remaining quota (client-accessible)
 * 
 * Returns remaining quota for a specific metric.
 * Useful for displaying usage bars and limits in the UI.
 */
export const getRemainingQuotaQuery = query({
  args: {
    workspaceId: v.id("workspaces"),
    metric: v.union(v.literal("tracks"), v.literal("storage"), v.literal("domains")),
  },
  handler: async (ctx, args) => {
    return await getRemainingQuota(ctx, args.workspaceId, args.metric);
  },
});

/**
 * Query: Check if feature is available (client-accessible)
 * 
 * Returns true if a feature is available for the workspace.
 * Useful for conditional rendering in the UI.
 */
export const hasFeatureQuery = query({
  args: {
    workspaceId: v.id("workspaces"),
    key: v.union(
      v.literal("max_published_tracks"),
      v.literal("storage_gb"),
      v.literal("max_custom_domains")
    ),
  },
  handler: async (ctx, args) => {
    return await hasFeature(ctx, args.workspaceId, args.key);
  },
});

/**
 * Query: Get usage stats (client-accessible)
 * 
 * Returns current usage statistics for the workspace.
 * Useful for displaying usage bars and progress indicators.
 */
export const getUsageStats = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!usage) {
      return {
        storageUsedBytes: 0,
        publishedTracksCount: 0,
        storageUsedGB: 0,
      };
    }

    return {
      storageUsedBytes: usage.storageUsedBytes,
      publishedTracksCount: usage.publishedTracksCount,
      storageUsedGB: Number((usage.storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2)),
    };
  },
});
