/**
 * Self-serve activation follow-ups.
 *
 * These emails replace calendar-heavy onboarding calls with one contextual
 * next step. Every send re-checks current product state, so completed steps
 * are never promoted again.
 */

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction, internalQuery } from "../_generated/server";
import { sendTransactionalEmail } from "./email/actions";
import { buildUnsubscribeUrl } from "./email/suppression";
import * as templates from "./email/templates";
import { resolveBrand } from "./email/theme";

type ActivationStage = "choose_plan" | "connect_stripe" | "publish_offer" | "complete";
type ActivationState = {
  stage: ActivationStage;
  clerkUserId: string | null;
  planKey: "basic" | "pro" | null;
};

export const getActivationState = internalQuery({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args): Promise<ActivationState> => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace) {
      return { stage: "complete", clerkUserId: null, planKey: null };
    }

    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (!subscription || subscription.status !== "active") {
      return {
        stage: "choose_plan",
        clerkUserId: workspace.ownerClerkUserId,
        planKey: subscription?.planKey ?? null,
      };
    }

    if (workspace.paymentsStatus !== "active") {
      return {
        stage: "connect_stripe",
        clerkUserId: workspace.ownerClerkUserId,
        planKey: subscription.planKey,
      };
    }

    const usage = await ctx.db
      .query("usage")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();
    const firstService = await ctx.db
      .query("services")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if ((usage?.publishedTracksCount ?? 0) === 0 && !firstService) {
      return {
        stage: "publish_offer",
        clerkUserId: workspace.ownerClerkUserId,
        planKey: subscription.planKey,
      };
    }

    return {
      stage: "complete",
      clerkUserId: workspace.ownerClerkUserId,
      planKey: subscription.planKey,
    };
  },
});

export const sendActivationNudge = internalAction({
  args: {
    workspaceId: v.id("workspaces"),
    sequence: v.number(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    sent: boolean;
    reason?: string;
    dedupeKey?: string;
    providerMessageId?: string;
  }> => {
    const state: ActivationState = await ctx.runQuery(
      internal.platform.activationNudges.getActivationState,
      { workspaceId: args.workspaceId }
    );

    if (state.stage === "complete" || !state.clerkUserId) {
      return { sent: false, reason: "activation_complete" };
    }

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY not configured");

    const response = await fetch(
      `https://api.clerk.com/v1/users/${state.clerkUserId}`,
      {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) {
      throw new Error(`Clerk API error ${response.status}`);
    }

    const clerkUser = (await response.json()) as {
      email_addresses?: Array<{ email_address: string; id: string }>;
      primary_email_address_id?: string;
    };
    const email =
      clerkUser.email_addresses?.find(
        (candidate) => candidate.id === clerkUser.primary_email_address_id
      )?.email_address ?? clerkUser.email_addresses?.[0]?.email_address;
    if (!email) return { sent: false, reason: "no_email" };

    const brand = resolveBrand();
    const fromEmail =
      process.env.BRAND_EMAIL || "contact@brolabentertainment.com";

    const activeStage: Exclude<ActivationStage, "complete"> = state.stage;
    const stageUrl = {
      choose_plan: `${brand.siteUrl}/studio/billing`,
      connect_stripe: `${brand.siteUrl}/studio/billing`,
      publish_offer: `${brand.siteUrl}/studio`,
    }[activeStage];

    const unsubscribeUrl = await buildUnsubscribeUrl(email);
    const rendered = templates.activationNudge({
      brand,
      unsubscribeUrl,
      stage: activeStage,
      url: stageUrl,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `activation:${args.workspaceId}:${args.sequence}:${state.stage}`,
      emailType: `activation_${state.stage}`,
      recipient: email,
      from: `${brand.brandName} <${fromEmail}>`,
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "lifecycle",
      unsubscribeUrl,
      tags: [
        { name: "type", value: "activation_nudge" },
        { name: "stage", value: activeStage },
      ],
    });
  },
});
