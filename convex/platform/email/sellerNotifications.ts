/**
 * Seller-facing notifications.
 *
 * The retention half of the email system. A producer who sees "you earned $30,
 * we took $0" has a concrete reason to keep paying the subscription; one who
 * hears nothing after a sale has only the invoice. Before this module, sales
 * notified the buyer and nobody else.
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import {
  internalAction,
  internalQuery,
} from "../../_generated/server";
import { fetchClerkEmail, sendTransactionalEmail } from "./actions";
import { buildUnsubscribeUrl } from "./suppression";
import * as templates from "./templates";
import { resolveBrand } from "./theme";

/**
 * Commission a mainstream marketplace would have charged on the same sale.
 * Beatstars and Airbit free tiers sit between 10% and 30%; 15% is a defensible
 * midpoint and is always presented as a comparison, never as a real deduction.
 */
const COMPETITOR_COMMISSION_RATE = 0.15;

function fromAddress(brandName: string): string {
  const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
  return `${brandName} <${fromEmail}>`;
}

/** Owner identity plus whether this is their first completed sale. */
export const getSellerSaleContext = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) return null;

    const order = await ctx.db.get(args.orderId);
    if (!order) return null;

    const completedOrders = await ctx.db
      .query("orders")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();

    // "First sale" means this order is the earliest one recorded, so the flag
    // stays correct even if the email is retried later.
    const earlier = completedOrders.filter(
      (o) => o._id !== order._id && o.createdAt < order.createdAt
    );

    let itemTitle = order.itemType === "track" ? "Your track" : "Your service";
    if (order.itemType === "track") {
      const trackId = ctx.db.normalizeId("tracks", order.itemId);
      const track = trackId ? await ctx.db.get(trackId) : null;
      if (track) itemTitle = track.title;
    } else {
      const serviceId = ctx.db.normalizeId("services", order.itemId);
      const service = serviceId ? await ctx.db.get(serviceId) : null;
      if (service) itemTitle = service.title;
    }

    return {
      ownerClerkUserId: workspace.ownerClerkUserId,
      itemTitle,
      amountCents: order.amountCents,
      currency: order.currency,
      licenseTier: order.licenseTier ?? null,
      isFirstSale: earlier.length === 0,
    };
  },
});

/**
 * Notify the seller that they made a sale.
 *
 * Category is "transactional": this reports money moving into the seller's own
 * account, which they are entitled to be told about regardless of marketing
 * preferences. An unsubscribe link is still included.
 */
export const sendSaleAlert = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    orderId: v.id("orders"),
  },
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const context = await ctx.runQuery(
      internal.platform.email.sellerNotifications.getSellerSaleContext,
      { workspaceId: args.workspaceId, orderId: args.orderId }
    );
    if (!context) return { sent: false, reason: "context_missing" };

    const email = await fetchClerkEmail(context.ownerClerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const brand = resolveBrand();
    const unsubscribeUrl = await buildUnsubscribeUrl(email);
    const rendered = templates.saleAlert({
      brand,
      unsubscribeUrl,
      itemTitle: context.itemTitle,
      amountCents: context.amountCents,
      currency: context.currency,
      tierLabel: context.licenseTier
        ? `${context.licenseTier.charAt(0).toUpperCase()}${context.licenseTier.slice(1)} License`
        : undefined,
      isFirstSale: context.isFirstSale,
      dashboardUrl: `${brand.siteUrl}/studio/metrics`,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `order:${args.orderId}:seller_sale_alert`,
      emailType: context.isFirstSale ? "seller_first_sale" : "seller_sale_alert",
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "transactional",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "seller_sale_alert" },
        { name: "first_sale", value: String(context.isFirstSale) },
      ],
    });
  },
});

// ============================================================================
// Weekly digest
// ============================================================================

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/** Every workspace whose owner should receive a digest this week. */
export const listDigestRecipients = internalQuery({
  args: {},
  handler: async (ctx) => {
    const subscriptions = await ctx.db
      .query("providerSubscriptions")
      .collect();

    return subscriptions
      .filter((s) => s.status === "active")
      .map((s) => ({ workspaceId: s.workspaceId, clerkUserId: s.clerkUserId }));
  },
});

export const getWeeklyStats = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const since = Date.now() - WEEK_MS;

    const orders = await ctx.db
      .query("orders")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const recentOrders = orders.filter((o) => o.createdAt >= since);

    const views = await ctx.db
      .query("trackViews")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    const recentViews = views.filter((v) => v.createdAt >= since);

    const revenueCents = recentOrders.reduce((sum, o) => sum + o.amountCents, 0);

    return {
      salesCount: recentOrders.length,
      revenueCents,
      currency: recentOrders[0]?.currency ?? "usd",
      viewsCount: recentViews.length,
      commissionSavedCents: Math.round(revenueCents * COMPETITOR_COMMISSION_RATE),
    };
  },
});

export const sendWeeklyDigest = internalAction({
  args: { workspaceId: v.id("workspaces"), clerkUserId: v.string() },
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const stats = await ctx.runQuery(
      internal.platform.email.sellerNotifications.getWeeklyStats,
      { workspaceId: args.workspaceId }
    );

    // A digest reporting zero of everything is noise that trains people to
    // ignore the sender. Stay silent when there is genuinely nothing to say.
    if (stats.salesCount === 0 && stats.viewsCount === 0) {
      return { sent: false, reason: "no_activity" };
    }

    const email = await fetchClerkEmail(args.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const brand = resolveBrand();
    const unsubscribeUrl = await buildUnsubscribeUrl(email);
    const rendered = templates.weeklyDigest({
      brand,
      unsubscribeUrl,
      salesCount: stats.salesCount,
      revenueCents: stats.revenueCents,
      currency: stats.currency,
      viewsCount: stats.viewsCount,
      commissionSavedCents: stats.commissionSavedCents,
      dashboardUrl: `${brand.siteUrl}/studio/metrics`,
    });

    // Week-stamped dedupe key: one digest per workspace per week, and a retry
    // within the same week never double-sends.
    const weekStamp = Math.floor(Date.now() / WEEK_MS);

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `digest:${args.workspaceId}:${weekStamp}`,
      emailType: "weekly_digest",
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [{ name: "type", value: "weekly_digest" }],
    });
  },
});

/** Cron entry point — fans out one digest action per active workspace. */
export const dispatchWeeklyDigests = internalAction({
  args: {},
  handler: async (ctx): Promise<{ dispatched: number }> => {
    const recipients = await ctx.runQuery(
      internal.platform.email.sellerNotifications.listDigestRecipients,
      {}
    );

    for (const recipient of recipients) {
      // Failures are isolated per recipient so one bad address cannot abort the
      // whole run.
      try {
        await ctx.runAction(
          internal.platform.email.sellerNotifications.sendWeeklyDigest,
          recipient
        );
      } catch (error) {
        console.error(
          "Weekly digest failed for workspace",
          recipient.workspaceId,
          error
        );
      }
    }

    return { dispatched: recipients.length };
  },
});
