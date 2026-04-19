/**
 * Test Data Seeding for Checkout E2E Tests
 *
 * Creates test workspace, tracks, and services for Stripe checkout flow testing
 * Run before E2E tests to establish valid test data
 */

import type { Id } from "../_generated/dataModel";
import { internalMutation } from "../_generated/server";

/**
 * Seed test workspace with Stripe Connect credentials
 */
export const seedCheckoutTestData = internalMutation({
  handler: async (ctx) => {
    // Create test workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      ownerClerkUserId: "test_owner_001",
      type: "producer",
      name: "Test Workspace",
      slug: "test-workspace",
      paymentsStatus: "active",
      stripeAccountId: "acct_test123",
      createdAt: Date.now(),
    });

    // Create test tracks
    const trackId1 = await ctx.db.insert("tracks", {
      workspaceId,
      title: "Test Beat",
      tags: ["hip-hop", "test"],
      bpm: 90,
      key: "C",
      status: "published",
      previewStorageId: "test_storage_001" as Id<"_storage">,
      fullStorageId: "test_storage_full_001" as Id<"_storage">,
      fileSizeBytes: 5000000, // 5MB
      priceUsdByTier: {
        basic: 29.99,
        premium: 49.99,
        unlimited: 99.99,
      },
      processingStatus: "completed",
      previewDurationSec: 30,
      previewPolicy: "manual",
      createdAt: Date.now(),
    });

    // Create test service
    const serviceId = await ctx.db.insert("services", {
      workspaceId,
      title: "Mixing Service",
      description: "Professional mixing service",
      priceUSD: 99.99,
      turnaround: "3-5 days",
      features: ["Professional mixing", "Unlimited revisions"],
      isActive: true,
      createdAt: Date.now(),
    });

    return {
      workspaceId: workspaceId.toString(),
      trackId: trackId1.toString(),
      serviceId: serviceId.toString(),
    };
  },
});
