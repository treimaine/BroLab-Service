// Convex mutations for Orders, Purchase Entitlements, and Bookings
// Implements Requirement 14: Stripe Webhook Processing

import { v } from "convex/values";
import { internalMutation } from "../_generated/server";

/**
 * Create an order from Stripe checkout session
 * Called by Stripe webhook handler
 * Requirements: 13.4, 14.5
 */
export const createOrder = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    buyerEmail: v.optional(v.string()),
    stripeSessionId: v.string(),
    itemType: v.union(v.literal("track"), v.literal("service")),
    itemId: v.string(),
    currency: v.string(),
    amountCents: v.number(),
    licenseTier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited"))),
  },
  handler: async (ctx, args) => {
    // Check if order already exists for this session (idempotency)
    const existing = await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create order
    const orderId = await ctx.db.insert("orders", {
      workspaceId: args.workspaceId,
      buyerClerkUserId: args.buyerClerkUserId,
      buyerEmail: args.buyerEmail,
      stripeSessionId: args.stripeSessionId,
      itemType: args.itemType,
      itemId: args.itemId,
      currency: args.currency,
      amountCents: args.amountCents,
      licenseTier: args.licenseTier,
      status: "completed",
      createdAt: Date.now(),
    });

    return orderId;
  },
});

/**
 * Create a purchase entitlement for a track
 * Called after order creation for track purchases
 * Requirements: 13.5, 14.5
 */
export const createPurchaseEntitlement = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    trackId: v.id("tracks"),
    licenseTier: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
    licenseTermsVersion: v.string(),
    licenseTermsSnapshot: v.any(),
  },
  handler: async (ctx, args) => {
    // Check if entitlement already exists (idempotency)
    const existing = await ctx.db
      .query("purchaseEntitlements")
      .withIndex("by_buyer_track", (q) =>
        q.eq("buyerClerkUserId", args.buyerClerkUserId).eq("trackId", args.trackId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create entitlement
    const entitlementId = await ctx.db.insert("purchaseEntitlements", {
      workspaceId: args.workspaceId,
      buyerClerkUserId: args.buyerClerkUserId,
      trackId: args.trackId,
      licenseTier: args.licenseTier,
      licenseTermsVersion: args.licenseTermsVersion,
      licenseTermsSnapshot: args.licenseTermsSnapshot,
      createdAt: Date.now(),
    });

    return entitlementId;
  },
});

/**
 * Create a booking for a service
 * Called after order creation for service purchases
 * Requirements: 13.6, 14.5
 */
export const createBooking = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    // Check if booking already exists for this buyer and service (idempotency)
    const existing = await ctx.db
      .query("bookings")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .filter((q) =>
        q.and(
          q.eq(q.field("buyerClerkUserId"), args.buyerClerkUserId),
          q.eq(q.field("serviceId"), args.serviceId)
        )
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create booking
    const bookingId = await ctx.db.insert("bookings", {
      workspaceId: args.workspaceId,
      buyerClerkUserId: args.buyerClerkUserId,
      serviceId: args.serviceId,
      status: "pending",
      createdAt: Date.now(),
    });

    return bookingId;
  },
});

/**
 * Check if a Stripe event has already been processed
 * Requirements: 14.2, 14.3
 */
export const isEventProcessed = internalMutation({
  args: {
    provider: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("processedEvents")
      .withIndex("by_event", (q) => q.eq("provider", args.provider).eq("eventId", args.eventId))
      .first();

    return existing !== null;
  },
});

/**
 * Mark a Stripe event as processed
 * Requirements: 14.4
 */
export const markEventProcessed = internalMutation({
  args: {
    provider: v.string(),
    eventId: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if already exists (idempotency)
    const existing = await ctx.db
      .query("processedEvents")
      .withIndex("by_event", (q) => q.eq("provider", args.provider).eq("eventId", args.eventId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Mark as processed
    const id = await ctx.db.insert("processedEvents", {
      provider: args.provider,
      eventId: args.eventId,
      createdAt: Date.now(),
    });

    return id;
  },
});
