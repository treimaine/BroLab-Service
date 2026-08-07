/**
 * Analytics Module - Product Metrics Dashboard
 * 
 * Provides queries for the core metrics defined in the product metrics plan:
 * - Signup conversion rate
 * - Time-to-signup
 * - Time-to-first-upload
 * - Onboarding completion rate
 * - Checkout completion rate
 * - Revenue per user
 * - First transaction time
 */

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

// ============ TRACK VIEW TRACKING ============

export const trackView = mutation({
  args: {
    clerkUserId: v.optional(v.string()),
    trackId: v.id("tracks"),
    workspaceId: v.id("workspaces"),
    source: v.optional(v.string()),
    referrer: v.optional(v.string()),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("trackViews", {
      clerkUserId: args.clerkUserId,
      trackId: args.trackId,
      workspaceId: args.workspaceId,
      source: args.source,
      referrer: args.referrer,
      sessionId: args.sessionId,
      createdAt: Date.now(),
    });
  },
});

export const getTrackViewStats = query({
  args: { workspaceId: v.optional(v.id("workspaces")) },
  handler: async (ctx, args) => {
    let views;
    if (args.workspaceId) {
      views = await ctx.db
        .query("trackViews")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId!))
        .collect();
    } else {
      views = await ctx.db.query("trackViews").collect();
    }
    
    const bySource: Record<string, number> = {};
    const byTrack: Record<string, number> = {};
    const uniqueVisitors = new Set<string>();
    
    for (const view of views) {
      bySource[view.source || "direct"] = (bySource[view.source || "direct"] || 0) + 1;
      byTrack[view.trackId] = (byTrack[view.trackId] || 0) + 1;
      if (view.clerkUserId) uniqueVisitors.add(view.clerkUserId);
    }
    
    return {
      totalViews: views.length,
      uniqueVisitors: uniqueVisitors.size,
      bySource,
      byTrack,
    };
  },
});

// ============ CHECKOUT FUNNEL TRACKING ============

export const trackCheckoutFunnelStep = mutation({
  args: {
    clerkUserId: v.optional(v.string()),
    trackId: v.optional(v.id("tracks")),
    workspaceId: v.id("workspaces"),
    step: v.union(
      v.literal("view_checkout"),
      v.literal("select_license"),
      v.literal("enter_email"),
      v.literal("begin_payment"),
      v.literal("complete_payment")
    ),
    sessionId: v.optional(v.string()),
    amountCents: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("checkoutFunnelEvents", {
      clerkUserId: args.clerkUserId,
      trackId: args.trackId,
      workspaceId: args.workspaceId,
      step: args.step,
      sessionId: args.sessionId,
      amountCents: args.amountCents,
      createdAt: Date.now(),
    });
  },
});

export const getCheckoutFunnelStats = query({
  args: { workspaceId: v.optional(v.id("workspaces")) },
  handler: async (ctx, args) => {
    let events;
    if (args.workspaceId) {
      events = await ctx.db
        .query("checkoutFunnelEvents")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId!))
        .collect();
    } else {
      events = await ctx.db.query("checkoutFunnelEvents").collect();
    }
    
    const stepCounts: Record<string, number> = {
      view_checkout: 0,
      select_license: 0,
      enter_email: 0,
      begin_payment: 0,
      complete_payment: 0,
    };
    
    const uniqueUsers = new Set<string>();
    let totalRevenue = 0;
    
    for (const event of events) {
      stepCounts[event.step] = (stepCounts[event.step] || 0) + 1;
      if (event.clerkUserId) uniqueUsers.add(event.clerkUserId);
      if (event.step === "complete_payment" && event.amountCents) {
        totalRevenue += event.amountCents;
      }
    }
    
    const conversionRates = {
      viewToSelect: stepCounts.select_license / (stepCounts.view_checkout || 1),
      selectToEmail: stepCounts.enter_email / (stepCounts.select_license || 1),
      emailToPayment: stepCounts.begin_payment / (stepCounts.enter_email || 1),
      paymentToComplete: stepCounts.complete_payment / (stepCounts.begin_payment || 1),
      overall: stepCounts.complete_payment / (stepCounts.view_checkout || 1),
    };
    
    return {
      stepCounts,
      uniqueUsers: uniqueUsers.size,
      totalRevenue,
      conversionRates,
    };
  },
});

