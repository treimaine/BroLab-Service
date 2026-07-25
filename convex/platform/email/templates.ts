/**
 * Email content.
 *
 * Every template returns { subject, html, text } and is a pure function of its
 * params — no I/O, no env reads beyond the passed-in brand. That keeps them
 * trivially previewable (see scripts/preview-emails.ts) and testable.
 *
 * Copy rules applied throughout:
 *   - Subject lines lead with the outcome, not the feature.
 *   - One primary CTA per email. Secondary links never compete visually.
 *   - The 0% commission differentiator is stated wherever money is involved,
 *     because that is the single reason to choose this over Beatstars/Airbit.
 */

import {
  badge,
  bulletList,
  button,
  detailTable,
  escapeHtml,
  h1,
  noteBox,
  paragraph,
  renderEmailLayout,
  richParagraph,
  secondaryLink,
  statBlock,
  strong,
  textFooter,
  type EmailBrand,
} from "./theme";

export interface RenderedEmail {
  subject: string;
  html: string;
  text: string;
}

interface BaseParams {
  brand: EmailBrand;
  unsubscribeUrl?: string;
}

function formatMoney(amountCents: number, currency = "usd"): string {
  const symbol = currency.toLowerCase() === "eur" ? "€" : "$";
  return `${symbol}${(amountCents / 100).toFixed(2)}`;
}

// ============================================================================
// TRANSACTIONAL — buyer side
// ============================================================================

export function purchaseConfirmation(
  p: BaseParams & {
    trackTitle: string;
    tierLabel: string;
    dashboardUrl: string;
  }
): RenderedEmail {
  const body = [
    badge("Confirmed", "success"),
    h1("Your track is ready"),
    paragraph(
      `You now own ${p.trackTitle} under the ${p.tierLabel}. Download the files any time from your dashboard — your license never expires.`
    ),
    detailTable([
      { label: "Track", value: p.trackTitle },
      { label: "License", value: p.tierLabel },
    ]),
    button("Download my files", p.dashboardUrl),
    noteBox(
      "Your license PDF is generated separately and will arrive in a second email within a few minutes."
    ),
  ].join("\n");

  return {
    subject: `Your purchase is confirmed — ${p.trackTitle}`,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: `${p.trackTitle} is ready to download in your dashboard.`,
      body,
      footerNote: "You received this because you completed a purchase.",
    }),
    text: [
      "Your track is ready",
      "",
      `You now own ${p.trackTitle} under the ${p.tierLabel}. Download the files any time from your dashboard — your license never expires.`,
      "",
      `Track: ${p.trackTitle}`,
      `License: ${p.tierLabel}`,
      "",
      `Download your files: ${p.dashboardUrl}`,
      "",
      "Your license PDF is generated separately and will arrive in a second email within a few minutes.",
      textFooter(p.brand),
    ].join("\n"),
  };
}

export function licenseReady(
  p: BaseParams & {
    trackTitle: string;
    tierLabel: string;
    dashboardUrl: string;
  }
): RenderedEmail {
  const body = [
    badge("License issued", "accent"),
    h1("Your license PDF is ready"),
    paragraph(
      `The signed license for ${p.trackTitle} (${p.tierLabel}) has been generated. It records the exact terms in force at the moment of purchase — keep it for your records.`
    ),
    detailTable([
      { label: "Track", value: p.trackTitle },
      { label: "License", value: p.tierLabel },
    ]),
    button("Download license and files", p.dashboardUrl),
  ].join("\n");

  return {
    subject: `Your license is ready — ${p.trackTitle}`,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: `The signed PDF for ${p.trackTitle} is available now.`,
      body,
      footerNote: "You received this because you completed a purchase.",
    }),
    text: [
      "Your license PDF is ready",
      "",
      `The signed license for ${p.trackTitle} (${p.tierLabel}) has been generated. It records the exact terms in force at the moment of purchase — keep it for your records.`,
      "",
      `Download: ${p.dashboardUrl}`,
      textFooter(p.brand),
    ].join("\n"),
  };
}

