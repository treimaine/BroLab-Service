// Convex mutations for Orders, Purchase Entitlements, and Bookings
// Implements Requirement 14: Stripe Webhook Processing

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { internalMutation, internalQuery, query } from "../_generated/server";
import { createLicenseSnapshot } from "../../shared/licenses";

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
    stripePaymentIntentId: v.optional(v.string()),
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
      stripePaymentIntentId: args.stripePaymentIntentId,
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
 * Revalidates Stripe fulfillment data against the live catalog.
 *
 * Metadata on a Stripe object is not an authorization boundary. This query
 * ensures the paid item belongs to the connected workspace, is still for sale,
 * and was paid at the server-owned catalog price before any entitlement exists.
 */
export const validateTrackFulfillment = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    trackId: v.id("tracks"),
    licenseTier: v.union(
      v.literal("basic"),
      v.literal("premium"),
      v.literal("unlimited")
    ),
  },
  handler: async (ctx, args) => {
    const [workspace, track] = await Promise.all([
      ctx.db.get(args.workspaceId),
      ctx.db.get(args.trackId),
    ]);

    if (
      !workspace ||
      !workspace.stripeAccountId ||
      workspace.paymentsStatus !== "active" ||
      !track ||
      track.workspaceId !== args.workspaceId
    ) {
      return null;
    }

    return {
      stripeAccountId: workspace.stripeAccountId,
    };
  },
});

export const validateServiceFulfillment = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const [workspace, service] = await Promise.all([
      ctx.db.get(args.workspaceId),
      ctx.db.get(args.serviceId),
    ]);

    if (
      !workspace ||
      !workspace.stripeAccountId ||
      workspace.paymentsStatus !== "active" ||
      !service ||
      service.workspaceId !== args.workspaceId
    ) {
      return null;
    }

    return {
      stripeAccountId: workspace.stripeAccountId,
    };
  },
});

/**
 * A fully refunded digital purchase no longer grants download rights.
 * The entitlement row remains for auditability; access checks use the
 * associated license status and deny revoked licenses.
 */
