/**
 * Services Module - Service Listings and Booking
 *
 * Handles service creation, management, and booking.
 *
 * Requirements: 16.1, 16.2, 16.3, 16.4
 */

import { v } from "convex/values";
import { internalQuery, mutation, query } from "../_generated/server";
import { logAuditHelper } from "../platform/auditLogs";
import { assertActiveSubscription } from "../platform/entitlements";
import { markFirstOfferPublished } from "./growth";

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

type ServiceUpdateFields = {
  title?: string;
  description?: string;
  priceUSD?: number;
  priceEUR?: number;
  turnaround?: string;
  features?: string[];
  isActive?: boolean;
};

// Individual field validators — each is a single-responsibility function,
// keeping buildServicePatch's cognitive complexity within the allowed limit.
function validateTitle(v: string | undefined): string | undefined {
  if (v === undefined) return undefined;
  if (!v.trim()) throw new Error("Service title cannot be empty");
  return v;
}

function validateDescription(v: string | undefined): string | undefined {
  if (v === undefined) return undefined;
  if (!v.trim()) throw new Error("Service description cannot be empty");
  return v;
}

function validatePriceUSD(v: number | undefined): number | undefined {
  if (v === undefined) return undefined;
  if (v <= 0) throw new Error("Price must be greater than 0");
  return v;
}

function validatePriceEUR(v: number | undefined): number | undefined {
  if (v === undefined) return undefined;
  if (v <= 0) throw new Error("EUR price must be greater than 0");
  return v;
}

function validateTurnaround(v: string | undefined): string | undefined {
  if (v === undefined) return undefined;
  if (!v.trim()) throw new Error("Turnaround time cannot be empty");
  return v;
}

function validateFeatures(v: string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined;
  if (v.length === 0) throw new Error("At least one feature is required");
  return v;
}

/**
 * Validates optional update fields and returns a clean patch object.
 * Extracted to keep updateService handler below SonarQube cognitive complexity limit (S3776).
 */
function buildServicePatch(fields: ServiceUpdateFields): Record<string, unknown> {
  const patch: Record<string, unknown> = {};

  const title = validateTitle(fields.title);
  if (title !== undefined) patch.title = title;

  const description = validateDescription(fields.description);
  if (description !== undefined) patch.description = description;

  const priceUSD = validatePriceUSD(fields.priceUSD);
  if (priceUSD !== undefined) patch.priceUSD = priceUSD;

  const priceEUR = validatePriceEUR(fields.priceEUR);
  if (priceEUR !== undefined) patch.priceEUR = priceEUR;

  const turnaround = validateTurnaround(fields.turnaround);
  if (turnaround !== undefined) patch.turnaround = turnaround;

  const features = validateFeatures(fields.features);
  if (features !== undefined) patch.features = features;

  if (fields.isActive !== undefined) patch.isActive = fields.isActive;

  return patch;
}

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create service
 *
 * Creates a new service listing for a workspace.
 * Requires active subscription.
 * Creates audit log for service_create action.
 *
 * Requirements: 16.1, 16.2, 9.1
 */
export const createService = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    priceUSD: v.number(),
    priceEUR: v.optional(v.number()),
    turnaround: v.string(),
    features: v.array(v.string()),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerClerkUserId !== identity.subject)
      throw new Error("Access denied. You are not the owner of this workspace.");

    await assertActiveSubscription(ctx, args.workspaceId);

    if (!args.title.trim()) throw new Error("Service title is required");
    if (!args.description.trim()) throw new Error("Service description is required");
    if (args.priceUSD <= 0) throw new Error("Price must be greater than 0");
    if (args.priceEUR !== undefined && args.priceEUR <= 0)
      throw new Error("EUR price must be greater than 0");
    if (!args.turnaround.trim()) throw new Error("Turnaround time is required");
    if (args.features.length === 0) throw new Error("At least one feature is required");

    const serviceId = await ctx.db.insert("services", {
      workspaceId: args.workspaceId,
      title: args.title,
      description: args.description,
      priceUSD: args.priceUSD,
      priceEUR: args.priceEUR,
      turnaround: args.turnaround,
      features: args.features,
      isActive: args.isActive,
      createdAt: Date.now(),
    });

    await logAuditHelper(ctx, {
      workspaceId: args.workspaceId,
      actorClerkUserId: identity.subject,
      action: "service_create",
      entityType: "service",
      entityId: serviceId,
      meta: { title: args.title, priceUSD: args.priceUSD, isActive: args.isActive },
    });

    // Funnel measurement: a service created already-active is a published offer.
    if (args.isActive) {
      await markFirstOfferPublished(ctx, args.workspaceId);
    }

    return serviceId;
  },
});

/**
 * Update service
 *
 * Updates an existing service listing.
 * Allows updating all fields except workspaceId and createdAt.
 * Creates audit log for service_update action.
 *
 * Requirements: 16.1, 16.2, 9.1
 */
export const updateService = mutation({
  args: {
    serviceId: v.id("services"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    priceUSD: v.optional(v.number()),
    priceEUR: v.optional(v.number()),
    turnaround: v.optional(v.string()),
    features: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const workspace = await ctx.db.get(service.workspaceId);
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerClerkUserId !== identity.subject)
      throw new Error("Access denied. You are not the owner of this workspace.");

    await assertActiveSubscription(ctx, service.workspaceId);

    // Validation + patch building extracted to keep cognitive complexity ≤ 15
    const patch = buildServicePatch(args);

    await ctx.db.patch(args.serviceId, patch);

    await logAuditHelper(ctx, {
      workspaceId: service.workspaceId,
      actorClerkUserId: identity.subject,
      action: "service_update",
      entityType: "service",
      entityId: args.serviceId,
      meta: patch,
    });

    return args.serviceId;
  },
});

