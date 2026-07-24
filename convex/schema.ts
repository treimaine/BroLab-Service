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
    fileSizeBytes: v.number(), // File size in bytes for usage tracking
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
    orderId: v.optional(v.id("orders")),
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
    .index("by_buyer_track", ["buyerClerkUserId", "trackId"])
    .index("by_order", ["orderId"]),

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
    emailType: v.optional(v.string()),
    recipient: v.optional(v.string()),
    status: v.optional(
      v.union(v.literal("sent"), v.literal("failed"))
    ),
    providerMessageId: v.optional(v.string()),
    attempts: v.optional(v.number()),
    lastError: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.optional(v.number()),
  }).index("by_dedupe", ["provider", "dedupeKey"]),

  // ============ ANALYTICS ============

  trackViews: defineTable({
    clerkUserId: v.optional(v.string()),
    trackId: v.id("tracks"),
    workspaceId: v.id("workspaces"),
    source: v.optional(v.string()), // "marketplace", "search", "featured", "direct"
    referrer: v.optional(v.string()),
    sessionId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_track", ["trackId"])
    .index("by_workspace", ["workspaceId"])
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_created_at", ["createdAt"]),

  searchQueries: defineTable({
    clerkUserId: v.optional(v.string()),
    query: v.string(),
    resultsCount: v.number(),
    sessionId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_query", ["query"])
    .index("by_created_at", ["createdAt"]),

  checkoutFunnelEvents: defineTable({
    clerkUserId: v.optional(v.string()),
    trackId: v.optional(v.id("tracks")),
    workspaceId: v.id("workspaces"),
    step: v.union(
      v.literal("view_checkout"),
      v.literal("select_license"),
      v.literal("enter_email"),
      v.literal("begin_payment"),
      v.literal("complete_payment")
    ),
    sessionId: v.optional(v.string()),
    amountCents: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_track", ["trackId"])
    .index("by_step", ["step"])
    .index("by_created_at", ["createdAt"]),

  surveyResponses: defineTable({
    clerkUserId: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    role: v.union(v.literal("producer"), v.literal("engineer"), v.literal("artist")),
    question: v.string(), // e.g. "what_made_you_choose_brolab"
    answer: v.string(), // selected option
    customAnswer: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_question", ["question"]),

  checkoutAbandonment: defineTable({
    clerkUserId: v.optional(v.string()),
    trackId: v.optional(v.string()),
    workspaceId: v.optional(v.id("workspaces")),
    licenseTier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited"))),
    reason: v.string(), // selected multiple choice option
    customReason: v.optional(v.string()),
    checkoutSessionId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_clerk_user", ["clerkUserId"])
    .index("by_track", ["trackId"])
    .index("by_created_at", ["createdAt"]),

  interviewRequests: defineTable({
    clerkUserId: v.optional(v.string()),
    email: v.string(),
    name: v.string(),
    company: v.optional(v.string()),
    preferredTimes: v.array(v.string()), // ISO datetime strings
    status: v.union(v.literal("pending"), v.literal("scheduled"), v.literal("completed"), v.literal("canceled")),
    notes: v.optional(v.string()),
    interviewDate: v.optional(v.number()), // Unix timestamp
    interviewUrl: v.optional(v.string()), // Calendly or Savvycal URL
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"]),

  // ============ FAILED TRANSACTIONS MONITOR ============

  failedTransactions: defineTable({
    stripePaymentIntentId: v.string(), // Stripe payment intent ID
    workspaceId: v.optional(v.id("workspaces")), // Producer workspace
    buyerClerkUserId: v.optional(v.string()), // Customer who failed to pay
    buyerEmail: v.optional(v.string()),
    amount: v.number(), // Amount in cents
    currency: v.string(), // "usd", "eur", etc.
    reason: v.string(), // Stripe error code (e.g., "card_declined")
    reasonMessage: v.string(), // Human-readable error (e.g., "Your card was declined")
    status: v.union(
      v.literal("pending_retry"),
      v.literal("retry_in_progress"),
      v.literal("retry_failed"),
      v.literal("resolved"),
      v.literal("support_ticket_created")
    ),
    retryCount: v.number(), // Number of retry attempts
    lastRetryAt: v.optional(v.number()), // Timestamp of last retry attempt
    supportTicketId: v.optional(v.string()), // Associated support ticket ID
    notes: v.optional(v.string()), // Admin notes
    createdAt: v.number(), // When payment failed
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_payment_intent", ["stripePaymentIntentId"]),

  // ============ ONBOARDING EXCEPTIONS MONITOR ============

  onboardingEvents: defineTable({
    userId: v.string(), // Clerk user ID of user being onboarded
    eventType: v.union(
      v.literal("signup"),
      v.literal("email_verified"),
      v.literal("profile_created"),
      v.literal("workspace_created"),
      v.literal("beat_uploaded"),
      v.literal("checkout_started"),
      v.literal("payment_success"),
      v.literal("payment_failed"),
      v.literal("onboarding_completed")
    ),
    timestamp: v.number(), // Event timestamp (milliseconds)
    metadata: v.optional(v.object({
      error: v.optional(v.string()), // Error message if applicable
      stage_duration: v.optional(v.number()), // Time spent at this stage (ms)
      retry_count: v.optional(v.number()), // For failed payment events
      additional_data: v.optional(v.any()), // Extensible field for extra data
    })),
    status: v.optional(v.union(v.literal("blocked"), v.literal("completed"))), // Track if user is stuck
    blocked_reason: v.optional(v.string()), // Why user is blocked if applicable
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_event_type", ["eventType"])
    .index("by_timestamp", ["timestamp"])
    .index("by_status", ["status"])
    .index("by_user_timestamp", ["userId", "timestamp"]),

  // ============ EARNINGS TRANSPARENCY DASHBOARD ============

  beatSales: defineTable({
    beatId: v.string(), // Track/beat ID (from orders.itemId)
    sellerId: v.string(), // Producer's Clerk user ID (from workspaceId owner)
    buyerId: v.string(), // Buyer's Clerk user ID
    amount: v.number(), // Amount in cents
    currency: v.string(), // "usd", "eur", etc.
    licenseTier: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
    orderId: v.optional(v.id("orders")), // Link to order for transaction details (optional for test data)
    status: v.union(v.literal("completed"), v.literal("refunded"), v.literal("disputed")),
    soldAt: v.number(), // Timestamp when sale was completed
  })
    .index("by_beat", ["beatId"])
    .index("by_seller", ["sellerId"])
    .index("by_buyer", ["buyerId"])
    .index("by_status", ["status"])
    .index("by_seller_date", ["sellerId", "soldAt"])
    .index("by_date", ["soldAt"]),

  sellerEarnings: defineTable({
    sellerId: v.string(), // Producer's Clerk user ID
    totalEarnings: v.number(), // Total in cents (cached)
    salesCount: v.number(), // Total number of sales
    lastUpdated: v.number(), // Last recalculation timestamp
    monthlyBreakdown: v.optional(v.object({
      // JSON object with earnings by month e.g. {"2026-04": 5000, "2026-05": 7500}
      // Key format: "YYYY-MM", value in cents
    })),
  })
    .index("by_seller", ["sellerId"]),
});
