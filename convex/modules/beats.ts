/**
 * Beats Module - Track Upload and Management
 * 
 * Handles track upload, preview generation, and publishing.
 * Enforces subscription gating and quota limits.
 * 
 * Requirements: 10.1, 10.5, 10.8, 10.9
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { assertActiveSubscription, assertQuota } from "../platform/entitlements";
import { internal } from "../_generated/api";

// ============================================================================
// TYPES
// ============================================================================

/**
 * Supported audio file formats for track upload
 */
const SUPPORTED_FORMATS = ["audio/wav", "audio/mpeg", "audio/mp3"] as const;

/**
 * Maximum file size for track upload (1GB in bytes)
 * This is a hard limit regardless of plan
 */
const MAX_FILE_SIZE_BYTES = 1024 * 1024 * 1024; // 1GB

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Generate upload URL for track audio file
 * 
 * This is step 1 of the Convex upload pattern:
 * 1. Generate upload URL (this mutation)
 * 2. Upload file to URL (client-side)
 * 3. Create track record (createTrack mutation)
 * 
 * Requirements: 10.1, 3.4, 3.7
 * 
 * @throws Error if subscription is not active
 * @throws Error if storage quota exceeded
 * @throws Error if file size exceeds limit
 */
export const generateUploadUrl = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    fileSizeBytes: v.number(),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Assert active subscription (requirement 3.4, 3.7)
    await assertActiveSubscription(ctx, args.workspaceId);

    // Check storage quota BEFORE generating upload URL
    // This prevents users from uploading files that would exceed their quota
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!usage) {
      throw new Error("Usage tracking not initialized for this workspace");
    }

    // Check if file size exceeds hard limit
    if (args.fileSizeBytes > MAX_FILE_SIZE_BYTES) {
      const sizeMB = (args.fileSizeBytes / (1024 * 1024)).toFixed(2);
      throw new Error(
        `File size (${sizeMB} MB) exceeds maximum allowed size (1024 MB)`
      );
    }

    // Check if adding this file would exceed storage quota
    // We do a soft check here - the actual quota enforcement happens in createTrack
    // This is just to give early feedback to the user
    const newStorageBytes = usage.storageUsedBytes + args.fileSizeBytes;
    
    // Get workspace plan to check storage limit
    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (subscription?.status === "active") {
      // Import plan features to check storage limit
      const { PLAN_FEATURES } = await import("../platform/billing/plans");
      const planFeatures = PLAN_FEATURES[subscription.planKey];
      const storageLimitBytes = planFeatures.storageGb * 1024 * 1024 * 1024;

      if (newStorageBytes > storageLimitBytes) {
        const currentGB = (usage.storageUsedBytes / (1024 * 1024 * 1024)).toFixed(2);
        const fileGB = (args.fileSizeBytes / (1024 * 1024 * 1024)).toFixed(2);
        const limitGB = planFeatures.storageGb;
        throw new Error(
          `Uploading this file (${fileGB} GB) would exceed your storage limit. ` +
          `Current usage: ${currentGB} GB of ${limitGB} GB. ` +
          `Please upgrade your plan or delete some files.`
        );
      }
    }

    // Generate upload URL
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Create track record after file upload
 * 
 * This is step 3 of the Convex upload pattern (after file is uploaded to URL).
 * Creates the track record in draft status and updates usage tracking.
 * 
 * Requirements: 10.1, 10.5, 7.1, 7.2
 * 
 * @throws Error if subscription is not active
 * @throws Error if storage quota exceeded
 * @throws Error if file format is invalid
 */
