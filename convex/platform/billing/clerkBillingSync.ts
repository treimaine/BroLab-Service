/**
 * Clerk Billing Sync
 *
 * Synchronizes subscription data from the Clerk Billing API into Convex.
 *
 * Clerk Billing webhooks (subscriptionItem.*) are the real-time path — see
 * `convex/http.ts`. This module is the *pull* path: it reconciles Convex with
 * Clerk's authoritative state, so a missed or undelivered webhook can never
 * leave a paying provider stuck on the free tier.
 *
 * Requirements: 3.1, 3.4, 3.7, 3.8
 */

import { v } from "convex/values";
import { internal } from "../../_generated/api";
import { action, internalMutation } from "../../_generated/server";
import {
  resolvePlanKeyFromClerkPlanId,
  type PlanKey,
} from "./plans";
import { mapClerkSubscriptionStatus } from "./status";

/**
 * How long a synced subscription is considered fresh (ms).
 * Anything older is re-pulled from Clerk on the next read.
 */
const SYNC_TTL_MS = 5 * 60 * 1000;

type SyncStatus = "active" | "inactive" | "canceled";

interface ClerkSubscriptionItem {
  status?: string;
  plan_id?: string;
  plan?: {
    id?: string;
    slug?: string;
    name?: string;
  };
}

interface ClerkSubscription {
  status?: string;
  subscription_items?: ClerkSubscriptionItem[];
}

/**
 * Resolve a Clerk plan slug/id/name to one of our internal plan keys.
 *
 * Clerk plan ids are opaque (`cplan_...`), so the slug is the reliable signal.
 * The default "free_user" plan intentionally resolves to null — a free plan is
 * not a paid entitlement.
 */
export function resolveClerkPlanKey(
  slug?: string,
  planId?: string,
  name?: string
): PlanKey | null {
  const exactPlan = resolvePlanKeyFromClerkPlanId(planId);
  if (exactPlan) return exactPlan;

  const haystack = `${slug ?? ""} ${planId ?? ""} ${name ?? ""}`.toLowerCase();

  if (haystack.includes("free")) return null;
  if (haystack.includes("pro")) return "pro";
  if (haystack.includes("basic")) return "basic";

  return null;
}

/**
 * Map a Clerk subscription/item status to our internal status.
 */
/**
 * Pick the subscription item that should drive entitlements.
 *
 * A Clerk subscription can hold several items (e.g. the default free plan plus
 * an upgrade). Active items win over inactive ones, PRO wins over BASIC.
 */
function pickEntitlementItem(
  subscription: ClerkSubscription
): { planKey: PlanKey; status: SyncStatus } | null {
  const items = subscription.subscription_items ?? [];

  const candidates = items
    .map((item) => {
      const planKey = resolveClerkPlanKey(
        item.plan?.slug,
        item.plan_id ?? item.plan?.id,
        item.plan?.name
      );
      if (!planKey) return null;
      return {
        planKey,
        status: mapClerkSubscriptionStatus(
          item.status ?? subscription.status
        ),
      };
    })
    .filter((c): c is { planKey: PlanKey; status: SyncStatus } => c !== null);

  if (candidates.length === 0) return null;

  const rank = (c: { planKey: PlanKey; status: SyncStatus }) =>
    (c.status === "active" ? 10 : 0) + (c.planKey === "pro" ? 1 : 0);

  return candidates.reduce((best, c) => (rank(c) > rank(best) ? c : best));
}

/**
 * Fetch the authoritative subscription for a Clerk user.
 */
