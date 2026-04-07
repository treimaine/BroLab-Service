/**
 * Interview Requests Module
 *
 * Handles user interview scheduling and request management for the feedback loop.
 * Provides ability to book quick 15-minute interviews with customers for product feedback.
 */

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

export const submitInterviewRequest = mutation({
  args: {
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    company: v.optional(v.string()),
    preferredTimes: v.array(v.string()), // ISO datetime strings
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("interviewRequests", {
      clerkUserId: args.clerkUserId,
      email: args.email,
      name: args.name,
      company: args.company,
      preferredTimes: args.preferredTimes,
      status: "pending",
      notes: args.notes,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
    return id;
  },
});

export const scheduleInterview = mutation({
  args: {
    requestId: v.id("interviewRequests"),
    interviewDate: v.number(),
    interviewUrl: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "scheduled",
      interviewDate: args.interviewDate,
      interviewUrl: args.interviewUrl,
      updatedAt: Date.now(),
    });
    return args.requestId;
  },
});

export const cancelInterviewRequest = mutation({
  args: {
    requestId: v.id("interviewRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "canceled",
      updatedAt: Date.now(),
    });
    return args.requestId;
  },
});

export const completeInterview = mutation({
  args: {
    requestId: v.id("interviewRequests"),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.requestId, {
      status: "completed",
      updatedAt: Date.now(),
    });
    return args.requestId;
  },
});

export const getPendingInterviewRequests = query({
  args: {},
  handler: async (ctx) => {
    const requests = await ctx.db
      .query("interviewRequests")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .collect();
    return requests;
  },
});

export const getScheduledInterviews = query({
  args: {},
  handler: async (ctx) => {
    const interviews = await ctx.db
      .query("interviewRequests")
      .withIndex("by_status", (q) => q.eq("status", "scheduled"))
      .collect();
    return interviews.sort((a, b) => (a.interviewDate || 0) - (b.interviewDate || 0));
  },
});

export const getInterviewRequestsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const requests = await ctx.db
      .query("interviewRequests")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .collect();
    return requests;
  },
});

export const getAllInterviewRequests = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 100;
    const requests = await ctx.db
      .query("interviewRequests")
      .order("desc")
      .take(limit);
    return requests;
  },
});
