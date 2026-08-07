/**
 * Lifecycle email sequences.
 *
 * These are the sends that convert signups into MRR: welcome, trial reminders,
 * and checkout abandonment recovery. Unlike transactional mail they are
 * initiated by us, so every one of them honors unsubscribes and carries a
 * List-Unsubscribe header.
 *
 * Scheduling model: each send is queued with `ctx.scheduler.runAfter` at the
 * moment the triggering event happens, then re-checks live state before
 * sending. A user who converts on day 2 never receives the day-7 reminder,
 * because the reminder asks the database whether it is still relevant.
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../../_generated/server";
import { PAID_PLAN_TRIAL_DAYS, PRICING } from "../billing/plans";
import { sendTransactionalEmail, fetchClerkEmail } from "./actions";
import { buildUnsubscribeUrl } from "./suppression";
import * as templates from "./templates";
import { resolveBrand } from "./theme";
import { buildOnboardingRecoveryUrl } from "./urls";

const DAY_MS = 24 * 60 * 60 * 1000;

const sendResultValidator = v.object({
  sent: v.boolean(),
  dedupeKey: v.optional(v.string()),
  providerMessageId: v.optional(v.string()),
  reason: v.optional(v.string()),
});

export const getCreatorLifecycleEligibility = internalQuery({
  args: { clerkUserId: v.string() },
  returns: v.object({ eligible: v.boolean() }),
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    return { eligible: user?.role !== "admin" };
  },
});

function fromAddress(brandName: string): string {
  const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
  return `${brandName} <${fromEmail}>`;
}

// ============================================================================
// Welcome
// ============================================================================

/**
 * Sent on user.created, before a workspace exists.
 *
 * This is the highest-intent moment in the entire funnel — the user just
 * decided to try the product. Previously nothing was sent here at all.
 */
export const sendWelcomeEmail = internalAction({
  args: { clerkUserId: v.string() },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const lifecycle = await ctx.runQuery(
      internal.platform.email.lifecycle.getCreatorLifecycleEligibility,
      { clerkUserId: args.clerkUserId }
    );
    if (!lifecycle.eligible) {
      return { sent: false, reason: "admin_account" };
    }

    const email = await fetchClerkEmail(args.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const brand = resolveBrand();
    const unsubscribeUrl = await buildUnsubscribeUrl(email);
    const rendered = templates.welcome({
      brand,
      unsubscribeUrl,
      onboardingUrl: `${brand.siteUrl}/onboarding`,
      trialDays: PAID_PLAN_TRIAL_DAYS,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `user:${args.clerkUserId}:welcome`,
      emailType: "welcome",
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [{ name: "type", value: "welcome" }],
    });
  },
});

// ============================================================================
// Pre-workspace onboarding recovery
// ============================================================================

type OnboardingRecoveryState = {
  workspaceExists: boolean;
};

export const getOnboardingRecoveryState = internalQuery({
  args: { clerkUserId: v.string() },
  returns: v.object({ workspaceExists: v.boolean() }),
  handler: async (ctx, args): Promise<OnboardingRecoveryState> => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) =>
        q.eq("ownerClerkUserId", args.clerkUserId)
      )
      .first();

    return { workspaceExists: workspace !== null };
  },
});

/**
 * Recover signups that leave before naming their storefront.
 *
 * Each scheduled action checks current state before sending. Once a workspace
 * exists, every remaining message becomes a no-op.
 */
export const scheduleOnboardingRecovery = internalMutation({
  args: { clerkUserId: v.string() },
  returns: v.object({ scheduled: v.number() }),
  handler: async (ctx, args) => {
    const schedule: Array<{
      stage: "one_hour" | "one_day" | "three_days";
      delay: number;
    }> = [
      { stage: "one_hour", delay: 60 * 60 * 1000 },
      { stage: "one_day", delay: DAY_MS },
      { stage: "three_days", delay: 3 * DAY_MS },
    ];

    for (const item of schedule) {
      await ctx.scheduler.runAfter(
        item.delay,
        internal.platform.email.lifecycle.sendOnboardingRecovery,
        { clerkUserId: args.clerkUserId, stage: item.stage }
      );
    }

    return { scheduled: schedule.length };
  },
});