async function fetchClerkSubscription(
  clerkUserId: string
): Promise<ClerkSubscription | null> {
  const clerkSecretKey = process.env.CLERK_SECRET_KEY;

  if (!clerkSecretKey) {
    throw new Error(
      "CLERK_SECRET_KEY is not set on this Convex deployment. Run: npx convex env set CLERK_SECRET_KEY sk_..."
    );
  }

  const response = await fetch(
    `https://api.clerk.com/v1/users/${clerkUserId}/billing/subscription`,
    {
      headers: {
        Authorization: `Bearer ${clerkSecretKey}`,
        "Content-Type": "application/json",
      },
    }
  );

  // 404 = the user has never had a subscription. Not an error.
  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Clerk Billing API error ${response.status}: ${detail.slice(0, 300)}`
    );
  }

  return (await response.json()) as ClerkSubscription;
}

/**
 * Reconcile one user's subscription from Clerk into Convex.
 * Shared by the authenticated and admin entry points below.
 */
async function reconcile(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  clerkUserId: string
): Promise<{
  synced: boolean;
  planKey: PlanKey | null;
  status: SyncStatus;
  reason?: string;
}> {
  const workspaceId = await ctx.runMutation(
    internal.platform.billing.webhooks.getWorkspaceByOwner,
    { clerkUserId }
  );

  if (!workspaceId) {
    return {
      synced: false,
      planKey: null,
      status: "inactive",
      reason: "no_workspace",
    };
  }

  const subscription = await fetchClerkSubscription(clerkUserId);
  const entitlement = subscription ? pickEntitlementItem(subscription) : null;

  if (!entitlement) {
    // No paid plan in Clerk — make sure Convex does not claim otherwise.
    await ctx.runMutation(
      internal.platform.billing.clerkBillingSync.markInactiveIfPresent,
      { workspaceId }
    );
    return {
      synced: true,
      planKey: null,
      status: "inactive",
      reason: "no_paid_plan",
    };
  }

  await ctx.runMutation(internal.platform.billing.webhooks.syncSubscription, {
    clerkUserId,
    workspaceId,
    planKey: entitlement.planKey,
    status: entitlement.status,
  });

  return {
    synced: true,
    planKey: entitlement.planKey,
    status: entitlement.status,
  };
}

// ============================================================================
// PUBLIC ACTIONS
// ============================================================================

/**
 * Reconcile the *signed-in* user's subscription from Clerk.
 *
 * Identity comes from the Convex auth context, never from the client, so this
 * is safe to call from the browser. Call it when rendering billing-sensitive
 * UI (billing page, domains page) to make plan state self-healing.
 */
export const syncMySubscription = action({
  args: {},
  handler: async (
    ctx
  ): Promise<{
    synced: boolean;
    planKey: PlanKey | null;
    status: SyncStatus;
    reason?: string;
  }> => {
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      return {
        synced: false,
        planKey: null,
        status: "inactive",
        reason: "unauthenticated",
      };
    }

    return await reconcile(ctx, identity.subject);
  },
});

/**
 * Reconcile an arbitrary user's subscription from Clerk.
 * Admin/ops entry point — call from the Convex dashboard or a backfill script.
 */
export const syncSubscriptionFromClerk = action({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (
    ctx,
    args
  ): Promise<{
    synced: boolean;
    planKey: PlanKey | null;
    status: SyncStatus;
    reason?: string;
  }> => {
    return await reconcile(ctx, args.clerkUserId);
  },
});

// ============================================================================
// INTERNAL MUTATIONS
// ============================================================================

/**
 * Downgrade an existing subscription row to inactive.
 *
 * Used when Clerk reports no paid plan. We never insert a row in that case, so
 * "no row" and "no plan" stay equivalent for fresh workspaces.
 */
export const markInactiveIfPresent = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .first();

    if (existing && existing.status !== "inactive") {
      await ctx.db.patch(existing._id, {
        status: "inactive",
        updatedAt: Date.now(),
      });
      return { updated: true };
    }

    return { updated: false };
  },
});

/**
 * Report whether a workspace's subscription snapshot is stale enough to re-pull.
 */
export const autoSyncIfNeeded = internalMutation({
  args: {
    clerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", args.clerkUserId))
      .first();

    if (!workspace) {
      return { shouldSync: false, reason: "no_workspace" };
    }

    const subscription = await ctx.db
      .query("providerSubscriptions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
      .first();

    if (!subscription) {
      return { shouldSync: true, reason: "missing" };
    }

    if (subscription.updatedAt < Date.now() - SYNC_TTL_MS) {
      return { shouldSync: true, reason: "stale" };
    }

    return { shouldSync: false, reason: "fresh" };
  },
});
