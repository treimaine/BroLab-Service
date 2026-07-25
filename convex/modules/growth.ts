import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const growthEventValidator = v.union(
  v.literal("landing_view"),
  v.literal("pricing_view"),
  v.literal("cta_clicked"),
  v.literal("signup_view"),
  v.literal("subscription_activated")
);

const planValidator = v.union(v.literal("basic"), v.literal("pro"));
const periodValidator = v.union(v.literal("month"), v.literal("annual"));
const roleValidator = v.union(
  v.literal("producer"),
  v.literal("engineer"),
  v.literal("artist")
);

export const track = mutation({
  args: {
    event: growthEventValidator,
    path: v.string(),
    sessionId: v.optional(v.string()),
    plan: v.optional(planValidator),
    period: v.optional(periodValidator),
    role: v.optional(roleValidator),
    source: v.optional(v.string()),
    campaign: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("growthEvents", {
      ...args,
      createdAt: Date.now(),
    });
  },
});

export const getFunnel = query({
  args: {
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const startTime = args.startTime ?? 0;
    const endTime = args.endTime ?? Date.now();
    const events = await ctx.db
      .query("growthEvents")
      .withIndex("by_createdAt", (q) =>
        q.gte("createdAt", startTime).lte("createdAt", endTime)
      )
      .collect();

    const counts: Record<string, number> = {};
    const sessionsByEvent = new Map<string, Set<string>>();

    for (const event of events) {
      counts[event.event] = (counts[event.event] ?? 0) + 1;
      if (event.sessionId) {
        const sessions = sessionsByEvent.get(event.event) ?? new Set<string>();
        sessions.add(event.sessionId);
        sessionsByEvent.set(event.event, sessions);
      }
    }

    return {
      counts,
      uniqueSessions: Object.fromEntries(
        Array.from(sessionsByEvent, ([event, sessions]) => [event, sessions.size])
      ),
      totalEvents: events.length,
    };
  },
});
