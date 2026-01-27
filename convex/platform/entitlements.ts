/**
 * Platform Core: Entitlements and Quotas
 * 
 * Centralized access control helpers for feature gating and usage limits.
 * Server-side enforcement - NEVER trust client-side state.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 5.5
 */

import { Id } from "../_generated/dataModel";
import { PLAN_FEATURES, PlanFeatures, PlanKey } from "./billing/plans";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Workspace plan snapshot with entitlements
 */
export interface WorkspacePlan {
  /**
   * Plan key (basic, pro, or null if no active subscription)
   */
  planKey: PlanKey | null;
  
  /**
   * Subscription status
   */
  status: "active" | "inactive" | "canceled";
  
  /**
   * Plan features and limits
   */
  features: PlanFeatures;
}

/**
 * Quota metrics that can be checked
 */
export type QuotaMetric = "tracks" | "storage" | "domains";

// ============================================================================
// CORE FUNCTIONS
// ============================================================================

/**
 * Get workspace plan with entitlements snapshot
 * 
 * Returns the current plan and features for a workspace.
 * If no active subscription, returns null plan with basic features.
 * 
 * @param ctx - Convex query/mutation context
 * @param workspaceId - Workspace ID to check
 * @returns WorkspacePlan with current entitlements
 * 
 * @example
 * ```ts
 * const plan = await getWorkspacePlan(ctx, workspaceId);
 * if (plan.features.maxCustomDomains > 0) {
 *   // Allow custom domain connection
 * }
 * ```
 */
export async function getWorkspacePlan(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">
): Promise<WorkspacePlan> {
  // Query subscription for this workspace
  const subscription = await ctx.db
    .query("providerSubscriptions")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .first();

  // No subscription or inactive subscription
  if (!subscription || subscription.status !== "active") {
    return {
      planKey: null,
      status: subscription?.status ?? "inactive",
      features: PLAN_FEATURES.basic, // Default to basic features when inactive
    };
  }

  // Active subscription
  const planKey = subscription.planKey as PlanKey;
  return {
    planKey,
    status: subscription.status,
    features: PLAN_FEATURES[planKey],
  };
}

/**
 * Assert that workspace has a specific entitlement
 * 
 * Throws error if the workspace plan does not include the requested feature.
 * Use this for feature gating (e.g., custom domains, advanced analytics).
 * 
 * @param ctx - Convex query/mutation context
 * @param workspaceId - Workspace ID to check
 * @param key - Feature key to check (e.g., "maxCustomDomains")
 * @throws Error if feature is not available or limit is 0
 * 
 * @example
 * ```ts
 * // Check if workspace can connect custom domains
 * await assertEntitlement(ctx, workspaceId, "maxCustomDomains");
 * // If we reach here, feature is available
 * ```
 */
export async function assertEntitlement(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">,
  key: keyof PlanFeatures
): Promise<void> {
  const plan = await getWorkspacePlan(ctx, workspaceId);
  const value = plan.features[key];

  // Check if feature is available
  if (typeof value === "number") {
    // For numeric features, check if > 0 or unlimited (-1)
    if (value === 0) {
      throw new Error(
        `Feature "${key}" is not available on your current plan. Please upgrade to access this feature.`
      );
    }
  } else if (!value) {
    // For boolean features, check if truthy
    throw new Error(
      `Feature "${key}" is not available on your current plan. Please upgrade to access this feature.`
    );
  }

  // Feature is available
}

/**
 * Assert that workspace has not exceeded quota for a metric
 * 
 * Throws error if the workspace has exceeded the usage limit for the metric.
 * Use this before allowing actions that consume quota (e.g., publishing tracks, uploading files).
 * 
 * @param ctx - Convex query/mutation context
 * @param workspaceId - Workspace ID to check
 * @param metric - Quota metric to check ("tracks", "storage", "domains")
 * @throws Error if quota is exceeded
 * 
 * @example
 * ```ts
 * // Check if workspace can publish another track
 * await assertQuota(ctx, workspaceId, "tracks");
 * // If we reach here, quota is available
 * await ctx.db.patch(trackId, { status: "published" });
 * ```
 */
