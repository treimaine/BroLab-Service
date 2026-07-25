/**
 * Unsubscribe verification.
 *
 * Lives in an action rather than a mutation because token verification uses
 * Web Crypto (`crypto.subtle`), which is only available in the action runtime.
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { internalAction } from "../../_generated/server";
import { verifyUnsubscribeToken } from "./suppression";

export const verifyAndUnsubscribe = internalAction({
  args: { email: v.string(), token: v.string() },
  handler: async (ctx, args): Promise<{ ok: boolean }> => {
    const valid = await verifyUnsubscribeToken(args.email, args.token);
    if (!valid) return { ok: false };

    await ctx.runMutation(
      internal.platform.email.suppression.recordUnsubscribe,
      { email: args.email }
    );
    return { ok: true };
  },
});