export const sendOnboardingRecovery = internalAction({
  args: {
    clerkUserId: v.string(),
    stage: v.union(
      v.literal("one_hour"),
      v.literal("one_day"),
      v.literal("three_days")
    ),
  },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const lifecycle = await ctx.runQuery(
      internal.platform.email.lifecycle.getCreatorLifecycleEligibility,
      { clerkUserId: args.clerkUserId }
    );
    if (!lifecycle.eligible) {
      return { sent: false, reason: "admin_account" };
    }

    const state: OnboardingRecoveryState = await ctx.runQuery(
      internal.platform.email.lifecycle.getOnboardingRecoveryState,
      { clerkUserId: args.clerkUserId }
    );
    if (state.workspaceExists) {
      return { sent: false, reason: "workspace_exists" };
    }

    const email = await fetchClerkEmail(args.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const brand = resolveBrand();
    const unsubscribeUrl = await buildUnsubscribeUrl(email);
    const rendered = templates.onboardingRecovery({
      brand,
      unsubscribeUrl,
      stage: args.stage,
      onboardingUrl: buildOnboardingRecoveryUrl(brand.siteUrl),
      trialDays: PAID_PLAN_TRIAL_DAYS,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `user:${args.clerkUserId}:onboarding:${args.stage}`,
      emailType: `onboarding_${args.stage}`,
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "onboarding_recovery" },
        { name: "stage", value: args.stage },
      ],
    });
  },
});

// ============================================================================
// Trial conversion
// ============================================================================

type TrialState = {
  /**
   * Subscription status as synced from Clerk Billing.
   *
   * Note: Clerk reports "active" for both trialing and fully paid subscriptions,
   * so this cannot by itself prove the user has started paying. The reminders
   * are written to stay accurate either way — they describe what happens at
   * trial end rather than claiming the user has not paid. Distinguishing the
   * two properly requires storing trialEndsAt on providerSubscriptions.
   */
  subscriptionStatus: "active" | "inactive" | "canceled" | null;
  planKey: "basic" | "pro" | null;
  clerkUserId: string | null;
  publishedTracks: number;
  hasService: boolean;
};

export const getTrialState = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  returns: v.object({
    subscriptionStatus: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("canceled"),
      v.null()
    ),
    planKey: v.union(v.literal("basic"), v.literal("pro"), v.null()),
    clerkUserId: v.union(v.string(), v.null()),
    publishedTracks: v.number(),
    hasService: v.boolean(),
  }),
  handler: async (ctx, args): Promise<TrialState> => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      return {
        subscriptionStatus: null,
        planKey: null,
        clerkUserId: null,
        publishedTracks: 0,
        hasService: false,
      };
    }

    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    const service = await ctx.db
      .query("services")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    return {
      subscriptionStatus: subscription?.status ?? null,
      planKey: subscription?.planKey ?? null,
      clerkUserId: workspace.ownerClerkUserId,
      publishedTracks: usage?.publishedTracksCount ?? 0,
      hasService: service !== null,
    };
  },
});

/**
 * Queue the full trial reminder ladder for a workspace.
 *
 * Called when a subscription first becomes active (trial start). Sends land at
 * day 23, 27, 29 and 31 of a 30-day trial — i.e. 7 days, 3 days, 1 day before
 * expiry and 1 day after.
 */
export const scheduleTrialSequence = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    trialStartedAt: v.optional(v.number()),
  },
  returns: v.object({ scheduled: v.number() }),
  handler: async (ctx, args) => {
    const start = args.trialStartedAt ?? Date.now();
    const trialEnd = start + PAID_PLAN_TRIAL_DAYS * DAY_MS;

    const schedule: Array<{ stage: "day7" | "day3" | "day1" | "expired"; at: number }> = [
      { stage: "day7", at: trialEnd - 7 * DAY_MS },
      { stage: "day3", at: trialEnd - 3 * DAY_MS },
      { stage: "day1", at: trialEnd - 1 * DAY_MS },
      { stage: "expired", at: trialEnd + 1 * DAY_MS },
    ];

    let scheduled = 0;
    for (const item of schedule) {
      const delay = item.at - Date.now();
      // Skip stages already in the past (e.g. a short or backdated trial).
      if (delay <= 0) continue;

      await ctx.scheduler.runAfter(
        delay,
        internal.platform.email.lifecycle.sendTrialReminder,
        { workspaceId: args.workspaceId, stage: item.stage }
      );
      scheduled += 1;
    }

    /**
     * The ladder above stops one day after expiry. Everyone who ignored that
     * last reminder used to fall off the map entirely, which is the largest
     * silent leak in the funnel — they signed up, so intent was real. The
     * win-back ladder picks them up at day 7, 14 and 30 and drops anyone who
     * converts in the meantime.
     */
    await ctx.runMutation(
      internal.platform.email.winback.scheduleTrialWinback,
      { workspaceId: args.workspaceId, trialEndsAt: trialEnd }
    );

    return { scheduled };
  },
});

