/**
 * Email Idempotency Helpers
 *
 * Prevents duplicate emails from being sent for the same event.
 * Uses the emailEvents table as a deduplication log.
 *
 * DedupeKey convention: {source}:{eventId}:{emailType}
 * Examples:
 *   - "stripe:evt_123abc:purchase_confirmation"
 *   - "stripe:evt_456def:booking_confirmation"
 *   - "system:order_789:license_delivery"
 *
 * Requirements: 30.5
 */

import { v } from "convex/values";
import type { MutationCtx, QueryCtx } from "../_generated/server";
import { mutation, query } from "../_generated/server";

// ============ HELPERS (for use inside other mutations/actions) ============

/**
 * Check if an email event has already been sent.
 * Returns true if already sent (caller should skip sending).
 *
 * Usage:
 *   if (await checkEmailEvent(ctx, "resend", `stripe:${eventId}:purchase_confirmation`)) return;
 */
export async function checkEmailEvent(
  ctx: QueryCtx | MutationCtx,
  provider: string,
  dedupeKey: string
): Promise<boolean> {
  const existing = await ctx.db
    .query("emailEvents")
    .withIndex("by_dedupe", (q) =>
      q.eq("provider", provider).eq("dedupeKey", dedupeKey)
    )
    .first();
  return existing !== null;
}

/**
 * Record that an email event has been sent.
 * Call AFTER successfully sending the email.
 *
 * Usage:
 *   await recordEmailEvent(ctx, "resend", `stripe:${eventId}:purchase_confirmation`);
 */
export async function recordEmailEvent(
  ctx: MutationCtx,
  provider: string,
  dedupeKey: string
): Promise<void> {
  // Guard against race conditions: check again before inserting
  const existing = await ctx.db
    .query("emailEvents")
    .withIndex("by_dedupe", (q) =>
      q.eq("provider", provider).eq("dedupeKey", dedupeKey)
    )
    .first();
  if (existing) return;

  await ctx.db.insert("emailEvents", {
    provider,
    dedupeKey,
    createdAt: Date.now(),
  });
}

/**
 * Convenience wrapper: check idempotency, run sendFn if not already sent, record result.
 * Returns true if email was sent, false if skipped (already sent).
 *
 * Usage:
 *   const sent = await withEmailIdempotency(
 *     ctx,
 *     "resend",
 *     `stripe:${eventId}:purchase_confirmation`,
 *     async () => {
 *       await resend.emails.send({ ... });
 *     }
 *   );
 */
export async function withEmailIdempotency(
  ctx: MutationCtx,
  provider: string,
  dedupeKey: string,
  sendFn: () => Promise<void>
): Promise<boolean> {
  const alreadySent = await checkEmailEvent(ctx, provider, dedupeKey);
  if (alreadySent) return false;

  await sendFn();
  await recordEmailEvent(ctx, provider, dedupeKey);
  return true;
}

// ============ CONVEX FUNCTIONS (for external callers) ============

/**
 * Check if an email event has already been sent (query for external callers).
 */
export const check = query({
  args: {
    provider: v.string(),
    dedupeKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("emailEvents")
      .withIndex("by_dedupe", (q) =>
        q.eq("provider", args.provider).eq("dedupeKey", args.dedupeKey)
      )
      .first();
    return existing !== null;
  },
});

/**
 * Record that an email event has been sent (mutation for external callers).
 * Idempotent: safe to call multiple times for the same event.
 */
export const record = mutation({
  args: {
    provider: v.string(),
    dedupeKey: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("emailEvents")
      .withIndex("by_dedupe", (q) =>
        q.eq("provider", args.provider).eq("dedupeKey", args.dedupeKey)
      )
      .first();
    if (existing) return { alreadyExists: true };

    const id = await ctx.db.insert("emailEvents", {
      provider: args.provider,
      dedupeKey: args.dedupeKey,
      createdAt: Date.now(),
    });

    return { alreadyExists: false, id };
  },
});
