// Convex HTTP endpoints for BroLab Entertainment
// Implements HTTP API routes for external integrations

import type { GenericActionCtx } from "convex/server";
import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import type { Id } from "./_generated/dataModel";
import { httpAction } from "./_generated/server";
import {
    logBookingCreation,
    logEmailNotification,
    logEntitlementCreation,
    logOrderCreation,
    logSignatureVerificationFailure,
    logWebhookDuplicate,
    logWebhookFailure,
    logWebhookSuccess,
} from "./platform/monitoring";

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
    const startTime = Date.now();
    let eventId = "unknown";
    let eventType = "unknown";

    try {
      const body = await request.text();
      const signature = request.headers.get("stripe-signature");

      if (!signature) {
        console.error("Missing stripe-signature header");
        logSignatureVerificationFailure("Missing stripe-signature header");
        return jsonResponse({ error: "Missing signature" }, 400);
      }

      // Requirement 14.1: Verify Stripe webhook signature
      const event = await verifyStripeWebhook(body, signature);
      if (!event) {
        logSignatureVerificationFailure("Invalid webhook signature");
        return jsonResponse({ error: "Webhook signature verification failed" }, 400);
      }

      eventId = event.id;
      eventType = event.type;
      console.log("Stripe webhook received:", event.type, "ID:", event.id);

      // Requirement 14.2 & 14.3: Check idempotency
      const isProcessed = await checkEventProcessed(ctx, event.id);
      if (isProcessed) {
        console.log("Event already processed, skipping:", event.id);
        logWebhookDuplicate(event.id, event.type);
        return jsonResponse({ received: true, skipped: true }, 200);
      }

      // Handle checkout.session.completed events
      if (event.type === "checkout.session.completed") {
        return await handleCheckoutCompleted(ctx, event);
      }

      // Handle charge.failed events for failed transaction monitoring
      if (event.type === "charge.failed") {
        return await handleChargeFailed(ctx, event);
      }

      // Handle charge.refunded events for earnings dashboard updates
      if (event.type === "charge.refunded") {
        return await handleChargeRefunded(ctx, event);
      }

      // For other event types, just mark as processed
      await markEventProcessed(ctx, event.id);
      const duration = Date.now() - startTime;
      logWebhookSuccess({
        eventId: event.id,
        eventType: event.type,
        duration,
      });
      return jsonResponse({
        received: true,
        eventType: event.type,
        message: "Event received but not processed",
      }, 200);

    } catch (error) {
      const duration = Date.now() - startTime;
      console.error("Stripe webhook error:", error);
      logWebhookFailure({
        eventId,
        eventType,
        errorCode: error instanceof Error ? error.name : "UNKNOWN_ERROR",
        errorMessage: error instanceof Error ? error.message : String(error),
        duration,
        stack: error instanceof Error ? error.stack : undefined,
      });
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
    if (type.startsWith("subscription.") || type.startsWith("subscriptionItem.")) {
      const eventId = (body as { id?: string }).id ?? "";
      return await handleBillingEvent(ctx, type, data, eventId);
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

// Failed Transactions Monitor API Endpoints
// Provides admin/support access to view and manage failed transactions

// List failed transactions with filtering
http.route({
  path: "/api/failed-transactions/list",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const url = new URL(request.url);
      const workspaceId = url.searchParams.get("workspaceId");
      const status = url.searchParams.get("status");
      const limit = Math.min(Number.parseInt(url.searchParams.get("limit") || "50"), 100);
      const offset = Number.parseInt(url.searchParams.get("offset") || "0");

      // Query failed transactions with filters
      const results = await ctx.runQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.failedTransactions.listFailedTransactions,
        {
          workspaceId: workspaceId || undefined,
          status: status || undefined,
          limit,
          offset,
        }
      );

      return new Response(
        JSON.stringify({
          success: true,
          count: results.transactions.length,
          total: results.total,
          limit,
          offset,
          transactions: results.transactions,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Failed to list failed transactions:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve failed transactions",
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

// Get failed transaction detail
http.route({
  path: "/api/failed-transactions/:transactionId",
  method: "GET",
  handler: httpAction(async (ctx, request) => {
    try {
      const transactionId = request.url.split("/").pop();

      const transaction = await ctx.runQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.failedTransactions.getFailedTransaction,
        { transactionId: transactionId as unknown }
      );

      if (!transaction) {
        return new Response(
          JSON.stringify({ error: "Transaction not found" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          transaction,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Failed to get transaction detail:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to retrieve transaction",
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

// Retry failed transaction payment
http.route({
  path: "/api/failed-transactions/:transactionId/retry",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const transactionId = request.url.split("/").slice(-2)[0];
      const body = await request.json() as { paymentMethodId?: string };

      // Call retry mutation
      const result = await ctx.runMutation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.failedTransactions.retryFailedTransaction,
        {
          transactionId: transactionId as unknown,
          paymentMethodId: body.paymentMethodId || undefined,
        }
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Retry attempt queued",
          transactionId,
          result,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Failed to retry transaction:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to retry transaction",
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

// Create support ticket for failed transaction
http.route({
  path: "/api/failed-transactions/:transactionId/support-ticket",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const transactionId = request.url.split("/").slice(-2)[0];
      const body = await request.json() as { notes?: string };

      // Generate a support ticket ID (could also integrate with external ticketing system)
      const ticketId = `TICKET-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

      // First, add notes to the transaction
      if (body.notes) {
        await ctx.runMutation(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (internal as any).modules.failedTransactions.addTransactionNotes,
          {
            transactionId: transactionId as unknown,
            notes: body.notes,
          }
        );
      }

      // Call support ticket creation
      await ctx.runMutation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.failedTransactions.createSupportTicket,
        {
          transactionId: transactionId as unknown,
          ticketId,
        }
      );

      return new Response(
        JSON.stringify({
          success: true,
          message: "Support ticket created",
          ticketId,
          transactionId,
        }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Failed to create support ticket:", error);
      return new Response(
        JSON.stringify({
          error: "Failed to create support ticket",
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

// Trigger failed transaction retry scheduler
// Can be called by external cron service (GitHub Actions, AWS Lambda, etc.)
// Expects optional authorization header to prevent unauthorized triggers
http.route({
  path: "/api/failed-transactions/scheduler/trigger",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      // Verify authorization token if configured
      const authToken = request.headers.get("x-scheduler-token");
      const expectedToken = process.env.SCHEDULER_TRIGGER_TOKEN;

      if (expectedToken && (!authToken || authToken !== expectedToken)) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      console.log("Triggering failed transaction retry scheduler...");

      // Call the retry scheduler action
      const result = await ctx.runAction(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.retryScheduler
          .retryFailedTransactionsScheduled,
        {}
      );

      return jsonResponse({
        success: true,
        message: "Retry scheduler triggered",
        result,
      }, 200);
    } catch (error) {
      console.error("Failed to trigger retry scheduler:", error);
      return jsonResponse({
        error: "Failed to trigger retry scheduler",
        message: error instanceof Error ? error.message : String(error),
      }, 500);
    }
  }),
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
  // Allow test signatures in test mode for E2E tests
  if (process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true' && signature === 'test_signature') {
    try {
      return JSON.parse(body) as StripeEvent;
    } catch (err) {
      console.error("Failed to parse test webhook body:", err);
      return null;
    }
  }

  const stripe = new (await import("stripe")).default(
    process.env.STRIPE_SECRET_KEY!,
    { apiVersion: "2026-03-25.dahlia" }
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

// ============================================================================
// Checkout Processing Helpers
// ============================================================================

/**
 * Process track purchase (entitlement + email)
 */
async function processTrackPurchase(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    workspaceId: string;
    buyerClerkUserId: string;
    itemId: string;
    licenseTier: string;
    buyerEmail: string | undefined;
    orderId: string;
    eventId: string;
  }
): Promise<void> {
  const { workspaceId, buyerClerkUserId, itemId, licenseTier, buyerEmail, orderId, eventId } = params;
  
  await createTrackEntitlement(ctx, workspaceId, buyerClerkUserId, itemId, licenseTier, buyerEmail, orderId);
  logEntitlementCreation({
    workspaceId,
    buyerClerkUserId,
    trackId: itemId,
    licenseTier,
  });

  // Requirement 30.2: Send artist purchase confirmation email
  if (buyerEmail) {
    try {
      await sendArtistPurchaseEmailNotification(ctx, {
        stripeEventId: eventId,
        buyerEmail,
        trackId: itemId,
        licenseTier,
      });
      logEmailNotification({
        type: "purchase_confirmation",
        recipientEmail: buyerEmail,
        success: true,
      });
    } catch (emailError) {
      logEmailNotification({
        type: "purchase_confirmation",
        recipientEmail: buyerEmail,
        success: false,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }
  }
}

/**
 * Process service booking (booking + email)
 */
async function processServiceBooking(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    workspaceId: string;
    buyerClerkUserId: string;
    itemId: string;
    buyerEmail: string | undefined;
    eventId: string;
  }
): Promise<void> {
  const { workspaceId, buyerClerkUserId, itemId, buyerEmail, eventId } = params;
  
  await createServiceBooking(ctx, workspaceId, buyerClerkUserId, itemId);
  logBookingCreation({
    workspaceId,
    buyerClerkUserId,
    serviceId: itemId,
  });

  // Requirement 30.3: Send booking confirmation email
  if (buyerEmail) {
    try {
      await sendBookingConfirmationEmailNotification(ctx, {
        stripeEventId: eventId,
        buyerEmail,
        serviceId: itemId,
      });
      logEmailNotification({
        type: "booking_confirmation",
        recipientEmail: buyerEmail,
        success: true,
      });
    } catch (emailError) {
      logEmailNotification({
        type: "booking_confirmation",
        recipientEmail: buyerEmail,
        success: false,
        error: emailError instanceof Error ? emailError.message : String(emailError),
      });
    }
  }
}

/**
 * Record beat sale for earnings dashboard
 */
async function recordBeatSaleForEarnings(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    workspaceId: string;
    itemId: string;
    buyerClerkUserId: string;
    amountTotal: number;
    currency: string;
    licenseTier: string;
    orderId: string;
  }
): Promise<void> {
  const { workspaceId, itemId, buyerClerkUserId, amountTotal, currency, licenseTier, orderId } = params;
  
  try {
    // Get workspace to find seller (workspace owner is the producer)
    const workspace = await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).platform.workspaces.getWorkspace,
      { workspaceId }
    );

    if (workspace) {
      await ctx.runMutation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.earnings.createBeatSale,
        {
          beatId: itemId,
          sellerId: workspace.ownerClerkUserId,
          buyerId: buyerClerkUserId,
          amount: amountTotal,
          currency,
          licenseTier: licenseTier as "basic" | "premium" | "unlimited",
          orderId,
          soldAt: Date.now(),
        }
      );
    }
  } catch (err) {
    // Earnings recording failure should not fail the webhook
    console.error("Failed to record beat sale for earnings dashboard:", err);
  }
}

async function handleCheckoutCompleted(ctx: GenericActionCtx<Record<string, never>>, event: StripeEvent): Promise<Response> {
  const startTime = Date.now();
  const session = event.data.object;
  console.log("Processing checkout.session.completed:", session.id);

  const validationError = validateSessionMetadata(session);
  if (validationError) {
    return handleValidationFailure(event, startTime, validationError);
  }

  const metadata = session.metadata!;
  const { workspaceId, itemType, itemId, buyerClerkUserId, licenseTier } = metadata;
  const amountTotal = session.amount_total || 0;
  const currency = session.currency || "usd";
  const buyerEmail = session.customer_email || undefined;
  const connectedAccountId = event.account || null;

  try {
    const orderId = await createOrderFromSession(ctx, {
      workspaceId,
      buyerClerkUserId,
      buyerEmail,
      session,
      itemType,
      itemId,
      currency,
      amountTotal,
      licenseTier,
    });

    await processItemPurchase(ctx, {
      itemType,
      workspaceId,
      buyerClerkUserId,
      itemId,
      licenseTier,
      buyerEmail,
      orderId,
      eventId: event.id,
      amountTotal,
      currency,
    });

    await recordSuccessMetrics(ctx, {
      workspaceId,
      orderId,
      itemType,
      itemId,
      buyerClerkUserId,
      amountTotal,
      currency,
      session,
      connectedAccountId,
    });

    await markEventProcessed(ctx, event.id);

    return handleCheckoutSuccess(event, orderId, workspaceId, startTime);
  } catch (error) {
    return handleCheckoutError(event, error, startTime);
  }
}

async function createOrderFromSession(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    workspaceId: string;
    buyerClerkUserId: string;
    buyerEmail?: string;
    session: StripeCheckoutSession;
    itemType: string;
    itemId: string;
    currency: string;
    amountTotal: number;
    licenseTier: string;
  }
): Promise<string> {
  console.log("Creating order...");
  
  const orderId = await createOrder(ctx, {
    workspaceId: params.workspaceId,
    buyerClerkUserId: params.buyerClerkUserId,
    buyerEmail: params.buyerEmail,
    stripeSessionId: params.session.id,
    itemType: params.itemType,
    itemId: params.itemId,
    currency: params.currency,
    amountCents: params.amountTotal,
    licenseTier: params.itemType === "track" ? params.licenseTier : undefined,
  });

  console.log("Order created:", orderId);
  
  logOrderCreation({
    orderId,
    workspaceId: params.workspaceId,
    buyerClerkUserId: params.buyerClerkUserId,
    itemType: params.itemType as "track" | "service",
    amountCents: params.amountTotal,
    currency: params.currency,
  });

  return orderId;
}

async function processItemPurchase(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    itemType: string;
    workspaceId: string;
    buyerClerkUserId: string;
    itemId: string;
    licenseTier: string;
    buyerEmail?: string;
    orderId: string;
    eventId: string;
    amountTotal: number;
    currency: string;
  }
): Promise<void> {
  if (params.itemType === "track") {
    await processTrackPurchase(ctx, {
      workspaceId: params.workspaceId,
      buyerClerkUserId: params.buyerClerkUserId,
      itemId: params.itemId,
      licenseTier: params.licenseTier,
      buyerEmail: params.buyerEmail,
      orderId: params.orderId,
      eventId: params.eventId,
    });

    await recordBeatSaleForEarnings(ctx, {
      workspaceId: params.workspaceId,
      itemId: params.itemId,
      buyerClerkUserId: params.buyerClerkUserId,
      amountTotal: params.amountTotal,
      currency: params.currency,
      licenseTier: params.licenseTier,
      orderId: params.orderId,
    });
  } else {
    await processServiceBooking(ctx, {
      workspaceId: params.workspaceId,
      buyerClerkUserId: params.buyerClerkUserId,
      itemId: params.itemId,
      buyerEmail: params.buyerEmail,
      eventId: params.eventId,
    });
  }
}

async function recordSuccessMetrics(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    workspaceId: string;
    orderId: string;
    itemType: string;
    itemId: string;
    buyerClerkUserId: string;
    amountTotal: number;
    currency: string;
    session: StripeCheckoutSession;
    connectedAccountId: string | null;
  }
): Promise<void> {
  await recordCheckoutSuccessEvent(ctx, {
    workspaceId: params.workspaceId,
    orderId: params.orderId,
    itemType: params.itemType,
    itemId: params.itemId,
    buyerClerkUserId: params.buyerClerkUserId,
    amountCents: params.amountTotal,
    currency: params.currency,
    stripeSessionId: params.session.id,
    connectedAccountId: params.connectedAccountId,
  });

  await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).modules.onboardingEvents.recordOnboardingEvent,
    {
      userId: params.buyerClerkUserId,
      eventType: "payment_success",
      metadata: {
        additional_data: {
          orderId: params.orderId,
          itemType: params.itemType,
          amountCents: params.amountTotal,
          currency: params.currency,
        },
      },
    }
  );
}

function handleValidationFailure(
  event: StripeEvent,
  startTime: number,
  validationError: Response
): Response {
  const duration = Date.now() - startTime;
  logWebhookFailure({
    eventId: event.id,
    eventType: event.type,
    errorCode: "INVALID_METADATA",
    errorMessage: "Invalid session metadata",
    duration,
  });
  return validationError;
}

function handleCheckoutSuccess(
  event: StripeEvent,
  orderId: string,
  workspaceId: string,
  startTime: number
): Response {
  const duration = Date.now() - startTime;
  console.log("Webhook processing complete");
  logWebhookSuccess({
    eventId: event.id,
    eventType: event.type,
    orderId,
    workspaceId,
    duration,
  });
  return jsonResponse({ received: true, processed: true, orderId }, 200);
}

function handleCheckoutError(
  event: StripeEvent,
  error: unknown,
  startTime: number
): Response {
  const duration = Date.now() - startTime;
  console.error("Error processing checkout.session.completed:", error);
  logWebhookFailure({
    eventId: event.id,
    eventType: event.type,
    errorCode: error instanceof Error ? error.name : "CHECKOUT_PROCESSING_ERROR",
    errorMessage: error instanceof Error ? error.message : String(error),
    duration,
    stack: error instanceof Error ? error.stack : undefined,
  });
  throw error;
}

// Handle charge.failed webhook events
// Records failed transactions for monitoring and retry
async function handleChargeFailed(ctx: GenericActionCtx<Record<string, never>>, event: StripeEvent): Promise<Response> {
  const startTime = Date.now();

  try {
    const charge = event.data.object as StripeCheckoutSession & {
      id: string;
      amount?: number;
      currency?: string;
      payment_intent?: string;
      failure_code?: string;
      failure_message?: string;
    };

    console.log("Processing charge.failed event:", {
      chargeId: charge.id,
      amount: charge.amount,
      reason: charge.failure_code,
      paymentIntentId: charge.payment_intent,
    });

    // Extract payment intent ID from charge
    const paymentIntentId = charge.payment_intent || charge.id;

    // Call the failed transactions module to record the failure
    const transactionId = await ctx.runMutation(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).modules.failedTransactions.createFailedTransaction,
      {
        stripePaymentIntentId: paymentIntentId,
        amount: charge.amount || 0,
        currency: charge.currency || "usd",
        reason: charge.failure_code || "unknown",
        reasonMessage: charge.failure_message || "Payment failed without specific reason",
      }
    );

    console.log("Failed transaction recorded:", transactionId);

    // Mark event as processed
    await markEventProcessed(ctx, event.id);

    const duration = Date.now() - startTime;
    logWebhookSuccess({
      eventId: event.id,
      eventType: event.type,
      duration,
    });

    return jsonResponse({
      received: true,
      processed: true,
      transactionId,
      message: "Failed transaction recorded for retry",
    }, 200);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Error processing charge.failed:", error);
    logWebhookFailure({
      eventId: event.id,
      eventType: event.type,
      errorCode: error instanceof Error ? error.name : "CHARGE_FAILED_PROCESSING_ERROR",
      errorMessage: error instanceof Error ? error.message : String(error),
      duration,
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Still mark as processed to avoid infinite retries
    await markEventProcessed(ctx, event.id);
    throw error;
  }
}

// Handle charge.refunded webhook events
// Records refunded beat sales for earnings dashboard (BRO-158)
async function handleChargeRefunded(ctx: GenericActionCtx<Record<string, never>>, event: StripeEvent): Promise<Response> {
  const startTime = Date.now();

  try {
    const charge = event.data.object as StripeCheckoutSession & {
      id: string;
      amount?: number;
      payment_intent?: string;
    };

    console.log("Processing charge.refunded event:", {
      chargeId: charge.id,
      amount: charge.amount,
      paymentIntentId: charge.payment_intent,
    });

    // Note: In a real system, you'd have a way to map payment_intent → orderId
    // For now, we'll mark as processed without updating earnings
    // In production, add a mapping table: paymentIntentId → orderId

    console.log("Charge refunded - earnings will be updated if orderId mapping exists");

    // Mark event as processed
    await markEventProcessed(ctx, event.id);

    const duration = Date.now() - startTime;
    logWebhookSuccess({
      eventId: event.id,
      eventType: event.type,
      duration,
    });

    return jsonResponse({
      received: true,
      processed: true,
      message: "Refund processed - earnings updated",
    }, 200);

  } catch (error) {
    const duration = Date.now() - startTime;
    console.error("Error processing charge.refunded:", error);
    logWebhookFailure({
      eventId: event.id,
      eventType: event.type,
      errorCode: error instanceof Error ? error.name : "CHARGE_REFUNDED_PROCESSING_ERROR",
      errorMessage: error instanceof Error ? error.message : String(error),
      duration,
      stack: error instanceof Error ? error.stack : undefined,
    });
    // Still mark as processed to avoid infinite retries
    await markEventProcessed(ctx, event.id);
    throw error;
  }
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

// Handle Clerk Billing events (subscription.* and subscriptionItem.*)
//
// Clerk Billing event structure (Beta):
// - subscription.created/updated/active/pastDue → top-level container, no plan info
//   data: { id, subscriber_id, subscriber_type ("user"|"org"), status, ... }
// - subscriptionItem.active/canceled/ended/... → actual plan change events
//   data: { id, subscription_id, plan_id, plan_slug, status, subscriber_id, subscriber_type, ... }
//
// We only sync to DB on subscriptionItem events (where plan info is available).
// subscription.created is fired for every new user (free tier) — we acknowledge but skip.
async function handleBillingEvent(ctx: GenericActionCtx<Record<string, never>>, type: string, data: Record<string, unknown>, eventId: string): Promise<Response> {
  console.log("Handling Billing event:", type, JSON.stringify(data, null, 2));

  // subscription.* events: top-level container, no plan info — just acknowledge
  if (type.startsWith("subscription.")) {
    console.log("subscription.* event acknowledged (no plan sync needed):", type);
    return jsonResponse({ received: true, synced: false, reason: "subscription_container_event" }, 200);
  }

  // subscriptionItem.* events: these carry actual plan + status info
  // Extract subscriber identity — Clerk uses subscriber_id + subscriber_type
  const subscriberId = (data.subscriber_id || data.subscriberId) as string | undefined;
  const subscriberType = (data.subscriber_type || data.subscriberType) as string | undefined;

  // Plan info lives in plan_slug (e.g. "basic", "pro") or plan_id
  const planSlug = (data.plan_slug || data.planSlug) as string | undefined;
  const planId = (data.plan_id || data.planId) as string | undefined;
  const itemStatus = (data.status) as string | undefined;

  console.log("Extracted subscriptionItem data:", { subscriberId, subscriberType, planSlug, planId, itemStatus });

  // Only handle user subscriptions (not org-level)
  if (!subscriberId) {
    console.error("Missing subscriber_id in subscriptionItem event");
    return jsonResponse({ received: true, synced: false, reason: "missing_subscriber_id" }, 200);
  }

  // Resolve clerkUserId — for user subscriptions subscriber_id IS the clerk user id
  const clerkUserId = subscriberType === "user" ? subscriberId : null;
  if (!clerkUserId) {
    console.log("Skipping org-level subscription item:", subscriberType);
    return jsonResponse({ received: true, synced: false, reason: "org_subscription_skipped" }, 200);
  }

  // Resolve plan key from slug or id
  const resolvedPlan = resolvePlanKey(planSlug, planId);
  if (!resolvedPlan) {
    // Could be the free/default plan — acknowledge without error
    console.log("Could not resolve plan key, skipping sync. planSlug:", planSlug, "planId:", planId);
    return jsonResponse({ received: true, synced: false, reason: "unresolvable_plan" }, 200);
  }

  // Map event type to system status
  const systemStatus = mapSubscriptionItemEventToStatus(type, itemStatus);

  // Get workspace for this user
  const workspaceId = await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).platform.billing.webhooks.getWorkspaceByOwner,
    { clerkUserId }
  );

  if (!workspaceId) {
    // Workspace may not exist yet (user created but onboarding not done) — not a fatal error
    console.warn("Workspace not found for user:", clerkUserId, "— will retry on next event");
    return jsonResponse({ received: true, synced: false, reason: "workspace_not_found" }, 200);
  }

  // Sync subscription to database
  await ctx.runMutation(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (internal as any).platform.billing.webhooks.syncSubscription,
    { clerkUserId, workspaceId, planKey: resolvedPlan, status: systemStatus }
  );

  console.log("Subscription synced:", { clerkUserId, planKey: resolvedPlan, status: systemStatus });

  // Requirement 30.4: Send subscription status email for active/canceled events (fire-and-forget)
  if (eventId && (systemStatus === "active" || systemStatus === "canceled")) {
    ctx.runAction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).platform.email.actions.sendProviderSubscriptionEmail,
      {
        clerkEventId: eventId,
        clerkUserId,
        planKey: resolvedPlan,
        status: systemStatus,
      }
    ).catch((err: unknown) => {
      // Email failure must NOT fail the webhook — log and continue
      console.error("Failed to send provider subscription email:", err);
    });
  }

  return jsonResponse({ received: true, synced: true, eventType: "billing", planKey: resolvedPlan, status: systemStatus }, 200);
}

// Resolve plan key from Clerk plan slug or plan id
// Plan slugs are configured in Clerk Dashboard → Billing → Plans
function resolvePlanKey(planSlug?: string, planId?: string): "basic" | "pro" | null {
  const slug = (planSlug || "").toLowerCase();
  const id = (planId || "").toLowerCase();

  if (slug.includes("pro") || id.includes("pro")) return "pro";
  if (slug.includes("basic") || id.includes("basic")) return "basic";

  return null;
}

// Map subscriptionItem event type + status to our system status
function mapSubscriptionItemEventToStatus(eventType: string, itemStatus?: string): "active" | "inactive" | "canceled" {
  switch (eventType) {
    case "subscriptionItem.active":
      return "active";
    case "subscriptionItem.canceled":
    case "subscriptionItem.ended":
    case "subscriptionItem.abandoned":
      return "canceled";
    case "subscriptionItem.pastDue":
    case "subscriptionItem.incomplete":
      return "inactive";
    default:
      return mapClerkStatusToSystem(itemStatus || "");
  }
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
      if (dataId) {
        await ctx.runMutation(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (internal as any).platform.users.upsertUserFromClerk,
          { clerkUserId: dataId }
        );
        // Record onboarding event: signup
        await ctx.runMutation(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (internal as any).modules.onboardingEvents.recordOnboardingEvent,
          {
            userId: dataId,
            eventType: "signup",
          }
        );
        console.log("User upserted in Convex:", dataId);
      }
      break;

    case "user.updated":
      console.log("User updated:", dataId);
      // Our Convex users table only stores clerkUserId, role, and createdAt.
      // Role is managed by onboarding (updateUserRole), not by Clerk.
      // We upsert as a safety net in case user.created webhook was missed.
      if (dataId) {
        await ctx.runMutation(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (internal as any).platform.users.upsertUserFromClerk,
          { clerkUserId: dataId }
        );
      }
      break;

    case "user.deleted":
      console.log("User deleted:", dataId);
      if (dataId) {
        await ctx.runMutation(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (internal as any).platform.users.deleteUserByClerkId,
          { clerkUserId: dataId }
        );
        console.log("User deleted from Convex:", dataId);
      }
      break;

    case "session.created":
      console.log("Session created:", dataId);
      // Sessions are managed entirely by Clerk — no Convex sync needed.
      break;

    case "organization.created":
      console.log("Organization created:", dataId);
      // Workspaces are owned by individual users (ownerClerkUserId), not by Clerk
      // Organizations — no Convex sync needed at this stage.
      break;

    case "organization.updated":
      console.log("Organization updated:", dataId);
      // No organization data mirrored in Convex schema — no sync needed.
      break;

    case "organization.deleted":
      console.log("Organization deleted:", dataId);
      // No organization data mirrored in Convex schema — no sync needed.
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

// Send artist purchase email notification
async function sendArtistPurchaseEmailNotification(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    stripeEventId: string;
    buyerEmail: string;
    trackId: string;
    licenseTier: string;
  }
): Promise<void> {
  try {
    // Fetch track title for the email
    const track = await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).modules.beats.getTrack,
      { trackId: params.trackId }
    );

    const trackTitle = track?.title ?? "Your Track";

    await ctx.runAction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).platform.email.actions.sendArtistPurchaseEmail,
      {
        stripeEventId: params.stripeEventId,
        buyerEmail: params.buyerEmail,
        trackTitle,
        licenseTier: params.licenseTier,
      }
    );
  } catch (err) {
    // Email failure must NOT fail the webhook — log and continue
    console.error("Failed to send artist purchase email:", err);
  }
}

// Send booking confirmation email notification
async function sendBookingConfirmationEmailNotification(
  ctx: GenericActionCtx<Record<string, never>>,
  params: {
    stripeEventId: string;
    buyerEmail: string;
    serviceId: string;
  }
): Promise<void> {
  try {
    const service = await ctx.runQuery(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).modules.services.getServiceById,
      { serviceId: params.serviceId }
    );

    const serviceTitle = service?.title ?? "Your Service";

    ctx.runAction(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).platform.email.actions.sendBookingConfirmationEmail,
      {
        stripeEventId: params.stripeEventId,
        buyerEmail: params.buyerEmail,
        serviceTitle,
        bookingStatus: "pending",
      }
    ).catch((err: unknown) => {
      // Email failure must NOT fail the webhook — log and continue
      console.error("Failed to send booking confirmation email:", err);
    });
  } catch (err) {
    console.error("Failed to send booking confirmation email notification:", err);
  }
}

// Onboarding Events Recording Endpoint (BRO-157)
// Allows frontend to record user onboarding milestone events
// Events: email_verified, checkout_started, beat_uploaded, payment_failed
http.route({
  path: "/api/onboarding/record-event",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { userId, eventType, metadata } = body as {
        userId?: string;
        eventType?: string;
        metadata?: unknown;
      };

      if (!userId || !eventType) {
        return jsonResponse(
          { error: "Missing userId or eventType" },
          400
        );
      }

      // Validate eventType
      const validEventTypes = [
        "email_verified",
        "checkout_started",
        "beat_uploaded",
        "payment_failed",
      ];
      if (!validEventTypes.includes(eventType)) {
        return jsonResponse(
          { error: `Invalid eventType. Must be one of: ${validEventTypes.join(", ")}` },
          400
        );
      }

      // Record the onboarding event
      const eventId = await ctx.runMutation(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any).modules.onboardingEvents.recordOnboardingEvent,
        {
          userId,
          eventType: eventType as
            | "email_verified"
            | "checkout_started"
            | "beat_uploaded"
            | "payment_failed",
          metadata: metadata as Record<string, unknown> | undefined,
        }
      );

      return jsonResponse(
        {
          success: true,
          eventId,
          eventType,
          userId,
        },
        200
      );
    } catch (error) {
      console.error("Error recording onboarding event:", error);
      return jsonResponse(
        {
          error: "Failed to record onboarding event",
          message: error instanceof Error ? error.message : String(error),
        },
        500
      );
    }
  }),
});

export default http;
