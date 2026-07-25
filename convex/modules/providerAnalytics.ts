/**
 * Workspace-scoped provider analytics.
 *
 * BASIC receives the essential sales dashboard. PRO receives advanced
 * conversion, acquisition-source and top-track breakdowns.
 */

import { query } from "../_generated/server";

export const getMyAnalytics = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", identity.subject))
      .first();
    if (!workspace) return null;

    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();
    if (!subscription || subscription.status !== "active") {
      return {
        workspace: { name: workspace.name, slug: workspace.slug },
        planKey: null,
        basic: null,
        advanced: null,
      };
    }

    const [orders, views, tracks] = await Promise.all([
      ctx.db
        .query("orders")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .take(500),
      ctx.db
        .query("trackViews")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .take(1000),
      ctx.db
        .query("tracks")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .take(250),
    ]);

    const completedOrders = orders.filter((order) => order.status === "completed");
    const revenueCents = completedOrders.reduce(
      (sum, order) => sum + order.amountCents,
      0
    );
    const uniqueVisitors = new Set(
      views.map((view) => view.clerkUserId ?? view.sessionId).filter(Boolean)
    ).size;

    const basic = {
      storefrontViews: views.length,
      uniqueVisitors,
      completedSales: completedOrders.length,
      revenueCents,
      publishedTracks: tracks.filter((track) => track.status === "published").length,
    };

    if (subscription.planKey !== "pro") {
      return {
        workspace: { name: workspace.name, slug: workspace.slug },
        planKey: subscription.planKey,
        basic,
        advanced: null,
      };
    }

    const trackTitleById = new Map(
      tracks.map((track) => [track._id.toString(), track.title])
    );
    const salesByTrack = new Map<string, { sales: number; revenueCents: number }>();
    for (const order of completedOrders) {
      if (order.itemType !== "track") continue;
      const current = salesByTrack.get(order.itemId) ?? {
        sales: 0,
        revenueCents: 0,
      };
      current.sales += 1;
      current.revenueCents += order.amountCents;
      salesByTrack.set(order.itemId, current);
    }

    const viewsBySource = new Map<string, number>();
    for (const view of views) {
      const source = view.source || "direct";
      viewsBySource.set(source, (viewsBySource.get(source) ?? 0) + 1);
    }

    return {
      workspace: { name: workspace.name, slug: workspace.slug },
      planKey: subscription.planKey,
      basic,
      advanced: {
        conversionRate:
          views.length > 0 ? completedOrders.length / views.length : 0,
        averageOrderCents:
          completedOrders.length > 0
            ? Math.round(revenueCents / completedOrders.length)
            : 0,
        viewsBySource: Array.from(viewsBySource.entries())
          .map(([source, count]) => ({ source, count }))
          .sort((a, b) => b.count - a.count),
        topTracks: Array.from(salesByTrack.entries())
          .map(([trackId, value]) => ({
            trackId,
            title: trackTitleById.get(trackId) ?? "Unknown track",
            ...value,
          }))
          .sort((a, b) => b.revenueCents - a.revenueCents)
          .slice(0, 5),
      },
    };
  },
});
