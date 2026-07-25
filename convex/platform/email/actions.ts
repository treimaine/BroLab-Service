/**
 * Email Actions
 *
 * Convex internal actions for sending transactional emails via Resend.
 * All sends are idempotent via the emailEvents table.
 *
 * DedupeKey convention: {source}:{eventId}:{emailType}
 *
 * Requirements: 30.2, 30.6, 30.7
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import type { ActionCtx } from "../../_generated/server";
import { internalAction } from "../../_generated/server";
import type { EmailCategory } from "./suppression";
import * as templates from "./templates";
import { resolveBrand } from "./theme";

interface TransactionalEmail {
  dedupeKey: string;
  emailType: string;
  recipient: string;
  from: string;
  subject: string;
  html: string;
  text: string;
  /**
   * Defaults to "transactional" for backwards compatibility with existing
   * callers. Lifecycle sends must pass "lifecycle" so unsubscribes are honored.
   */
  category?: EmailCategory;
  /** Unsubscribe URL — required for lifecycle mail, drives List-Unsubscribe. */
  unsubscribeUrl?: string;
  /** Groups related sends in Resend analytics (e.g. "trial_reminder"). */
  tags?: Array<{ name: string; value: string }>;
}

export async function sendTransactionalEmail(
  ctx: ActionCtx,
  email: TransactionalEmail
): Promise<{
  sent: boolean;
  dedupeKey: string;
  providerMessageId?: string;
  reason?: string;
}> {
  const category: EmailCategory = email.category ?? "transactional";

  // Suppression is checked before idempotency: an address that hard-bounced or
  // complained must not be contacted even on a first-ever send.
  const eligibility = await ctx.runQuery(
    internal.platform.email.suppression.checkEligibility,
    { email: email.recipient, category }
  );
  if (!eligibility.allowed) {
    console.log(
      "Email suppressed:",
      email.emailType,
      "reason:",
      eligibility.reason
    );
    return {
      sent: false,
      dedupeKey: email.dedupeKey,
      reason: eligibility.reason,
    };
  }

  const alreadySent = await ctx.runQuery(internal.platform.emailEvents.check, {
    provider: "resend",
    dedupeKey: email.dedupeKey,
  });
  if (alreadySent) return { sent: false, dedupeKey: email.dedupeKey, reason: "already_sent" };

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

  /**
   * RFC 8058 one-click unsubscribe. Gmail and Yahoo require this on bulk mail —
   * without it they route lifecycle sends to spam regardless of content quality.
   */
  const listHeaders = email.unsubscribeUrl
    ? {
        "List-Unsubscribe": `<${email.unsubscribeUrl}>`,
        "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
      }
    : {};

  let lastError = "Unknown Resend delivery error";
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": email.dedupeKey,
        },
        body: JSON.stringify({
          from: email.from,
          to: [email.recipient],
          subject: email.subject,
          html: email.html,
          text: email.text,
          headers: listHeaders,
          ...(email.tags ? { tags: email.tags } : {}),
        }),
      });

      if (response.ok) {
        const responseBody = await response.json() as unknown;
        const providerMessageId =
          typeof responseBody === "object" && responseBody !== null &&
          "id" in responseBody && typeof responseBody.id === "string"
            ? responseBody.id
            : "unknown";

        await ctx.runMutation(internal.platform.emailEvents.recordSuccess, {
          provider: "resend",
          dedupeKey: email.dedupeKey,
          emailType: email.emailType,
          recipient: email.recipient,
          providerMessageId,
        });
        return { sent: true, dedupeKey: email.dedupeKey, providerMessageId };
      }

      const errorBody = (await response.text()).slice(0, 1000);
      lastError = `Resend API error ${response.status}: ${errorBody}`;
      const isRetryable = response.status === 409 || response.status === 429 || response.status >= 500;
      if (!isRetryable || attempt === 3) break;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
      if (attempt === 3) break;
    }

    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }

  await ctx.runMutation(internal.platform.emailEvents.recordFailure, {
    provider: "resend",
    dedupeKey: email.dedupeKey,
    emailType: email.emailType,
    recipient: email.recipient,
    error: lastError,
  });
  throw new Error(lastError);
}

// ============================================================================
// Shared send helpers
// ============================================================================

function fromAddress(brandName: string): string {
  const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
  return `${brandName} <${fromEmail}>`;
}

