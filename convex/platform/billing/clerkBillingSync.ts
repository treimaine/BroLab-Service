/**
 * Clerk Billing Sync
 * 
 * Synchronizes subscription data from Clerk Billing API to Convex
 * 
 * Since Clerk Billing webhooks are not yet available in Beta,
 * we need to poll the Clerk API to sync subscription status.
 * 
 * Requirements: 3.1, 3.4, 3.7, 3.8
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { action, internalMutation } from "../../_generated/server";

/**
 * Sync subscription from Clerk Billing API
 * 
 * This action fetches the current subscription status from Clerk
 * and syncs it to the Convex database.
 * 
 * Call this action:
 * - After a user subscribes via Clerk Billing UI
 * - Periodically to keep subscriptions in sync
 * - When displaying billing information
 */
export const syncSubscriptionFromClerk = action({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Get Clerk secret key from environment
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    
    if (!clerkSecretKey) {
      throw new Error("CLERK_SECRET_KEY not configured");
    }
    
    try {
      // Fetch user's subscription from Clerk Billing API
      // Note: This is a placeholder - actual Clerk Billing API endpoint may differ
      const response = await fetch(
        `https://api.clerk.com/v1/users/${args.clerkUserId}/subscriptions`,
        {
          headers: {
            Authorization: `Bearer ${clerkSecretKey}`,
            "Content-Type": "application/json",
          },
        }
      );
      
      if (!response.ok) {
        if (response.status === 404) {
          // No subscription found - this is OK
          console.log("No subscription found for user:", args.clerkUserId);
          return { synced: false, reason: "no_subscription" };
        }
        
        throw new Error(`Clerk API error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract subscription data
      // Note: Actual structure depends on Clerk Billing API response
      const subscription = data.data?.[0]; // Assuming array of subscriptions
      
      if (!subscription) {
        console.log("No active subscription for user:", args.clerkUserId);
        return { synced: false, reason: "no_active_subscription" };
      }
      
      // Get workspace for this user
      const workspaceId = await ctx.runMutation(
        internal.platform.billing.webhooks.getWorkspaceByOwner,
        { clerkUserId: args.clerkUserId }
      );
      
      if (!workspaceId) {
        throw new Error("Workspace not found for user");
      }
      
      // Extract plan and status
      const planKey = subscription.plan_id?.includes("pro") ? "pro" : "basic";
      const status = subscription.status === "active" ? "active" : "inactive";
      
      // Sync to database
      await ctx.runMutation(
        internal.platform.billing.webhooks.syncSubscription,
        {
          clerkUserId: args.clerkUserId,
          workspaceId,
          planKey,
          status,
        }
      );
      
      return { synced: true, planKey, status };
    } catch (error) {
      console.error("Failed to sync subscription from Clerk:", error);
      throw error;
    }
  },
});

/**
 * Auto-sync subscription when fetching billing data
 * 
 * This mutation checks if subscription data is stale and triggers
 * a sync if needed.
 */
export const autoSyncIfNeeded = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Find workspace
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", args.clerkUserId))
      .first();
    
    if (!workspace) {
      return { shouldSync: false, reason: "no_workspace" };
    }
    
    // Check if subscription exists
    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();
    
    // If no subscription or data is older than 5 minutes, trigger sync
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
    
    if (!subscription || subscription.updatedAt < fiveMinutesAgo) {
      return { shouldSync: true, reason: subscription ? "stale" : "missing" };
    }
    
    return { shouldSync: false, reason: "fresh" };
  },
});
