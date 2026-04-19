/**
 * Test Data Seeding for Checkout E2E Tests
 *
 * Creates test workspace, tracks, and services for Stripe checkout flow testing
 * Run before E2E tests to establish valid test data
 */

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Seed test workspace with Stripe Connect credentials
 */
export const seedCheckoutTestData = internalMutation({
  handler: async (ctx) => {
    // Create test workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      ownerId: "test_owner_001",
      name: "Test Workspace",
      slug: "test-workspace",
      customDomain: null,
      customDomainVerified: false,
      logoUrl: null,
      paymentsStatus: "active",
      stripeAccountId: "acct_test123",
      createdAt: Date.now(),
    });

    // Create test tracks
    const trackId1 = await ctx.db.insert("tracks", {
      workspaceId,
      title: "Test Beat",
      description: "Test beat for checkout",
      artistName: "Test Artist",
      genre: "Hip-Hop",
      bpm: 90,
      key: "C",
      status: "published",
      storageId: "test_storage_001",
      durationSeconds: 180,
      wavUrl: "https://example.com/test.wav",
      mp3Url: "https://example.com/test.mp3",
      priceUsdByTier: {
        basic: 29.99,
        premium: 49.99,
        unlimited: 99.99,
      },
      requiresLicense: true,
      createdAt: Date.now(),
      publishedAt: Date.now(),
    });

    // Create test service
    const serviceId = await ctx.db.insert("services", {
      workspaceId,
      title: "Mixing Service",
      description: "Professional mixing service",
      priceUSD: 99.99,
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