/**
 * Toggle service active status
 *
 * Flips isActive. Active services appear on the storefront.
 * Creates audit log for service_update action.
 *
 * Requirements: 16.1, 16.2, 9.1
 */
export const toggleServiceActive = mutation({
  args: {
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const workspace = await ctx.db.get(service.workspaceId);
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerClerkUserId !== identity.subject)
      throw new Error("Access denied. You are not the owner of this workspace.");

    await assertActiveSubscription(ctx, service.workspaceId);

    const newStatus = !service.isActive;
    await ctx.db.patch(args.serviceId, { isActive: newStatus });

    await logAuditHelper(ctx, {
      workspaceId: service.workspaceId,
      actorClerkUserId: identity.subject,
      action: "service_update",
      entityType: "service",
      entityId: args.serviceId,
      meta: {
        title: service.title,
        previousStatus: service.isActive,
        newStatus,
        action: newStatus ? "activated" : "deactivated",
      },
    });

    // Funnel measurement: activating a service is publishing an offer.
    if (newStatus) {
      await markFirstOfferPublished(ctx, service.workspaceId);
    }

    return { success: true, isActive: newStatus };
  },
});

/**
 * Delete service
 *
 * Deletes a service listing.
 * Creates audit log for service_delete action.
 *
 * Requirements: 16.1, 9.1
 */
export const deleteService = mutation({
  args: {
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const service = await ctx.db.get(args.serviceId);
    if (!service) throw new Error("Service not found");

    const workspace = await ctx.db.get(service.workspaceId);
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerClerkUserId !== identity.subject)
      throw new Error("Access denied. You are not the owner of this workspace.");

    await assertActiveSubscription(ctx, service.workspaceId);

    await ctx.db.delete(args.serviceId);

    await logAuditHelper(ctx, {
      workspaceId: service.workspaceId,
      actorClerkUserId: identity.subject,
      action: "service_delete",
      entityType: "service",
      entityId: args.serviceId,
      meta: { title: service.title, priceUSD: service.priceUSD, isActive: service.isActive },
    });

    return { success: true };
  },
});

// ============================================================================
// QUERIES
// ============================================================================

/** Get service by ID. Requirements: 16.2 */
export const getService = query({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => ctx.db.get(args.serviceId),
});

/** Internal query to get a service by ID for use in HTTP actions. Requirements: 30.3 */
export const getServiceById = internalQuery({
  args: { serviceId: v.id("services") },
  handler: async (ctx, args) => ctx.db.get(args.serviceId),
});

/** 
 * Get all active services for a workspace (storefront public query).
 * - Scoped by workspaceId: never returns services from other workspaces (Req 28.5)
 * - Filtered by isActive=true: inactive services are never exposed to public (Req 28.1)
 * Uses the by_workspace_active compound index for efficient filtering.
 * Requirements: 16.2, 28.1, 28.5
 */
export const getActiveServices = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) =>
    ctx.db
      .query("services")
      .withIndex("by_workspace_active", (q) =>
        q.eq("workspaceId", args.workspaceId).eq("isActive", true)
      )
      .collect(),
});

/** Get all services for a workspace (including inactive). Requirements: 16.1 */
export const getServicesByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) =>
    ctx.db
      .query("services")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect(),
});

// ============================================================================
// BOOKING MUTATIONS
// ============================================================================

/**
 * Update booking status
 *
 * Allows providers to transition booking status:
 * pending → confirmed → completed | canceled
 *
 * Requirements: 16.3, 16.4
 */
export const updateBookingStatus = mutation({
  args: {
    bookingId: v.id("bookings"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("canceled")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const booking = await ctx.db.get(args.bookingId);
    if (!booking) throw new Error("Booking not found");

    // Verify caller owns the workspace this booking belongs to
    const workspace = await ctx.db.get(booking.workspaceId);
    if (!workspace) throw new Error("Workspace not found");
    if (workspace.ownerClerkUserId !== identity.subject)
      throw new Error("Access denied. You are not the owner of this workspace.");

    await ctx.db.patch(args.bookingId, { status: args.status });

    return { success: true, bookingId: args.bookingId, status: args.status };
  },
});

// ============================================================================
// BOOKING QUERIES (Provider side)
// ============================================================================

/**
 * Get all bookings for a workspace (provider view)
 * Returns bookings with buyer and service details.
 * Requirements: 16.3, 16.4
 */
export const getBookingsByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const service = await ctx.db.get(booking.serviceId);
        return {
          bookingId: booking._id,
          serviceId: booking.serviceId,
          serviceTitle: service?.title ?? "Deleted service",
          buyerClerkUserId: booking.buyerClerkUserId,
          status: booking.status,
          createdAt: booking.createdAt,
        };
      })
    );

    return bookingsWithDetails.sort((a, b) => b.createdAt - a.createdAt);
  },
});

/**
 * Get a single service by ID (storefront public query)
 *
 * Returns service data for the detail page.
 * - Only returns active services — inactive services are never exposed (Req 28.1)
 * - Scoped by workspaceId to prevent cross-tenant data leaks (Req 28.5)
 *
 * Requirements: 21.5, 28.1, 28.5
 */
export const getActiveService = query({
  args: {
    serviceId: v.id("services"),
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);

    // Enforce: only active services visible to public users (Req 28.1)
    if (!service || !service.isActive) return null;

    // Enforce: scope by workspaceId — never mix tenants (Req 28.5)
    if (service.workspaceId !== args.workspaceId) return null;

    return service;
  },
});
