// Convex HTTP endpoints for BroLab Entertainment
// Implements HTTP API routes for external integrations

import type { GenericActionCtx } from "convex/server";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";

// Stripe event types
interface StripeCheckoutSession {
  id: string;
  amount_total?: number;
  currency?: string;
  customer_email?: string;
  metadata?: Record<string, string>;
}

interface StripeEvent {
  id: string;
  type: string;
  data: {
    object: StripeCheckoutSession;
  };
  account?: string;
}

const http = httpRouter();

// Health check endpoint
http.route({
  path: "/health",
  method: "GET",
  handler: httpAction(async () => {
    return new Response(
      JSON.stringify({ status: "ok", timestamp: Date.now() }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        },
      }
    );
  }),
});

// Domain resolution endpoint (for middleware.ts at project root)
// Resolves custom domain hostnames to workspace slugs
// Requirements: 1.3, 1.5, Req 1
http.route({
  path: "/api/domains/resolve",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { hostname } = body;

      if (!hostname || typeof hostname !== "string") {
        return new Response(
          JSON.stringify({ error: "Invalid hostname" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Use internal query to resolve hostname to workspace slug
      const result = await ctx.runQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).platform.domains.resolveHostnameToSlug,
        { hostname }
      );

      // Return slug if domain is verified, otherwise null
      return new Response(
        JSON.stringify({ slug: result?.slug || null }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch {
      // Error during domain resolution
      return new Response(
        JSON.stringify({ error: "Internal server error" }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Stripe webhook endpoint
// Handles checkout.session.completed events for artist purchases
// Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6
http.route({
  path: "/api/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        console.error("Missing stripe-signature header");
        return jsonResponse({ error: "Missing signature" }, 400);
      }

      // Requirement 14.1: Verify Stripe webhook signature
      const event = await verifyStripeWebhook(body, signature);
      if (!event) {
        return jsonResponse({ error: "Webhook signature verification failed" }, 400);
      }

      console.log("Stripe webhook received:", event.type, "ID:", event.id);

      // Requirement 14.2 & 14.3: Check idempotency
      const isProcessed = await checkEventProcessed(ctx, event.id);
      if (isProcessed) {
        console.log("Event already processed, skipping:", event.id);
        return jsonResponse({ received: true, skipped: true }, 200);
      }

      // Handle checkout.session.completed events
      if (event.type === "checkout.session.completed") {
        return await handleCheckoutCompleted(ctx, event);
      }

      // For other event types, just mark as processed
      await markEventProcessed(ctx, event.id);
      return jsonResponse({
        received: true,
        eventType: event.type,
        message: "Event received but not processed (not checkout.session.completed)",
      }, 200);

    } catch (error) {
      console.error("Stripe webhook error:", error);
      return jsonResponse({
        error: "Webhook processing failed",
        message: error instanceof Error ? error.message : String(error),
      }, 500);
    }
  }),
});

// Track download endpoint with entitlement check
// Verifies purchase entitlement and generates time-limited download URL
// Requirements: 15.1, 15.2, 15.3
http.route({
  path: "/api/tracks/download",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { trackId, buyerClerkUserId } = body;

      if (!trackId || !buyerClerkUserId) {
        return new Response(
          JSON.stringify({ error: "Missing trackId or buyerClerkUserId" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Requirement 15.1: Verify purchase entitlement exists for buyer + track
      const entitlement = await ctx.runQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.beats.checkEntitlement,
        {
          trackId,
          buyerClerkUserId,
        }
      );

      // Requirement 15.3: Deny access if no entitlement
      if (!entitlement) {
        return new Response(
          JSON.stringify({ 
            error: "Access denied. You must purchase this track to download it.",
            hasEntitlement: false,
          }),
          {
            status: 403,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Get track to retrieve storage ID
      const track = await ctx.runQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.beats.getTrackForDownload,
        { trackId }
      );

      if (!track) {
        return new Response(
          JSON.stringify({ error: "Track not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Check if license tier includes stems
      const includesStems = entitlement.licenseTier === "unlimited";
      
      // Requirement 15.2: Generate time-limited download URL (signed or equivalent)
      // Convex storage URLs are automatically time-limited and signed
      const fullAudioUrl = track.fullStorageId 
        ? await ctx.storage.getUrl(track.fullStorageId as Id<"_storage">)
        : null;
      
      // Get stems URL if entitled
      let stemsUrl = null;
      if (includesStems && track.stemsStorageId) {
        stemsUrl = await ctx.storage.getUrl(track.stemsStorageId as Id<"_storage">);
      }

      return new Response(
        JSON.stringify({
          success: true,
          hasEntitlement: true,
          licenseTier: entitlement.licenseTier,
          includesStems,
          downloads: {
            fullAudio: fullAudioUrl,
            stems: stemsUrl,
          },
          track: {
            id: track._id,
            title: track.title,
            bpm: track.bpm,
            key: track.key,
          },
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Track download error:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to generate download URL",
          message: error instanceof Error ? error.message : String(error),
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  }),
});

// Unified Clerk webhook handler (handles both standard and Billing events)
const clerkWebhookHandler = httpAction(async (ctx, request) => {
  try {
    const rawBody = await request.text();
    console.log("Clerk webhook received - raw body:", rawBody);

    const body = parseWebhookBody(rawBody);
    if (!body) {
      return jsonResponse({ error: "Invalid JSON payload" }, 400);
    }

    console.log("Clerk webhook parsed body:", JSON.stringify(body, null, 2));

    const { type, data, object: eventObject } = body as {
      type?: string;
      data?: Record<string, unknown>;
      object?: string;
    };

    if (!type || !data) {
      console.error("Missing required fields in webhook payload");
      return jsonResponse({ error: "Invalid webhook payload: missing 'type' or 'data'" }, 400);
    }

    // Route to appropriate handler based on event type
    if (type.startsWith("subscription.")) {
      return await handleBillingEvent(ctx, type, data);
    }
    
    return await handleStandardEvent(ctx, type, data, eventObject);

  } catch (error) {
    console.error("Clerk webhook error:", error);
    return jsonResponse({
      error: "Internal server error",
      message: error instanceof Error ? error.message : String(error)
    }, 500);
  }
});

// Clerk webhook endpoint (unified handler for standard and Billing events)
// Handles both:
// - Standard Clerk events: user.*, session.*, organization.*
// - Clerk Billing events: subscription.*
// Requirements: 3.1, 3.4, 3.7, 3.8
http.route({
  path: "/api/clerk/billing/webhook",
  method: "POST",
  handler: clerkWebhookHandler,
});

// Clerk webhook endpoint (alias for compatibility)
http.route({
  path: "/api/clerk/webhook",
  method: "POST",
  handler: clerkWebhookHandler,
});

// ============================================================================
// Helper Functions
// ============================================================================

// JSON response helper
function jsonResponse(data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// Parse webhook body
function parseWebhookBody(rawBody: string): Record<string, unknown> | null {
  try {
    return JSON.parse(rawBody) as Record<string, unknown>;
  } catch (parseError) {
    console.error("Failed to parse webhook body:", parseError);
    return null;
  }
}

// Verify Stripe webhook signature
async function verifyStripeWebhook(body: string, signature: string): Promise<StripeEvent | null> {
  const stripe = new (await import("stripe")).default(
    process.env.STRIPE_SECRET_KEY!,
    { apiVersion: "2024-12-18.acacia" }
  );

  try {
    return stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    ) as StripeEvent;
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return null;
  }
}

// Check if event already processed
async function checkEventProcessed(ctx: GenericActionCtx<Record<string, never>>, eventId: string): Promise<boolean> {
  return await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).modules.orders.isEventProcessed,
    { provider: "stripe_connect", eventId }
  );
}

// Mark event as processed
async function markEventProcessed(ctx: GenericActionCtx<Record<string, never>>, eventId: string): Promise<void> {
  await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).modules.orders.markEventProcessed,
    { provider: "stripe_connect", eventId }
  );
}

// Handle checkout.session.completed event
async function handleCheckoutCompleted(ctx: GenericActionCtx<Record<string, never>>, event: StripeEvent): Promise<Response> {
  const session = event.data.object;
  console.log("Processing checkout.session.completed:", session.id);

  // Validate session metadata
  const validationError = validateSessionMetadata(session);
  if (validationError) {
    return validationError;
  }

  const metadata = session.metadata!;
  const { workspaceId, itemType, itemId, buyerClerkUserId, licenseTier } = metadata;
  const amountTotal = session.amount_total || 0;
  const currency = session.currency || "usd";
  const buyerEmail = session.customer_email || undefined;
  const connectedAccountId = event.account || null;

  // Create order
  console.log("Creating order...");
  const orderId = await createOrder(ctx, {
    workspaceId,
    buyerClerkUserId,
    buyerEmail,
    stripeSessionId: session.id,
    itemType,
    itemId,
    currency,
    amountCents: amountTotal,
    licenseTier: itemType === "track" ? licenseTier : undefined,
  });
  console.log("Order created:", orderId);

  // Create entitlement or booking
  if (itemType === "track") {
    await createTrackEntitlement(ctx, workspaceId, buyerClerkUserId, itemId, licenseTier, buyerEmail, orderId);
  } else {
    await createServiceBooking(ctx, workspaceId, buyerClerkUserId, itemId);
  }

  // Record event
  await recordCheckoutSuccessEvent(ctx, {
    workspaceId,
    orderId,
    itemType,
    itemId,
    buyerClerkUserId,
    amountCents: amountTotal,
    currency,
    stripeSessionId: session.id,
    connectedAccountId,
  });

  // Mark as processed
  await markEventProcessed(ctx, event.id);
  console.log("Webhook processing complete");

  return jsonResponse({ received: true, processed: true, orderId }, 200);
}

// Validate session metadata
function validateSessionMetadata(session: StripeCheckoutSession): Response | null {
  const metadata = session.metadata;
  const { workspaceId, itemType, itemId, buyerClerkUserId, licenseTier } = metadata || {};

  if (!workspaceId || !itemType || !itemId || !buyerClerkUserId) {
    console.error("Missing required metadata in checkout session:", metadata);
    return jsonResponse({ error: "Missing required metadata" }, 400);
  }

  if (itemType !== "track" && itemType !== "service") {
    console.error("Invalid itemType:", itemType);
    return jsonResponse({ error: "Invalid itemType" }, 400);
  }

  if (itemType === "track" && !licenseTier) {
    console.error("Missing licenseTier for track purchase");
    return jsonResponse({ error: "Missing licenseTier" }, 400);
  }

  if (itemType === "track" && !["basic", "premium", "unlimited"].includes(licenseTier)) {
    console.error("Invalid licenseTier:", licenseTier);
    return jsonResponse({ error: "Invalid licenseTier" }, 400);
  }

  return null;
}

// Create order
async function createOrder(ctx: GenericActionCtx<Record<string, never>>, params: {
  workspaceId: string;
  buyerClerkUserId: string;
  buyerEmail?: string;
  stripeSessionId: string;
  itemType: string;
  itemId: string;
  currency: string;
  amountCents: number;
  licenseTier?: string;
}): Promise<string> {
  return await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).modules.orders.createOrder,
    params
  );
}

// Create track entitlement
async function createTrackEntitlement(
  ctx: GenericActionCtx<Record<string, never>>,
  workspaceId: string,
  buyerClerkUserId: string,
  trackId: string,
  licenseTier: string,
  buyerEmail: string | undefined,
  orderId: string
): Promise<void> {
  console.log("Creating purchase entitlement...");
  
  const LICENSE_TERMS_VERSION = "v1.1-2026-01";
  const licenseTermsSnapshot = getLicenseTerms(licenseTier);

  await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).modules.orders.createPurchaseEntitlement,
    {
      workspaceId,
      buyerClerkUserId,
      buyerEmail,
      trackId,
      orderId,
      licenseTier,
      licenseTermsVersion: LICENSE_TERMS_VERSION,
      licenseTermsSnapshot,
    }
  );

  console.log("Purchase entitlement created");
}

// Create service booking
async function createServiceBooking(
  ctx: GenericActionCtx<Record<string, never>>,
  workspaceId: string,
  buyerClerkUserId: string,
  serviceId: string
): Promise<void> {
  console.log("Creating booking...");
  
  await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).modules.orders.createBooking,
    { workspaceId, buyerClerkUserId, serviceId }
  );

  console.log("Booking created");
}

// Record checkout success event
async function recordCheckoutSuccessEvent(ctx: GenericActionCtx<Record<string, never>>, params: {
  workspaceId: string;
  orderId: string;
  itemType: string;
  itemId: string;
  buyerClerkUserId: string;
  amountCents: number;
  currency: string;
  stripeSessionId: string;
  connectedAccountId: string | null;
}): Promise<void> {
  console.log("Recording checkout_success event...");
  
  await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).platform.events.recordEvent,
    {
      workspaceId: params.workspaceId,
      type: "checkout_success",
      meta: {
        orderId: params.orderId,
        itemType: params.itemType,
        itemId: params.itemId,
        buyerClerkUserId: params.buyerClerkUserId,
        amountCents: params.amountCents,
        currency: params.currency,
        stripeSessionId: params.stripeSessionId,
        connectedAccountId: params.connectedAccountId,
      },
    }
  );

  console.log("Event recorded");
}

// Get license terms by tier
function getLicenseTerms(licenseTier: string) {
  const LICENSE_TERMS_BY_TIER = {
    basic: {
      title: "Basic License",
      includesStems: false,
      rights: {
        commercialUse: true,
        audioStreamingCap: 100000,
        musicVideosCap: 1,
        livePerformanceCap: 10,
        radioBroadcastCap: 0,
        syncAllowed: false,
      },
      publishingSplit: {
        licensorWriterSharePercent: 50,
        licenseeWriterSharePercent: 50,
        licensorPublisherSharePercent: 50,
        licenseePublisherSharePercent: 50,
      },
    },
    premium: {
      title: "Premium License",
      includesStems: false,
      rights: {
        commercialUse: true,
        audioStreamingCap: 500000,
        musicVideosCap: 2,
        livePerformanceCap: 25,
        radioBroadcastCap: 10,
        syncAllowed: false,
      },
      publishingSplit: {
        licensorWriterSharePercent: 50,
        licenseeWriterSharePercent: 50,
        licensorPublisherSharePercent: 50,
        licenseePublisherSharePercent: 50,
      },
    },
    unlimited: {
      title: "Unlimited License",
      includesStems: true,
      rights: {
        commercialUse: true,
        audioStreamingCap: -1,
        musicVideosCap: -1,
        livePerformanceCap: -1,
        radioBroadcastCap: -1,
        syncAllowed: true,
      },
      publishingSplit: {
        licensorWriterSharePercent: 50,
        licenseeWriterSharePercent: 50,
        licensorPublisherSharePercent: 50,
        licenseePublisherSharePercent: 50,
      },
    },
  };

  return LICENSE_TERMS_BY_TIER[licenseTier as keyof typeof LICENSE_TERMS_BY_TIER];
}

// Handle Clerk Billing events (subscription.*)
async function handleBillingEvent(ctx: GenericActionCtx<Record<string, never>>, type: string, data: Record<string, unknown>): Promise<Response> {
  console.log("Handling Billing event:", type);

  const clerkUserId = (data.user_id || data.userId) as string | undefined;
  const plan = data.plan as string | undefined;
  const status = data.status as string | undefined;

  console.log("Extracted billing data:", { clerkUserId, plan, status });

  if (!clerkUserId || !plan || !status) {
    console.error("Missing required fields:", { clerkUserId, plan, status });
    return jsonResponse({
      error: "Missing required fields in billing webhook data",
      received: { clerkUserId, plan, status }
    }, 400);
  }

  if (plan !== "basic" && plan !== "pro") {
    console.error("Invalid plan key:", plan);
    return jsonResponse({ error: "Invalid plan key", received: plan }, 400);
  }

  // Get workspace for this user
  console.log("Looking up workspace for user:", clerkUserId);
  const workspaceId = await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).platform.billing.webhooks.getWorkspaceByOwner,
    { clerkUserId }
  );

  if (!workspaceId) {
    console.error("Workspace not found for user:", clerkUserId);
    return jsonResponse({ error: "Workspace not found for user", userId: clerkUserId }, 404);
  }

  console.log("Found workspace:", workspaceId);

  const systemStatus = mapClerkStatusToSystem(status);
  console.log("Mapped status:", status, "->", systemStatus);

  // Sync subscription to database
  await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).platform.billing.webhooks.syncSubscription,
    { clerkUserId, workspaceId, planKey: plan, status: systemStatus }
  );

  console.log("Subscription synced successfully");

  return jsonResponse({ received: true, synced: true, eventType: "billing" }, 200);
}

