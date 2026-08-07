// Platform Core: User Management
// Handles user CRUD operations and role management
// Requirements: 2.1, 2.2, 2.3, 2.4

import { v } from "convex/values";
import { internalMutation, mutation, query } from "../_generated/server";
import { internal } from "../_generated/api";
import { recordServerGrowthEvent } from "../modules/growth";
import {
  shouldStartCreatorLifecycle,
  type UserRole,
  userRoleValidator,
} from "./userRoles";

// ============ TYPES ============

export type { UserRole } from "./userRoles";

// ============ QUERIES ============

/**
 * Get user by Clerk user ID
 * Returns null if user doesn't exist
 */
export const getUserByClerkId = query({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    
    return user;
  },
});

/**
 * Get user by internal ID
 */
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.userId);
  },
});

// ============ MUTATIONS ============

/**
 * Create a new user
 * Called after Clerk authentication
 */
export const createUser = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(
      v.literal("producer"),
      v.literal("engineer"),
      v.literal("artist")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkUserId) {
      throw new Error("You can only create your own user profile");
    }

    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing?.role === "admin") {
      throw new Error("Admin accounts cannot enter creator onboarding");
    }

    if (existing) {
      // User already exists (e.g. created by webhook before onboarding) — just update the role
      await ctx.db.patch(existing._id, { role: args.role });
      return existing._id;
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      role: args.role,
      createdAt: Date.now(),
    });

    // Record onboarding event: signup
    await ctx.runMutation(internal.modules.onboardingEvents.recordOnboardingEvent, {
      userId: args.clerkUserId,
      eventType: "signup",
      metadata: {
        additional_data: { role: args.role },
      },
    });

    await recordServerGrowthEvent(ctx, {
      event: "account_created",
      path: "/sign-up",
      clerkUserId: args.clerkUserId,
      source: "authenticated_onboarding",
    });

    return userId;
  },
});

/**
 * Synchronize a user from Clerk user.created and user.updated webhooks.
 * Clerk metadata is authoritative when it carries a recognized role.
 * Users without role metadata receive the default "artist" role.
 */
export const upsertUserFromClerk = internalMutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(userRoleValidator, v.null()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (existing) {
      const synchronizedRole = args.role ?? "artist";
      if (existing.role !== synchronizedRole) {
        await ctx.db.patch(existing._id, { role: synchronizedRole });
      }
      return existing._id;
    }

    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      role: args.role ?? "artist",
      createdAt: Date.now(),
    });

    if (shouldStartCreatorLifecycle(args.role)) {
      await recordServerGrowthEvent(ctx, {
        event: "account_created",
        path: "/sign-up",
        clerkUserId: args.clerkUserId,
        source: "clerk_user_created_webhook",
      });
    }

    return userId;
  },
});

/**
 * Update user role
 * Used during onboarding or role changes
 */
export const updateUserRole = mutation({
  args: {
    clerkUserId: v.string(),
    role: v.union(
      v.literal("producer"),
      v.literal("engineer"),
      v.literal("artist")
    ),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity || identity.subject !== args.clerkUserId) {
      throw new Error("You can only update your own user profile");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    if (user.role === "admin") {
      throw new Error("Admin accounts cannot enter creator onboarding");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });

    // Record onboarding event: profile_created (role finalized)
    await ctx.runMutation(internal.modules.onboardingEvents.recordOnboardingEvent, {
      userId: args.clerkUserId,
      eventType: "profile_created",
      metadata: {
        additional_data: { role: args.role },
      },
    });

    return user._id;
  },
});

/**
 * Delete user by internal ID
 */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
  },
});

/**
 * Delete user by Clerk user ID
 * Called from Clerk webhook user.deleted event
 * Also cascades to delete all workspaces owned by the user
 */
export const deleteUserByClerkId = mutation({
  args: { clerkUserId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();

    if (!user) {
      // Already deleted or never existed — not an error
      return null;
    }

    // Cascade: delete all workspaces owned by this user
    const workspaces = await ctx.db
      .query("workspaces")
      .withIndex("by_owner", (q) => q.eq("ownerClerkUserId", args.clerkUserId))
      .collect();

    for (const workspace of workspaces) {
      // Delete usage tracking for this workspace
      const usage = await ctx.db
        .query("usage")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", workspace._id))
        .first();
      if (usage) {
        await ctx.db.delete(usage._id);
      }

      await ctx.db.delete(workspace._id);
    }

    await ctx.db.delete(user._id);
    return user._id;
  },
});

// ============ HELPERS ============

/**
 * Check if user has a specific role
 * Server-side helper for authorization
 */
export async function assertUserRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  clerkUserId: string,
  allowedRoles: UserRole[]
): Promise<void> {
  const user = await ctx.db
    .query("users")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkUserId", clerkUserId))
    .first();
  
  if (!user) {
    throw new Error("User not found");
  }

  if (!allowedRoles.includes(user.role)) {
    throw new Error(`Access denied. Required roles: ${allowedRoles.join(", ")}`);
  }
}

/**
 * Get user role
 * Returns null if user doesn't exist
 */
export async function getUserRole(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  clerkUserId: string
): Promise<UserRole | null> {
  const user = await ctx.db
    .query("users")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_clerk_id", (q: any) => q.eq("clerkUserId", clerkUserId))
    .first();
  
  return user?.role ?? null;
}