// ============ SEARCH TRACKING ============

export const trackSearchQuery = mutation({
  args: {
    clerkUserId: v.optional(v.string()),
    query: v.string(),
    resultsCount: v.number(),
    sessionId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("searchQueries", {
      clerkUserId: args.clerkUserId,
      query: args.query,
      resultsCount: args.resultsCount,
      sessionId: args.sessionId,
      createdAt: Date.now(),
    });
  },
});

export const getSearchAnalytics = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const queries = await ctx.db
      .query("searchQueries")
      .order("desc")
      .take(limit);
    
    const queryCounts: Record<string, number> = {};
    let totalResults = 0;
    let zeroResultQueries = 0;
    
    for (const q of queries) {
      queryCounts[q.query.toLowerCase()] = (queryCounts[q.query.toLowerCase()] || 0) + 1;
      totalResults += q.resultsCount;
      if (q.resultsCount === 0) zeroResultQueries++;
    }
    
    const topQueries = Object.entries(queryCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20);
    
    return {
      totalQueries: queries.length,
      topQueries,
      avgResultsPerQuery: queries.length > 0 ? totalResults / queries.length : 0,
      zeroResultQueries,
      zeroResultRate: queries.length > 0 ? zeroResultQueries / queries.length : 0,
    };
  },
});

// ============ ACQUISITION METRICS ============

/**
 * Count total users by role
 */
export const getUserCounts = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const counts = {
      producer: 0,
      engineer: 0,
      artist: 0,
      admin: 0,
      total: users.length,
    };
    for (const u of users) {
      counts[u.role]++;
    }
    return counts;
  },
});

/**
 * Get average time-to-signup (ms from user creation to onboarding completion).
 * Approximated as time from user.createdAt to workspace.createdAt for providers,
 * or user createdAt alone for artists.
 */
export const getTimeToSignup = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const workspaces = await ctx.db.query("workspaces").collect();
    const workspaceByOwner = new Map(workspaces.map((w) => [w.ownerClerkUserId, w]));

    const durations: number[] = [];
    for (const user of users) {
      const ws = workspaceByOwner.get(user.clerkUserId);
      if (ws) {
        durations.push(ws.createdAt - user.createdAt);
      } else {
        durations.push(0);
      }
    }
    if (durations.length === 0) return { avgMs: 0, count: 0 };
    return { avgMs: durations.reduce((a, b) => a + b, 0) / durations.length, count: durations.length };
  },
});

// ============ ACTIVATION METRICS ============

/**
 * Time-to-first-upload: average ms from workspace creation to first track upload
 */
export const getTimeToFirstUpload = query({
  args: {},
  handler: async (ctx) => {
    const tracks = await ctx.db.query("tracks").collect();
    const workspaces = await ctx.db.query("workspaces").collect();
    const wsMap = new Map(workspaces.map((w) => [w._id, w]));

    const firstUploadByWs = new Map<Id<"workspaces">, number>();
    for (const track of tracks) {
      const existing = firstUploadByWs.get(track.workspaceId);
      if (!existing || track.createdAt < existing) {
        firstUploadByWs.set(track.workspaceId, track.createdAt);
      }
    }

    const durations: number[] = [];
    for (const [wsId, uploadTime] of firstUploadByWs) {
      const ws = wsMap.get(wsId);
      if (ws) {
        durations.push(uploadTime - ws.createdAt);
      }
    }
    if (durations.length === 0) return { avgMs: 0, count: 0 };
    return { avgMs: durations.reduce((a, b) => a + b, 0) / durations.length, count: durations.length };
  },
});

/**
 * Onboarding completion rate: workspaces with at least one track / total workspaces
 */
export const getOnboardingCompletionRate = query({
  args: {},
  handler: async (ctx) => {
    const workspaces = await ctx.db.query("workspaces").collect();
    const tracks = await ctx.db.query("tracks").collect();

    const wsWithTracks = new Set(tracks.map((t) => t.workspaceId));
    const completed = wsWithTracks.size;
    const total = workspaces.length;

    return { completed, total, rate: total > 0 ? completed / total : 0 };
  },
});