export function bookingConfirmation(
  p: BaseParams & {
    serviceTitle: string;
    statusLabel: string;
    dashboardUrl: string;
  }
): RenderedEmail {
  const body = [
    badge("Booking received", "success"),
    h1("Your session is booked"),
    paragraph(
      `${p.serviceTitle} is confirmed and the provider has been notified. They will reach out with next steps and scheduling.`
    ),
    detailTable([
      { label: "Service", value: p.serviceTitle },
      { label: "Status", value: p.statusLabel },
    ]),
    button("View my bookings", p.dashboardUrl),
  ].join("\n");

  return {
    subject: `Booking confirmed — ${p.serviceTitle}`,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: `${p.serviceTitle} is confirmed. The provider will be in touch.`,
      body,
      footerNote: "You received this because you booked a service.",
    }),
    text: [
      "Your session is booked",
      "",
      `${p.serviceTitle} is confirmed and the provider has been notified. They will reach out with next steps and scheduling.`,
      "",
      `Service: ${p.serviceTitle}`,
      `Status: ${p.statusLabel}`,
      "",
      `View your bookings: ${p.dashboardUrl}`,
      textFooter(p.brand),
    ].join("\n"),
  };
}

// ============================================================================
// TRANSACTIONAL — seller side
// ============================================================================

/**
 * Sale alert.
 *
 * The highest-retention email in the system: it is the moment the product
 * visibly pays for itself. Showing the commission a competitor would have taken
 * turns each sale into a renewal argument.
 */
export function saleAlert(
  p: BaseParams & {
    itemTitle: string;
    amountCents: number;
    currency: string;
    tierLabel?: string;
    isFirstSale: boolean;
    dashboardUrl: string;
  }
): RenderedEmail {
  const gross = formatMoney(p.amountCents, p.currency);
  // Beatstars/Airbit free tiers take 10-30%; 15% is a conservative midpoint for
  // the comparison and is labelled as an estimate in the copy.
  const competitorCut = formatMoney(Math.round(p.amountCents * 0.15), p.currency);

  const rows = [
    { label: "Item", value: p.itemTitle },
    ...(p.tierLabel ? [{ label: "License", value: p.tierLabel }] : []),
    { label: "Sale amount", value: gross },
    { label: "Platform commission", value: "$0.00" },
    { label: "You keep", value: gross },
  ];

  const body = [
    badge(p.isFirstSale ? "First sale" : "New sale", "success"),
    h1(p.isFirstSale ? "You made your first sale" : "You just made a sale"),
    statBlock(gross, "paid out to you, in full"),
    richParagraph(
      p.isFirstSale
        ? `This is the one that matters. ${escapeHtml(p.itemTitle)} sold for ${strong(gross)} and every cent goes to your account — we take ${strong("0% commission")}, now and always.`
        : `${escapeHtml(p.itemTitle)} sold for ${strong(gross)}. You keep all of it — we take ${strong("0% commission")}.`
    ),
    detailTable(rows),
    noteBox(
      `On a platform charging 15%, this sale would have cost you ${competitorCut}. Your subscription is flat, so the more you sell, the more that gap compounds.`
    ),
    button("See my earnings", p.dashboardUrl),
  ].join("\n");

  return {
    subject: p.isFirstSale
      ? `Your first sale — ${gross}, and you keep all of it`
      : `You sold ${p.itemTitle} — ${gross}, 0% taken`,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: `${gross} from ${p.itemTitle}. Commission taken: $0.00.`,
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: "You received this because you made a sale on your storefront.",
    }),
    text: [
      p.isFirstSale ? "You made your first sale" : "You just made a sale",
      "",
      `${p.itemTitle} sold for ${gross}. You keep all of it — we take 0% commission.`,
      "",
      `Sale amount: ${gross}`,
      `Platform commission: $0.00`,
      `You keep: ${gross}`,
      "",
      `On a platform charging 15%, this sale would have cost you ${competitorCut}.`,
      "",
      `See your earnings: ${p.dashboardUrl}`,
      textFooter(p.brand, p.unsubscribeUrl),
    ].join("\n"),
  };
}