/** Resolve a Clerk user's primary email address. */
export async function fetchClerkEmail(
  clerkUserId: string
): Promise<string | null> {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) throw new Error("CLERK_SECRET_KEY not configured");

  const response = await fetch(`https://api.clerk.com/v1/users/${clerkUserId}`, {
    headers: {
      Authorization: `Bearer ${clerkSecretKey}`,
      "Content-Type": "application/json",
    },
  });
  if (!response.ok) {
    throw new Error(`Clerk API error ${response.status}`);
  }

  const user = (await response.json()) as {
    email_addresses?: Array<{ email_address: string; id: string }>;
    primary_email_address_id?: string;
  };

  return (
    user.email_addresses?.find((e) => e.id === user.primary_email_address_id)
      ?.email_address ??
    user.email_addresses?.[0]?.email_address ??
    null
  );
}

// ============================================================================
// Buyer-facing transactional email
// ============================================================================

const licenseTierValidator = v.union(
  v.literal("basic"),
  v.literal("premium"),
  v.literal("unlimited")
);

function tierLabel(tier: "basic" | "premium" | "unlimited"): string {
  return `${tier.charAt(0).toUpperCase()}${tier.slice(1)} License`;
}

/**
 * Purchase confirmation for the buyer.
 *
 * Requirement 30.6: links to the dashboard rather than embedding signed URLs,
 * so a forwarded email never grants file access.
 */
export const sendArtistPurchaseEmail = internalAction({
  args: {
    stripeEventId: v.string(),
    buyerEmail: v.string(),
    trackTitle: v.string(),
    licenseTier: licenseTierValidator,
  },
  handler: async (ctx, args) => {
    const brand = resolveBrand();
    const rendered = templates.purchaseConfirmation({
      brand,
      trackTitle: args.trackTitle,
      tierLabel: tierLabel(args.licenseTier),
      dashboardUrl: `${brand.siteUrl}/artist`,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `stripe:${args.stripeEventId}:artist_purchase`,
      emailType: "artist_purchase",
      recipient: args.buyerEmail,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "transactional",
      tags: [{ name: "type", value: "artist_purchase" }],
    });
  },
});

/** Sent once the asynchronously generated license PDF exists. */
export const sendLicenseReadyEmail = internalAction({
  args: {
    licenseId: v.id("licenses"),
    buyerEmail: v.string(),
    trackTitle: v.string(),
    licenseTier: licenseTierValidator,
  },
  handler: async (ctx, args) => {
    const brand = resolveBrand();
    const rendered = templates.licenseReady({
      brand,
      trackTitle: args.trackTitle,
      tierLabel: tierLabel(args.licenseTier),
      dashboardUrl: `${brand.siteUrl}/artist`,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `license:${args.licenseId}:ready`,
      emailType: "license_ready",
      recipient: args.buyerEmail,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "transactional",
      tags: [{ name: "type", value: "license_ready" }],
    });
  },
});

export const sendBookingConfirmationEmail = internalAction({
  args: {
    stripeEventId: v.string(),
    buyerEmail: v.string(),
    serviceTitle: v.string(),
    bookingStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const brand = resolveBrand();
    const statusLabel =
      args.bookingStatus.charAt(0).toUpperCase() + args.bookingStatus.slice(1);
    const rendered = templates.bookingConfirmation({
      brand,
      serviceTitle: args.serviceTitle,
      statusLabel,
      dashboardUrl: `${brand.siteUrl}/artist`,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `stripe:${args.stripeEventId}:booking_confirm`,
      emailType: "booking_confirmation",
      recipient: args.buyerEmail,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "transactional",
      tags: [{ name: "type", value: "booking_confirmation" }],
    });
  },
});

// ============================================================================
// Provider-facing subscription email
// ============================================================================

export const sendProviderSubscriptionEmail = internalAction({
  args: {
    clerkEventId: v.string(),
    clerkUserId: v.string(),
    planKey: v.union(v.literal("basic"), v.literal("pro")),
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("canceled")
    ),
  },
  handler: async (ctx, args) => {
    // Requirement 30.4: only active/canceled transitions are worth an email.
    if (args.status !== "active" && args.status !== "canceled") {
      return { sent: false, reason: "status_not_actionable" };
    }

    const providerEmail = await fetchClerkEmail(args.clerkUserId);
    if (!providerEmail) return { sent: false, reason: "no_email_found" };

    const brand = resolveBrand();
    const rendered = templates.subscriptionStatus({
      brand,
      planLabel: args.planKey === "pro" ? "PRO" : "BASIC",
      isActive: args.status === "active",
      billingUrl: `${brand.siteUrl}/studio/billing`,
    });

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `clerk:${args.clerkEventId}:subscription_status`,
      emailType: "subscription_status",
      recipient: providerEmail,
      from: fromAddress(brand.brandName),
      subject: rendered.subject,
      html: rendered.html,
      text: rendered.text,
      category: "transactional",
      tags: [{ name: "type", value: "subscription_status" }],
    });
  },
});
