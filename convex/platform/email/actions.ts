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

interface TransactionalEmail {
  dedupeKey: string;
  emailType: string;
  recipient: string;
  from: string;
  subject: string;
  html: string;
  text: string;
}

export async function sendTransactionalEmail(
  ctx: ActionCtx,
  email: TransactionalEmail
): Promise<{ sent: boolean; dedupeKey: string; providerMessageId?: string }> {
  const alreadySent = await ctx.runQuery(internal.platform.emailEvents.check, {
    provider: "resend",
    dedupeKey: email.dedupeKey,
  });
  if (alreadySent) return { sent: false, dedupeKey: email.dedupeKey };

  const resendApiKey = process.env.RESEND_API_KEY;
  if (!resendApiKey) throw new Error("RESEND_API_KEY not configured");

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

/**
 * Send purchase confirmation email to the artist after a successful track checkout.
 *
 * Triggered from the Stripe webhook handler (convex/http.ts) after order and
 * entitlement creation. Uses emailEvents table for idempotency.
 *
 * Requirements: 30.2, 30.6, 30.7
 */
export const sendArtistPurchaseEmail = internalAction({
  args: {
    /** Stripe event ID — used to build the dedupeKey */
    stripeEventId: v.string(),
    /** Buyer email address from the Stripe checkout session */
    buyerEmail: v.string(),
    /** Track title for display in the email */
    trackTitle: v.string(),
    /** License tier purchased: basic | premium | unlimited */
    licenseTier: v.union(
      v.literal("basic"),
      v.literal("premium"),
      v.literal("unlimited")
    ),
  },
  handler: async (ctx, args) => {
    const { stripeEventId, buyerEmail, trackTitle, licenseTier } = args;

    // Requirement 30.7: Idempotency — skip if already sent
    const dedupeKey = `stripe:${stripeEventId}:artist_purchase`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brolabentertainment.com";
    const brandName = process.env.BRAND_NAME || "BroLab Entertainment";
    const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
    const from = `${brandName} <${fromEmail}>`;

    // Requirement 30.6: Link to /artist dashboard — never include direct signed URLs
    const dashboardUrl = `${siteUrl}/artist`;

    let tierLabel: string;
    if (licenseTier === "basic") {
      tierLabel = "Basic License";
    } else if (licenseTier === "premium") {
      tierLabel = "Premium License";
    } else {
      tierLabel = "Unlimited License";
    }

    const subject = `Your purchase is confirmed — ${trackTitle}`;

    const html = buildPurchaseEmailHtml({
      trackTitle,
      tierLabel,
      dashboardUrl,
      brandName,
    });

    const text = buildPurchaseEmailText({
      trackTitle,
      tierLabel,
      dashboardUrl,
      brandName,
    });

    // Send via Resend HTTP API (no Node SDK — Convex actions use fetch)
    const result = await sendTransactionalEmail(ctx, {
      dedupeKey,
      emailType: "artist_purchase",
      recipient: buyerEmail,
      from,
      subject,
      html,
      text,
    });

    console.log("Artist purchase email handled for:", buyerEmail, "dedupeKey:", dedupeKey);
    return result;
  },
});

// ============ Email Templates ============

interface PurchaseEmailParams {
  trackTitle: string;
  tierLabel: string;
  dashboardUrl: string;
  brandName: string;
}

function buildPurchaseEmailHtml(p: PurchaseEmailParams): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Purchase Confirmed</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: Inter, -apple-system, sans-serif; color: #e5e5e5; }
    .container { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 40px 32px; }
    .brand { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #06b6d4; margin-bottom: 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #f5f5f5; margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: #737373; margin: 0 0 32px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1f1f1f; font-size: 14px; }
    .detail-label { color: #737373; }
    .detail-value { color: #f5f5f5; font-weight: 500; }
    .cta { display: block; margin: 32px 0 0; padding: 14px 24px; background: #06b6d4; color: #000; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; border-radius: 8px; }
    .footer { margin-top: 32px; font-size: 12px; color: #525252; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="brand">${p.brandName}</div>
      <h1>Purchase Confirmed</h1>
      <p class="subtitle">Your track is ready to download from your dashboard.</p>
      <div class="detail-row">
        <span class="detail-label">Track</span>
        <span class="detail-value">${escapeHtml(p.trackTitle)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">License</span>
        <span class="detail-value">${escapeHtml(p.tierLabel)}</span>
      </div>
      <a href="${p.dashboardUrl}" class="cta">Go to My Dashboard →</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${p.brandName}. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

function buildPurchaseEmailText(p: PurchaseEmailParams): string {
  return [
    `${p.brandName}`,
    ``,
    `Purchase Confirmed`,
    ``,
    `Your track is ready to download from your dashboard.`,
    ``,
    `Track: ${p.trackTitle}`,
    `License: ${p.tierLabel}`,
    ``,
    `Go to your dashboard to download your files:`,
    p.dashboardUrl,
    ``,
    `© ${new Date().getFullYear()} ${p.brandName}. All rights reserved.`,
  ].join("\n");
}

function escapeHtml(str: string): string {
  return str
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

/** Notify the buyer only after the asynchronously generated PDF is available. */
export const sendLicenseReadyEmail = internalAction({
  args: {
    licenseId: v.id("licenses"),
    buyerEmail: v.string(),
    trackTitle: v.string(),
    licenseTier: v.union(
      v.literal("basic"),
      v.literal("premium"),
      v.literal("unlimited")
    ),
  },
  handler: async (ctx, args) => {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brolabentertainment.com";
    const brandName = process.env.BRAND_NAME || "BroLab Entertainment";
    const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
    const dashboardUrl = `${siteUrl}/artist`;
    const tierLabel = `${args.licenseTier.charAt(0).toUpperCase()}${args.licenseTier.slice(1)} License`;
    const subject = `Your license is ready — ${args.trackTitle}`;
    const html = `<!DOCTYPE html><html lang="en"><body style="margin:0;padding:32px;background:#0a0a0a;color:#e5e5e5;font-family:Arial,sans-serif"><div style="max-width:560px;margin:auto;background:#141414;border:1px solid #262626;border-radius:12px;padding:32px"><p style="color:#06b6d4;font-weight:700">${escapeHtml(brandName)}</p><h1 style="color:#f5f5f5">Your license is ready</h1><p>The PDF for <strong>${escapeHtml(args.trackTitle)}</strong> (${escapeHtml(tierLabel)}) has been generated and is available in your artist dashboard.</p><a href="${dashboardUrl}" style="display:block;margin-top:28px;padding:14px 24px;background:#06b6d4;color:#000;text-align:center;text-decoration:none;border-radius:8px;font-weight:700">Download files and license</a></div></body></html>`;
    const text = `${brandName}\n\nYour license is ready\n\nThe PDF for ${args.trackTitle} (${tierLabel}) is available in your artist dashboard:\n${dashboardUrl}`;

    return await sendTransactionalEmail(ctx, {
      dedupeKey: `license:${args.licenseId}:ready`,
      emailType: "license_ready",
      recipient: args.buyerEmail,
      from: `${brandName} <${fromEmail}>`,
      subject,
      html,
      text,
    });
  },
});

/**
 * Send subscription status email to the provider after a Clerk Billing webhook event.
 *
 * Triggered from the Clerk webhook handler (convex/http.ts) on:
 *   - subscriptionItem.active   → "Subscription Activated"
 *   - subscriptionItem.canceled → "Subscription Canceled"
 *
 * Fetches provider email from Clerk REST API using CLERK_SECRET_KEY.
 * Uses emailEvents table for idempotency with dedupeKey: "clerk:{eventId}:subscription_status"
 *
 * Requirements: 30.4
 */
export const sendProviderSubscriptionEmail = internalAction({
  args: {
    /** Clerk event ID — used to build the dedupeKey */
    clerkEventId: v.string(),
    /** Clerk user ID of the provider */
    clerkUserId: v.string(),
    /** Resolved plan key: "basic" | "pro" */
    planKey: v.union(v.literal("basic"), v.literal("pro")),
    /** System status after sync */
    status: v.union(
      v.literal("active"),
      v.literal("inactive"),
      v.literal("canceled")
    ),
  },
  handler: async (ctx, args) => {
    const { clerkEventId, clerkUserId, planKey, status } = args;

    // Requirement 30.4: Only send for active/canceled status changes
    if (status !== "active" && status !== "canceled") {
      console.log("Skipping subscription email for status:", status);
      return { sent: false, reason: "status_not_actionable" };
    }

    // Idempotency check
    const dedupeKey = `clerk:${clerkEventId}:subscription_status`;

    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) {
      throw new Error("CLERK_SECRET_KEY not configured");
    }

    // Fetch provider email from Clerk REST API
    const clerkApiBase = "https://api.clerk.com/v1";
    const userResponse = await fetch(`${clerkApiBase}/users/${clerkUserId}`, {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!userResponse.ok) {
      const errBody = await userResponse.text();
      throw new Error(`Clerk API error ${userResponse.status}: ${errBody}`);
    }

    const clerkUser = await userResponse.json() as {
      email_addresses?: Array<{ email_address: string; id: string }>;
      primary_email_address_id?: string;
    };

    // Resolve primary email
    const primaryEmailObj = clerkUser.email_addresses?.find(
      (e) => e.id === clerkUser.primary_email_address_id
    ) ?? clerkUser.email_addresses?.[0];

    if (!primaryEmailObj?.email_address) {
      console.warn("No email found for Clerk user:", clerkUserId);
      return { sent: false, reason: "no_email_found" };
    }

    const providerEmail = primaryEmailObj.email_address;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brolabentertainment.com";
    const brandName = process.env.BRAND_NAME || "BroLab Entertainment";
    const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
    const from = `${brandName} <${fromEmail}>`;
    const billingUrl = `${siteUrl}/studio/billing`;

    const planLabel = planKey === "pro" ? "PRO" : "BASIC";
    const isActive = status === "active";

    const subject = isActive
      ? `Your ${planLabel} subscription is now active`
      : `Your ${planLabel} subscription has been canceled`;

    const html = buildSubscriptionEmailHtml({
      planLabel,
      isActive,
      billingUrl,
      brandName,
    });

    const text = buildSubscriptionEmailText({
      planLabel,
      isActive,
      billingUrl,
      brandName,
    });

    // Send via Resend HTTP API
    const result = await sendTransactionalEmail(ctx, {
      dedupeKey,
      emailType: "subscription_status",
      recipient: providerEmail,
      from,
      subject,
      html,
      text,
    });

    console.log(
      "Provider subscription email sent to:",
      providerEmail,
      "status:",
      status,
      "dedupeKey:",
      dedupeKey
    );
    return result;
  },
});

// ============ Subscription Email Templates ============

interface SubscriptionEmailParams {
  planLabel: string;
  isActive: boolean;
  billingUrl: string;
  brandName: string;
}

function buildSubscriptionEmailHtml(p: SubscriptionEmailParams): string {
  const statusColor = p.isActive ? "#06b6d4" : "#f97316";
  const statusLabel = p.isActive ? "Active" : "Canceled";
  const headline = p.isActive
    ? `Your ${p.planLabel} plan is now active`
    : `Your ${p.planLabel} plan has been canceled`;
  const body = p.isActive
    ? `You now have full access to all ${p.planLabel} features. Head to your billing dashboard to manage your subscription.`
    : `Your subscription has been canceled. Your storefront remains publicly accessible, but provider features are now restricted. You can resubscribe at any time.`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Subscription Update</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: Inter, -apple-system, sans-serif; color: #e5e5e5; }
    .container { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 40px 32px; }
    .brand { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #06b6d4; margin-bottom: 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #f5f5f5; margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: #a3a3a3; margin: 0 0 32px; line-height: 1.6; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; background: ${statusColor}22; color: ${statusColor}; border: 1px solid ${statusColor}44; margin-bottom: 24px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1f1f1f; font-size: 14px; }
    .detail-label { color: #737373; }
    .detail-value { color: #f5f5f5; font-weight: 500; }
    .cta { display: block; margin: 32px 0 0; padding: 14px 24px; background: #06b6d4; color: #000; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; border-radius: 8px; }
    .footer { margin-top: 32px; font-size: 12px; color: #525252; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="brand">${escapeHtml(p.brandName)}</div>
      <div class="status-badge">${escapeHtml(statusLabel)}</div>
      <h1>${escapeHtml(headline)}</h1>
      <p class="subtitle">${escapeHtml(body)}</p>
      <div class="detail-row">
        <span class="detail-label">Plan</span>
        <span class="detail-value">${escapeHtml(p.planLabel)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value">${escapeHtml(statusLabel)}</span>
      </div>
      <a href="${p.billingUrl}" class="cta">Manage Billing →</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${p.brandName}. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

function buildSubscriptionEmailText(p: SubscriptionEmailParams): string {
  const statusLabel = p.isActive ? "Active" : "Canceled";
  const headline = p.isActive
    ? `Your ${p.planLabel} plan is now active`
    : `Your ${p.planLabel} plan has been canceled`;
  const body = p.isActive
    ? `You now have full access to all ${p.planLabel} features.`
    : `Your subscription has been canceled. Your storefront remains publicly accessible, but provider features are now restricted. You can resubscribe at any time.`;

  return [
    p.brandName,
    ``,
    headline,
    ``,
    body,
    ``,
    `Plan: ${p.planLabel}`,
    `Status: ${statusLabel}`,
    ``,
    `Manage your billing:`,
    p.billingUrl,
    ``,
    `© ${new Date().getFullYear()} ${p.brandName}. All rights reserved.`,
  ].join("\n");
}

/**
 * Send booking confirmation email to the artist after a successful service checkout.
 *
 * Triggered from the Stripe webhook handler (convex/http.ts) after booking creation.
 * Uses emailEvents table for idempotency.
 *
 * Requirements: 30.3
 */
export const sendBookingConfirmationEmail = internalAction({
  args: {
    /** Stripe event ID — used to build the dedupeKey */
    stripeEventId: v.string(),
    /** Buyer email address from the Stripe checkout session */
    buyerEmail: v.string(),
    /** Service title for display in the email */
    serviceTitle: v.string(),
    /** Booking status (always "pending" at creation) */
    bookingStatus: v.string(),
  },
  handler: async (ctx, args) => {
    const { stripeEventId, buyerEmail, serviceTitle, bookingStatus } = args;

    // Requirement 30.3: Idempotency — skip if already sent
    const dedupeKey = `stripe:${stripeEventId}:booking_confirm`;

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://brolabentertainment.com";
    const brandName = process.env.BRAND_NAME || "BroLab Entertainment";
    const fromEmail = process.env.BRAND_EMAIL || "contact@brolabentertainment.com";
    const from = `${brandName} <${fromEmail}>`;

    // Requirement 30.3: Link to /artist dashboard
    const dashboardUrl = `${siteUrl}/artist`;

    const subject = `Booking confirmed — ${serviceTitle}`;

    const html = buildBookingEmailHtml({ serviceTitle, bookingStatus, dashboardUrl, brandName });
    const text = buildBookingEmailText({ serviceTitle, bookingStatus, dashboardUrl, brandName });

    const result = await sendTransactionalEmail(ctx, {
      dedupeKey,
      emailType: "booking_confirmation",
      recipient: buyerEmail,
      from,
      subject,
      html,
      text,
    });

    console.log("Booking confirmation email handled for:", buyerEmail, "dedupeKey:", dedupeKey);
    return result;
  },
});

// ============ Booking Email Templates ============

interface BookingEmailParams {
  serviceTitle: string;
  bookingStatus: string;
  dashboardUrl: string;
  brandName: string;
}

function buildBookingEmailHtml(p: BookingEmailParams): string {
  const statusLabel = p.bookingStatus.charAt(0).toUpperCase() + p.bookingStatus.slice(1);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Booking Confirmed</title>
  <style>
    body { margin: 0; padding: 0; background: #0a0a0a; font-family: Inter, -apple-system, sans-serif; color: #e5e5e5; }
    .container { max-width: 560px; margin: 40px auto; padding: 0 16px; }
    .card { background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 40px 32px; }
    .brand { font-size: 13px; font-weight: 600; letter-spacing: 0.08em; text-transform: uppercase; color: #06b6d4; margin-bottom: 32px; }
    h1 { font-size: 22px; font-weight: 700; color: #f5f5f5; margin: 0 0 8px; }
    .subtitle { font-size: 14px; color: #737373; margin: 0 0 32px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #1f1f1f; font-size: 14px; }
    .detail-label { color: #737373; }
    .detail-value { color: #f5f5f5; font-weight: 500; }
    .status-badge { display: inline-block; padding: 2px 10px; border-radius: 999px; font-size: 12px; font-weight: 600; background: #06b6d422; color: #06b6d4; border: 1px solid #06b6d444; }
    .cta { display: block; margin: 32px 0 0; padding: 14px 24px; background: #06b6d4; color: #000; font-size: 14px; font-weight: 600; text-align: center; text-decoration: none; border-radius: 8px; }
    .footer { margin-top: 32px; font-size: 12px; color: #525252; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="card">
      <div class="brand">${p.brandName}</div>
      <h1>Booking Confirmed</h1>
      <p class="subtitle">Your service booking has been received. The provider will be in touch shortly.</p>
      <div class="detail-row">
        <span class="detail-label">Service</span>
        <span class="detail-value">${escapeHtml(p.serviceTitle)}</span>
      </div>
      <div class="detail-row">
        <span class="detail-label">Status</span>
        <span class="detail-value"><span class="status-badge">${escapeHtml(statusLabel)}</span></span>
      </div>
      <a href="${p.dashboardUrl}" class="cta">View My Bookings →</a>
    </div>
    <div class="footer">
      © ${new Date().getFullYear()} ${p.brandName}. All rights reserved.
    </div>
  </div>
</body>
</html>`;
}

function buildBookingEmailText(p: BookingEmailParams): string {
  const statusLabel = p.bookingStatus.charAt(0).toUpperCase() + p.bookingStatus.slice(1);
  return [
    p.brandName,
    ``,
    `Booking Confirmed`,
    ``,
    `Your service booking has been received. The provider will be in touch shortly.`,
    ``,
    `Service: ${p.serviceTitle}`,
    `Status: ${statusLabel}`,
    ``,
    `View your bookings:`,
    p.dashboardUrl,
    ``,
    `© ${new Date().getFullYear()} ${p.brandName}. All rights reserved.`,
  ].join("\n");
}
