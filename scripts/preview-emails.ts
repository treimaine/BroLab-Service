/**
 * Render every email template to static HTML for visual review.
 *
 * Templates are pure functions, so they can be rendered outside Convex with no
 * database or Resend access. Run before shipping copy or layout changes:
 *
 *   npx tsx scripts/preview-emails.ts [outputDir]
 *
 * Writes one file per template plus an index.html contact sheet.
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import {
  formatPlanPriceLabel,
  type Locale,
} from "../convex/platform/email/i18n";
import * as retention from "../convex/platform/email/retentionTemplates";
import * as templates from "../convex/platform/email/templates";
import type { EmailBrand } from "../convex/platform/email/theme";

const brand: EmailBrand = {
  brandName: "BroLab Entertainment",
  siteUrl: "https://brolabentertainment.com",
};

const unsubscribeUrl = `${brand.siteUrl}/api/email/unsubscribe?email=demo%40example.com&token=preview`;
const base = { brand, unsubscribeUrl };

/** Retention templates are bilingual — both languages get rendered. */
const LOCALES: Locale[] = ["en", "fr"];
const billingUrl = `${brand.siteUrl}/studio/billing`;
const replyEmail = "contact@brolabentertainment.com";

const samples: Array<{ name: string; email: templates.RenderedEmail }> = [
  {
    name: "welcome",
    email: templates.welcome({
      ...base,
      onboardingUrl: `${brand.siteUrl}/onboarding`,
      trialDays: 30,
    }),
  },
  {
    name: "purchase-confirmation",
    email: templates.purchaseConfirmation({
      ...base,
      trackTitle: "Midnight Drive",
      tierLabel: "Premium License",
      dashboardUrl: `${brand.siteUrl}/artist`,
    }),
  },
  {
    name: "license-ready",
    email: templates.licenseReady({
      ...base,
      trackTitle: "Midnight Drive",
      tierLabel: "Premium License",
      dashboardUrl: `${brand.siteUrl}/artist`,
    }),
  },
  {
    name: "booking-confirmation",
    email: templates.bookingConfirmation({
      ...base,
      serviceTitle: "Mixing & Mastering — 1 track",
      statusLabel: "Pending",
      dashboardUrl: `${brand.siteUrl}/artist`,
    }),
  },
  {
    name: "seller-first-sale",
    email: templates.saleAlert({
      ...base,
      itemTitle: "Midnight Drive",
      amountCents: 4999,
      currency: "usd",
      tierLabel: "Premium License",
      isFirstSale: true,
      dashboardUrl: `${brand.siteUrl}/studio/metrics`,
    }),
  },
  {
    name: "seller-sale-alert",
    email: templates.saleAlert({
      ...base,
      itemTitle: "Neon Alley",
      amountCents: 2999,
      currency: "usd",
      tierLabel: "Basic License",
      isFirstSale: false,
      dashboardUrl: `${brand.siteUrl}/studio/metrics`,
    }),
  },
  {
    name: "weekly-digest-active",
    email: templates.weeklyDigest({
      ...base,
      salesCount: 4,
      revenueCents: 15996,
      currency: "usd",
      viewsCount: 312,
      commissionSavedCents: 2399,
      dashboardUrl: `${brand.siteUrl}/studio/metrics`,
    }),
  },
  {
    name: "weekly-digest-quiet",
    email: templates.weeklyDigest({
      ...base,
      salesCount: 0,
      revenueCents: 0,
      currency: "usd",
      viewsCount: 47,
      commissionSavedCents: 0,
      dashboardUrl: `${brand.siteUrl}/studio/metrics`,
    }),
  },
  ...(["day7", "day3", "day1", "expired"] as const).map((stage) => ({
    name: `trial-${stage}`,
    email: templates.trialReminder({
      ...base,
      stage,
      planLabel: "PRO",
      priceLabel: "$29.99/month",
      daysLeft: { day7: 7, day3: 3, day1: 1, expired: 0 }[stage],
      billingUrl: `${brand.siteUrl}/studio/billing`,
      publishedTracks: stage === "day7" ? 0 : 6,
      isActivated: stage !== "day7",
    }),
  })),
  {
    name: "abandonment-price",
    email: templates.abandonmentRecovery({
      ...base,
      trackTitle: "Midnight Drive",
      reason: "price",
      checkoutUrl: `${brand.siteUrl}/beats/demo`,
    }),
  },
  {
    name: "abandonment-license-unclear",
    email: templates.abandonmentRecovery({
      ...base,
      trackTitle: "Midnight Drive",
      reason: "license_unclear",
      checkoutUrl: `${brand.siteUrl}/beats/demo`,
    }),
  },
  ...(["choose_plan", "connect_stripe", "publish_offer"] as const).map(
    (stage) => ({
      name: `activation-${stage}`,
      email: templates.activationNudge({
        ...base,
        stage,
        url: `${brand.siteUrl}/studio`,
      }),
    })
  ),
  {
    name: "subscription-active",
    email: templates.subscriptionStatus({
      ...base,
      planLabel: "PRO",
      isActive: true,
      billingUrl: `${brand.siteUrl}/studio/billing`,
    }),
  },
  {
    name: "subscription-canceled",
    email: templates.subscriptionStatus({
      ...base,
      planLabel: "PRO",
      isActive: false,
      billingUrl: `${brand.siteUrl}/studio/billing`,
    }),
  },

  // ---- Revenue protection, both locales ----

  ...LOCALES.flatMap((locale) =>
    (["first", "reminder", "urgent", "final"] as const).map((stage) => ({
      name: `${locale}-dunning-${stage}`,
      email: retention.paymentFailed({
        ...base,
        locale,
        stage,
        planLabel: "PRO",
        priceLabel: formatPlanPriceLabel(29.99, locale),
        billingUrl,
      }),
    }))
  ),
  ...LOCALES.map((locale) => ({
    name: `${locale}-cancellation-survey`,
    email: retention.cancellationSurvey({
      ...base,
      locale,
      planLabel: "PRO",
      surveyUrl: `mailto:${replyEmail}`,
      reactivateUrl: billingUrl,
    }),
  })),
  // publishedTracks splits the copy, so render both branches of the fork.
  ...LOCALES.flatMap((locale) =>
    (["feedback", "value", "final"] as const).map((stage) => ({
      name: `${locale}-trial-winback-${stage}`,
      email: retention.trialWinback({
        ...base,
        locale,
        stage,
        planLabel: "BASIC",
        priceLabel: formatPlanPriceLabel(9.99, locale),
        publishedTracks: stage === "feedback" ? 0 : 6,
        billingUrl,
        replyEmail,
      }),
    }))
  ),
  ...LOCALES.map((locale) => ({
    name: `${locale}-trial-winback-feedback-engaged`,
    email: retention.trialWinback({
      ...base,
      locale,
      stage: "feedback" as const,
      planLabel: "BASIC",
      priceLabel: formatPlanPriceLabel(9.99, locale),
      publishedTracks: 4,
      billingUrl,
      replyEmail,
    }),
  })),
  ...LOCALES.flatMap((locale) =>
    (["whatsNew", "addressed", "openDoor"] as const).map((stage) => ({
      name: `${locale}-churn-winback-${stage}`,
      email: retention.churnWinback({
        ...base,
        locale,
        stage,
        priceLabel: formatPlanPriceLabel(29.99, locale),
        billingUrl,
        changelogUrl: `${brand.siteUrl}/changelog`,
        statedReason:
          stage === "addressed"
            ? locale === "fr"
              ? "trop cher pour ce que je vends"
              : "too expensive for what I sell"
            : null,
      }),
    }))
  ),
];