// Handle standard Clerk events (user.*, session.*, organization.*)
async function handleStandardEvent(
  ctx: GenericActionCtx<Record<string, never>>,
  type: string,
  data: Record<string, unknown>,
  eventObject: string | undefined
): Promise<Response> {
  console.log("Handling standard Clerk event:", type);
  console.log("Event object:", eventObject);
  console.log("Event data:", JSON.stringify(data, null, 2));

  // Log the event for audit purposes
  const dataId = data.id as string | undefined;
  
  switch (type) {
    case "user.created":
      console.log("User created:", dataId);
      // TODO: Add user creation logic if needed
      break;

    case "user.updated":
      console.log("User updated:", dataId);
      // TODO: Add user update logic if needed
      break;

    case "user.deleted":
      console.log("User deleted:", dataId);
      // TODO: Add user deletion logic if needed
      break;

    case "session.created":
      console.log("Session created:", dataId);
      // TODO: Add session tracking logic if needed
      break;

    case "organization.created":
      console.log("Organization created:", dataId);
      // TODO: Add organization creation logic if needed
      break;

    case "organization.updated":
      console.log("Organization updated:", dataId);
      // TODO: Add organization update logic if needed
      break;

    case "organization.deleted":
      console.log("Organization deleted:", dataId);
      // TODO: Add organization deletion logic if needed
      break;

    default:
      console.log("Unhandled event type:", type);
  }

  return jsonResponse({
    received: true,
    eventType: "standard",
    type,
    message: "Event logged successfully"
  }, 200);
}

// Helper function to map Clerk subscription status to system status
function mapClerkStatusToSystem(clerkStatus: string): "active" | "inactive" | "canceled" {
  switch (clerkStatus) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
      return "canceled";
    case "incomplete":
    case "incomplete_expired":
    case "past_due":
    case "unpaid":
      return "inactive";
    default:
      return "inactive";
  }
}

export default http;
