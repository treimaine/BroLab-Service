/**
 * Services Module - Service Listings and Booking
 * 
 * Handles service creation, management, and booking.
 * 
 * Requirements: 16.1, 16.2, 16.3, 16.4
 */

import { v } from "convex/values";
import { query } from "../_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get service by ID
 * 
 * Requirements: 16.2
 */
export const getService = query({
  args: {
    serviceId: v.id("services"),
  },
  handler: async (ctx, args) => {
    const service = await ctx.db.get(args.serviceId);
    return service;
  },
});

/**
 * Get all active services for a workspace
 * 
 * Requirements: 16.2
 */
export const getActiveServices = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_workspace_active", (q) => 
        q.eq("workspaceId", args.workspaceId).eq("isActive", true)
      )
      .collect();
    
    return services;
  },
});

/**
 * Get all services for a workspace (including inactive)
 * For provider dashboard
 * 
 * Requirements: 16.1
 */
export const getServicesByWorkspace = query({
  args: {
    workspaceId: v.id("workspaces"),
  },
  handler: async (ctx, args) => {
    const services = await ctx.db
      .query("services")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
      .collect();
    
    return services;
  },
});
