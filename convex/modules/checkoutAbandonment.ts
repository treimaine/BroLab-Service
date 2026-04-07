/**
 * Checkout Abandonment Survey Module
 * 
 * Handles checkout abandonment survey submission and analytics.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

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
