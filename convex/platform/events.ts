// Platform Core: Events
// Records lifecycle events for observability
// Requirements: 9.3, 9.4

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

// ============ TYPES ============

/**
 * Lifecycle events that should be recorded
 * Requirements: 9.3 - checkout success, preview generated, domain verified, payments connected
 */
export type EventType =
  | "checkout_success"
  | "checkout_failed"
  | "preview_generated"
  | "preview_failed"
  | "domain_verified"
  | "domain_verification_failed"
  | "payments_connected"
  | "payments_disconnected"
  | "workspace_created"
  | "subscription_activated"
  | "subscription_canceled"
  | "license_pdf_generated"
  | "license_pdf_failed";

// ============ MUTATIONS ============

/**
 * Record a lifecycle event
 * Requirements: 9.3, 9.4
 * 
 * @param workspaceId - The workspace where the event occurred
 * @param type - The event type
 * @param meta - Event metadata (optional)
 */
export const recordEvent = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    meta: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    const eventId = await ctx.db.insert("events", {
      workspaceId: args.workspaceId,
      type: args.type,
      meta: args.meta ?? {},
      createdAt: Date.now(),
    });

    return eventId;
  },
});

// ============ QUERIES ============

/**
 * Get events for a workspace
 * Paginated query for admin dashboard
 */
export const getEvents = query({
  args: {
    workspaceId: v.id("workspaces"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const events = await ctx.db
      .query("events")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Get events by type
 * Useful for filtering specific event types (e.g., all checkout_success events)
 */
export const getEventsByType = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 50;

    const events = await ctx.db
      .query("events")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Get recent events across all workspaces
 * Admin-only query for platform monitoring
 */
export const getRecentEvents = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;

    const events = await ctx.db
      .query("events")
      .order("desc")
      .take(limit);

    return events;
  },
});

/**
 * Count events by type for a workspace
 * Useful for analytics and monitoring
 */
export const countEventsByType = query({
  args: {
    workspaceId: v.id("workspaces"),
    type: v.string(),
  },
  handler: async (ctx, args) => {
    const events = await ctx.db
      .query("events")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) => q.eq(q.field("type"), args.type))
      .collect();

    return events.length;
  },
});

// ============ HELPERS ============

/**
 * Helper to record event from within other mutations
 * Can be called directly without going through the mutation API
 * 
 * Usage example:
 * ```typescript
 * await recordEventHelper(ctx, {
 *   workspaceId,
 *   type: "checkout_success",
 *   meta: {
 *     orderId,
 *     itemType: "track",
 *     amountCents: 2999
 *   }
 * });
 * ```
 */
export async function recordEventHelper(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  params: {
    workspaceId: Id<"workspaces">;
    type: EventType;
    meta?: Record<string, unknown>;
  }
): Promise<Id<"events">> {
  const eventId = await ctx.db.insert("events", {
    workspaceId: params.workspaceId,
    type: params.type,
    meta: params.meta ?? {},
    createdAt: Date.now(),
  });

  return eventId;
}

/**
 * Helper to record multiple events in batch
 * Useful for recording related events together
 */
export async function recordEventsBatch(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  events: Array<{
    workspaceId: Id<"workspaces">;
    type: EventType;
    meta?: Record<string, unknown>;
  }>
): Promise<Id<"events">[]> {
  const eventIds: Id<"events">[] = [];

  for (const event of events) {
    const eventId = await recordEventHelper(ctx, event);
    eventIds.push(eventId);
  }

  return eventIds;
}
