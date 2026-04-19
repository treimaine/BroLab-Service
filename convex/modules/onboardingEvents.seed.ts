/**
 * Test Data Seeding for Onboarding Events
 *
 * This file provides utilities to seed test data for verifying:
 * - Schema structure and indexing
 * - Query performance (<200ms for list queries)
 * - Aggregation calculations accuracy
 *
 * Usage: Run via Convex CLI for testing
 */

import { internalMutation } from "../_generated/server";

/**
 * Seed 5 sample user journeys with realistic timings
 */
export const seedSampleUserJourneys = internalMutation({
  handler: async (ctx) => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // Journey 1: Complete happy path (signup → payment_success)
    const user1 = "clerk_user_1";
    const events1 = [
      { userId: user1, eventType: "signup" as const, timestamp: now - 10 * DAY },
      { userId: user1, eventType: "email_verified" as const, timestamp: now - 10 * DAY + 10 * 60 * 1000 },
      { userId: user1, eventType: "profile_created" as const, timestamp: now - 10 * DAY + 30 * 60 * 1000 },
      { userId: user1, eventType: "beat_uploaded" as const, timestamp: now - 9 * DAY + 2 * 60 * 60 * 1000 },
      { userId: user1, eventType: "checkout_started" as const, timestamp: now - 8 * DAY },
      { userId: user1, eventType: "payment_success" as const, timestamp: now - 8 * DAY + 5 * 60 * 1000 },
    ];

    // Journey 2: Blocked at profile_created
    const user2 = "clerk_user_2";
    const events2 = [
      { userId: user2, eventType: "signup" as const, timestamp: now - 7 * DAY },
      { userId: user2, eventType: "email_verified" as const, timestamp: now - 7 * DAY + 5 * 60 * 1000 },
      { userId: user2, eventType: "profile_created" as const, timestamp: now - 7 * DAY + 20 * 60 * 1000, blocked: true },
    ];

    // Journey 3: Blocked at beat_uploaded (file size issue)
    const user3 = "clerk_user_3";
    const events3 = [
      { userId: user3, eventType: "signup" as const, timestamp: now - 5 * DAY },
      { userId: user3, eventType: "email_verified" as const, timestamp: now - 5 * DAY + 15 * 60 * 1000 },
      { userId: user3, eventType: "profile_created" as const, timestamp: now - 5 * DAY + 40 * 60 * 1000 },
      { userId: user3, eventType: "beat_uploaded" as const, timestamp: now - 4 * DAY, blocked: true },
    ];

    // Journey 4: Payment failed, retrying
    const user4 = "clerk_user_4";
    const events4 = [
      { userId: user4, eventType: "signup" as const, timestamp: now - 3 * DAY },
      { userId: user4, eventType: "email_verified" as const, timestamp: now - 3 * DAY + 8 * 60 * 1000 },
      { userId: user4, eventType: "profile_created" as const, timestamp: now - 3 * DAY + 25 * 60 * 1000 },
      { userId: user4, eventType: "beat_uploaded" as const, timestamp: now - 2 * DAY + 3 * 60 * 60 * 1000 },
      { userId: user4, eventType: "checkout_started" as const, timestamp: now - 1 * DAY },
      { userId: user4, eventType: "payment_failed" as const, timestamp: now - 1 * DAY + 2 * 60 * 1000 },
      { userId: user4, eventType: "checkout_started" as const, timestamp: now - 12 * 60 * 60 * 1000 },
      { userId: user4, eventType: "payment_success" as const, timestamp: now - 12 * 60 * 60 * 1000 + 3 * 60 * 1000 },
    ];

    // Journey 5: Early dropout at email_verified
    const user5 = "clerk_user_5";
    const events5 = [
      { userId: user5, eventType: "signup" as const, timestamp: now - 2 * DAY },
      { userId: user5, eventType: "email_verified" as const, timestamp: now - 2 * DAY + 12 * 60 * 1000 },
    ];

    const allJourneys = [
      ...events1,
      ...events2,
      ...events3,
      ...events4,
      ...events5,
    ];

    // Insert all events
    let insertedCount = 0;
    for (const event of allJourneys) {
      const eventData: {
        userId: string;
        eventType: "signup" | "email_verified" | "profile_created" | "workspace_created" | "beat_uploaded" | "checkout_started" | "payment_success" | "payment_failed" | "onboarding_completed";
        timestamp: number;
        createdAt: number;
        status?: "blocked" | "completed";
        blocked_reason?: string;
        metadata?: {
          error?: string;
          stage_duration?: number;
          retry_count?: number;
          additional_data?: unknown;
        };
      } = {
        userId: event.userId,
        eventType: event.eventType as "signup" | "email_verified" | "profile_created" | "workspace_created" | "beat_uploaded" | "checkout_started" | "payment_success" | "payment_failed" | "onboarding_completed",
        timestamp: event.timestamp,
        createdAt: event.timestamp,
      };
      
      // Only add status/blocked_reason if event has blocked property
      if ('blocked' in event && event.blocked) {
        eventData.status = "blocked";
        eventData.blocked_reason = "Support required";
      }
      
      await ctx.db.insert("onboardingEvents", eventData);
      insertedCount++;
    }

    return {
      message: "Test data seeded successfully",
      insertedCount,
      userJourneys: 5,
      totalEvents: insertedCount,
    };
  },
});

/**
 * Clear all test data (for cleanup between test runs)
 */
export const clearTestData = internalMutation({
  handler: async (ctx) => {
    const testUserIds = [
      "clerk_user_1",
      "clerk_user_2",
      "clerk_user_3",
      "clerk_user_4",
      "clerk_user_5",
    ];

    let deletedCount = 0;
    for (const userId of testUserIds) {
      const events = await ctx.db
        .query("onboardingEvents")
        .withIndex("by_user", (q) => q.eq("userId", userId))
        .collect();

      for (const event of events) {
        await ctx.db.delete(event._id);
        deletedCount++;
      }
    }

    return {
      message: "Test data cleared successfully",
      deletedCount,
    };
  },
});
