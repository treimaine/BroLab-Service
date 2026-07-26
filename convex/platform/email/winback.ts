/**
 * Win-back sequences.
 *
 * Two audiences, both of which the product currently stops talking to at
 * exactly the wrong moment:
 *
 *   1. Expired trials. The trial ladder in lifecycle.ts ends at day+1. Everyone
 *      who ignored that email is never contacted again, despite having signed
 *      up — intent was real and something specific stopped them.
 *   2. Churned customers. Somebody who paid understood the product well enough
 *      to buy it. That makes them the best-qualified lead there is, and the
 *      reason they left often stops being true given a few months.
 *
 * Both ladders re-check live subscription state before every send, so anyone
 * who comes back drops out of the sequence immediately.
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import {
  internalAction,
  internalMutation,
  internalQuery,
} from "../../_generated/server";
import { PRICING } from "../billing/plans";
import { fetchClerkEmail, sendTransactionalEmail } from "./actions";
import { formatPlanPriceLabel, resolveRecipientLocale } from "./i18n";
import * as retention from "./retentionTemplates";
import { buildUnsubscribeUrl } from "./suppression";
import { resolveBrand } from "./theme";

const DAY_MS = 24 * 60 * 60 * 1000;

const sendResultValidator = v.object({
  sent: v.boolean(),
  dedupeKey: v.optional(v.string()),
  providerMessageId: v.optional(v.string()),
  reason: v.optional(v.string()),
});

const winbackStateValidator = v.object({
  subscriptionStatus: v.union(
    v.literal("active"),
    v.literal("inactive"),
    v.literal("canceled"),
    v.null()
  ),
  planKey: v.union(v.literal("basic"), v.literal("pro"), v.null()),
  clerkUserId: v.union(v.string(), v.null()),
  publishedTracks: v.number(),
});

function fromAddress(brandName: string): string {
  const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
  return `${brandName} <${fromEmail}>`;
}

function replyAddress(): string {
  return process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
}

type WinbackState = {
  subscriptionStatus: "active" | "inactive" | "canceled" | null;
  planKey: "basic" | "pro" | null;
  clerkUserId: string | null;
  publishedTracks: number;
};

export const getWinbackState = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  returns: winbackStateValidator,
  handler: async (ctx, args): Promise<WinbackState> => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      return {
        subscriptionStatus: null,
        planKey: null,
        clerkUserId: null,
        publishedTracks: 0,
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

    return {
      subscriptionStatus: subscription?.status ?? null,
      planKey: subscription?.planKey ?? null,
      clerkUserId: workspace.ownerClerkUserId,
      publishedTracks: usage?.publishedTracksCount ?? 0,
    };
  },
});

// ============================================================================
// Expired trial ladder
// ============================================================================

const trialWinbackStageValidator = v.union(
  v.literal("feedback"),
  v.literal("value"),
  v.literal("final")
);

/**
 * Days after trial end, not after the day+1 "expired" email.
 *
 * The gap between the expired notice and the first win-back send is deliberate:
 * asking "what stopped you?" the day after a lapse reads as a sales tactic
 * wearing a question mark. A week later it reads as a real question.
 */
const TRIAL_WINBACK_SCHEDULE: Array<{
  stage: retention.TrialWinbackStage;
  dayOffset: number;
}> = [
  { stage: "feedback", dayOffset: 7 },
  { stage: "value", dayOffset: 14 },
  { stage: "final", dayOffset: 30 },
];

export const scheduleTrialWinback = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    trialEndsAt: v.number(),
  },
  returns: v.object({ scheduled: v.number() }),
  handler: async (ctx, args) => {
    let scheduled = 0;

    for (const item of TRIAL_WINBACK_SCHEDULE) {
      const delay = args.trialEndsAt + item.dayOffset * DAY_MS - Date.now();
      if (delay <= 0) continue;

      await ctx.scheduler.runAfter(
        delay,
        internal.platform.email.winback.sendTrialWinback,
        { workspaceId: args.workspaceId, stage: item.stage }
      );
      scheduled += 1;
    }

    return { scheduled };
  },
});

export const sendTrialWinback = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    stage: trialWinbackStageValidator,
  },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const state: WinbackState = await ctx.runQuery(
      internal.platform.email.winback.getWinbackState,
      { workspaceId: args.workspaceId }
    );

    if (!state.clerkUserId) return { sent: false, reason: "workspace_missing" };

    // Converted since the trial lapsed — they are a customer now, and a
    // "what stopped you?" email would be actively confusing.
    if (state.subscriptionStatus === "active") {
      return { sent: false, reason: "converted" };
    }

    const email = await fetchClerkEmail(state.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const locale = await resolveRecipientLocale(ctx, {
      email,
      clerkUserId: state.clerkUserId,
    });

    const brand = resolveBrand();
    const planKey = state.planKey ?? "basic";
    const unsubscribeUrl = await buildUnsubscribeUrl(email);

    const rendered = retention.trialWinback({
      brand,
      locale,
      unsubscribeUrl,
      stage: args.stage,
      planLabel: planKey === "pro" ? "PRO" : "BASIC",
      priceLabel: formatPlanPriceLabel(PRICING[planKey].monthly, locale),
      publishedTracks: state.publishedTracks,
      billingUrl: `${brand.siteUrl}/studio/billing`,
      replyEmail: replyAddress(),
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `trial_winback:${args.workspaceId}:${args.stage}`,
      emailType: `trial_winback_${args.stage}`,
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "trial_winback" },
        { name: "stage", value: args.stage },
      ],
    });
  },
});

