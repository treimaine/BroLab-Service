// Platform Core: Workspace Management
// Handles workspace CRUD operations and slug validation
// Requirements: 4.1, 4.2, 4.3, 4.4

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { mutation, query } from "../_generated/server";

// ============ TYPES ============

export type WorkspaceType = "producer" | "engineer";
export type PaymentsStatus = "unconfigured" | "pending" | "active";

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
    ownerClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
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
      ownerClerkUserId: args.ownerClerkUserId,
      paymentsStatus: "unconfigured",
      createdAt: Date.now(),
    });

    // Initialize usage tracking
    await ctx.db.insert("usage", {
      workspaceId,
      storageUsedBytes: 0,
      publishedTracksCount: 0,
      updatedAt: Date.now(),
    });

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
 * Update workspace Stripe account
 * Called after Stripe Connect onboarding
 */
export const updateWorkspaceStripeAccount = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    stripeAccountId: v.string(),
    paymentsStatus: v.union(
      v.literal("unconfigured"),
      v.literal("pending"),
      v.literal("active")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.workspaceId, {
      stripeAccountId: args.stripeAccountId,
      paymentsStatus: args.paymentsStatus,
    });
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any | null> {
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