/** Weekly earnings digest — keeps the value visible between sales. */
export function weeklyDigest(
  p: BaseParams & {
    salesCount: number;
    revenueCents: number;
    currency: string;
    viewsCount: number;
    commissionSavedCents: number;
    dashboardUrl: string;
  }
): RenderedEmail {
  const revenue = formatMoney(p.revenueCents, p.currency);
  const saved = formatMoney(p.commissionSavedCents, p.currency);
  const hadSales = p.salesCount > 0;

  const body = hadSales
    ? [
        badge("Weekly recap", "accent"),
        h1(`${revenue} earned this week`),
        statBlock(saved, "kept that a 15% platform would have taken"),
        detailTable([
          { label: "Sales", value: String(p.salesCount) },
          { label: "Revenue", value: revenue },
          { label: "Commission paid", value: "$0.00" },
          { label: "Storefront views", value: String(p.viewsCount) },
        ]),
        button("Open my dashboard", p.dashboardUrl),
      ].join("\n")
    : [
        badge("Weekly recap", "accent"),
        h1(`${p.viewsCount} people viewed your storefront`),
        paragraph(
          p.viewsCount > 0
            ? "Traffic arrived but nothing sold. That gap is usually pricing or catalog depth, not demand."
            : "Quiet week on traffic. The fastest fix is more catalog — each new beat is another entry point from search."
        ),
        bulletList([
          "Upload two or three new beats — catalog size drives discovery more than anything else",
          "Check that your best track is priced at the tier buyers actually pick",
          "Share your storefront link where your audience already is",
        ]),
        button("Open my dashboard", p.dashboardUrl),
      ].join("\n");

  return {
    subject: hadSales
      ? `${revenue} earned this week — $0 in commission`
      : `Your week: ${p.viewsCount} storefront views`,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: hadSales
        ? `${p.salesCount} sale(s), ${revenue} earned, ${saved} kept in commission.`
        : "Here is what happened on your storefront this week.",
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: "Weekly summary for your storefront.",
    }),
    text: [
      hadSales ? `${revenue} earned this week` : `${p.viewsCount} storefront views this week`,
      "",
      `Sales: ${p.salesCount}`,
      `Revenue: ${revenue}`,
      `Commission paid: $0.00`,
      `Storefront views: ${p.viewsCount}`,
      "",
      `Open your dashboard: ${p.dashboardUrl}`,
      textFooter(p.brand, p.unsubscribeUrl),
    ].join("\n"),
  };
}

// ============================================================================
// LIFECYCLE — activation and conversion
// ============================================================================

export function welcome(
  p: BaseParams & { onboardingUrl: string; trialDays: number }
): RenderedEmail {
  const body = [
    h1("Welcome — your storefront starts here"),
    paragraph(
      `You have ${p.trialDays} days of full access, no card charged today. The goal for your first session is simple: get one beat live so your storefront has something to sell.`
    ),
    bulletList([
      "Claim your storefront name and URL",
      "Connect Stripe so payments land in your bank account directly",
      "Upload your first beat and set its license tiers",
    ]),
    button("Set up my storefront", p.onboardingUrl),
    noteBox(
      "We charge a flat subscription and take 0% of your sales — every dollar a customer pays you is yours."
    ),
  ].join("\n");

  return {
    subject: "Your storefront is ready to set up",
    html: renderEmailLayout({
      brand: p.brand,
      preheader: `${p.trialDays} days of full access. First step: get one beat live.`,
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: "You received this because you created an account.",
    }),
    text: [
      "Welcome — your storefront starts here",
      "",
      `You have ${p.trialDays} days of full access, no card charged today. The goal for your first session is simple: get one beat live so your storefront has something to sell.`,
      "",
      "- Claim your storefront name and URL",
      "- Connect Stripe so payments land in your bank account directly",
      "- Upload your first beat and set its license tiers",
      "",
      `Set up your storefront: ${p.onboardingUrl}`,
      "",
      "We charge a flat subscription and take 0% of your sales.",
      textFooter(p.brand, p.unsubscribeUrl),
    ].join("\n"),
  };
}

export type TrialStage = "day7" | "day3" | "day1" | "expired";

/**
 * Trial reminders.
 *
 * Each stage carries a different argument rather than escalating urgency alone:
 * day 7 reframes value, day 3 removes friction, day 1 states the deadline
 * plainly, expired offers a one-click return path.
 */
