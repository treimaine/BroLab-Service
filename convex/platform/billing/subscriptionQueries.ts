/**
 * Subscription Queries
 * 
 * Public queries for fetching subscription and usage data
 * Used by billing management UI
 * 
 * Requirements: 3.6, 19.1, 19.6
 */

import { v } from "convex/values";
import { query } from "../../_generated/server";
import { PLAN_FEATURES } from "./plans";

/**
 * Get subscription and usage data for a workspace
 * Returns subscription status, plan details, and usage metrics
 */
export const getWorkspaceSubscriptionAndUsage = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    // Get subscription
    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    // Get usage
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    // Get workspace
    const workspace = await ctx.db.get(args.workspaceId);

    if (!workspace) {
      throw new Error("Workspace not found");
    }

    // Get plan features if subscription exists
    const planFeatures = subscription
      ? PLAN_FEATURES[subscription.planKey]
      : null;

    return {
      subscription: subscription
        ? {
            planKey: subscription.planKey,
            status: subscription.status,
            updatedAt: subscription.updatedAt,
          }
        : null,
      usage: usage
        ? {
            storageUsedBytes: usage.storageUsedBytes,
            publishedTracksCount: usage.publishedTracksCount,
            updatedAt: usage.updatedAt,
          }
        : {
            storageUsedBytes: 0,
            publishedTracksCount: 0,
            updatedAt: Date.now(),
          },
      planFeatures,
      workspace: {
        name: workspace.name,
        slug: workspace.slug,
        type: workspace.type,
      },
    };
  },
});

/**
 * Get subscription by Clerk user ID
 * Used to find subscription for the current user
 */
export const getSubscriptionByClerkUserId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    // Find workspace owned by this user
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", args.clerkUserId))
      .first();

    if (!workspace) {
      return null;
    }

    // Get subscription for this workspace
    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();

    // Get usage
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();

    // Get plan features if subscription exists
    const planFeatures = subscription
      ? PLAN_FEATURES[subscription.planKey]
      : null;

    return {
      workspaceId: workspace._id,
      subscription: subscription
        ? {
            planKey: subscription.planKey,
            status: subscription.status,
            updatedAt: subscription.updatedAt,
          }
        : null,
      usage: usage
        ? {
            storageUsedBytes: usage.storageUsedBytes,
            publishedTracksCount: usage.publishedTracksCount,
            updatedAt: usage.updatedAt,
          }
        : {
            storageUsedBytes: 0,
            publishedTracksCount: 0,
            updatedAt: Date.now(),
          },
      planFeatures,
      workspace: {
        name: workspace.name,
        slug: workspace.slug,
        type: workspace.type,
      },
    };
  },
});