export const sendTrialReminder = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    stage: v.union(
      v.literal("day7"),
      v.literal("day3"),
      v.literal("day1"),
      v.literal("expired")
    ),
  },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const state: TrialState = await ctx.runQuery(
      internal.platform.email.lifecycle.getTrialState,
      { workspaceId: args.workspaceId }
    );

    if (!state.clerkUserId) return { sent: false, reason: "workspace_missing" };

    // Once the workspace has no subscription record at all, the trial ladder is
    // meaningless — the activation nudges own that user instead.
    if (state.subscriptionStatus === null) {
      return { sent: false, reason: "no_subscription" };
    }

    const email = await fetchClerkEmail(state.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const brand = resolveBrand();
    const planKey = state.planKey ?? "basic";
    const planLabel = planKey === "pro" ? "PRO" : "BASIC";
    const priceLabel = `$${PRICING[planKey].monthly}/month`;
    const daysLeft = { day7: 7, day3: 3, day1: 1, expired: 0 }[args.stage];

    const unsubscribeUrl = await buildUnsubscribeUrl(email);
    const rendered = templates.trialReminder({
      brand,
      unsubscribeUrl,
      stage: args.stage,
      planLabel,
      priceLabel,
      daysLeft,
      billingUrl: `${brand.siteUrl}/studio/billing`,
      publishedTracks: state.publishedTracks,
      isActivated: state.publishedTracks > 0 || state.hasService,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `trial:${args.workspaceId}:${args.stage}`,
      emailType: `trial_${args.stage}`,
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "trial_reminder" },
        { name: "stage", value: args.stage },
      ],
    });
  },
});

// ============================================================================
// Checkout abandonment recovery
// ============================================================================

/**
 * Look up an abandonment record and confirm the buyer has not since purchased.
 *
 * Emailing "you left something behind" to someone who already bought it is
 * worse than sending nothing, so the purchase check is not optional.
 */
export const getAbandonmentContext = internalQuery({
  args: { abandonmentId: v.id("checkoutAbandonment") },
  returns: v.union(
    v.object({
      clerkUserId: v.string(),
      trackId: v.string(),
      reason: v.string(),
      workspaceId: v.union(v.id("workspaces"), v.null()),
      trackTitle: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const record = await ctx.db.get(args.abandonmentId);
    if (!record || !record.clerkUserId || !record.trackId) return null;

    const purchased = await ctx.db
      .query("orders")
      .withIndex("by_buyer", (q) => q.eq("buyerClerkUserId", record.clerkUserId!))
      .order("desc")
      .take(1_000);

    if (purchased.some((o) => o.itemId === record.trackId)) return null;

    // trackId is stored as a plain string on checkoutAbandonment, so it has to
    // be validated against the tracks table before it can be dereferenced.
    const trackId = ctx.db.normalizeId("tracks", record.trackId);
    const track = trackId ? await ctx.db.get(trackId) : null;
    if (!track || track.status !== "published") return null;

    return {
      clerkUserId: record.clerkUserId,
      trackId: record.trackId,
      reason: record.reason,
      workspaceId: record.workspaceId ?? null,
      trackTitle: track.title,
    };
  },
});

/** Queued 4h after the survey — long enough to not feel like surveillance. */
export const sendAbandonmentRecovery = internalAction({
  args: { abandonmentId: v.id("checkoutAbandonment") },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const context = await ctx.runQuery(
      internal.platform.email.lifecycle.getAbandonmentContext,
      { abandonmentId: args.abandonmentId }
    );
    if (!context) return { sent: false, reason: "purchased_or_missing" };

    const email = await fetchClerkEmail(context.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const brand = resolveBrand();
    const unsubscribeUrl = await buildUnsubscribeUrl(email);
    const rendered = templates.abandonmentRecovery({
      brand,
      unsubscribeUrl,
      trackTitle: context.trackTitle,
      reason: context.reason,
      checkoutUrl: `${brand.siteUrl}/beats/${context.trackId}`,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `abandonment:${args.abandonmentId}:recovery`,
      emailType: "abandonment_recovery",
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "abandonment_recovery" },
        { name: "reason", value: context.reason.slice(0, 40) },
      ],
    });
  },
});
