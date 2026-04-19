// Onboarding mutations and utilities
// Integrates onboarding event tracking for exception monitoring

import { v } from "convex/values";
import { mutation } from "../_generated/server";

/**
 * Record onboarding milestone when user completes a stage
 * Called from client-side onboarding flow
 */
export const recordOnboardingMilestone = mutation({
  args: {
    clerkUserId: v.string(),
    eventType: v.union(
      v.literal("profile_created"),
      v.literal("workspace_created"),
      v.literal("beat_uploaded"),
      v.literal("checkout_started"),
      v.literal("payment_success"),
      v.literal("payment_failed"),
      v.literal("onboarding_completed")
    ),
    metadata: v.optional(v.object({
      workspaceId: v.optional(v.string()),
      workspaceName: v.optional(v.string()),
      role: v.optional(v.string()),
      error: v.optional(v.string()),
      additional_data: v.optional(v.any()),
    })),
  },
  handler: async (ctx, args) => {
    // Record the onboarding event to onboardingEvents table
    const now = Date.now();
    const eventId = await ctx.db.insert("onboardingEvents", {
      userId: args.clerkUserId,
      eventType: args.eventType,
      timestamp: now,
      metadata: args.metadata,
      status: undefined,
      blocked_reason: undefined,
      createdAt: now,
    });

    return eventId;
  },
});

/**
 * Record user signup event (called after Clerk signup completes)
 */
export const recordSignup = mutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    return await ctx.db.insert("onboardingEvents", {
      userId: args.clerkUserId,
      eventType: "signup",
      timestamp: now,
      metadata: undefined,
      status: undefined,
      blocked_reason: undefined,
      createdAt: now,
    });
  },
});
