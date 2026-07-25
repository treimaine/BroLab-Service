/**
 * Checkout Abandonment Survey Module
 * 
 * Handles checkout abandonment survey submission and analytics.
 */

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation, query } from "../_generated/server";

/**
 * Delay before the recovery email.
 *
 * Four hours: long enough that it does not read as surveillance of a session
 * the buyer just left, short enough that the intent has not gone cold.
 */
const RECOVERY_DELAY_MS = 4 * 60 * 60 * 1000;

export const submitAbandonment = mutation({
  args: {
    clerkUserId: v.optional(v.string()),
    trackId: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces")),
    licenseTier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited"))),
    reason: v.string(),
    customReason: v.optional(v.string()),
    checkoutSessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("checkoutAbandonment", {
      clerkUserId: args.clerkUserId,
      trackId: args.trackId,
      workspaceId: args.workspaceId,
      licenseTier: args.licenseTier,
      reason: args.reason,
      customReason: args.customReason,
      checkoutSessionId: args.checkoutSessionId,
      createdAt: Date.now(),
    });

    // Recovery is only possible when we know who left and what they left behind.
    // The action re-checks at send time whether they have since purchased.
    if (args.clerkUserId && args.trackId) {
      await ctx.scheduler.runAfter(
        RECOVERY_DELAY_MS,
        internal.platform.email.lifecycle.sendAbandonmentRecovery,
        { abandonmentId: id }
      );
    }

    return id;
  },
});

export const getAbandonmentStats = query({
  args: {},
  handler: async (ctx) => {
    const responses = await ctx.db.query("checkoutAbandonment").collect();
    
    const reasonCounts: Record<string, number> = {};
    const tierCounts: Record<string, number> = {};
    const trackCounts: Record<string, number> = {};
    const workspaceCounts: Record<string, number> = {};
    
    for (const r of responses) {
      reasonCounts[r.reason] = (reasonCounts[r.reason] || 0) + 1;
      if (r.licenseTier) {
        tierCounts[r.licenseTier] = (tierCounts[r.licenseTier] || 0) + 1;
      }
      if (r.trackId) {
        trackCounts[r.trackId] = (trackCounts[r.trackId] || 0) + 1;
      }
      if (r.workspaceId) {
        workspaceCounts[r.workspaceId] = (workspaceCounts[r.workspaceId] || 0) + 1;
      }
    }

    return {
      total: responses.length,
      reasonCounts,
      tierCounts,
      trackCounts,
      workspaceCounts,
      recent: responses.slice(-20).reverse(),
    };
  },
});
