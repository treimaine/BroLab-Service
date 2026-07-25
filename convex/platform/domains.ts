// Platform Core: Domain Management
// Handles custom domain CRUD and hostname resolution
// Requirements: 1.3, 1.5, 4.4

import { v } from "convex/values";
import { Id } from "../_generated/dataModel";
import { internalMutation, internalQuery, mutation, query } from "../_generated/server";
import { logAuditHelper } from "./auditLogs";
import { assertEntitlement, assertQuota } from "./entitlements";

// ============ TYPES ============

export type DomainStatus = "pending" | "verified" | "failed";

// ============ HOSTNAME NORMALIZATION ============

/**
 * Normalize hostname
 * - Convert to lowercase
 * - Strip port (for localhost/preview deployments)
 * - Remove www prefix (optional)
 */
export function normalizeHostname(hostname: string, stripWww: boolean = false): string {
  let normalized = hostname.split(":")[0].toLowerCase();

  if (stripWww && normalized.startsWith("www.")) {
    normalized = normalized.substring(4);
  }

  return normalized;
}

/**
 * Validate hostname format
 * Basic validation for domain names
 */
export function validateHostname(hostname: string): { valid: boolean; error?: string } {
  // Normalize first
  const normalized = normalizeHostname(hostname);

  // Check length
  if (normalized.length < 3 || normalized.length > 253) {
    return { valid: false, error: "Hostname must be 3-253 characters" };
  }

  // Basic domain regex (simplified)
  const domainRegex = /^[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?(\.[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/;
  if (!domainRegex.test(normalized)) {
    return { valid: false, error: "Invalid hostname format" };
  }

  // Must have at least one dot (TLD required)
  if (!normalized.includes(".")) {
    return { valid: false, error: "Hostname must include a TLD (e.g., .com)" };
  }

  return { valid: true };
}

// ============ QUERIES ============

/**
 * Get domain by hostname
 * Returns null if domain doesn't exist
 */
export const getDomainByHostname = query({
  args: { hostname: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeHostname(args.hostname);

    const domain = await ctx.db
      .query("domains")
      .withIndex("by_hostname", (q) => q.eq("hostname", normalized))
      .first();

    return domain;
  },
});

/**
 * Get domains by workspace
 */
export const getDomainsByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const domains = await ctx.db
      .query("domains")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .collect();

    return domains;
  },
});

/**
 * Get verified domains by workspace
 * Only returns domains with status "verified"
 */
export const getVerifiedDomainsByWorkspace = query({
  args: { workspaceId: v.id("workspaces") },
  handler: async (ctx, args) => {
    const domains = await ctx.db
      .query("domains")
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", args.workspaceId))
      .collect();

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return domains.filter((d: any) => d.status === "verified");
  },
});

/**
 * Resolve hostname to workspace slug
 * Returns null if hostname is not found or not verified
 * This is used by middleware.ts (at project root) for custom domain routing
 */
export const resolveHostnameToSlug = query({
  args: { hostname: v.string() },
  handler: async (ctx, args) => {
    const normalized = normalizeHostname(args.hostname);

    // Find domain
    const domain = await ctx.db
      .query("domains")
      .withIndex("by_hostname", (q) => q.eq("hostname", normalized))
      .first();

    // Only return if verified
    if (!domain?.status || domain.status !== "verified") {
      return null;
    }

    // Get workspace to return slug
    const workspace = await ctx.db.get(domain.workspaceId);

    if (!workspace) {
      return null;
    }

    return {
      slug: workspace.slug,
      workspaceId: workspace._id,
    };
  },
});

// ============ MUTATIONS ============

/**
 * Add custom domain to workspace
 * Initial status is "pending" - requires verification
 */
export const addDomain = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    hostname: v.string(),
  },
  handler: async (ctx, args) => {
    const normalized = normalizeHostname(args.hostname);

    // Validate hostname format
    const validation = validateHostname(normalized);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Check if hostname already exists
    const existing = await ctx.db
      .query("domains")
      .withIndex("by_hostname", (q) => q.eq("hostname", normalized))
      .first();

    if (existing) {
      throw new Error("Domain already exists");
    }

    // Create domain
    const domainId = await ctx.db.insert("domains", {
      workspaceId: args.workspaceId,
      hostname: normalized,
      status: "pending",
      createdAt: Date.now(),
    });

    return domainId;
  },
});

/**
 * Update domain status
 * Called after DNS verification check
 */
export const updateDomainStatus = mutation({
  args: {
    domainId: v.id("domains"),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("failed")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.domainId, {
      status: args.status,
    });
  },
});

/**
 * Delete domain
 */
export const deleteDomain = mutation({
  args: { domainId: v.id("domains") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.domainId);
  },
});

/**
 * Connect a custom domain (PRO only)
 * Checks entitlement (maxCustomDomains > 0) and quota before adding.
 * Creates audit log entry for domain_connect action.
 * Requirements: 4.4, 19.4, 1.3
 */
