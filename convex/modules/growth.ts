import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

const MAX_EVENTS_PER_REPORT = 10_000;

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

const diagnosisValidator = v.object({
  status: v.union(
    v.literal("no_traffic"),
    v.literal("conversion_gap"),
    v.literal("healthy_signal")
  ),
  bottleneck: v.union(
    v.literal("acquisition"),
    v.literal("cta"),
    v.literal("signup"),
    v.literal("subscription"),
    v.null()
  ),
  evidence: v.string(),
  nextAction: v.string(),
});

function getStageCount(
  event: string,
  counts: Record<string, number>,
  uniqueSessions: Record<string, number>
): number {
  return uniqueSessions[event] ?? counts[event] ?? 0;
}

function diagnoseFunnel(
  counts: Record<string, number>,
  uniqueSessions: Record<string, number>
) {
  const landingViews = getStageCount("landing_view", counts, uniqueSessions);
  const ctaClicks = getStageCount("cta_clicked", counts, uniqueSessions);
  const signupViews = getStageCount("signup_view", counts, uniqueSessions);
  const subscriptions = counts.subscription_activated ?? 0;

  if (landingViews === 0) {
    return {
      status: "no_traffic" as const,
      bottleneck: "acquisition" as const,
      evidence: "No landing session is recorded for this period.",
      nextAction:
        "Verify production tracking, then generate qualified traffic before changing the offer.",
    };
  }

  if (ctaClicks === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "cta" as const,
      evidence: `${landingViews} landing session(s) produced no tracked CTA click.`,
      nextAction:
        "Review the promise, proof, and CTA visibility; confirm click tracking before changing pricing.",
    };
  }

  if (signupViews === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "signup" as const,
      evidence: `${ctaClicks} CTA session(s) produced no tracked signup view.`,
      nextAction:
        "Test the CTA destination and signup load path before attributing the gap to price.",
    };
  }

  if (subscriptions === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "subscription" as const,
      evidence: `${signupViews} signup session(s) produced no activated subscription.`,
      nextAction:
        "Inspect account creation, workspace onboarding, and checkout as separate steps.",
    };
  }

  return {
    status: "healthy_signal" as const,
    bottleneck: null,
    evidence: `${subscriptions} subscription activation(s) are recorded for this period.`,
    nextAction:
      "Measure workspace creation, Stripe readiness, and first-offer publication before optimizing activation.",
  };
}

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
  returns: v.id("growthEvents"),
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
  returns: v.object({
    counts: v.record(v.string(), v.number()),
    uniqueSessions: v.record(v.string(), v.number()),
    totalEvents: v.number(),
    isTruncated: v.boolean(),
    diagnosis: diagnosisValidator,
    coverage: v.object({
      measured: v.array(v.string()),
      notMeasured: v.array(v.string()),
    }),
  }),
  handler: async (ctx, args) => {
    const startTime = args.startTime ?? 0;
    const endTime = args.endTime ?? Date.now();
    const eventBatch = await ctx.db
      .query("growthEvents")
      .withIndex("by_createdAt", (q) =>
        q.gte("createdAt", startTime).lte("createdAt", endTime)
      )
      .take(MAX_EVENTS_PER_REPORT + 1);
    const isTruncated = eventBatch.length > MAX_EVENTS_PER_REPORT;
    const events = eventBatch.slice(0, MAX_EVENTS_PER_REPORT);

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

    const uniqueSessions = Object.fromEntries(
      Array.from(sessionsByEvent, ([event, sessions]) => [event, sessions.size])
    );

    return {
      counts,
      uniqueSessions,
      totalEvents: events.length,
      isTruncated,
      diagnosis: diagnoseFunnel(counts, uniqueSessions),
      coverage: {
        measured: [
          "landing view",
          "pricing view",
          "CTA click",
          "signup view",
          "subscription activation",
        ],
        notMeasured: [
          "workspace creation",
          "Stripe Connect readiness",
          "first published offer",
        ],
      },
    };
  },
});