export function trialReminder(
  p: BaseParams & {
    stage: TrialStage;
    planLabel: string;
    priceLabel: string;
    daysLeft: number;
    billingUrl: string;
    publishedTracks: number;
    isActivated: boolean;
  }
): RenderedEmail {
  const activationNudge = !p.isActivated
    ? noteBox(
        "Your storefront has nothing published yet. Upload one beat before your trial ends — an empty storefront cannot convert the traffic you send it."
      )
    : "";

  const content: Record<
    TrialStage,
    { subject: string; heading: string; lead: string; cta: string; tone: "accent" | "warning" }
  > = {
    day7: {
      subject: `7 days left on your ${p.planLabel} trial`,
      heading: "One week left on your trial",
      lead: `Your ${p.planLabel} trial ends in 7 days, after which it continues at ${p.priceLabel}. You have published ${p.publishedTracks} track${p.publishedTracks === 1 ? "" : "s"} so far.`,
      cta: "Review my plan",
      tone: "accent",
    },
    day3: {
      subject: `3 days left — keep your storefront live`,
      heading: "Three days left",
      lead: `Your ${p.planLabel} trial ends in 3 days. Confirm your plan now and nothing about your storefront changes — same URL, same catalog, same 0% commission on every sale.`,
      cta: "Confirm my plan",
      tone: "accent",
    },
    day1: {
      subject: `Your trial ends tomorrow`,
      heading: "Your trial ends tomorrow",
      lead: `Tomorrow your ${p.planLabel} trial ends. If you do nothing, your catalog freezes — no new uploads, no publishing, no price changes. Anything already live keeps selling. Continuing costs ${p.priceLabel}.`,
      cta: "Keep my catalog open",
      tone: "warning",
    },
    expired: {
      subject: "Your catalog is frozen",
      heading: "Your trial has ended",
      lead: `Everything you published is still online and still selling — you just can't add to it or change it any more. Picking a plan unfreezes it immediately: ${p.priceLabel}, 0% commission.`,
      cta: "Unfreeze my catalog",
      tone: "warning",
    },
  };

  const c = content[p.stage];
  const badgeLabel =
    p.stage === "expired"
      ? "Paused"
      : `${p.daysLeft} ${p.daysLeft === 1 ? "day" : "days"} left`;
  const body = [
    badge(badgeLabel, c.tone),
    h1(c.heading),
    paragraph(c.lead),
    activationNudge,
    button(c.cta, p.billingUrl),
    secondaryLink("Compare BASIC and PRO", `${p.brand.siteUrl}/pricing`),
  ].join("\n");

  return {
    subject: c.subject,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: c.lead.slice(0, 110),
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: "You received this because you have an active trial.",
    }),
    text: [
      c.heading,
      "",
      c.lead,
      "",
      `${c.cta}: ${p.billingUrl}`,
      textFooter(p.brand, p.unsubscribeUrl),
    ].join("\n"),
  };
}

/**
 * Checkout abandonment recovery.
 *
 * The survey already captured *why* the buyer left, so the reply answers that
 * specific objection instead of sending a generic "you left something behind".
 */
export function abandonmentRecovery(
  p: BaseParams & {
    trackTitle: string;
    reason: string;
    checkoutUrl: string;
  }
): RenderedEmail {
  const objection: Record<string, { heading: string; answer: string }> = {
    price: {
      heading: "Still thinking about the price?",
      answer:
        "The basic tier covers most releases and costs the least. If you only need the beat for a single track, it is likely all you need — you can always upgrade the license later without repurchasing.",
    },
    too_expensive: {
      heading: "Still thinking about the price?",
      answer:
        "The basic tier covers most releases and costs the least. You can always upgrade the license later without repurchasing.",
    },
    license_unclear: {
      heading: "Not sure which license you need?",
      answer:
        "Basic covers streaming and non-profit releases. Premium adds commercial distribution. Unlimited includes stems and removes all caps. Every purchase ships with a signed PDF stating the exact terms.",
    },
    payment_issue: {
      heading: "Payment did not go through?",
      answer:
        "Checkout runs on Stripe and accepts all major cards. If your card was declined, retrying usually clears it — no charge was made.",
    },
    just_browsing: {
      heading: "Still deciding?",
      answer:
        "No rush. Your selection is saved and the checkout link below picks up exactly where you left off.",
    },
  };

  const matched = objection[p.reason] ?? {
    heading: "You left something behind",
    answer:
      "Your selection is saved and the checkout link below picks up exactly where you left off.",
  };

  const body = [
    h1(matched.heading),
    paragraph(`You were about to buy ${p.trackTitle}.`),
    paragraph(matched.answer),
    button("Complete my purchase", p.checkoutUrl),
    noteBox(
      "Instant download after payment. The license PDF arrives by email within minutes."
    ),
  ].join("\n");

  return {
    subject: `${p.trackTitle} is still available`,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: `Pick up where you left off with ${p.trackTitle}.`,
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: "You received this because you started a checkout.",
    }),
    text: [
      matched.heading,
      "",
      `You were about to buy ${p.trackTitle}.`,
      "",
      matched.answer,
      "",
      `Complete your purchase: ${p.checkoutUrl}`,
      textFooter(p.brand, p.unsubscribeUrl),
    ].join("\n"),
  };
}

