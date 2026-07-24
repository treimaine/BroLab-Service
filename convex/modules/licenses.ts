// Convex queries and mutations for License PDF generation
// Implements Requirement 29.6: License PDF generation

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { mutation, query } from "../_generated/server";
import { assertWorkerSecret } from "../lib/workerAuth";

/**
 * Get license data for PDF generation
 * Called by worker to fetch all necessary data
 * Requirements: 29.6
 */
export const getLicenseForPdf = query({
  args: {
    licenseId: v.id("licenses"),
    workerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    assertWorkerSecret(args.workerSecret);
    // Fetch license record
    const license = await ctx.db.get(args.licenseId);
    if (!license) {
      throw new Error(`License ${args.licenseId} not found`);
    }

    // Fetch track
    const track = await ctx.db.get(license.trackId);
    if (!track) {
      throw new Error(`Track ${license.trackId} not found`);
    }

    // Fetch workspace (provider info)
    const workspace = await ctx.db.get(license.workspaceId);
    if (!workspace) {
      throw new Error(`Workspace ${license.workspaceId} not found`);
    }

    // Fetch order (for purchase date and amount)
    const order = await ctx.db.get(license.orderId);
    if (!order) {
      throw new Error(`Order ${license.orderId} not found`);
    }

    return {
      license,
      track,
      workspace,
      order,
    };
  },
});

/**
 * Update license document with generated PDF storage ID
 * Called by worker after successful PDF generation
 * Requirements: 29.6
 */
export const completeLicensePdfGeneration = mutation({
  args: {
    documentId: v.id("licenseDocuments"),
    storageId: v.id("_storage"),
    licenseId: v.id("licenses"),
    workerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    assertWorkerSecret(args.workerSecret);
    // Update license document
    await ctx.db.patch(args.documentId, {
      storageId: args.storageId,
      status: "generated",
      updatedAt: Date.now(),
    });

    // Get license to find entitlement
    const license = await ctx.db.get(args.licenseId);
    if (!license) {
      throw new Error(`License ${args.licenseId} not found`);
    }

    // Update purchase entitlement with PDF storage ID
    await ctx.db.patch(license.entitlementId, {
      licensePdfStorageId: args.storageId,
    });

    await ctx.db.patch(args.licenseId, { status: "active" });

    if (license.buyerEmail) {
      const track = await ctx.db.get(license.trackId);
      if (track) {
        await ctx.scheduler.runAfter(
          0,
          internal.platform.email.actions.sendLicenseReadyEmail,
          {
            licenseId: license._id,
            buyerEmail: license.buyerEmail,
            trackTitle: track.title,
            licenseTier: license.tierKey,
          }
        );
      }
    }

    // Get license document to record event
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error(`License document ${args.documentId} not found`);
    }

    // Record event
    await ctx.db.insert("events", {
      workspaceId: document.workspaceId,
      type: "license_pdf_generated",
      meta: {
        licenseId: document.licenseId,
        documentId: args.documentId,
        storageId: args.storageId,
      },
      createdAt: Date.now(),
    });
  },
});

/**
 * Mark license PDF generation as failed
 * Called by worker if PDF generation fails
 * Requirements: 29.6
 */
export const failLicensePdfGeneration = mutation({
  args: {
    documentId: v.id("licenseDocuments"),
    error: v.string(),
    workerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    assertWorkerSecret(args.workerSecret);
    // Update license document
    await ctx.db.patch(args.documentId, {
      status: "failed",
      error: args.error,
      updatedAt: Date.now(),
    });

    // Get license to record event
    const document = await ctx.db.get(args.documentId);
    if (!document) {
      throw new Error(`License document ${args.documentId} not found`);
    }

    // Record event
    await ctx.db.insert("events", {
      workspaceId: document.workspaceId,
      type: "license_pdf_failed",
      meta: {
        licenseId: document.licenseId,
        documentId: args.documentId,
        error: args.error,
      },
      createdAt: Date.now(),
    });
  },
});
