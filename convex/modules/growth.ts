import { v } from "convex/values";
import { mutation, query, type MutationCtx } from "../_generated/server";
import { Id } from "../_generated/dataModel";

const MAX_EVENTS_PER_REPORT = 10_000;
const MAX_USERS_PER_REPORT = 1_000;

const clientGrowthEventValidator = v.union(
  v.literal("landing_view"),
  v.literal("pricing_view"),
  v.literal("cta_clicked"),
  v.literal("signup_view")
);

/**
 * Server-authoritative funnel events.
 *
 * Unlike the client-beacon events (landing/pricing/cta/signup views), these are
 * emitted from Convex mutations at the moment real product state changes, so a
 * browser can neither forge nor drop them. They fill the post-signup half of the
 * funnel that was previously labelled "unmeasured".
 */
export type ServerGrowthEvent =
  | "account_created"
  | "workspace_created"
  | "subscription_activated"
  | "stripe_ready"
  | "first_offer_published";

/**
 * Record a server-authoritative funnel event.
 *
 * Callable from any mutation. `path` defaults to "/onboarding" to match the
 * existing subscription_activated rows. Attribution (source/campaign/role) is
 * optional and should be threaded through from the workspace where available.
 */
export async function recordServerGrowthEvent(
  ctx: MutationCtx,
  params: {
    event: ServerGrowthEvent;
    path?: string;
    clerkUserId?: string;
    plan?: "basic" | "pro";
    period?: "month" | "annual";
    role?: "producer" | "engineer" | "artist";
    source?: string;
    campaign?: string;
  }
): Promise<void> {
  await ctx.db.insert("growthEvents", {
    event: params.event,
    path: params.path ?? "/onboarding",
    clerkUserId: params.clerkUserId,
    plan: params.plan,
    period: params.period,
    role: params.role,
    source: params.source,
    campaign: params.campaign,
    createdAt: Date.now(),
  });
}

/**
 * Emit `first_offer_published` exactly once per workspace.
 *
 * A published track and an active service are both "offers", so this is called
 * from track publish and service activation alike. `workspace.firstOfferPublishedAt`
 * is the idempotency guard — the second and later offers are no-ops here.
 */
export async function markFirstOfferPublished(
  ctx: MutationCtx,
  workspaceId: Id<"workspaces">
): Promise<void> {
  const workspace = await ctx.db.get(workspaceId);
  if (!workspace || workspace.firstOfferPublishedAt) return;

  await ctx.db.patch(workspaceId, { firstOfferPublishedAt: Date.now() });
  await recordServerGrowthEvent(ctx, {
    event: "first_offer_published",
    clerkUserId: workspace.ownerClerkUserId,
    role: workspace.type,
    source: workspace.signupSource,
    campaign: workspace.signupCampaign,
  });
}

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
    v.literal("workspace"),
    v.literal("subscription"),
    v.literal("stripe"),
    v.literal("first_offer"),
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
  const accounts = counts.account_created ?? 0;
  // Server-authoritative stages have no sessionId, so they are counted by event.
  const workspaces = counts.workspace_created ?? 0;
  const subscriptions = counts.subscription_activated ?? 0;
  const stripeReady = counts.stripe_ready ?? 0;
  const firstOffers = counts.first_offer_published ?? 0;

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

  if (accounts === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "signup" as const,
      evidence: `${signupViews} sign-up page session(s) produced no confirmed Clerk account.`,
      nextAction:
        "Check Clerk user.created webhook delivery; page views are not account creations.",
    };
  }

  if (workspaces === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "workspace" as const,
      evidence: `${accounts} confirmed Clerk account(s) produced no created workspace.`,
      nextAction:
        "Reproduce account creation and role/slug selection; the drop is before checkout, not at price.",
    };
  }

  if (subscriptions === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "subscription" as const,
      evidence: `${workspaces} workspace(s) produced no activated subscription.`,
      nextAction:
        "Confirm the paid-plan CTA and Clerk checkout work; verify the free-month trial is configured.",
    };
  }

  if (stripeReady === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "stripe" as const,
      evidence: `${subscriptions} subscription(s) produced no Stripe-ready workspace.`,
      nextAction:
        "Inspect Stripe Connect onboarding and return URLs; sellers cannot be paid until this clears.",
    };
  }

  if (firstOffers === 0) {
    return {
      status: "conversion_gap" as const,
      bottleneck: "first_offer" as const,
      evidence: `${stripeReady} Stripe-ready workspace(s) published no first offer.`,
      nextAction:
        "Observe the first upload/publish flow; a live storefront with no offer cannot sell.",
    };
  }

  return {
    status: "healthy_signal" as const,
    bottleneck: null,
    evidence: `${firstOffers} workspace(s) reached a published first offer this period.`,
    nextAction:
      "Full activation path is measured end to end; optimize the weakest measured step.",
  };
}

export const track = mutation({
  args: {
    // Browser tracking is intentionally limited to pre-auth navigation events.
    // Product-state milestones are emitted only by trusted server mutations.
    event: clientGrowthEventValidator,
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
    const userBatch = await ctx.db.query("users").take(MAX_USERS_PER_REPORT + 1);
    const usersAreTruncated = userBatch.length > MAX_USERS_PER_REPORT;
    const adminClerkUserIds = new Set(
      userBatch
        .slice(0, MAX_USERS_PER_REPORT)
        .filter((user) => user.role === "admin")
        .map((user) => user.clerkUserId)
    );

    const counts: Record<string, number> = {};
    const sessionsByEvent = new Map<string, Set<string>>();
    let includedEventCount = 0;

    for (const event of events) {
      // Keep historical audit data intact while excluding operational admin
      // accounts from creator acquisition and conversion diagnostics.
      if (
        event.clerkUserId &&
        adminClerkUserIds.has(event.clerkUserId)
      ) {
        continue;
      }
      includedEventCount++;
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
      totalEvents: includedEventCount,
      isTruncated: isTruncated || usersAreTruncated,
      diagnosis: diagnoseFunnel(counts, uniqueSessions),
      coverage: {
        measured: [
          "landing view",
          "pricing view",
          "CTA click",
          "signup view",
          "Clerk account creation",
          "workspace creation",
          "subscription activation",
          "Stripe Connect readiness",
          "first published offer",
        ],
        notMeasured: [],
      },
    };
  },
});
