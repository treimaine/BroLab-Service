import { v } from "convex/values";
import { internal } from "../_generated/api";
import { action } from "../_generated/server";

const stripeConnectResultValidator = v.object({
  stripeAccountId: v.string(),
  paymentsStatus: v.union(v.literal("pending"), v.literal("active")),
  accountType: v.optional(v.string()),
  chargesEnabled: v.boolean(),
  payoutsEnabled: v.boolean(),
  detailsSubmitted: v.boolean(),
});

type StripeObject = Record<string, unknown>;

function asStripeObject(value: unknown): StripeObject {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Stripe returned an invalid response.");
  }
  return value as StripeObject;
}

/**
 * Complete Stripe Connect OAuth inside an authenticated Convex action.
 *
 * The browser callback never receives a mutation capable of selecting an
 * arbitrary workspace: ownership comes from the verified Clerk identity and
 * the final database write is internal-only.
 */
export const completeOAuth = action({
  args: {
    workspaceId: v.id("workspaces"),
    code: v.string(),
  },
  returns: stripeConnectResultValidator,
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to connect Stripe.");
    }

    await ctx.runQuery(
      internal.platform.workspaces.assertStripeConnectOwnership,
      {
        workspaceId: args.workspaceId,
        clerkUserId: identity.subject,
      }
    );

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      throw new Error("STRIPE_SECRET_KEY is not configured.");
    }

    const tokenResponse = await fetch("https://connect.stripe.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_secret: stripeSecretKey,
        code: args.code,
        grant_type: "authorization_code",
      }),
    });
    const tokenBody = asStripeObject(await tokenResponse.json());
    if (!tokenResponse.ok) {
      const description =
        typeof tokenBody.error_description === "string"
          ? tokenBody.error_description
          : "Stripe OAuth exchange failed.";
      throw new Error(description);
    }

    const stripeAccountId = tokenBody.stripe_user_id;
    if (typeof stripeAccountId !== "string" || !stripeAccountId) {
      throw new Error("Stripe did not return a connected account.");
    }

    const accountResponse = await fetch(
      `https://api.stripe.com/v1/accounts/${encodeURIComponent(stripeAccountId)}`,
      { headers: { Authorization: `Bearer ${stripeSecretKey}` } }
    );
    const account = asStripeObject(await accountResponse.json());
    if (!accountResponse.ok) {
      throw new Error("Unable to verify the connected Stripe account.");
    }

    const chargesEnabled = account.charges_enabled === true;
    const payoutsEnabled = account.payouts_enabled === true;
    const detailsSubmitted = account.details_submitted === true;
    const paymentsStatus =
      chargesEnabled && payoutsEnabled && detailsSubmitted
        ? ("active" as const)
        : ("pending" as const);
    const accountType =
      typeof account.type === "string" ? account.type : undefined;

    await ctx.runMutation(
      internal.platform.workspaces.updateWorkspaceStripeAccountInternal,
      {
        workspaceId: args.workspaceId,
        stripeAccountId,
        paymentsStatus,
        accountType,
        chargesEnabled,
        payoutsEnabled,
        detailsSubmitted,
      }
    );

    return {
      stripeAccountId,
      paymentsStatus,
      accountType,
      chargesEnabled,
      payoutsEnabled,
      detailsSubmitted,
    };
  },
});