export async function assertQuota(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">,
  metric: QuotaMetric
): Promise<void> {
  const plan = await getWorkspacePlan(ctx, workspaceId);

  // Get current usage
  const usage = await ctx.db
    .query("usage")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .first();

  if (!usage) {
    throw new Error("Usage tracking not initialized for this workspace");
  }

  // Check quota based on metric
  switch (metric) {
    case "tracks": {
      const limit = plan.features.maxPublishedTracks;
      const current = usage.publishedTracksCount;

      // -1 means unlimited
      if (limit === -1) {
        return;
      }

      if (current >= limit) {
        throw new Error(
          `Track limit reached. You have published ${current} of ${limit} tracks allowed on your plan. Please upgrade to publish more tracks.`
        );
      }
      break;
    }

    case "storage": {
      const limitBytes = plan.features.storageGb * 1024 * 1024 * 1024; // Convert GB to bytes
      const currentBytes = usage.storageUsedBytes;

      if (currentBytes >= limitBytes) {
        const currentGb = (currentBytes / (1024 * 1024 * 1024)).toFixed(2);
        const limitGb = plan.features.storageGb;
        throw new Error(
          `Storage limit reached. You have used ${currentGb} GB of ${limitGb} GB allowed on your plan. Please upgrade to get more storage.`
        );
      }
      break;
    }

    case "domains": {
      const limit = plan.features.maxCustomDomains;

      // Count current domains
      const domains = await ctx.db
        .query("domains")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .collect();

      const current = domains.length;

      if (current >= limit) {
        throw new Error(
          `Custom domain limit reached. You have ${current} of ${limit} domains allowed on your plan. Please upgrade to connect more domains.`
        );
      }
      break;
    }

    default: {
      // TypeScript exhaustiveness check
      const _exhaustive: never = metric;
      throw new Error(`Unknown quota metric: ${_exhaustive}`);
    }
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Check if workspace has an active subscription
 * 
 * @param ctx - Convex query/mutation context
 * @param workspaceId - Workspace ID to check
 * @returns True if workspace has active subscription
 */
export async function hasActiveSubscription(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">
): Promise<boolean> {
  const plan = await getWorkspacePlan(ctx, workspaceId);
  return plan.status === "active" && plan.planKey !== null;
}

/**
 * Check if workspace plan allows unlimited usage of a feature
 * 
 * @param ctx - Convex query/mutation context
 * @param workspaceId - Workspace ID to check
 * @param key - Feature key to check
 * @returns True if feature is unlimited (-1)
 */
export async function isUnlimited(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">,
  key: keyof PlanFeatures
): Promise<boolean> {
  const plan = await getWorkspacePlan(ctx, workspaceId);
  const value = plan.features[key];
  return typeof value === "number" && value === -1;
}

/**
 * Get remaining quota for a metric
 * 
 * @param ctx - Convex query/mutation context
 * @param workspaceId - Workspace ID to check
 * @param metric - Quota metric to check
 * @returns Remaining quota (number or "unlimited")
 */
export async function getRemainingQuota(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">,
  metric: QuotaMetric
): Promise<number | "unlimited"> {
  const plan = await getWorkspacePlan(ctx, workspaceId);

  // Get current usage
  const usage = await ctx.db
    .query("usage")
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .first();

  if (!usage) {
    return 0;
  }

  switch (metric) {
    case "tracks": {
      const limit = plan.features.maxPublishedTracks;
      if (limit === -1) return "unlimited";
      return Math.max(0, limit - usage.publishedTracksCount);
    }

    case "storage": {
      const limitBytes = plan.features.storageGb * 1024 * 1024 * 1024;
      return Math.max(0, limitBytes - usage.storageUsedBytes);
    }

    case "domains": {
      const limit = plan.features.maxCustomDomains;
      const domains = await ctx.db
        .query("domains")
        .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
        .collect();
      return Math.max(0, limit - domains.length);
    }

    default: {
      const _exhaustive: never = metric;
      throw new Error(`Unknown quota metric: ${_exhaustive}`);
    }
  }
}
