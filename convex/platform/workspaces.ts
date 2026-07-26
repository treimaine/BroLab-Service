// Platform Core: Workspace Management
// Handles workspace CRUD operations and slug validation
// Requirements: 4.1, 4.2, 4.3, 4.4

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { Id } from "../_generated/dataModel";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
} from "../_generated/server";
import { recordEventHelper } from "./events";
import { recordServerGrowthEvent } from "../modules/growth";

// ============ TYPES ============

export type WorkspaceType = "producer" | "engineer";
export type PaymentsStatus = "unconfigured" | "pending" | "active";

const contactDetailsValidator = v.object({
  email: v.optional(v.string()),
  phone: v.optional(v.string()),
  location: v.optional(v.string()),
  responseTime: v.optional(v.string()),
});

// ============ SLUG VALIDATION ============

/**
 * Reserved slugs that cannot be used for workspaces
 * These are reserved for hub routes
 */
const RESERVED_SLUGS = new Set([
  "www",
  "app",
  "api",
  "admin",
  "studio",
  "artist",
  "pricing",
  "sign-in",
  "sign-up",
  "about",
  "contact",
  "privacy",
  "terms",
  "onboarding",
]);

/**
 * Validate slug format
 * Rules:
 * - 3-30 characters
 * - Lowercase letters, numbers, hyphens only
 * - Must start with letter
 * - Cannot end with hyphen
 * - No consecutive hyphens
 */
export function validateSlugFormat(slug: string): { valid: boolean; error?: string } {
  // Check length
  if (slug.length < 3 || slug.length > 30) {
    return { valid: false, error: "Slug must be 3-30 characters" };
  }

  // Check format
  const slugRegex = /^[a-z][a-z0-9-]*[a-z0-9]$/;
  if (!slugRegex.test(slug)) {
    return {
      valid: false,
      error: "Slug must start with letter, contain only lowercase letters, numbers, and hyphens, and not end with hyphen",
    };
  }

  // Check for consecutive hyphens
  if (slug.includes("--")) {
    return { valid: false, error: "Slug cannot contain consecutive hyphens" };
  }

  // Check if reserved
  if (RESERVED_SLUGS.has(slug)) {
    return { valid: false, error: "This slug is reserved" };
  }

  return { valid: true };
}

/**
 * Normalize slug
 * Converts to lowercase and replaces spaces with hyphens
 */
export function normalizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replaceAll(/\s+/g, "-") // Replace spaces with hyphens
    .replaceAll(/[^a-z0-9-]/g, "") // Remove invalid characters
    .replaceAll(/--+/g, "-") // Replace consecutive hyphens with single hyphen
    .replaceAll(/(?:^-+|-+$)/g, ""); // Remove leading/trailing hyphens
}

// ============ QUERIES ============

/**
 * Get workspace by slug
 * Returns null if workspace doesn't exist
 */
export const getWorkspaceBySlug = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    const workspace = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    return workspace;
  },
});

/**
 * Get workspace by ID
 */
export const getWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.workspaceId);
  },
});

/**
 * Get workspaces owned by a user
 */
export const getWorkspacesByOwner = query({
  args: { ownerClerkUserId: v.string() },
  handler: async (ctx, args) => {
    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", args.ownerClerkUserId))
      .collect();
    
    return workspaces;
  },
});

/**
 * Get current user's workspaces
 * Convenience query that uses auth context
 */
export const listUserWorkspaces = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return [];
    }

    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", identity.subject))
      .collect();
    
    return workspaces;
  },
});

/**
 * Check if slug is available
 */
export const isSlugAvailable = query({
  args: { slug: v.string() },
  handler: async (ctx, args) => {
    // Validate format
    const validation = validateSlugFormat(args.slug);
    if (!validation.valid) {
      return { available: false, error: validation.error };
    }

    // Check if slug exists
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      return { available: false, error: "Slug already taken" };
    }

    return { available: true };
  },
});

