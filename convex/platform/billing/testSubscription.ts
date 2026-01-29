/**
 * Test Subscription Helper
 * 
 * DEVELOPMENT ONLY - Creates a test subscription for testing billing UI
 * This should NOT be used in production
 */

import { v } from "convex/values";
import { mutation } from "../../_generated/server";

/**
 * Create a test subscription for the current user
 * 
 * Usage: Call this mutation from Convex dashboard with your clerkUserId
 */
export const createTestSubscription = mutation({
  args: {
    clerkUserId: v.string(),
    planKey: v.union(v.literal("basic"), v.literal("pro")),
  },
  handler: async (ctx, args) => {
    // Find workspace for this user
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", args.clerkUserId))
      .first();
    
    if (!workspace) {
      throw new Error("Workspace not found for user");
    }
    
    // Check if subscription already exists
    const existing = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      // Update existing
      await ctx.db.patch(existing._id, {
        planKey: args.planKey,
        status: "active",
        updatedAt: now,
      });
      
      return { message: "Subscription updated", subscriptionId: existing._id };
    } else {
      // Create new
      const subscriptionId = await ctx.db.insert("providerSubscriptions", {
        workspaceId: workspace._id,
        clerkUserId: args.clerkUserId,
        planKey: args.planKey,
        status: "active",
        updatedAt: now,
      });
      
      // Create usage record if it doesn't exist
      const usage = await ctx.db
        .query("usage")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first();
      
      if (!usage) {
        await ctx.db.insert("usage", {
          workspaceId: workspace._id,
          storageUsedBytes: 0,
          publishedTracksCount: 0,
          updatedAt: now,
        });
      }
      
      return { message: "Subscription created", subscriptionId };
    }
  },
});
