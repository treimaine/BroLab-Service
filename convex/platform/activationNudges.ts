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

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://brolabentertainment.com";
    const brandName = process.env.BRAND_NAME || "BroLab Entertainment";
    const fromEmail =
      process.env.BRAND_EMAIL || "contact@brolabentertainment.com";

    const activeStage: Exclude<ActivationStage, "complete"> = state.stage;
    const content = {
      choose_plan: {
        subject: "Your storefront is ready — activate your free month",
        heading: "Choose BASIC or PRO",
        body: "Your storefront is saved. Start your free month to unlock publishing, services and direct sales.",
        cta: "Start my free month",
        url: `${siteUrl}/studio/billing`,
      },
      connect_stripe: {
        subject: "One step left before you can get paid",
        heading: "Connect Stripe",
        body: "Your plan is active. Connect Stripe so customer payments can go directly to your bank account.",
        cta: "Connect Stripe",
        url: `${siteUrl}/studio/billing`,
      },
      publish_offer: {
        subject: "Publish your first offer today",
        heading: "Add one beat or one service",
        body: "Billing and payouts are ready. Publish one beat or service so your storefront has something customers can buy.",
        cta: "Finish my storefront",
        url: `${siteUrl}/studio`,
      },
    }[activeStage];

    const html = `<!doctype html><html><body style="font-family:Arial,sans-serif;background:#0b0b0f;color:#f7f7fb;padding:32px"><div style="max-width:560px;margin:auto;background:#17171d;border-radius:18px;padding:32px"><p style="color:#8b5cf6;font-weight:700">${brandName}</p><h1>${content.heading}</h1><p style="color:#c4c4ce;line-height:1.6">${content.body}</p><p><a href="${content.url}" style="display:inline-block;background:#8b5cf6;color:white;text-decoration:none;padding:13px 20px;border-radius:999px;font-weight:700">${content.cta}</a></p><p style="color:#81818c;font-size:13px">No call required — the in-app checklist guides every step.</p></div></body></html>`;
    const text = `${content.heading}\n\n${content.body}\n\n${content.cta}: ${content.url}\n\nNo call required — the in-app checklist guides every step.`;

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `activation:${args.workspaceId}:${args.sequence}:${state.stage}`,
      emailType: `activation_${state.stage}`,
      recipient: email,
      from: `${brandName} <${fromEmail}>`,
      subject: content.subject,
      html,
      text,
    });
  },
});