// ============ MUTATIONS ============

/**
 * Create a new workspace
 * Called during provider onboarding
 */
export const createWorkspace = mutation({
  args: {
    slug: v.string(),
    name: v.string(),
    type: v.union(v.literal("producer"), v.literal("engineer")),
    // Acquisition attribution carried from the signup URL. Optional so existing
    // callers keep working; when present it is stored on the workspace and
    // copied onto later funnel events.
    signupSource: v.optional(v.string()),
    signupCampaign: v.optional(v.string()),
  },
  returns: v.id("workspaces"),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to create a workspace.");
    }

    // Validate slug format
    const validation = validateSlugFormat(args.slug);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check if slug already exists
    const existing = await ctx.db
      .query("workspaces")
      .withIndex("by_slug", (q) => q.eq("slug", args.slug))
      .first();
    
    if (existing) {
      throw new Error("Slug already taken");
    }

    // Create workspace
    const workspaceId = await ctx.db.insert("workspaces", {
      slug: args.slug,
      name: args.name,
      type: args.type,
      ownerClerkUserId: identity.subject,
      paymentsStatus: "unconfigured",
      signupSource: args.signupSource,
      signupCampaign: args.signupCampaign,
      createdAt: Date.now(),
    });

    // Initialize usage tracking
    await ctx.db.insert("usage", {
      workspaceId,
      storageUsedBytes: 0,
      publishedTracksCount: 0,
      updatedAt: Date.now(),
    });

    await recordEventHelper(ctx, {
      workspaceId,
      type: "workspace_created",
      meta: {
        ownerClerkUserId: identity.subject,
        slug: args.slug,
        name: args.name,
        workspaceType: args.type,
        source: "onboarding",
      },
    });

    // Funnel measurement: the signup→workspace step used to be invisible.
    await recordServerGrowthEvent(ctx, {
      event: "workspace_created",
      clerkUserId: identity.subject,
      role: args.type,
      source: args.signupSource,
      campaign: args.signupCampaign,
    });

    // Contextual, self-serve onboarding: each action checks the latest state
    // and only sends the next unfinished step.
    await ctx.scheduler.runAfter(
      60 * 60 * 1000,
      internal.platform.activationNudges.sendActivationNudge,
      { workspaceId, sequence: 1 }
    );
    await ctx.scheduler.runAfter(
      24 * 60 * 60 * 1000,
      internal.platform.activationNudges.sendActivationNudge,
      { workspaceId, sequence: 2 }
    );
    await ctx.scheduler.runAfter(
      72 * 60 * 60 * 1000,
      internal.platform.activationNudges.sendActivationNudge,
      { workspaceId, sequence: 3 }
    );

    return workspaceId;
  },
});

/**
 * Update workspace name
 */
export const updateWorkspaceName = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workspaceId, {
      name: args.name,
    });
  },
});

/**
 * Update the public contact details shown on a provider storefront.
 * Ownership is derived from the authenticated identity, never from client input.
 */
export const updateContactDetails = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    contact: contactDetailsValidator,
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("You must be signed in to update contact details.");
    }

    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("You do not have access to this storefront.");
    }

    const contact = {
      email: args.contact.email?.trim() || undefined,
      phone: args.contact.phone?.trim() || undefined,
      location: args.contact.location?.trim() || undefined,
      responseTime: args.contact.responseTime?.trim() || undefined,
    };

    if (contact.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact.email) || contact.email.length > 254)) {
      throw new Error("Enter a valid contact email address.");
    }
    if (contact.phone && contact.phone.length > 40) {
      throw new Error("Phone number must be 40 characters or fewer.");
    }
    if (contact.location && contact.location.length > 120) {
      throw new Error("Location must be 120 characters or fewer.");
    }
    if (contact.responseTime && contact.responseTime.length > 80) {
      throw new Error("Response time must be 80 characters or fewer.");
    }

    const hasContactDetails = Object.values(contact).some(Boolean);
    await ctx.db.patch(args.workspaceId, {
      contact: hasContactDetails ? contact : undefined,
    });

    return null;
  },
});

