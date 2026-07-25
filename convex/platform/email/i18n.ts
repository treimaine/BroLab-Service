/**
 * Email localization (FR / EN).
 *
 * The paying segments — producers and audio engineers — are reached first
 * through the founder's own French-speaking network, while the type-beat market
 * at large is English-speaking. Sending everyone English costs conversions in
 * the near term; sending everyone French caps the ceiling. So locale travels
 * with the recipient, resolved once per send.
 *
 * Resolution order, most to least trustworthy:
 *   1. emailPreferences.locale — captured from the recipient's own browser.
 *   2. Clerk user metadata — set during signup flows that know the locale.
 *   3. "en" — the safe default for an unknown recipient.
 *
 * Copy itself lives inline in each template as an `{ en, fr }` pair rather than
 * in central message catalogs. Email copy is layout-coupled (a French sentence
 * that wraps to three lines breaks a button), so keeping both languages beside
 * the markup is what makes divergence visible in review.
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import {
  internalMutation,
  internalQuery,
  mutation,
  type ActionCtx,
  type QueryCtx,
} from "../../_generated/server";

export type Locale = "en" | "fr";

export const DEFAULT_LOCALE: Locale = "en";

export const localeValidator = v.union(v.literal("en"), v.literal("fr"));

/**
 * Reduce any BCP 47 tag to a supported locale.
 *
 * "fr-CA", "FR", "fr_BE" all collapse to "fr". Anything unrecognized returns
 * null so callers can distinguish "no signal" from "explicitly English" and
 * avoid overwriting a good stored value with a guess.
 */
export function normalizeLocale(raw: string | null | undefined): Locale | null {
  if (!raw) return null;
  const base = raw.trim().toLowerCase().replace("_", "-").split("-")[0];
  if (base === "fr") return "fr";
  if (base === "en") return "en";
  return null;
}

/**
 * Select the variant for a locale.
 *
 * Typed so a template that adds an English string without its French
 * counterpart fails to compile rather than silently shipping a gap.
 */
export function pick<T>(locale: Locale, variants: Record<Locale, T>): T {
  return variants[locale] ?? variants[DEFAULT_LOCALE];
}

/** Locale-correct money formatting: "$29.99" vs "29,99 $". */
export function formatMoneyLocalized(
  amountCents: number,
  currency: string,
  locale: Locale
): string {
  const symbol = currency.toLowerCase() === "eur" ? "€" : "$";
  const amount = (amountCents / 100).toFixed(2);
  return locale === "fr"
    ? `${amount.replace(".", ",")} ${symbol}`
    : `${symbol}${amount}`;
}

/**
 * Recurring plan price as one label: "$29.99/month" vs "29,99 $/mois".
 *
 * Prices are stored as plain USD numbers in billing/plans.ts, so without this
 * the dollar amount lands untranslated in the middle of a French sentence —
 * which is exactly the detail that makes a localized email read as machine
 * output.
 */
export function formatPlanPriceLabel(
  monthlyUsd: number,
  locale: Locale
): string {
  return locale === "fr"
    ? `${monthlyUsd.toFixed(2).replace(".", ",")} $/mois`
    : `$${monthlyUsd}/month`;
}

/** Locale-correct date, e.g. "March 4" vs "4 mars". */
export function formatDateLocalized(timestamp: number, locale: Locale): string {
  return new Date(timestamp).toLocaleDateString(
    locale === "fr" ? "fr-FR" : "en-US",
    { day: "numeric", month: "long" }
  );
}

// ============================================================================
// Storage
// ============================================================================

async function readPreference(ctx: QueryCtx, email: string) {
  return await ctx.db
    .query("emailPreferences")
    .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
    .first();
}

export const getStoredLocale = internalQuery({
  args: { email: v.string() },
  returns: v.union(localeValidator, v.null()),
  handler: async (ctx, args): Promise<Locale | null> => {
    const pref = await readPreference(ctx, args.email);
    return normalizeLocale(pref?.locale);
  },
});