// ============================================================================
// Cancellation
// ============================================================================

/**
 * Sent the moment a subscription is cancelled.
 *
 * Not a save attempt — see the template. The CTA is a reply to a real inbox
 * rather than a survey form: at this stage of the business a written sentence
 * from a departing customer is worth more than a multiple-choice answer, and
 * there is no survey route in the app to link to. If a form is built later,
 * swap the CTA and keep the rest.
 */
export const sendCancellationSurvey = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    clerkEventId: v.string(),
  },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const state: WinbackState = await ctx.runQuery(
      internal.platform.email.winback.getWinbackState,
      { workspaceId: args.workspaceId }
    );

    if (!state.clerkUserId) return { sent: false, reason: "workspace_missing" };

    const email = await fetchClerkEmail(state.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const locale = await resolveRecipientLocale(ctx, {
      email,
      clerkUserId: state.clerkUserId,
    });

    const brand = resolveBrand();
    const planKey = state.planKey ?? "basic";
    const unsubscribeUrl = await buildUnsubscribeUrl(email);

    const subjectLine =
      locale === "fr" ? "Pourquoi j'ai résilié" : "Why I cancelled";

    const rendered = retention.cancellationSurvey({
      brand,
      locale,
      unsubscribeUrl,
      planLabel: planKey === "pro" ? "PRO" : "BASIC",
      surveyUrl: `mailto:${replyAddress()}?subject=${encodeURIComponent(subjectLine)}`,
      reactivateUrl: `${brand.siteUrl}/studio/billing`,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `cancellation:${args.workspaceId}:${args.clerkEventId}`,
      emailType: "cancellation_survey",
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "transactional",
      unsubscribeUrl,
      tags: [{ name: "type", value: "cancellation_survey" }],
    });
  },
});

// ============================================================================
// Churned-customer ladder
// ============================================================================

const churnWinbackStageValidator = v.union(
  v.literal("whatsNew"),
  v.literal("addressed"),
  v.literal("openDoor")
);

const CHURN_WINBACK_SCHEDULE: Array<{
  stage: retention.ChurnWinbackStage;
  dayOffset: number;
  /**
   * True for stages that assert something shipped. Those claims need somewhere
   * to point, so they are skipped entirely unless EMAIL_CHANGELOG_URL is set —
   * a "we fixed it" email with no visible fix costs more trust than the send
   * could ever win back.
   */
  requiresChangelog: boolean;
}> = [
  { stage: "whatsNew", dayOffset: 30, requiresChangelog: true },
  { stage: "addressed", dayOffset: 60, requiresChangelog: true },
  { stage: "openDoor", dayOffset: 90, requiresChangelog: false },
];

export const scheduleChurnWinback = internalMutation({
  args: { workspaceId: v.id("workspaces") },
  returns: v.object({
    scheduled: v.number(),
    changelogConfigured: v.boolean(),
  }),
  handler: async (ctx, args) => {
    const hasChangelog = Boolean(process.env.EMAIL_CHANGELOG_URL);
    let scheduled = 0;

    for (const item of CHURN_WINBACK_SCHEDULE) {
      if (item.requiresChangelog && !hasChangelog) continue;

      await ctx.scheduler.runAfter(
        item.dayOffset * DAY_MS,
        internal.platform.email.winback.sendChurnWinback,
        { workspaceId: args.workspaceId, stage: item.stage }
      );
      scheduled += 1;
    }

    return { scheduled, changelogConfigured: hasChangelog };
  },
});

export const sendChurnWinback = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    stage: churnWinbackStageValidator,
  },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const state: WinbackState = await ctx.runQuery(
      internal.platform.email.winback.getWinbackState,
      { workspaceId: args.workspaceId }
    );

    if (!state.clerkUserId) return { sent: false, reason: "workspace_missing" };

    if (state.subscriptionStatus === "active") {
      return { sent: false, reason: "resubscribed" };
    }

    const email = await fetchClerkEmail(state.clerkUserId);
    if (!email) return { sent: false, reason: "no_email" };

    const locale = await resolveRecipientLocale(ctx, {
      email,
      clerkUserId: state.clerkUserId,
    });

    const brand = resolveBrand();
    const planKey = state.planKey ?? "basic";
    const unsubscribeUrl = await buildUnsubscribeUrl(email);

    const rendered = retention.churnWinback({
      brand,
      locale,
      unsubscribeUrl,
      stage: args.stage,
      priceLabel: formatPlanPriceLabel(PRICING[planKey].monthly, locale),
      billingUrl: `${brand.siteUrl}/studio/billing`,
      changelogUrl: process.env.EMAIL_CHANGELOG_URL || `${brand.siteUrl}/pricing`,
      statedReason: null,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `churn_winback:${args.workspaceId}:${args.stage}`,
      emailType: `churn_winback_${args.stage}`,
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "churn_winback" },
        { name: "stage", value: args.stage },
      ],
    });
  },
});