const outDir = process.argv[2] ?? join(process.cwd(), ".email-preview");
mkdirSync(outDir, { recursive: true });

for (const sample of samples) {
  writeFileSync(join(outDir, `${sample.name}.html`), sample.email.html, "utf8");
  writeFileSync(
    join(outDir, `${sample.name}.txt`),
    `Subject: ${sample.email.subject}\n\n${sample.email.text}`,
    "utf8"
  );
}

const index = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<title>Email previews</title></head>
<body style="margin:0;background:#EEF3FA;color:#071022;font-family:Inter,-apple-system,'Segoe UI',sans-serif;padding:32px;">
<h1 style="font-size:22px;margin:0 0 6px;">Email templates</h1>
<p style="color:#3E4C60;font-size:14px;margin:0 0 28px;">${samples.length} templates. Each card shows the live subject line.</p>
<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:14px;">
${samples
  .map(
    (s) => `<a href="${s.name}.html" style="display:block;padding:18px;background:#FFFFFF;border:1px solid #D7E0EC;border-radius:12px;text-decoration:none;box-shadow:0 1px 2px rgb(15 23 42 / .04);">
<div style="color:#077A96;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px;">${s.name}</div>
<div style="color:#071022;font-size:14px;line-height:1.5;">${s.email.subject.replace(/</g, "&lt;")}</div>
</a>`
  )
  .join("\n")}
</div></body></html>`;

writeFileSync(join(outDir, "index.html"), index, "utf8");
console.log(`Rendered ${samples.length} templates to ${outDir}`);
