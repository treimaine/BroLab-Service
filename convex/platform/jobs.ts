/**
 * Platform Core: Job Queue System
 * 
 * Generic job queue for background tasks (preview generation, license PDF, etc.)
 * Supports concurrency control, retry logic, and extensible job types.
 * 
 * Requirements:
 * - Requirement 8.1: Store jobs with workspaceId, type, status, payload, attempts, error, timestamps, locks
 * - Requirement 8.2: Support statuses: pending, processing, completed, failed
 * - Requirement 8.3: Create job record with status "pending" when enqueued
 * - Requirement 8.4: Job worker processes pending jobs and updates status
 * - Requirement 8.5: Record error, increment attempts, allow retry on failure
 * - Requirement 8.6: Extensible for future job types (waveforms, loudness analysis)
 * 
 * ARCHITECTURE:
 * - Jobs are enqueued via mutations (enqueueJob)
 * - External worker polls for pending jobs (getNextPendingJob)
 * - Worker locks job before processing (lockJob)
 * - Worker updates status after processing (completeJob, failJob)
 * - Failed jobs can be retried (retryJob)
 */

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

// ============ TYPES ============

/**
 * Job types supported by the system
 * Extensible for future job types
 */
export type JobType =
  | "preview_generation"
  | "license_pdf_generation"
  | "waveform_generation"
  | "loudness_analysis";

/**
 * Job status
 */
export type JobStatus = "pending" | "processing" | "completed" | "failed";

/**
 * Job payload structure (type-specific)
 */
export interface PreviewGenerationPayload {
  trackId: Id<"tracks">;
  fullStorageId: Id<"_storage">;
}

export interface LicensePdfGenerationPayload {
  licenseId: Id<"licenses">;
  documentId: Id<"licenseDocuments">;
  workspaceId: Id<"workspaces">;
}

export interface WaveformGenerationPayload {
  trackId: Id<"tracks">;
  previewStorageId: Id<"_storage">;
}

export interface LoudnessAnalysisPayload {
  trackId: Id<"tracks">;
  fullStorageId: Id<"_storage">;
}

/**
 * Union type for all job payloads
 */
export type JobPayload =
  | PreviewGenerationPayload
  | LicensePdfGenerationPayload
  | WaveformGenerationPayload
  | LoudnessAnalysisPayload;

// ============ CONSTANTS ============

/**
 * Maximum number of retry attempts before job is permanently failed
 */
export const MAX_JOB_ATTEMPTS = 3;

/**
 * Job lock timeout in milliseconds (5 minutes)
 * If a job is locked for longer than this, it's considered stale and can be re-locked
 */
export const JOB_LOCK_TIMEOUT_MS = 5 * 60 * 1000;

// ============ MUTATIONS ============

/**
 * Enqueue a new job
 * 
 * Creates a job record with status "pending" and attempts = 0.
 * The job will be picked up by the external worker.
 * 
 * @param workspaceId - Workspace ID
 * @param type - Job type
 * @param payload - Job-specific payload
 * @returns Job ID
 * 
 * @example
 * ```typescript
 * const jobId = await ctx.runMutation(api.platform.jobs.enqueueJob, {
 *   workspaceId,
 *   type: "preview_generation",
 *   payload: { trackId, fullStorageId },
 * });
 * ```
 */
export const enqueueJob = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    payload: v.any(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    const jobId = await ctx.db.insert("jobs", {
      workspaceId: args.workspaceId,
      type: args.type,
      status: "pending",
      payload: args.payload,
      attempts: 0,
      createdAt: now,
      updatedAt: now,
    });

    return jobId;
  },
});

/**
 * Lock a job for processing
 * 
 * Atomically locks a job by setting lockedAt and lockedBy.
 * This prevents multiple workers from processing the same job.
 * 
 * @param jobId - Job ID
 * @param workerId - Worker identifier (e.g., hostname, process ID)
 * @returns True if lock was acquired, false if job is already locked
 * 
 * @example
 * ```typescript
 * const locked = await ctx.runMutation(api.platform.jobs.lockJob, {
 *   jobId,
 *   workerId: "worker-1",
 * });
 * ```
 */
