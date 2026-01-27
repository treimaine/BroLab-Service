/**
 * Example: How to use entitlements and quotas in mutations
 * 
 * This file demonstrates the correct usage of assertEntitlement and assertQuota
 * in provider mutations. All provider mutations MUST follow these patterns.
 * 
 * CRITICAL RULES:
 * 1. ALWAYS call assertEntitlement or assertQuota at the START of the mutation
 * 2. NEVER trust client-side state for authorization
 * 3. Server-side checks are MANDATORY, not optional
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { assertEntitlement, assertQuota } from "./entitlements";

// ============ EXAMPLE 1: Publishing a Track ============

/**
 * Example mutation: Publish a track
 * 
 * This demonstrates how to use assertActiveSubscription and assertQuota
 * before an operation that consumes quota (publishing a track).
 * 
 * Requirements: 3.4, 3.7
 */
export const publishTrackExample = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    // STEP 1: Check active subscription FIRST
    // This will throw an error if subscription is inactive
    await assertActiveSubscription(ctx, args.workspaceId);

    // STEP 2: Check quota (max published tracks)
    // This will throw an error if quota is exceeded
    await assertQuota(ctx, args.workspaceId, "tracks");

    // STEP 3: Perform the operation
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    if (track.workspaceId !== args.workspaceId) {
      throw new Error("Track does not belong to this workspace");
    }

    // Update track status
    await ctx.db.patch(args.trackId, {
      status: "published",
    });

    // STEP 4: Update usage tracking
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (usage) {
      await ctx.db.patch(usage._id, {
        publishedTracksCount: usage.publishedTracksCount + 1,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

// ============ EXAMPLE 2: Connecting a Custom Domain ============

/**
 * Example mutation: Connect a custom domain
 * 
 * This demonstrates how to use assertEntitlement for feature gating
 * and assertQuota for usage limits.
 */
export const connectCustomDomainExample = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    hostname: v.string(),
  },
  handler: async (ctx, args) => {
    // STEP 1: Check entitlement (is custom domains feature available?)
    await assertEntitlement(ctx, args.workspaceId, "maxCustomDomains");

    // STEP 2: Check quota (has workspace reached domain limit?)
    await assertQuota(ctx, args.workspaceId, "domains");

    // STEP 3: Perform the operation
    const domainId = await ctx.db.insert("domains", {
      workspaceId: args.workspaceId,
      hostname: args.hostname.toLowerCase(),
      status: "pending",
      createdAt: Date.now(),
    });

    return { domainId };
  },
});

// ============ EXAMPLE 3: Uploading a File ============

/**
 * Example mutation: Upload a file
 * 
 * This demonstrates how to check storage quota before uploading.
 * Note: The actual file upload happens client-side via Convex Storage,
 * but we check quota server-side before generating the upload URL.
 */
export const generateUploadUrlExample = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    fileSizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    // STEP 1: Check storage quota
    // Note: We check if adding this file would exceed the limit
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!usage) {
      throw new Error("Usage tracking not found");
    }

    // Check if projected usage would exceed limit
    // Note: assertQuota will check current usage + buffer against limit
    await assertQuota(ctx, args.workspaceId, "storage");

    // STEP 2: Generate upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl();

    return { uploadUrl };
  },
});

// ============ EXAMPLE 4: Creating a Service ============

/**
 * Example mutation: Create a service
 * 
 * This demonstrates subscription gating for operations without quota limits.
 * Services don't have a quota limit, but require an active subscription.
 * 
 * Requirements: 3.4, 3.7
 */
export const createServiceExample = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    priceUSD: v.number(),
  },
  handler: async (ctx, args) => {
    // STEP 1: Check if subscription is active
    await assertActiveSubscription(ctx, args.workspaceId);

    // STEP 2: Create the service
    const serviceId = await ctx.db.insert("services", {
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      priceUSD: args.priceUSD,
      turnaround: "3-5 days",
      features: [],
      isActive: true,
      createdAt: Date.now(),
    });

    return { serviceId };
  },
});

// ============ ANTI-PATTERNS (DO NOT DO THIS) ============

/**
 * ❌ WRONG: Checking subscription on client-side only
 * 
 * This is INSECURE. Client-side checks can be bypassed.
 */
export const insecurePublishTrackExample = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    trackId: v.id("tracks"),
    // ❌ WRONG: Trusting client to pass subscription status
    hasActiveSubscription: v.boolean(),
  },
  handler: async (ctx, args) => {
    // ❌ WRONG: Trusting client-side state
    if (!args.hasActiveSubscription) {
      throw new Error("Subscription required");
    }

    // This is insecure! A malicious client can pass hasActiveSubscription: true
    // and bypass the subscription check.

    // ... rest of the mutation
  },
});

/**
 * ❌ WRONG: Not checking quota before operation
 * 
 * This allows users to exceed their limits.
 */
export const insecurePublishTrackExample2 = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    // ❌ WRONG: No quota check!
    
    // Directly publishing without checking limits
    await ctx.db.patch(args.trackId, {
      status: "published",
    });

    // This allows users to publish unlimited tracks even on BASIC plan
  },
});

/**
 * ✅ CORRECT PATTERN SUMMARY:
 * 
 * 1. Call assertActiveSubscription at the START of ALL provider mutations
 * 2. Call assertEntitlement or assertQuota for specific feature/quota checks
 * 3. These functions will throw an error if checks fail
 * 4. Only proceed with the operation if checks pass
 * 5. Update usage tracking after the operation
 * 6. NEVER trust client-side state for authorization
 * 
 * Requirements: 3.4, 3.7, 6.5
 */
