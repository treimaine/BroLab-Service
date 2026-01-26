// Convex Schema for BroLab Entertainment
// Implemented in Phase 4 (Task 4.2)
// See design.md for full schema specification

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============ PLATFORM TABLES ============
  
  users: defineTable({
    clerkUserId: v.string(),
    role: v.union(v.literal("producer"), v.literal("engineer"), v.literal("artist")),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkUserId"]),

  workspaces: defineTable({
    slug: v.string(),
    name: v.string(),
    type: v.union(v.literal("producer"), v.literal("engineer")),
    ownerClerkUserId: v.string(),
    stripeAccountId: v.optional(v.string()),
    paymentsStatus: v.union(
      v.literal("unconfigured"),
      v.literal("pending"),
      v.literal("active")
    ),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerClerkUserId"]),

  domains: defineTable({
    workspaceId: v.id("workspaces"),
    hostname: v.string(), // Stored normalized (lowercase, no port)
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_hostname", ["hostname"]),

  providerSubscriptions: defineTable({
    workspaceId: v.id("workspaces"),
    clerkUserId: v.string(),
    planKey: v.union(v.literal("basic"), v.literal("pro")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("canceled")),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_clerk_user", ["clerkUserId"]),

  usage: defineTable({
    workspaceId: v.id("workspaces"),
    storageUsedBytes: v.number(),
    publishedTracksCount: v.number(),
    updatedAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  auditLogs: defineTable({
    workspaceId: v.id("workspaces"),
    actorClerkUserId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    meta: v.any(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  events: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(),
    meta: v.any(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  jobs: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    payload: v.any(),
    attempts: v.number(),
    error: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
    lockedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"])
    .index("by_status_createdAt", ["status", "createdAt"]),

  processedEvents: defineTable({
    provider: v.string(),
    eventId: v.string(),
    createdAt: v.number(),
  }).index("by_event", ["provider", "eventId"]),

  // ============ MODULE TABLES ============

  tracks: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    bpm: v.optional(v.number()),
    key: v.optional(v.string()),
    tags: v.array(v.string()),
    // License tier pricing (replaces single priceUSD)
    priceUsdByTier: v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    }),
    priceEurByTier: v.optional(v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    })),
    status: v.union(v.literal("draft"), v.literal("published")),
    fullStorageId: v.id("_storage"),
    stemsStorageId: v.optional(v.id("_storage")), // For Unlimited tier
    previewStorageId: v.optional(v.id("_storage")),
    processingStatus: v.union(
      v.literal("idle"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    previewDurationSec: v.number(),
    previewPolicy: v.union(v.literal("none"), v.literal("manual")),
    processingError: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"]),

  services: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    priceUSD: v.number(),
    priceEUR: v.optional(v.number()),
    turnaround: v.string(),
    features: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_active", ["workspaceId", "isActive"]),

  orders: defineTable({
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    buyerEmail: v.optional(v.string()), // Stored from Stripe session for email sending
    stripeSessionId: v.string(),
    itemType: v.union(v.literal("track"), v.literal("service")),
    itemId: v.string(),
    currency: v.string(),
    amountCents: v.number(),
    licenseTier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited"))), // For track orders
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  purchaseEntitlements: defineTable({
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    trackId: v.id("tracks"),
    // License information
    licenseTier: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
    licenseTermsVersion: v.string(), // e.g. "v1.1-2026-01"
    licenseTermsSnapshot: v.any(), // Immutable snapshot of terms at purchase time
    licensePdfStorageId: v.optional(v.id("_storage")), // Generated PDF
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"])
    .index("by_buyer_track", ["buyerClerkUserId", "trackId"]),

  bookings: defineTable({
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    serviceId: v.id("services"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"]),

  // ============ LICENSING TABLES ============

  licenses: defineTable({
    workspaceId: v.id("workspaces"),
    orderId: v.id("orders"),
    buyerClerkUserId: v.string(),
    buyerEmail: v.optional(v.string()),
    trackId: v.id("tracks"),
    entitlementId: v.id("purchaseEntitlements"),
    // Terms snapshot (immutable)
    termsVersion: v.string(), // "v1.1-2026-01"
    tierKey: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
    includesStems: v.boolean(),
    rightsSnapshot: v.any(), // Snapshot of tier rights at purchase
    prohibitedUsesSnapshot: v.array(v.string()),
    creditLineSnapshot: v.string(),
    // Publishing split
    publishingEnabled: v.boolean(),
    licensorWriterSharePercent: v.optional(v.number()),
    licenseeWriterSharePercent: v.optional(v.number()),
    licensorPublisherSharePercent: v.optional(v.number()),
    licenseePublisherSharePercent: v.optional(v.number()),
    // Status
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"])
    .index("by_entitlement", ["entitlementId"])
    .index("by_order", ["orderId"])
    .index("by_track", ["trackId"]),

  licenseDocuments: defineTable({
    workspaceId: v.id("workspaces"),
    licenseId: v.id("licenses"),
    kind: v.union(v.literal("license_pdf")),
    storageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("pending"), v.literal("generated"), v.literal("failed")),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_license", ["licenseId"])
    .index("by_workspace", ["workspaceId"]),

  // ============ EMAIL EVENTS (Idempotency) ============

  emailEvents: defineTable({
    provider: v.string(), // "resend"
    dedupeKey: v.string(), // Unique business key e.g. "stripe:evt_123:artist_purchase"
    createdAt: v.number(),
  }).index("by_dedupe", ["provider", "dedupeKey"]),
});
