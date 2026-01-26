// Example usage of observability helpers
// This file demonstrates how to use auditLogs and events in your mutations

import { v } from "convex/values";
import { mutation } from "../_generated/server";
import { logAuditHelper } from "./auditLogs";
import { recordEventHelper } from "./events";

/**
 * Example: Track publish mutation with audit logging
 * 
 * This shows how to integrate audit logging into your business logic
 */
export const examplePublishTrack = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    trackId: v.id("tracks"),
    actorClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Perform the business logic
    const track = await ctx.db.get(args.trackId);
    if (!track) {
      throw new Error("Track not found");
    }

    await ctx.db.patch(args.trackId, {
      status: "published" as const,
    });

    // 2. Log the audit trail
    // Requirements: 9.1, 9.2 - Log provider admin actions
    await logAuditHelper(ctx, {
      workspaceId: args.workspaceId,
      actorClerkUserId: args.actorClerkUserId,
      action: "track_publish",
      entityType: "track",
      entityId: args.trackId,
      meta: {
        title: track.title,
        previousStatus: track.status,
      },
    });

    return { success: true };
  },
});

/**
 * Example: Checkout success with event recording
 * 
 * This shows how to record lifecycle events
 */
export const exampleCheckoutSuccess = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    orderId: v.id("orders"),
    amountCents: v.number(),
  },
  handler: async (ctx, args) => {
    // 1. Perform the business logic
    await ctx.db.patch(args.orderId, {
      status: "completed" as const,
    });

    // 2. Record the lifecycle event
    // Requirements: 9.3, 9.4 - Record lifecycle events
    await recordEventHelper(ctx, {
      workspaceId: args.workspaceId,
      type: "checkout_success",
      meta: {
        orderId: args.orderId,
        amountCents: args.amountCents,
      },
    });

    return { success: true };
  },
});

/**
 * Example: Preview generation with both audit and event
 * 
 * This shows how to use both audit logs and events together
 */
export const examplePreviewGeneration = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    trackId: v.id("tracks"),
    actorClerkUserId: v.string(),
    jobId: v.id("jobs"),
  },
  handler: async (ctx, args) => {
    // 1. Enqueue the preview generation job
    // (job logic would go here)

    // 2. Log the audit trail (admin action)
    await logAuditHelper(ctx, {
      workspaceId: args.workspaceId,
      actorClerkUserId: args.actorClerkUserId,
      action: "preview_generate",
      entityType: "job",
      entityId: args.jobId,
      meta: {
        trackId: args.trackId,
      },
    });

    // 3. When job completes successfully, record the event
    // (This would be called from the job worker)
    await recordEventHelper(ctx, {
      workspaceId: args.workspaceId,
      type: "preview_generated",
      meta: {
        trackId: args.trackId,
        jobId: args.jobId,
      },
    });

    return { success: true };
  },
});

/**
 * Example: Domain verification with error handling
 * 
 * This shows how to record both success and failure events
 */
export const exampleDomainVerification = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    domainId: v.id("domains"),
    actorClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    try {
      // 1. Perform domain verification
      const domain = await ctx.db.get(args.domainId);
      if (!domain) {
        throw new Error("Domain not found");
      }

      // Simulate verification logic
      const isVerified = true; // In real code, this would check DNS records

      if (isVerified) {
        await ctx.db.patch(args.domainId, {
          status: "verified" as const,
        });

        // 2. Log audit trail
        await logAuditHelper(ctx, {
          workspaceId: args.workspaceId,
          actorClerkUserId: args.actorClerkUserId,
          action: "domain_verify",
          entityType: "domain",
          entityId: args.domainId,
          meta: {
            hostname: domain.hostname,
          },
        });

        // 3. Record success event
        await recordEventHelper(ctx, {
          workspaceId: args.workspaceId,
          type: "domain_verified",
          meta: {
            domainId: args.domainId,
            hostname: domain.hostname,
          },
        });

        return { success: true };
      } else {
        throw new Error("Domain verification failed");
      }
    } catch (error) {
      // Record failure event
      await recordEventHelper(ctx, {
        workspaceId: args.workspaceId,
        type: "domain_verification_failed",
        meta: {
          domainId: args.domainId,
          error: error instanceof Error ? error.message : "Unknown error",
        },
      });

      throw error;
    }
  },
});
