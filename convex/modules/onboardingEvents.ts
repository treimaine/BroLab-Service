// Convex queries and mutations for Onboarding Exceptions Monitor
// Implements May Phase: User onboarding visibility and blocker detection

import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";

/**
 * Record an onboarding event for a user
 * Called when user completes a stage: signup, email verify, profile creation, upload, checkout, payment
 */
export const recordOnboardingEvent = internalMutation({
  args: {
    userId: v.string(),
    eventType: v.union(
      v.literal("signup"),
      v.literal("email_verified"),
      v.literal("profile_created"),
      v.literal("workspace_created"),
      v.literal("beat_uploaded"),
      v.literal("checkout_started"),
      v.literal("payment_success"),
      v.literal("payment_failed"),
      v.literal("onboarding_completed")
    ),
    metadata: v.optional(v.object({
      error: v.optional(v.string()),
      stage_duration: v.optional(v.number()),
      retry_count: v.optional(v.number()),
      additional_data: v.optional(v.any()),
    })),
    blocked_reason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const eventId = await ctx.db.insert("onboardingEvents", {
      userId: args.userId,
      eventType: args.eventType,
      timestamp: now,
      metadata: args.metadata,
      status: args.blocked_reason ? "blocked" : undefined,
      blocked_reason: args.blocked_reason,
      createdAt: now,
    });

    return eventId;
  },
});

/**
 * Query: List all onboarding exceptions (blocked/stuck users)
 * Used by operations dashboard to identify users needing support
 */
export const listOnboardingExceptions = query({
  args: {
    status: v.optional(v.union(v.literal("blocked"), v.literal("completed"))),
    limit: v.optional(v.number()),
    startTime: v.optional(v.number()), // milliseconds, for date range filtering
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    let query = ctx.db.query("onboardingEvents");

    // Filter by status if provided
    if (args.status === "blocked") {
      query = query.filter((q) => q.eq(q.field("status"), "blocked"));
    }

    const events = await query
      .order("desc")
      .take(limit);

    // Group by userId to get current status for each user
    const userMap = new Map();
    for (const event of events) {
      if (!userMap.has(event.userId)) {
        const userEvents = await ctx.db
          .query("onboardingEvents")
          .withIndex("by_user", (q) => q.eq("userId", event.userId))
          .order("desc")
          .take(1);

        if (userEvents.length > 0) {
          const latestEvent = userEvents[0];
          userMap.set(event.userId, {
            userId: event.userId,
            currentStage: latestEvent.eventType,
            lastEventTime: latestEvent.timestamp,
            isBlocked: latestEvent.status === "blocked",
            blockedReason: latestEvent.blocked_reason,
            metadata: latestEvent.metadata,
          });
        }
      }
    }

    return Array.from(userMap.values());
  },
});

/**
 * Query: Get detailed onboarding flow for a single user
 * Used by support team to debug individual user issues
 */
export const getUserOnboardingFlow = query({
  args: {
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("onboardingEvents")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("asc") // Chronological order
      .collect();

    // Calculate stage durations
    const timeline = [];
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const nextEvent = events[i + 1];
      const stageDuration = nextEvent ? nextEvent.timestamp - event.timestamp : null;

      timeline.push({
        eventType: event.eventType,
        timestamp: event.timestamp,
        stageDuration: stageDuration,
        metadata: event.metadata,
        status: event.status,
        blockedReason: event.blocked_reason,
      });
    }

    // Identify where user is stuck (if at all)
    let blockedAtStage = null;
    const blockedEvent = events.find((e) => e.status === "blocked");
    if (blockedEvent) {
      blockedAtStage = blockedEvent.eventType;
    }

    return {
      userId: args.userId,
      timeline: timeline,
      currentStage: events.length > 0 ? events[events.length - 1].eventType : null,
      blockedAtStage: blockedAtStage,
      isCompleted: timeline.some((e) => e.eventType === "payment_success"),
      totalEventsCount: events.length,
    };
  },
});

/**
 * Query: Get aggregate onboarding metrics
 * Used by operations dashboard for insights and KPIs
 */
export const getOnboardingMetrics = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const allEvents = await ctx.db
      .query("onboardingEvents")
      .collect();

    // Filter by time range if provided
    const events = args.startTime !== undefined && args.endTime !== undefined
      ? allEvents.filter((e) => e.timestamp >= args.startTime! && e.timestamp <= args.endTime!)
      : allEvents;

    // Calculate metrics
    const metrics = {
      totalUsers: new Set(events.map((e) => e.userId)).size,
      usersByStage: {} as Record<string, number>,
      blockedUsersCount: 0,
      completedUsersCount: 0,
      avgTimePerStage: {} as Record<string, number>,
      dropoffByStage: {} as Record<string, number>,
    };

    // Count users by current stage and blocked status
    const userStages = new Map();
    const userStatus = new Map();

    for (const event of events) {
      userStages.set(event.userId, event.eventType);
      if (event.status === "blocked") {
        userStatus.set(event.userId, "blocked");
      }
      if (event.eventType === "payment_success") {
        userStatus.set(event.userId, "completed");
      }
    }

    // Count stage distribution
    for (const stage of userStages.values()) {
      metrics.usersByStage[stage] = (metrics.usersByStage[stage] || 0) + 1;
    }

    // Count blocked and completed users
    metrics.blockedUsersCount = Array.from(userStatus.values()).filter((s) => s === "blocked").length;
    metrics.completedUsersCount = Array.from(userStatus.values()).filter((s) => s === "completed").length;

    // Calculate average time per stage
    const stageDurations = new Map();
    const stageUserCounts = new Map();

    for (const event of events) {
      if (event.metadata?.stage_duration) {
        if (!stageDurations.has(event.eventType)) {
          stageDurations.set(event.eventType, 0);
          stageUserCounts.set(event.eventType, 0);
        }
        stageDurations.set(
          event.eventType,
          stageDurations.get(event.eventType) + event.metadata.stage_duration
        );
        stageUserCounts.set(
          event.eventType,
          stageUserCounts.get(event.eventType) + 1
        );
      }
    }

    for (const [stage, total] of stageDurations.entries()) {
      const count = stageUserCounts.get(stage) || 1;
      metrics.avgTimePerStage[stage] = Math.round(total / count);
    }

    return metrics;
  },
});

/**
 * Mutation: Create a support escalation for a blocked user
 * Used when operations team wants to escalate a user issue
 */
export const createOnboardingSupportTicket = mutation({
  args: {
    userId: v.string(),
    reason: v.string(),
    priority: v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
  },
  handler: async (ctx, args) => {
    // Record an internal note about the escalation
    const ticketId = `TICKET-${Date.now()}-${args.userId}`;

    await ctx.db.insert("onboardingEvents", {
      userId: args.userId,
      eventType: "signup", // Use signup as placeholder for non-event
      timestamp: Date.now(),
      metadata: {
        additional_data: {
          escalation_ticket: ticketId,
          reason: args.reason,
          priority: args.priority,
        },
      },
      status: "blocked",
      blocked_reason: `Support ticket created: ${args.reason}`,
      createdAt: Date.now(),
    });

    return {
      ticketId,
      userId: args.userId,
      reason: args.reason,
      priority: args.priority,
      createdAt: Date.now(),
    };
  },
});