/** Contextual activation nudge — replaces onboarding calls with one next step. */
export function activationNudge(
  p: BaseParams & {
    stage: "choose_plan" | "connect_stripe" | "publish_offer";
    url: string;
  }
): RenderedEmail {
  const content = {
    choose_plan: {
      subject: "Your storefront is ready — activate your free month",
      heading: "Pick BASIC or PRO to go live",
      lead: "Your storefront is saved. Starting your free month unlocks publishing, services and direct sales — no card charged today.",
      cta: "Start my free month",
    },
    connect_stripe: {
      subject: "One step left before you can get paid",
      heading: "Connect Stripe to receive payments",
      lead: "Your plan is active. Connecting Stripe sends customer payments straight to your bank account — we never hold your money and take 0% of it.",
      cta: "Connect Stripe",
    },
    publish_offer: {
      subject: "Publish your first offer today",
      heading: "Add one beat or one service",
      lead: "Billing and payouts are ready. Publish one offer so your storefront has something customers can actually buy.",
      cta: "Finish my storefront",
    },
  }[p.stage];

  const body = [
    h1(content.heading),
    paragraph(content.lead),
    button(content.cta, p.url),
    noteBox("No call required — the in-app checklist guides every step."),
  ].join("\n");

  return {
    subject: content.subject,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: content.lead.slice(0, 110),
      body,
      unsubscribeUrl: p.unsubscribeUrl,
      footerNote: "You received this because you started setting up a storefront.",
    }),
    text: [
      content.heading,
      "",
      content.lead,
      "",
      `${content.cta}: ${p.url}`,
      "",
      "No call required — the in-app checklist guides every step.",
      textFooter(p.brand, p.unsubscribeUrl),
    ].join("\n"),
  };
}

export function subscriptionStatus(
  p: BaseParams & {
    planLabel: string;
    isActive: boolean;
    billingUrl: string;
  }
): RenderedEmail {
  const body = p.isActive
    ? [
        badge("Active", "success"),
        h1(`Your ${p.planLabel} plan is live`),
        paragraph(
          `Full ${p.planLabel} access is enabled. Every sale you make from here is yours in full — we take 0% commission, and that does not change with volume.`
        ),
        detailTable([
          { label: "Plan", value: p.planLabel },
          { label: "Status", value: "Active" },
          { label: "Sales commission", value: "0%" },
        ]),
        button("Open my dashboard", `${p.brand.siteUrl}/studio`),
      ].join("\n")
    : [
        badge("Canceled", "warning"),
        h1(`Your ${p.planLabel} plan is canceled`),
        paragraph(
          "Your storefront stays publicly visible, but publishing and new orders are paused. Your catalog and settings are kept intact — resubscribing restores everything exactly as it was."
        ),
        detailTable([
          { label: "Plan", value: p.planLabel },
          { label: "Status", value: "Canceled" },
        ]),
        button("Reactivate my plan", p.billingUrl),
      ].join("\n");

  return {
    subject: p.isActive
      ? `Your ${p.planLabel} subscription is now active`
      : `Your ${p.planLabel} subscription has been canceled`,
    html: renderEmailLayout({
      brand: p.brand,
      preheader: p.isActive
        ? `${p.planLabel} access is enabled. 0% commission on every sale.`
        : "Your catalog is kept intact and returns when you resubscribe.",
      body,
      footerNote: "You received this because your subscription status changed.",
    }),
    text: [
      p.isActive
        ? `Your ${p.planLabel} plan is live`
        : `Your ${p.planLabel} plan is canceled`,
      "",
      p.isActive
        ? `Full ${p.planLabel} access is enabled. We take 0% commission on your sales.`
        : "Your storefront stays visible, but publishing and new orders are paused. Your catalog is kept intact.",
      "",
      `Plan: ${p.planLabel}`,
      `Status: ${p.isActive ? "Active" : "Canceled"}`,
      "",
      `Manage billing: ${p.billingUrl}`,
      textFooter(p.brand),
    ].join("\n"),
  };
}