export const connectDomain = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    hostname: v.string(),
    actorClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // 1. Assert PRO entitlement (maxCustomDomains > 0)
    await assertEntitlement(ctx, args.workspaceId, "maxCustomDomains");

    // 2. Assert quota not exceeded
    await assertQuota(ctx, args.workspaceId, "domains");

    const normalized = normalizeHostname(args.hostname);

    // 3. Validate hostname format
    const validation = validateHostname(normalized);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // 4. Check if hostname already exists
    const existing = await ctx.db
      .query("domains")
      .withIndex("by_hostname", (q) => q.eq("hostname", normalized))
      .first();

    if (existing) {
      throw new Error("Domain already connected to a workspace");
    }

    // 5. Create domain with pending status
    const domainId = await ctx.db.insert("domains", {
      workspaceId: args.workspaceId,
      hostname: normalized,
      status: "pending",
      createdAt: Date.now(),
    });

    // 6. Audit log
    await logAuditHelper(ctx, {
      workspaceId: args.workspaceId,
      actorClerkUserId: args.actorClerkUserId,
      action: "domain_connect",
      entityType: "domain",
      entityId: domainId,
      meta: { hostname: normalized },
    });

    return domainId;
  },
});

/**
 * Disconnect (delete) a custom domain
 * Verifies ownership before deleting.
 * Creates audit log entry for domain_disconnect action.
 * Requirements: 4.4, 19.4
 */
export const disconnectDomain = mutation({
  args: {
    workspaceId: v.id("workspaces"),
    domainId: v.id("domains"),
    actorClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify ownership
    await assertDomainOwnership(ctx, args.domainId, args.workspaceId);

    const domain = await ctx.db.get(args.domainId);
    const hostname = domain?.hostname ?? "";

    await ctx.db.delete(args.domainId);

    // Audit log
    await logAuditHelper(ctx, {
      workspaceId: args.workspaceId,
      actorClerkUserId: args.actorClerkUserId,
      action: "domain_disconnect",
      entityType: "domain",
      entityId: args.domainId,
      meta: { hostname },
    });
  },
});

export const getDomainForVerification = internalQuery({
  args: {
    workspaceId: v.id("workspaces"),
    domainId: v.id("domains"),
  },
  returns: v.object({
    hostname: v.string(),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied");
    }
    const domain = await ctx.db.get(args.domainId);
    if (!domain || domain.workspaceId !== args.workspaceId) {
      throw new Error("Domain not found");
    }
    return { hostname: domain.hostname };
  },
});

export const recordDomainVerification = internalMutation({
  args: {
    workspaceId: v.id("workspaces"),
    domainId: v.id("domains"),
    verified: v.boolean(),
    error: v.optional(v.string()),
  },
  returns: v.object({
    status: v.union(v.literal("verified"), v.literal("failed")),
  }),
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    const workspace = await ctx.db.get(args.workspaceId);
    if (!workspace || workspace.ownerClerkUserId !== identity.subject) {
      throw new Error("Access denied");
    }
    const domain = await ctx.db.get(args.domainId);
    if (!domain || domain.workspaceId !== args.workspaceId) {
      throw new Error("Domain not found");
    }
    const now = Date.now();
    const status: "verified" | "failed" = args.verified ? "verified" : "failed";
    await ctx.db.patch(args.domainId, {
      status,
      verificationCheckedAt: now,
      verificationError: args.verified ? undefined : args.error,
      verifiedAt: args.verified ? now : domain.verifiedAt,
    });
    await logAuditHelper(ctx, {
      workspaceId: args.workspaceId,
      actorClerkUserId: identity.subject,
      action: "domain_verify",
      entityType: "domain",
      entityId: args.domainId,
      meta: { hostname: domain.hostname, verified: args.verified, error: args.error },
    });
    return { status };
  },
});

// ============ HELPERS ============

/**
 * Assert domain ownership
 * Throws error if domain doesn't belong to workspace
 */
export async function assertDomainOwnership(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  domainId: Id<"domains">,
  workspaceId: Id<"workspaces">
): Promise<void> {
  const domain = await ctx.db.get(domainId);

  if (!domain) {
    throw new Error("Domain not found");
  }

  if (domain.workspaceId !== workspaceId) {
    throw new Error("Access denied. This domain belongs to another workspace.");
  }
}

/**
 * Count verified domains for workspace
 * Used for quota enforcement
 */
export async function countVerifiedDomains(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  workspaceId: Id<"workspaces">
): Promise<number> {
  const domains = await ctx.db
    .query("domains")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_workspace", (q: any) => q.eq("workspaceId", workspaceId))
    .collect();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return domains.filter((d: any) => d.status === "verified").length;
}

/**
 * Get domain by hostname (helper)
 * Returns null if not found
 */
export async function getDomainByHostnameHelper(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  hostname: string
) {
  const normalized = normalizeHostname(hostname);

  const domain = await ctx.db
    .query("domains")
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .withIndex("by_hostname", (q: any) => q.eq("hostname", normalized))
    .first();

  return domain ?? null;
}

/**
 * Check if hostname is verified
 */
export async function isHostnameVerified(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ctx: any,
  hostname: string
): Promise<boolean> {
  const domain = await getDomainByHostnameHelper(ctx, hostname);
  return domain?.status === "verified";
}