/**
 * Persist a locale for an address.
 *
 * Creates the preferences row when absent so a locale can be recorded before
 * the recipient has any send history. `marketingOptIn` defaults to true here
 * because this path only ever runs for people already inside the product — an
 * unsubscribe that arrives later still wins, since it patches the same row.
 */
export const storeLocale = internalMutation({
  args: { email: v.string(), locale: localeValidator },
  returns: v.object({ updated: v.boolean() }),
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const now = Date.now();
    const existing = await readPreference(ctx, email);

    if (existing) {
      if (existing.locale === args.locale) return { updated: false };
      await ctx.db.patch(existing._id, { locale: args.locale, updatedAt: now });
      return { updated: true };
    }

    await ctx.db.insert("emailPreferences", {
      email,
      marketingOptIn: true,
      locale: args.locale,
      createdAt: now,
      updatedAt: now,
    });
    return { updated: true };
  },
});

// ============================================================================
// Send-time resolution
// ============================================================================

/**
 * Read a locale hint out of Clerk user metadata.
 *
 * Clerk has no first-class locale field, so signup flows write one into
 * `unsafe_metadata.locale` (client-writable, set at sign-up) or
 * `public_metadata.locale` (server-written). Either is a weaker signal than a
 * captured browser language, so this is only consulted as a fallback.
 *
 * Network failure here is never worth failing a send over — the caller gets
 * null and the send proceeds in the default locale.
 */
async function fetchClerkLocale(clerkUserId: string): Promise<Locale | null> {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;
  if (!clerkSecretKey) return null;

  try {
    const response = await fetch(
      `https://api.clerk.com/v1/users/${clerkUserId}`,
      {
        headers: {
          Authorization: `Bearer ${clerkSecretKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    if (!response.ok) return null;

    const user = (await response.json()) as {
      unsafe_metadata?: Record<string, unknown>;
      public_metadata?: Record<string, unknown>;
    };

    const candidate =
      user.unsafe_metadata?.locale ?? user.public_metadata?.locale;
    return typeof candidate === "string" ? normalizeLocale(candidate) : null;
  } catch {
    return null;
  }
}

/**
 * Decide which language to render a send in.
 *
 * Every lifecycle and transactional action calls this immediately before
 * building its template. A stored preference short-circuits the Clerk lookup,
 * so the common path costs one indexed query.
 */
export async function resolveRecipientLocale(
  ctx: ActionCtx,
  target: { email: string; clerkUserId?: string | null }
): Promise<Locale> {
  const stored: Locale | null = await ctx.runQuery(
    internal.platform.email.i18n.getStoredLocale,
    { email: target.email }
  );
  if (stored) return stored;

  if (target.clerkUserId) {
    const fromClerk = await fetchClerkLocale(target.clerkUserId);
    if (fromClerk) {
      // Cache it so subsequent sends skip the Clerk round-trip.
      await ctx.runMutation(internal.platform.email.i18n.storeLocale, {
        email: target.email,
        locale: fromClerk,
      });
      return fromClerk;
    }
  }

  return DEFAULT_LOCALE;
}

/**
 * Client-side capture point.
 *
 * Called from the app with `navigator.language`. The address is taken from the
 * verified Clerk identity rather than an argument, so this cannot be used to
 * write a locale onto somebody else's preferences row.
 */
export const captureMyLocale = mutation({
  args: { locale: v.string() },
  returns: v.object({
    stored: v.boolean(),
    changed: v.optional(v.boolean()),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity?.email) return { stored: false, reason: "no_identity_email" };

    const locale = normalizeLocale(args.locale);
    if (!locale) return { stored: false, reason: "unsupported_locale" };

    const email = identity.email.trim().toLowerCase();
    const now = Date.now();
    const existing = await readPreference(ctx, email);

    if (existing) {
      if (existing.locale === locale) return { stored: true, changed: false };
      await ctx.db.patch(existing._id, { locale, updatedAt: now });
      return { stored: true, changed: true };
    }

    await ctx.db.insert("emailPreferences", {
      email,
      marketingOptIn: true,
      locale,
      createdAt: now,
      updatedAt: now,
    });
    return { stored: true, changed: true };
  },
});