export const lockJob = mutation({
  args: {
    jobId: v.id("jobs"),
    workerId: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    // Check if job is already locked by another worker
    const now = Date.now();
    if (job.lockedAt && job.lockedBy && job.lockedBy !== args.workerId) {
      // Check if lock is stale (older than timeout)
      if (now - job.lockedAt < JOB_LOCK_TIMEOUT_MS) {
        return false; // Job is locked by another worker
      }
      // Lock is stale, we can take it over
    }

    // Acquire lock
    await ctx.db.patch(args.jobId, {
      status: "processing",
      lockedAt: now,
      lockedBy: args.workerId,
      updatedAt: now,
    });

    return true;
  },
});

/**
 * Mark job as completed
 * 
 * Updates job status to "completed" and clears lock.
 * 
 * @param jobId - Job ID
 * 
 * @example
 * ```typescript
 * await ctx.runMutation(api.platform.jobs.completeJob, { jobId });
 * ```
 */
export const completeJob = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: "completed",
      lockedAt: undefined,
      lockedBy: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Mark job as failed
 * 
 * Updates job status to "failed", records error, increments attempts.
 * If attempts < MAX_JOB_ATTEMPTS, job can be retried.
 * 
 * @param jobId - Job ID
 * @param error - Error message
 * 
 * @example
 * ```typescript
 * await ctx.runMutation(api.platform.jobs.failJob, {
 *   jobId,
 *   error: "ffmpeg failed: invalid audio format",
 * });
 * ```
 */
export const failJob = mutation({
  args: {
    jobId: v.id("jobs"),
    error: v.string(),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: args.error,
      attempts: job.attempts + 1,
      lockedAt: undefined,
      lockedBy: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Retry a failed job
 * 
 * Resets job status to "pending" so it can be picked up by the worker again.
 * Only works if attempts < MAX_JOB_ATTEMPTS.
 * 
 * @param jobId - Job ID
 * @throws Error if job cannot be retried (too many attempts or not failed)
 * 
 * @example
 * ```typescript
 * await ctx.runMutation(api.platform.jobs.retryJob, { jobId });
 * ```
 */
export const retryJob = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status !== "failed") {
      throw new Error("Only failed jobs can be retried");
    }

    if (job.attempts >= MAX_JOB_ATTEMPTS) {
      throw new Error(
        `Job has reached maximum retry attempts (${MAX_JOB_ATTEMPTS})`
      );
    }

    await ctx.db.patch(args.jobId, {
      status: "pending",
      error: undefined,
      lockedAt: undefined,
      lockedBy: undefined,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Cancel a job
 * 
 * Marks job as failed with "canceled" error.
 * Used when user manually cancels a job.
 * 
 * @param jobId - Job ID
 * 
 * @example
 * ```typescript
 * await ctx.runMutation(api.platform.jobs.cancelJob, { jobId });
 * ```
 */
export const cancelJob = mutation({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    const job = await ctx.db.get(args.jobId);

    if (!job) {
      throw new Error("Job not found");
    }

    if (job.status === "completed") {
      throw new Error("Cannot cancel completed job");
    }

    await ctx.db.patch(args.jobId, {
      status: "failed",
      error: "Job canceled by user",
      lockedAt: undefined,
      lockedBy: undefined,
      updatedAt: Date.now(),
    });
  },
});

// ============ QUERIES ============

/**
 * Get next pending job for worker
 * 
 * Returns the oldest pending job (FIFO order).
 * Worker should call lockJob immediately after getting a job.
 * 
 * @param type - Optional job type filter
 * @returns Job or null if no pending jobs
 * 
 * @example
 * ```typescript
 * const job = await ctx.runQuery(api.platform.jobs.getNextPendingJob, {
 *   type: "preview_generation",
 * });
 * ```
 */
export const getNextPendingJob = query({
  args: {
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const jobsQuery = ctx.db
      .query("jobs")
      .withIndex("by_status_createdAt", (q) => q.eq("status", "pending"));

    const jobs = await jobsQuery.collect();

    // Filter by type if specified
    const filteredJobs = args.type
      ? jobs.filter((job) => job.type === args.type)
      : jobs;

    // Return oldest job (FIFO)
    return filteredJobs.length > 0 ? filteredJobs[0] : null;
  },
});

/**
 * Get job by ID
 * 
 * @param jobId - Job ID
 * @returns Job or null if not found
 */
export const getJob = query({
  args: {
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.jobId);
  },
});

/**
 * Get jobs for a workspace
 * 
 * @param workspaceId - Workspace ID
 * @param status - Optional status filter
 * @param type - Optional type filter
 * @returns Array of jobs
 * 
 * @example
 * ```typescript
 * // Get all failed jobs for a workspace
 * const failedJobs = await ctx.runQuery(api.platform.jobs.getJobsByWorkspace, {
 *   workspaceId,
 *   status: "failed",
 * });
 * ```
 */
export const getJobsByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("processing"),
        v.literal("completed"),
        v.literal("failed")
      )
    ),
    type: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const jobsQuery = ctx.db
      .query("jobs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    const jobs = await jobsQuery.collect();

    // Filter by status if specified
    let filteredJobs = args.status
      ? jobs.filter((job) => job.status === args.status)
      : jobs;

    // Filter by type if specified
    filteredJobs = args.type
      ? filteredJobs.filter((job) => job.type === args.type)
      : filteredJobs;

    // Sort by createdAt descending (newest first)
    return filteredJobs.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get job statistics for a workspace
 * 
 * Returns counts by status for monitoring and UI display.
 * 
 * @param workspaceId - Workspace ID
 * @returns Job statistics
 * 
 * @example
 * ```typescript
 * const stats = await ctx.runQuery(api.platform.jobs.getJobStats, {
 *   workspaceId,
 * });
 * // { pending: 2, processing: 1, completed: 10, failed: 1 }
 * ```
 */
export const getJobStats = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const stats = {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0,
    };

    for (const job of jobs) {
      stats[job.status]++;
    }

    return stats;
  },
});

