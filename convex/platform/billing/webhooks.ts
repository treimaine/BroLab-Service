/**
 * Clerk Billing Webhook Handler
 * 
 * Handles subscription lifecycle events from Clerk Billing:
 * - subscription.created
 * - subscription.updated
 * - subscription.deleted
 * 
 * Requirements: 3.1, 3.4, 3.7, 3.8
 */

import { v } from "convex/values";
import type { Id } from "../../_generated/dataModel";
import { internalMutation } from "../../_generated/server";

/**
 * Subscription status mapping from Clerk to our system
 */
type ClerkSubscriptionStatus = "active" | "canceled" | "incomplete" | "incomplete_expired" | "past_due" | "trialing" | "unpaid";
type SystemSubscriptionStatus = "active" | "inactive" | "canceled";

function mapClerkStatusToSystem(clerkStatus: ClerkSubscriptionStatus): SystemSubscriptionStatus {
  switch (clerkStatus) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "unpaid":
      return "inactive";
    default:
      return "inactive";
  }
}

/**
 * Sync subscription from Clerk Billing webhook
 * 
 * This mutation is called from the HTTP webhook handler to update
 * the providerSubscriptions table based on Clerk Billing events.
 * 
 * @internal This is an internal mutation called only from HTTP actions
 */
export const syncSubscription = internalMutation({
  args: {
    clerkUserId: v.string(),
    workspaceId: v.id("workspaces"),
    planKey: v.union(v.literal("basic"), v.literal("pro")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("canceled")),
  },
  handler: async (ctx, args) => {
    const { clerkUserId, workspaceId, planKey, status } = args;
    
    // Check if subscription already exists
    const existing = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspaceId))
      .first();
    
    const now = Date.now();
    
    if (existing) {
      // Update existing subscription
      await ctx.db.patch(existing._id, {
        planKey,
        status,
        updatedAt: now,
      });
    } else {
      // Create new subscription record
      await ctx.db.insert("providerSubscriptions", {
        workspaceId,
        clerkUserId,
        planKey,
        status,
        updatedAt: now,
      });
    }
    
    // Log event for observability
    await ctx.db.insert("events", {
      workspaceId,
      type: "subscription_synced",
      meta: {
        clerkUserId,
        planKey,
        status,
        source: "clerk_billing_webhook",
      },
      createdAt: now,
    });
  },
});

/**
 * Get workspace by owner Clerk user ID
 * 
 * Helper to find the workspace associated with a Clerk user
 * for subscription sync.
 * 
 * @internal This is an internal query called only from HTTP actions
 */
export const getWorkspaceByOwner = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args): Promise<Id<"workspaces"> | null> => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", args.clerkUserId))
      .first();
    
    return workspace?._id ?? null;
  },
});
