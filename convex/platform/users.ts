// Platform Core: User Management
// Handles user CRUD operations and role management
// Requirements: 2.1, 2.2, 2.3, 2.4

import { v } from "convex/values";
import { mutation, query } from "../_generated/server";

// ============ TYPES ============

export type UserRole = "producer" | "engineer" | "artist";

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
    // Check if user already exists
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    
    if (existing) {
      throw new Error("User already exists");
    }

    // Create user
    const userId = await ctx.db.insert("users", {
      clerkUserId: args.clerkUserId,
      role: args.role,
      createdAt: Date.now(),
    });

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
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkUserId", args.clerkUserId))
      .first();
    
    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });

    return user._id;
  },
});

/**
 * Delete user
 * Soft delete - keeps record but marks as deleted
 * Note: For MVP, we do hard delete. In production, consider soft delete.
 */
export const deleteUser = mutation({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.userId);
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