/**
 * Get stale jobs (locked but not updated recently)
 * 
 * Returns jobs that are locked but haven't been updated in JOB_LOCK_TIMEOUT_MS.
 * These jobs may have been abandoned by crashed workers.
 * 
 * @returns Array of stale jobs
 */
export const getStaleJobs = query({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const jobs = await ctx.db
      .query("jobs")
      .withIndex("by_status", (q) => q.eq("status", "processing"))
      .collect();

    return jobs.filter(
      (job) =>
        job.lockedAt && now - job.lockedAt > JOB_LOCK_TIMEOUT_MS
    );
  },
});

// ============ HELPER FUNCTIONS ============

/**
 * Check if job can be retried
 * 
 * @param job - Job record
 * @returns True if job can be retried
 */
export function canRetryJob(job: {
  status: JobStatus;
  attempts: number;
}): boolean {
  return job.status === "failed" && job.attempts < MAX_JOB_ATTEMPTS;
}

/**
 * Get job type display name
 * 
 * @param type - Job type
 * @returns Human-readable job type name
 */
export function getJobTypeDisplayName(type: string): string {
  const displayNames: Record<string, string> = {
    preview_generation: "Preview Generation",
    license_pdf_generation: "License PDF Generation",
    waveform_generation: "Waveform Generation",
    loudness_analysis: "Loudness Analysis",
  };

  return displayNames[type] || type;
}

/**
 * Get job status display name
 * 
 * @param status - Job status
 * @returns Human-readable status name
 */
export function getJobStatusDisplayName(status: JobStatus): string {
  const displayNames: Record<JobStatus, string> = {
    pending: "Pending",
    processing: "Processing",
    completed: "Completed",
    failed: "Failed",
  };

  return displayNames[status];
}
