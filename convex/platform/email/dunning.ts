/**
 * Failed-payment recovery.
 *
 * The single highest-leverage sequence in the system. Every other campaign has
 * to earn a subscription; this one only has to keep a subscription that was
 * already earned, from a customer who in most cases never intended to leave —
 * industry-wide, expired and reissued cards cause more involuntary churn than
 * any deliberate cancellation.
 *
 * Trigger: a Clerk `subscriptionItem.pastDue` or `subscriptionItem.incomplete`
 * webhook. Four sends land at 0, 3, 7 and 12 days; each one re-reads the live
 * subscription before sending and stops the moment the payment clears.
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

const stageValidator = v.union(
  v.literal("first"),
  v.literal("reminder"),
  v.literal("urgent"),
  v.literal("final")
);

const sendResultValidator = v.object({
  sent: v.boolean(),
  dedupeKey: v.optional(v.string()),
  providerMessageId: v.optional(v.string()),
  reason: v.optional(v.string()),
});

/**
 * When each send lands, in days after the first failure.
 *
 * Front-loaded on purpose: the great majority of recoverable failures are fixed
 * within the first 72 hours, and spacing the early sends any wider mostly buys
 * involuntary churn.
 */
const DUNNING_SCHEDULE: Array<{
  stage: retention.DunningStage;
  dayOffset: number;
}> = [
  { stage: "first", dayOffset: 0 },
  { stage: "reminder", dayOffset: 3 },
  { stage: "urgent", dayOffset: 7 },
  { stage: "final", dayOffset: 12 },
];

function fromAddress(brandName: string): string {
  const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
  return `${brandName} <${fromEmail}>`;
}

type DunningState = {
  subscriptionStatus: "active" | "inactive" | "canceled" | null;
  planKey: "basic" | "pro" | null;
  clerkUserId: string | null;
};

export const getDunningState = internalQuery({
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
  }),
  handler: async (ctx, args): Promise<DunningState> => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      return { subscriptionStatus: null, planKey: null, clerkUserId: null };
    }

    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    return {
      subscriptionStatus: subscription?.status ?? null,
      planKey: subscription?.planKey ?? null,
      clerkUserId: workspace.ownerClerkUserId,
    };
  },
});

/**
 * Queue the four-send ladder for one payment failure.
 *
 * `cycleId` is the Clerk event id of the failure that opened this cycle. It is
 * what makes a second failure months later a genuinely new sequence rather than
 * a set of sends the emailEvents dedupe silently swallows.
 */
export const scheduleDunningSequence = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    cycleId: v.string(),
  },
  returns: v.object({ scheduled: v.number() }),
  handler: async (ctx, args) => {
    for (const item of DUNNING_SCHEDULE) {
      await ctx.scheduler.runAfter(
        item.dayOffset * DAY_MS,
        internal.platform.email.dunning.sendDunningEmail,
        {
          workspaceId: args.workspaceId,
          cycleId: args.cycleId,
          stage: item.stage,
        }
      );
    }

    return { scheduled: DUNNING_SCHEDULE.length };
  },
});

export const sendDunningEmail = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    cycleId: v.string(),
    stage: stageValidator,
  },
  returns: sendResultValidator,
  handler: async (ctx, args): Promise<{ sent: boolean; reason?: string }> => {
    const state: DunningState = await ctx.runQuery(
      internal.platform.email.dunning.getDunningState,
      { workspaceId: args.workspaceId }
    );

    if (!state.clerkUserId) return { sent: false, reason: "workspace_missing" };

    // The recovery check. A customer who fixed their card on day 1 must never
    // receive the day-3 "still failing" email — that is a worse experience than
    // no dunning at all, and it is the reason each stage re-reads state instead
    // of trusting the schedule.
    if (state.subscriptionStatus === "active") {
      return { sent: false, reason: "payment_recovered" };
    }

    // A deliberate cancellation hands the customer to the winback sequence.
    // Continuing to chase a card they intentionally stopped paying with reads
    // as not listening.
    if (state.subscriptionStatus === "canceled") {
      return { sent: false, reason: "canceled" };
    }

    if (state.subscriptionStatus === null) {
      return { sent: false, reason: "no_subscription" };
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

    const rendered = retention.paymentFailed({
      brand,
      locale,
      unsubscribeUrl,
      stage: args.stage,
      planLabel: planKey === "pro" ? "PRO" : "BASIC",
      priceLabel: formatPlanPriceLabel(PRICING[planKey].monthly, locale),
      billingUrl: `${brand.siteUrl}/studio/billing`,
    });

    /**
     * Category is transactional. A billing failure is not marketing: the
     * recipient is mid-contract and losing access to a product they are paying
     * for, so an unrelated marketing unsubscribe must not silence it. The
     * unsubscribe link is still present, and a hard bounce still blocks it.
     */
    return await sendTransactionalEmail(ctx, {
      dedupeKey: `dunning:${args.workspaceId}:${args.cycleId}:${args.stage}`,
      emailType: `dunning_${args.stage}`,
      recipient: email,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "transactional",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "dunning" },
        { name: "stage", value: args.stage },
      ],
    });
  },
});
