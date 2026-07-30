/**
 * Platform Core: File Storage Helpers
 * 
 * Helpers for Convex File Storage operations.
 * Used by both frontend and worker for file upload/download.
 * 
 * Requirements:
 * - Convex File Storage for audio files
 * - Time-limited download URLs
 * - Upload URL generation
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";
import { assertWorkerSecret } from "../lib/workerAuth";

/**
 * Generate upload URL for file storage
 * 
 * This is a generic helper that can be used by any module.
 * For track-specific upload with quota checks, use beats.generateUploadUrl.
 * 
 * @returns Upload URL
 */
export const generateUploadUrl = mutation({
  args: { workerSecret: v.string() },
  handler: async (ctx, args) => {
    assertWorkerSecret(args.workerSecret);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Get file URL from storage ID
 * 
 * Returns a time-limited URL for downloading/streaming a file.
 * URLs expire after a certain time (Convex default: 1 hour).
 * 
 * @param storageId - Convex storage ID
 * @returns File URL or null if file not found
 */
export const getFileUrl = query({
  args: {
    storageId: v.id("_storage"),
    workerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    assertWorkerSecret(args.workerSecret);
    return await ctx.storage.getUrl(args.storageId);
  },
});

/**
 * Get file metadata from storage ID
 * 
 * Returns metadata about a stored file (size, content type, etc.).
 * 
 * @param storageId - Convex storage ID
 * @returns File metadata or null if file not found
 */
export const getFileMetadata = query({
  args: {
    storageId: v.id("_storage"),
    workerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    assertWorkerSecret(args.workerSecret);
    return await ctx.db.system.get("_storage", args.storageId);
  },
});

/**
 * Delete file from storage
 * 
 * Removes a file from Convex Storage.
 * This is a low-level helper - most modules should handle deletion
 * as part of their own delete mutations (e.g., beats.deleteTrack).
 * 
 * @param storageId - Convex storage ID
 */
export const deleteFile = mutation({
  args: {
    storageId: v.id("_storage"),
    workerSecret: v.string(),
  },
  handler: async (ctx, args) => {
    assertWorkerSecret(args.workerSecret);
    await ctx.storage.delete(args.storageId);
  },
});