export const createTrack = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    fullStorageId: v.id("_storage"),
    fileSizeBytes: v.number(),
    mimeType: v.string(),
    bpm: v.optional(v.number()),
    key: v.optional(v.string()),
    tags: v.array(v.string()),
    priceUsdByTier: v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    }),
    priceEurByTier: v.optional(v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    })),
    generatePreview: v.boolean(), // "Generate preview now" option
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Assert active subscription (requirement 3.4, 3.7)
    await assertActiveSubscription(ctx, args.workspaceId);

    // Validate file format
    const validFormat = SUPPORTED_FORMATS.includes(args.mimeType as typeof SUPPORTED_FORMATS[number]);
    if (!validFormat) {
      throw new Error(
        `Invalid file format: ${args.mimeType}. Supported formats: WAV, MP3`
      );
    }

    // Assert storage quota (requirement 7.2)
    // This will throw if quota is exceeded
    await assertQuota(ctx, args.workspaceId, "storage");

    // Get current usage
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!usage) {
      throw new Error("Usage tracking not initialized for this workspace");
    }

    // Create track record in draft status
    const trackId = await ctx.db.insert("tracks", {
      workspaceId: args.workspaceId,
      title: args.title,
      bpm: args.bpm,
      key: args.key,
      tags: args.tags,
      priceUsdByTier: args.priceUsdByTier,
      priceEurByTier: args.priceEurByTier,
      status: "draft",
      fullStorageId: args.fullStorageId,
      fileSizeBytes: args.fileSizeBytes, // Store file size for usage tracking
      processingStatus: "idle",
      previewPolicy: args.generatePreview ? "none" : "manual",
      previewDurationSec: 30, // Fixed at 30 seconds for MVP
      createdAt: Date.now(),
    });

    // Update usage tracking (requirement 10.5)
    await ctx.db.patch(usage._id, {
      storageUsedBytes: usage.storageUsedBytes + args.fileSizeBytes,
      updatedAt: Date.now(),
    });

    // Create audit log for track upload
    await ctx.db.insert("auditLogs", {
      workspaceId: args.workspaceId,
      actorClerkUserId: identity.subject,
      action: "track_upload",
      entityType: "track",
      entityId: trackId,
      meta: {
        title: args.title,
        fileSizeBytes: args.fileSizeBytes,
        mimeType: args.mimeType,
        generatePreview: args.generatePreview,
      },
      createdAt: Date.now(),
    });

    // If generatePreview is true, enqueue preview generation job
    // This will be implemented in Task 8.2
    if (args.generatePreview) {
      await ctx.db.insert("jobs", {
        workspaceId: args.workspaceId,
        type: "preview_generation",
        status: "pending",
        payload: {
          trackId,
          fullStorageId: args.fullStorageId,
        },
        attempts: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });

      // Update track processing status
      await ctx.db.patch(trackId, {
        processingStatus: "processing",
      });
    }

    // Record onboarding event: beat_uploaded
    await ctx.runMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).modules.onboardingEvents.recordOnboardingEvent,
      {
        userId: identity.subject,
        eventType: "beat_uploaded",
        metadata: {
          additional_data: {
            trackId: trackId.toString(),
            title: args.title,
            fileSizeBytes: args.fileSizeBytes,
          },
        },
      }
    );

    return trackId;
  },
});

/**
 * Update track metadata
 * 
 * Allows updating track title, BPM, key, tags, and pricing.
 * Does not allow changing status or storage IDs.
 * 
 * Requirements: 10.1
 */
export const updateTrack = mutation({
  args: {
    trackId: v.id("tracks"),
    title: v.optional(v.string()),
    bpm: v.optional(v.number()),
    key: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    priceUsdByTier: v.optional(v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    })),
    priceEurByTier: v.optional(v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    })),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get track to verify ownership
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Verify workspace ownership
    const workspace = await ctx.db.get(track.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied. You are not the owner of this workspace.");
    }

    // Assert active subscription
    await assertActiveSubscription(ctx, track.workspaceId);

    // Build update object (only include provided fields)
    const updates: Record<string, unknown> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.bpm !== undefined) updates.bpm = args.bpm;
    if (args.key !== undefined) updates.key = args.key;
    if (args.tags !== undefined) updates.tags = args.tags;
    if (args.priceUsdByTier !== undefined) updates.priceUsdByTier = args.priceUsdByTier;
    if (args.priceEurByTier !== undefined) updates.priceEurByTier = args.priceEurByTier;

    // Update track
    await ctx.db.patch(args.trackId, updates);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      workspaceId: track.workspaceId,
      actorClerkUserId: identity.subject,
      action: "track_update",
      entityType: "track",
      entityId: args.trackId,
      meta: updates,
      createdAt: Date.now(),
    });

    return args.trackId;
  },
});

