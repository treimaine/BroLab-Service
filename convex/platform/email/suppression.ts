/**
 * Send eligibility, unsubscribe tokens, and provider suppression.
 *
 * Two independent gates decide whether an address may be emailed:
 *   1. marketingOptIn — the recipient's own choice (unsubscribe link).
 *   2. suppressedReason — forced by Resend on hard bounce or spam complaint.
 *
 * Transactional mail (receipts, licenses) still sends to opted-out addresses:
 * a purchase receipt is a legal/contractual obligation, not marketing. It is
 * blocked only by a hard bounce, where delivery is physically impossible.
 */

import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  type QueryCtx,
} from "../../_generated/server";

/**
 * Email categories.
 *
 * "transactional" = triggered by an action the recipient took and expects a
 * record of. "lifecycle" = we initiated it (nudges, trial reminders, digests)
 * and it must honor unsubscribes.
 */
export type EmailCategory = "transactional" | "lifecycle";

// ============ Unsubscribe tokens ============

/**
 * Derive a stable unsubscribe token for an address.
 *
 * HMAC-SHA256 over the address, so the link cannot be forged to unsubscribe
 * someone else, and no token table is required. Truncated to 32 hex chars —
 * 128 bits, far beyond guessing range for this use.
 */
export async function buildUnsubscribeToken(email: string): Promise<string> {
  const secret = process.env.EMAIL_UNSUBSCRIBE_SECRET;
  if (!secret) {
    throw new Error(
      "EMAIL_UNSUBSCRIBE_SECRET not configured — required to generate unsubscribe links"
    );
  }

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(email.trim().toLowerCase())
  );

  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .slice(0, 32);
}

/** Constant-time comparison — avoids leaking token bytes via timing. */
function safeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i += 1) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function verifyUnsubscribeToken(
  email: string,
  token: string
): Promise<boolean> {
  const expected = await buildUnsubscribeToken(email);
  return safeEqual(expected, token);
}

/** Absolute one-click unsubscribe URL embedded in the footer and headers. */
export async function buildUnsubscribeUrl(email: string): Promise<string> {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://brolabentertainment.com";
  const token = await buildUnsubscribeToken(email);
  return `${siteUrl}/api/email/unsubscribe?email=${encodeURIComponent(email)}&token=${token}`;
}

// ============ Eligibility ============

async function readPreference(ctx: QueryCtx, email: string) {
  return await ctx.db
    .query("emailPreferences")
    .withIndex("by_email", (q) => q.eq("email", email.trim().toLowerCase()))
    .first();
}

/**
 * Decide whether a send may proceed.
 *
 * Returns a reason string when blocked so the caller can record why nothing
 * was sent instead of silently dropping the message.
 */
export const checkEligibility = internalQuery({
  args: {
    email: v.string(),
    category: v.union(v.literal("transactional"), v.literal("lifecycle")),
  },
  handler: async (
    ctx,
    args
  ): Promise<{ allowed: boolean; reason?: string }> => {
    const pref = await readPreference(ctx, args.email);
    if (!pref) return { allowed: true };

    // A hard bounce means the mailbox does not exist — never retry, any category.
    if (pref.suppressedReason === "hard_bounce") {
      return { allowed: false, reason: "hard_bounce" };
    }

    // A spam complaint blocks everything we are not obligated to send.
    if (pref.suppressedReason === "complaint" && args.category !== "transactional") {
      return { allowed: false, reason: "complaint" };
    }

    if (pref.suppressedReason === "manual" && args.category !== "transactional") {
      return { allowed: false, reason: "manually_suppressed" };
    }

    if (args.category === "lifecycle" && !pref.marketingOptIn) {
      return { allowed: false, reason: "unsubscribed" };
    }

    return { allowed: true };
  },
});

// ============ Mutations ============

export const recordUnsubscribe = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const now = Date.now();
    const existing = await readPreference(ctx, email);

    if (existing) {
      await ctx.db.patch(existing._id, {
        marketingOptIn: false,
        unsubscribedAt: now,
        updatedAt: now,
      });
      return { updated: true };
    }

    await ctx.db.insert("emailPreferences", {
      email,
      marketingOptIn: false,
      unsubscribedAt: now,
      createdAt: now,
      updatedAt: now,
    });
    return { updated: true };
  },
});

/** Re-enable lifecycle email — used by an in-app preferences toggle. */
export const recordResubscribe = internalMutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const now = Date.now();
    const existing = await readPreference(ctx, email);

    if (!existing) {
      await ctx.db.insert("emailPreferences", {
        email,
        marketingOptIn: true,
        createdAt: now,
        updatedAt: now,
      });
      return { updated: true };
    }

    // A complaint or bounce is not undone by the user asking to resubscribe —
    // the provider's verdict outranks the preference.
    if (existing.suppressedReason) {
      return { updated: false, reason: existing.suppressedReason };
    }

    await ctx.db.patch(existing._id, {
      marketingOptIn: true,
      unsubscribedAt: undefined,
      updatedAt: now,
    });
    return { updated: true };
  },
});

/** Called by the Resend webhook on bounce/complaint events. */
export const recordSuppression = internalMutation({
  args: {
    email: v.string(),
    reason: v.union(
      v.literal("hard_bounce"),
      v.literal("complaint"),
      v.literal("manual")
    ),
    detail: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const email = args.email.trim().toLowerCase();
    const now = Date.now();
    const existing = await readPreference(ctx, email);
    const detail = args.detail?.slice(0, 500);

    if (existing) {
      await ctx.db.patch(existing._id, {
        marketingOptIn: false,
        suppressedReason: args.reason,
        suppressedAt: now,
        lastBounceDetail: detail,
        updatedAt: now,
      });
      return { suppressed: true };
    }

    await ctx.db.insert("emailPreferences", {
      email,
      marketingOptIn: false,
      suppressedReason: args.reason,
      suppressedAt: now,
      lastBounceDetail: detail,
      createdAt: now,
      updatedAt: now,
    });
    return { suppressed: true };
  },
});

/** Deliverability health snapshot for the admin dashboard. */
export const getSuppressionStats = internalQuery({
  args: {},
  handler: async (ctx) => {
    const prefs = await ctx.db.query("emailPreferences").collect();
    return {
      total: prefs.length,
      unsubscribed: prefs.filter((p) => !p.marketingOptIn && !p.suppressedReason)
        .length,
      hardBounces: prefs.filter((p) => p.suppressedReason === "hard_bounce")
        .length,
      complaints: prefs.filter((p) => p.suppressedReason === "complaint").length,
    };
  },
});
