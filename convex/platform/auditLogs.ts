// Platform Core: Audit Logs
// Logs provider admin actions for observability
// Requirements: 9.1, 9.2

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

// ============ TYPES ============

/**
 * Provider admin actions that should be logged
 * Requirements: 9.1 - publish, upload, domain connect, service create, preview retry
 */
export type AuditAction =
  | "track_upload"
  | "track_publish"
  | "track_unpublish"
  | "track_delete"
  | "preview_generate"
  | "preview_retry"
  | "service_create"
  | "service_update"
  | "service_delete"
  | "domain_connect"
  | "domain_verify"
  | "domain_disconnect";

export type EntityType = "track" | "service" | "domain" | "job";

// ============ MUTATIONS ============

/**
 * Log a provider admin action
 * Requirements: 9.1, 9.2
 * 
 * @param workspaceId - The workspace where the action occurred
 * @param actorClerkUserId - The Clerk user ID of the actor
 * @param action - The action performed
 * @param entityType - The type of entity affected
 * @param entityId - The ID of the entity affected
 * @param meta - Additional metadata (optional)
 */
export const logAudit = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    actorClerkUserId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const auditLogId = await ctx.db.insert("auditLogs", {
      workspaceId: args.workspaceId,
      actorClerkUserId: args.actorClerkUserId,
      action: args.action,
      entityType: args.entityType,
      entityId: args.entityId,
      meta: args.meta ?? {},
      createdAt: Date.now(),
    });

    return auditLogId;
  },
});

// ============ QUERIES ============

/**
 * Get audit logs for a workspace
 * Paginated query for admin dashboard
 */
export const getAuditLogs = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(limit);

    return logs;
  },
});

/**
 * Get audit logs for a specific entity
 * Useful for tracking history of a specific track, service, or domain
 */
export const getAuditLogsByEntity = query({
  args: {
    workspaceId: v.id("workspaces"),
    entityType: v.string(),
    entityId: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 20;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) =>
        q.and(
          q.eq(q.field("entityType"), args.entityType),
          q.eq(q.field("entityId"), args.entityId)
        )
      )
      .order("desc")
      .take(limit);

    return logs;
  },
});

/**
 * Get audit logs by action type
 * Useful for filtering specific actions (e.g., all track_publish actions)
 */
export const getAuditLogsByAction = query({
  args: {
    workspaceId: v.id("workspaces"),
    action: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const logs = await ctx.db
      .query("auditLogs")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("action"), args.action))
      .order("desc")
      .take(limit);

    return logs;
  },
});

// ============ HELPERS ============

/**
 * Helper to log audit from within other mutations
 * Can be called directly without going through the mutation API
 * 
 * Usage example:
 * ```typescript
 * await logAuditHelper(ctx, {
 *   workspaceId,
 *   actorClerkUserId,
 *   action: "track_publish",
 *   entityType: "track",
 *   entityId: trackId,
 *   meta: { title: "My Beat" }
 * });
 * ```
 */
export async function logAuditHelper(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  params: {
    workspaceId: Id<"workspaces">;
    actorClerkUserId: string;
    action: AuditAction;
    entityType: EntityType;
    entityId: string;
    meta?: Record<string, unknown>;
  }
): Promise<Id<"auditLogs">> {
  const auditLogId = await ctx.db.insert("auditLogs", {
    workspaceId: params.workspaceId,
    actorClerkUserId: params.actorClerkUserId,
    action: params.action,
    entityType: params.entityType,
    entityId: params.entityId,
    meta: params.meta ?? {},
    createdAt: Date.now(),
  });

  return auditLogId;
}