/**
 * Publish track
 * 
 * Publishes a draft track, making it visible on the storefront.
 * Enforces quota check for max_published_tracks before publishing.
 * Updates usage tracking and creates audit log.
 * 
 * Requirements: 10.8, 10.9, 9.1
 * 
 * @throws Error if subscription is not active
 * @throws Error if track not found or already published
 * @throws Error if published tracks quota exceeded
 */
export const publishTrack = mutation({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get track to verify ownership and status
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Verify workspace ownership
    const workspace = await ctx.db.get(track.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied. You are not the owner of this workspace.");
    }

    // Assert active subscription (requirement 3.4, 3.7)
    await assertActiveSubscription(ctx, track.workspaceId);

    // Check if track is already published
    if (track.status === "published") {
      throw new Error("Track is already published");
    }

    // Assert quota for published tracks (requirement 10.8)
    // This will throw if the workspace has reached its published tracks limit
    await assertQuota(ctx, track.workspaceId, "tracks");

    // Update track status to published (requirement 10.9)
    await ctx.db.patch(args.trackId, {
      status: "published",
    });

    // Update usage tracking - increment publishedTracksCount (requirement 10.9)
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", track.workspaceId))
      .first();

    if (usage) {
      await ctx.db.patch(usage._id, {
        publishedTracksCount: usage.publishedTracksCount + 1,
        updatedAt: Date.now(),
      });
    }

    // Create audit log for track publish (requirement 9.1)
    await ctx.db.insert("auditLogs", {
      workspaceId: track.workspaceId,
      actorClerkUserId: identity.subject,
      action: "track_publish",
      entityType: "track",
      entityId: args.trackId,
      meta: {
        title: track.title,
        previousStatus: "draft",
        newStatus: "published",
      },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Unpublish track
 * 
 * Unpublishes a published track, removing it from the storefront.
 * Updates usage tracking and creates audit log.
 * 
 * Requirements: 10.8, 10.9, 9.1
 * 
 * @throws Error if subscription is not active
 * @throws Error if track not found or not published
 */
export const unpublishTrack = mutation({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get track to verify ownership and status
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Verify workspace ownership
    const workspace = await ctx.db.get(track.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied. You are not the owner of this workspace.");
    }

    // Assert active subscription
    await assertActiveSubscription(ctx, track.workspaceId);

    // Check if track is already draft
    if (track.status === "draft") {
      throw new Error("Track is already unpublished");
    }

    // Update track status to draft
    await ctx.db.patch(args.trackId, {
      status: "draft",
    });

    // Update usage tracking - decrement publishedTracksCount
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", track.workspaceId))
      .first();

    if (usage) {
      await ctx.db.patch(usage._id, {
        publishedTracksCount: Math.max(0, usage.publishedTracksCount - 1),
        updatedAt: Date.now(),
      });
    }

    // Create audit log for track unpublish
    await ctx.db.insert("auditLogs", {
      workspaceId: track.workspaceId,
      actorClerkUserId: identity.subject,
      action: "track_unpublish",
      entityType: "track",
      entityId: args.trackId,
      meta: {
        title: track.title,
        previousStatus: "published",
        newStatus: "draft",
      },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete track
 * 
 * Deletes track record and updates usage tracking.
 * Does NOT delete the actual file from storage (Convex handles cleanup).
 * 
 * Requirements: 10.1, 10.5
 */
export const deleteTrack = mutation({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get track to verify ownership and get file size
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Verify workspace ownership
    const workspace = await ctx.db.get(track.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied. You are not the owner of this workspace.");
    }

    // Assert active subscription
    await assertActiveSubscription(ctx, track.workspaceId);

    // Use stored file size for usage tracking
    const fileSizeBytes = track.fileSizeBytes;

    // Update usage tracking (subtract file size)
    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", track.workspaceId))
      .first();

    if (usage) {
      await ctx.db.patch(usage._id, {
        storageUsedBytes: Math.max(0, usage.storageUsedBytes - fileSizeBytes),
        // If track was published, decrement published count
        publishedTracksCount: track.status === "published" 
          ? Math.max(0, usage.publishedTracksCount - 1)
          : usage.publishedTracksCount,
        updatedAt: Date.now(),
      });
    }

    // Delete track record
    await ctx.db.delete(args.trackId);

    // Create audit log
    await ctx.db.insert("auditLogs", {
      workspaceId: track.workspaceId,
      actorClerkUserId: identity.subject,
      action: "track_delete",
      entityType: "track",
      entityId: args.trackId,
      meta: {
        title: track.title,
        status: track.status,
        fileSizeBytes,
      },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// PREVIEW GENERATION MUTATIONS
// ============================================================================

/**
 * Generate preview for a track
 * 
 * Enqueues a preview generation job for a track that was uploaded without preview
 * or for which preview generation failed.
 * 
 * Requirements: 10.2, 10.3, 10.4, 11.1
 * 
 * @throws Error if subscription is not active
 * @throws Error if track not found or already has preview
 * @throws Error if preview generation already in progress
 */
export const generatePreview = mutation({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get track
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Verify workspace ownership
    const workspace = await ctx.db.get(track.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied. You are not the owner of this workspace.");
    }

    // Assert active subscription (requirement 3.4, 3.7)
    await assertActiveSubscription(ctx, track.workspaceId);

    // Check if preview already exists
    if (track.previewStorageId) {
      throw new Error("Track already has a preview. Delete the track and re-upload to regenerate.");
    }

    // Check if preview generation is already in progress
    if (track.processingStatus === "processing") {
      throw new Error("Preview generation is already in progress for this track.");
    }

    // Enqueue preview generation job
    await ctx.db.insert("jobs", {
      workspaceId: track.workspaceId,
      type: "preview_generation",
      status: "pending",
      payload: {
        trackId: args.trackId,
        fullStorageId: track.fullStorageId,
      },
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update track processing status
    await ctx.db.patch(args.trackId, {
      processingStatus: "processing",
      processingError: undefined, // Clear any previous error
      previewPolicy: "none", // Update policy since we're generating now
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      workspaceId: track.workspaceId,
      actorClerkUserId: identity.subject,
      action: "preview_generate",
      entityType: "track",
      entityId: args.trackId,
      meta: {
        title: track.title,
      },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Retry failed preview generation
 * 
 * Retries preview generation for a track that failed processing.
 * Clears the error and enqueues a new job.
 * 
 * Requirements: 10.6, 10.7, 11.5, 11.6
 * 
 * @throws Error if subscription is not active
 * @throws Error if track not found or not in failed state
 */
export const retryPreviewGeneration = mutation({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get track
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Verify workspace ownership
    const workspace = await ctx.db.get(track.workspaceId);
    if (!workspace) {
      throw new Error("Workspace not found");
    }

    if (workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied. You are not the owner of this workspace.");
    }

    // Assert active subscription
    await assertActiveSubscription(ctx, track.workspaceId);

    // Check if track is in failed state
    if (track.processingStatus !== "failed") {
      throw new Error("Can only retry failed preview generation. Current status: " + track.processingStatus);
    }

    // Enqueue new preview generation job
    await ctx.db.insert("jobs", {
      workspaceId: track.workspaceId,
      type: "preview_generation",
      status: "pending",
      payload: {
        trackId: args.trackId,
        fullStorageId: track.fullStorageId,
      },
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Update track processing status
    await ctx.db.patch(args.trackId, {
      processingStatus: "processing",
      processingError: undefined, // Clear error
    });

    // Create audit log
    await ctx.db.insert("auditLogs", {
      workspaceId: track.workspaceId,
      actorClerkUserId: identity.subject,
      action: "preview_retry",
      entityType: "track",
      entityId: args.trackId,
      meta: {
        title: track.title,
        previousError: track.processingError,
      },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Complete preview generation (called by worker)
 * 
 * Updates track with preview storage ID and marks processing as completed.
 * This mutation is called by the external worker after successfully generating the preview.
 * 
 * Requirements: 11.3, 11.4
 * 
 * @throws Error if track not found
 */
export const completePreviewGeneration = mutation({
  args: {
    trackId: v.id("tracks"),
    previewStorageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    // Get track
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Update track with preview storage ID and mark as completed
    await ctx.db.patch(args.trackId, {
      previewStorageId: args.previewStorageId,
      processingStatus: "completed",
      processingError: undefined,
    });

    // Record event
    await ctx.db.insert("events", {
      workspaceId: track.workspaceId,
      type: "preview_generated",
      meta: {
        trackId: args.trackId,
        trackTitle: track.title,
        previewStorageId: args.previewStorageId,
      },
      createdAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Fail preview generation (called by worker)
 * 
 * Updates track processing status to failed and records error message.
 * This mutation is called by the external worker when preview generation fails.
 * 
 * Requirements: 11.7
 * 
 * @throws Error if track not found
 */
export const failPreviewGeneration = mutation({
  args: {
    trackId: v.id("tracks"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    // Get track
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    // Update track with error
    await ctx.db.patch(args.trackId, {
      processingStatus: "failed",
      processingError: args.error,
    });

    return { success: true };
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Check if buyer has purchase entitlement for a track
 * 
 * Internal query used by download API to verify entitlement.
 * 
 * Requirements: 15.1
 */
export const checkEntitlement = query({
  args: {
    trackId: v.id("tracks"),
    buyerClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const entitlement = await ctx.db
      .query("purchaseEntitlements")
      .withIndex("by_buyer_track", (q) =>
        q.eq("buyerClerkUserId", args.buyerClerkUserId).eq("trackId", args.trackId)
      )
      .first();

    return entitlement;
  },
});

/**
 * Get track for download (internal query)
 * 
 * Returns track with storage IDs for download URL generation.
 * 
 * Requirements: 15.2
 */
export const getTrackForDownload = query({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trackId);
  },
});

/**
 * Get tracks for a workspace
 * 
 * Returns all tracks for a workspace with their preview status.
 * Used by the provider dashboard to display tracks and preview generation status.
 * 
 * Requirements: 10.1, 10.6
 */
export const getTracksByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(v.union(v.literal("draft"), v.literal("published"))),
  },
  handler: async (ctx, args) => {
    const tracksQuery = ctx.db
      .query("tracks")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    let tracks = await tracksQuery.collect();

    // Filter by status if specified
    if (args.status) {
      tracks = tracks.filter((track) => track.status === args.status);
    }

    // Sort by createdAt descending (newest first)
    return tracks.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get track by ID
 * 
 * Returns a single track with all details.
 * 
 * Requirements: 10.1
 */
export const getTrack = query({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.trackId);
  },
});

/**
 * Get published tracks for a workspace (storefront public query)
 *
 * Returns ONLY published tracks for a specific workspace.
 * - Scoped by workspaceId: never returns tracks from other workspaces (Req 28.5)
 * - Filtered by status="published": draft tracks are never exposed (Req 28.1)
 * Uses the by_workspace_status compound index for efficient filtering.
 *
 * Requirements: 21.1, 21.2, 28.1, 28.5
 */
export const getPublishedTracks = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_workspace_status", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("status", "published")
      )
      .collect();

    // Resolve preview URLs for tracks that have previews
    const tracksWithUrls = await Promise.all(
      tracks.map(async (track) => {
        let previewUrl: string | null = null;
        if (track.previewStorageId) {
          previewUrl = await ctx.storage.getUrl(track.previewStorageId);
        }
        return { ...track, previewUrl };
      })
    );

    return tracksWithUrls.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a single published track with preview URL (storefront public query)
 *
 * Returns track data with resolved preview URL.
 * Scoped by workspaceId to prevent cross-tenant data leaks.
 * Only returns published tracks — draft tracks are never exposed to public users.
 *
 * Requirements: 21.3, 28.1, 28.5
 */
export const getPublishedTrack = query({
  args: {
    trackId: v.id("tracks"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);

    // Enforce: only published tracks visible to public users (Req 28.1)
    if (!track || track?.status !== "published") return null;

    // Enforce: scope by workspaceId — never mix tenants (Req 28.5)
    if (track?.workspaceId !== args.workspaceId) return null;

    const previewUrl = track.previewStorageId
      ? await ctx.storage.getUrl(track.previewStorageId)
      : null;

    return { ...track, previewUrl };
  },
});
