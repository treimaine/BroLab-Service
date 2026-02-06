/**
 * Artist Dashboard Queries
 * 
 * Queries for fetching artist's purchased tracks, bookings, and order history
 * Requirements: 20.1, 20.2, 20.3
 */

import { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";

/**
 * Get all purchased tracks for the current artist
 * Returns tracks with download links and license information
 * Requirements: 20.1
 */
export const getPurchasedTracks = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all purchase entitlements for this user
    const entitlements = await ctx.db
      .query("purchaseEntitlements")
      .withIndex("by_buyer", (q) => q.eq("buyerClerkUserId", identity.subject))
      .collect();

    // Fetch track details for each entitlement
    const purchasedTracks = await Promise.all(
      entitlements.map(async (entitlement) => {
        const track = await ctx.db.get(entitlement.trackId);
        if (!track) return null;

        const workspace = await ctx.db.get(entitlement.workspaceId);
        if (!workspace) return null;

        // Get download URL for full audio
        const fullAudioUrl = track.fullStorageId
          ? await ctx.storage.getUrl(track.fullStorageId)
          : null;

        // Get stems URL if included in license tier
        const stemsUrl =
          entitlement.licenseTier === "unlimited" && track.stemsStorageId
            ? await ctx.storage.getUrl(track.stemsStorageId)
            : null;

        // Get license PDF URL if generated
        const licensePdfUrl = entitlement.licensePdfStorageId
          ? await ctx.storage.getUrl(entitlement.licensePdfStorageId)
          : null;

        return {
          entitlementId: entitlement._id,
          trackId: track._id,
          title: track.title,
          bpm: track.bpm,
          key: track.key,
          licenseTier: entitlement.licenseTier,
          licenseTermsVersion: entitlement.licenseTermsVersion,
          purchasedAt: entitlement.createdAt,
          providerName: workspace.name,
          providerSlug: workspace.slug,
          fullAudioUrl,
          stemsUrl,
          licensePdfUrl,
        };
      })
    );

    // Filter out null entries and sort by purchase date (newest first)
    return purchasedTracks
      .filter((track): track is NonNullable<typeof track> => track !== null)
      .sort((a, b) => b.purchasedAt - a.purchasedAt);
  },
});

/**
 * Get all service bookings for the current artist
 * Returns bookings with service details and status
 * Requirements: 20.2
 */
export const getServiceBookings = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all bookings for this user
    const bookings = await ctx.db
      .query("bookings")
      .withIndex("by_buyer", (q) => q.eq("buyerClerkUserId", identity.subject))
      .collect();

    // Fetch service and workspace details for each booking
    const bookingsWithDetails = await Promise.all(
      bookings.map(async (booking) => {
        const service = await ctx.db.get(booking.serviceId);
        if (!service) return null;

        const workspace = await ctx.db.get(booking.workspaceId);
        if (!workspace) return null;

        return {
          bookingId: booking._id,
          serviceId: service._id,
          serviceTitle: service.title,
          serviceDescription: service.description,
          turnaround: service.turnaround,
          status: booking.status,
          bookedAt: booking.createdAt,
          providerName: workspace.name,
          providerSlug: workspace.slug,
        };
      })
    );

    // Filter out null entries and sort by booking date (newest first)
    return bookingsWithDetails
      .filter((booking): booking is NonNullable<typeof booking> => booking !== null)
      .sort((a, b) => b.bookedAt - a.bookedAt);
  },
});

/**
 * Get order history for the current artist
 * Returns all orders with item details
 * Requirements: 20.3
 */
export const getOrderHistory = query({
  args: {},
  handler: async (ctx) => {
    // Get authenticated user
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    // Get all orders for this user
    const orders = await ctx.db
      .query("orders")
      .withIndex("by_buyer", (q) => q.eq("buyerClerkUserId", identity.subject))
      .collect();

    // Fetch item details for each order
    const ordersWithDetails = await Promise.all(
      orders.map(async (order) => {
        const workspace = await ctx.db.get(order.workspaceId);
        if (!workspace) return null;

        let itemTitle = "Unknown Item";
        const itemType = order.itemType;

        // Fetch item details based on type
        if (order.itemType === "track") {
          const track = await ctx.db.get(order.itemId as Id<"tracks">);
          if (track) {
            itemTitle = track.title;
          }
        } else if (order.itemType === "service") {
          const service = await ctx.db.get(order.itemId as Id<"services">);
          if (service) {
            itemTitle = service.title;
          }
        }

        return {
          orderId: order._id,
          itemType,
          itemTitle,
          licenseTier: order.licenseTier,
          currency: order.currency,
          amountCents: order.amountCents,
          status: order.status,
          orderedAt: order.createdAt,
          providerName: workspace.name,
          providerSlug: workspace.slug,
        };
      })
    );

    // Filter out null entries and sort by order date (newest first)
    return ordersWithDetails
      .filter((order): order is NonNullable<typeof order> => order !== null)
      .sort((a, b) => b.orderedAt - a.orderedAt);
  },
});