/**
 * Update workspace Stripe account
 * Called after Stripe Connect onboarding
 */
export const assertStripeConnectOwnership = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    clerkUserId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.ownerClerkUserId !== args.clerkUserId) {
      throw new Error("You do not have access to this workspace.");
    }
    return null;
  },
});

/**
 * Persist Stripe Connect state after the authenticated server action has
 * exchanged the one-time OAuth code and verified workspace ownership.
 */
export const updateWorkspaceStripeAccountInternal = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    stripeAccountId: v.string(),
    paymentsStatus: v.union(v.literal("pending"), v.literal("active")),
    accountType: v.optional(v.string()),
    chargesEnabled: v.boolean(),
    payoutsEnabled: v.boolean(),
    detailsSubmitted: v.boolean(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const before = await ctx.db.get(args.workspaceId);
    if (!before) {
      throw new Error("Workspace not found.");
    }

    await ctx.db.patch(args.workspaceId, {
      stripeAccountId: args.stripeAccountId,
      paymentsStatus: args.paymentsStatus,
    });

    await recordEventHelper(ctx, {
      workspaceId: args.workspaceId,
      type: "payments_connected",
      meta: {
        stripeAccountId: args.stripeAccountId,
        paymentsStatus: args.paymentsStatus,
        accountType: args.accountType,
        chargesEnabled: args.chargesEnabled,
        payoutsEnabled: args.payoutsEnabled,
        detailsSubmitted: args.detailsSubmitted,
      },
    });

    // Funnel measurement: emit stripe_ready only on the transition into
    // "active", so a status refresh that stays active is not double-counted.
    if (
      args.paymentsStatus === "active" &&
      before?.paymentsStatus !== "active"
    ) {
      await recordServerGrowthEvent(ctx, {
        event: "stripe_ready",
        clerkUserId: before?.ownerClerkUserId,
        role: before?.type,
        source: before?.signupSource,
        campaign: before?.signupCampaign,
      });
    }

    if (args.paymentsStatus === "active" && before.paymentsStatus !== "active") {
      await recordEventHelper(ctx, {
        workspaceId: args.workspaceId,
        type: "onboarding_completed",
        meta: {
          stripeAccountId: args.stripeAccountId,
          accountType: args.accountType,
          completedAt: new Date().toISOString(),
        },
      });
    }

    return null;
  },
});

/**
 * Delete workspace
 * Note: Should also delete related data (tracks, services, etc.)
 * For MVP, we do simple delete. In production, implement cascade delete.
 */
export const deleteWorkspace = mutation({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.workspaceId);
  },
});

// ============ HELPERS ============

/**
 * Assert workspace ownership
 * Throws error if user is not the owner
 */
export async function assertWorkspaceOwnership(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">,
  clerkUserId: string
): Promise<void> {
  const workspace = await ctx.db.get(workspaceId);
  
  if (!workspace) {
    throw new Error("Workspace not found");
  }

  if (workspace.ownerClerkUserId !== clerkUserId) {
    throw new Error("Access denied. You are not the owner of this workspace.");
  }
}

/**
 * Get workspace by slug (helper)
 * Returns null if not found
 */
export async function getWorkspaceBySlugHelper(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  slug: string
) {
  const workspace = await ctx.db
    .query("workspaces")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_slug", (q: any) => q.eq("slug", slug))
    .first();
  
  return workspace ?? null;
}

/**
 * Check if workspace has payments configured
 */
export async function hasPaymentsConfigured(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">
): Promise<boolean> {
  const workspace = await ctx.db.get(workspaceId);
  
  if (!workspace) {
    return false;
  }

  return (
    workspace.paymentsStatus === "active" &&
    workspace.stripeAccountId !== undefined
  );
}