export const markOrderRefundedByPaymentIntent = internalMutation({
  args: {
    stripePaymentIntentId: v.string(),
  },
  handler: async (ctx, args) => {
    const order = await ctx.db
      .query("orders")
      .withIndex("by_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .unique();

    if (!order) return null;
    if (order.status !== "refunded") {
      await ctx.db.patch(order._id, { status: "refunded" });
    }

    if (order.itemType === "track") {
      const license = await ctx.db
        .query("licenses")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .unique();
      if (license && license.status !== "revoked") {
        await ctx.db.patch(license._id, { status: "revoked" });
      }
    }

    return { orderId: order._id, itemType: order.itemType };
  },
});

/**
 * Create a purchase entitlement for a track
 * Called after order creation for track purchases
 * Requirements: 13.5, 14.5, 29.3, 29.4, 29.5
 */
export const createPurchaseEntitlement = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    buyerEmail: v.optional(v.string()),
    trackId: v.id("tracks"),
    orderId: v.id("orders"),
    licenseTier: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
  },
  handler: async (ctx, args) => {
    // A Stripe session/order creates exactly one license, while the same buyer
    // can legitimately purchase the same track again or upgrade its tier.
    const existingLicense = await ctx.db
      .query("licenses")
      .withIndex("by_order", (q) => q.eq("orderId", args.orderId))
      .first();

    if (existingLicense) {
      return existingLicense.entitlementId;
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) throw new Error("Workspace not found");

    const licenseTerms = createLicenseSnapshot(args.licenseTier, workspace.name);

    // Create entitlement
    const entitlementId = await ctx.db.insert("purchaseEntitlements", {
      workspaceId: args.workspaceId,
      orderId: args.orderId,
      buyerClerkUserId: args.buyerClerkUserId,
      trackId: args.trackId,
      licenseTier: args.licenseTier,
      licenseTermsVersion: licenseTerms.termsVersion,
      licenseTermsSnapshot: licenseTerms,
      createdAt: Date.now(),
    });

    // Requirement 29.4: Create licenses table record with full snapshot
    const licenseId = await ctx.db.insert("licenses", {
      workspaceId: args.workspaceId,
      orderId: args.orderId,
      buyerClerkUserId: args.buyerClerkUserId,
      buyerEmail: args.buyerEmail,
      trackId: args.trackId,
      entitlementId,
      termsVersion: licenseTerms.termsVersion,
      tierKey: args.licenseTier,
      includesStems: licenseTerms.includesStems,
      rightsSnapshot: licenseTerms.rights,
      prohibitedUsesSnapshot: licenseTerms.prohibitedUses,
      creditLineSnapshot: licenseTerms.creditLineTemplate,
      publishingEnabled: true,
      licensorWriterSharePercent: licenseTerms.publishingSplit.licensorWriterSharePercent,
      licenseeWriterSharePercent: licenseTerms.publishingSplit.licenseeWriterSharePercent,
      licensorPublisherSharePercent: licenseTerms.publishingSplit.licensorPublisherSharePercent,
      licenseePublisherSharePercent: licenseTerms.publishingSplit.licenseePublisherSharePercent,
      status: "pending",
      createdAt: Date.now(),
    });

    // Requirement 29.4: Create licenseDocuments record (status: pending)
    const documentId = await ctx.db.insert("licenseDocuments", {
      workspaceId: args.workspaceId,
      licenseId,
      kind: "license_pdf",
      status: "pending",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Requirement 29.5: Enqueue license_pdf_generation job
    await ctx.db.insert("jobs", {
      workspaceId: args.workspaceId,
      type: "license_pdf_generation",
      status: "pending",
      payload: {
        licenseId,
        documentId,
        workspaceId: args.workspaceId,
      },
      attempts: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
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

/**
 * Get checkout session purchase details for success page rendering.
 * Server-only query used by the Next.js API route.
 */
export const getMySessionPurchaseData = query({
  args: {
    stripeSessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return null;

    const order = await ctx.db
      .query("orders")
      .withIndex("by_stripe_session", (q) => q.eq("stripeSessionId", args.stripeSessionId))
      .first();

    if (!order || order.buyerClerkUserId !== identity.subject) {
      return null;
    }

    const workspace = await ctx.db.get(order.workspaceId);
    const producerName = workspace?.name ?? "Unknown Producer";

    if (order.itemType === "track") {
      const track = await ctx.db.get(order.itemId as Id<"tracks">);
      if (!track) return null;

      const license = await ctx.db
        .query("licenses")
        .withIndex("by_order", (q) => q.eq("orderId", order._id))
        .first();
      const entitlement = license ? await ctx.db.get(license.entitlementId) : null;
      const licenseDocument = license
        ? await ctx.db
            .query("licenseDocuments")
            .withIndex("by_license", (q) => q.eq("licenseId", license._id))
            .first()
        : null;
      const isRevoked = license?.status === "revoked" || order.status === "refunded";

      const downloadUrl = !isRevoked && track.fullStorageId
        ? await ctx.storage.getUrl(track.fullStorageId)
        : null;
      const licenseUrl = !isRevoked && entitlement?.licensePdfStorageId
        ? await ctx.storage.getUrl(entitlement.licensePdfStorageId)
        : null;

      return {
        orderId: order._id,
        stripeSessionId: order.stripeSessionId,
        itemType: "track" as const,
        itemTitle: track.title,
        producerName,
        licenseType: order.licenseTier ?? null,
        amountCents: order.amountCents,
        currency: order.currency,
        downloadUrl,
        licenseUrl,
        licenseStatus: licenseDocument?.status ?? "pending",
        buyerEmail: order.buyerEmail,
        paidAt: order.createdAt,
      };
    }

    const service = await ctx.db.get(order.itemId as Id<"services">);
    if (!service) return null;

    return {
      orderId: order._id,
      stripeSessionId: order.stripeSessionId,
      itemType: "service" as const,
      itemTitle: service.title,
      producerName,
      licenseType: null,
      amountCents: order.amountCents,
      currency: order.currency,
      downloadUrl: null,
      licenseUrl: null,
      licenseStatus: null,
      buyerEmail: order.buyerEmail,
      paidAt: order.createdAt,
    };
  },
});