// ============ REVENUE METRICS ============

/**
 * Checkout completion rate: completed orders / total orders
 */
export const getCheckoutCompletionRate = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const completed = orders.filter((o) => o.status === "completed").length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const failed = orders.filter((o) => o.status === "failed").length;
    const total = orders.length;
    return { completed, pending, failed, total, rate: total > 0 ? completed / total : 0 };
  },
});

/**
 * Revenue per active producer: total revenue / number of producers with workspaces
 */
export const getRevenuePerUser = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const workspaces = await ctx.db.query("workspaces").collect();

    const completedRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, o) => sum + o.amountCents, 0);

    const activeProducers = workspaces.length;

    return {
      totalRevenueCents: completedRevenue,
      activeProducers,
      revenuePerUserCents: activeProducers > 0 ? completedRevenue / activeProducers : 0,
    };
  },
});

/**
 * First transaction time: average ms from workspace creation to first completed order
 */
export const getFirstTransactionTime = query({
  args: {},
  handler: async (ctx) => {
    const orders = await ctx.db.query("orders").collect();
    const workspaces = await ctx.db.query("workspaces").collect();
    const wsMap = new Map(workspaces.map((w) => [w._id, w]));

    const firstOrderByWs = new Map<Id<"workspaces">, number>();
    for (const order of orders.filter((o) => o.status === "completed")) {
      const existing = firstOrderByWs.get(order.workspaceId);
      if (!existing || order.createdAt < existing) {
        firstOrderByWs.set(order.workspaceId, order.createdAt);
      }
    }

    const durations: number[] = [];
    for (const [wsId, orderTime] of firstOrderByWs) {
      const ws = wsMap.get(wsId);
      if (ws) {
        durations.push(orderTime - ws.createdAt);
      }
    }
    if (durations.length === 0) return { avgMs: 0, count: 0 };
    return { avgMs: durations.reduce((a, b) => a + b, 0) / durations.length, count: durations.length };
  },
});

// ============ SURVEY METRICS ============

/**
 * Get survey response counts for a given question
 */
export const getSurveyResponses = query({
  args: { question: v.string() },
  handler: async (ctx, args) => {
    const responses = await ctx.db
      .query("surveyResponses")
      .withIndex("by_question", (q) => q.eq("question", args.question))
      .collect();

    const counts: Record<string, number> = {};
    for (const r of responses) {
      counts[r.answer] = (counts[r.answer] || 0) + 1;
    }
    return { question: args.question, counts, total: responses.length };
  },
});

/**
 * Get all survey responses (admin view)
 */
export const getAllSurveyResponses = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const responses = await ctx.db
      .query("surveyResponses")
      .order("desc")
      .take(limit);
    return responses;
  },
});

// ============ DASHBOARD SUMMARY ============

/**
 * Single query returning all key metrics for the dashboard
 */
export const getDashboardMetrics = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const workspaces = await ctx.db.query("workspaces").collect();
    const tracks = await ctx.db.query("tracks").collect();
    const orders = await ctx.db.query("orders").collect();

    const userCounts = {
      producer: 0,
      engineer: 0,
      artist: 0,
      admin: 0,
      creatorTotal: 0,
      total: users.length,
    };
    for (const u of users) {
      userCounts[u.role]++;
      if (u.role !== "admin") userCounts.creatorTotal++;
    }

    const completedOrders = orders.filter((o) => o.status === "completed");
    const totalRevenueCents = completedOrders.reduce((s, o) => s + o.amountCents, 0);

    const wsWithTracks = new Set(tracks.map((t) => t.workspaceId));

    return {
      userCounts,
      totalWorkspaces: workspaces.length,
      totalTracks: tracks.length,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      checkoutCompletionRate: orders.length > 0 ? completedOrders.length / orders.length : 0,
      totalRevenueCents,
      onboardingCompletionRate: workspaces.length > 0 ? wsWithTracks.size / workspaces.length : 0,
    };
  },
});
