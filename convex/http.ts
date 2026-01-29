// Convex HTTP endpoints for BroLab Entertainment
// Implements HTTP API routes for external integrations

import { httpRouter } from "convex/server";
import { internal } from "./_generated/api";
import { httpAction } from "./_generated/server";

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

// Domain resolution endpoint (for proxy.ts at project root)
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
// Will be fully implemented in Phase 9 (Task 9.4)
http.route({
  path: "/api/stripe/webhook",
  method: "POST",
  handler: httpAction(async () => {
    // TODO: Implement Stripe webhook handler in Phase 9
    // ctx and request will be used when implementing webhook signature verification
    return new Response(
      JSON.stringify({ received: true }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  }),
});

// Unified Clerk webhook handler (handles both standard and Billing events)
const clerkWebhookHandler = httpAction(async (ctx, request) => {
    try {
      // Log raw request for debugging
      const rawBody = await request.text();
      console.log("Clerk webhook received - raw body:", rawBody);
      
      let body;
      try {
        body = JSON.parse(rawBody);
      } catch (parseError) {
        console.error("Failed to parse webhook body:", parseError);
        return new Response(
          JSON.stringify({ error: "Invalid JSON payload" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      console.log("Clerk webhook parsed body:", JSON.stringify(body, null, 2));
      
      // Clerk webhook payload structure:
      // Standard events (user.*, session.*, organization.*):
      // {
      //   type: "user.created" | "session.created" | etc.,
      //   object: "event",
      //   data: { id, ... }
      // }
      //
      // Billing events (subscription.*):
      // {
      //   type: "subscription.created" | "subscription.updated" | "subscription.deleted",
      //   data: {
      //     id: string,
      //     user_id: string,
      //     plan: string,
      //     status: string
      //   }
      // }
      
      const { type, data, object: eventObject } = body;
      
      if (!type) {
        console.error("Missing 'type' field in webhook payload");
        return new Response(
          JSON.stringify({ error: "Invalid webhook payload: missing 'type'" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      if (!data) {
        console.error("Missing 'data' field in webhook payload");
        return new Response(
          JSON.stringify({ error: "Invalid webhook payload: missing 'data'" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Route to appropriate handler based on event type
      if (type.startsWith("subscription.")) {
        // Handle Billing events
        return await handleBillingEvent(ctx, type, data);
      } else {
        // Handle standard Clerk events
        return await handleStandardEvent(ctx, type, data, eventObject);
      }
    } catch (error) {
      console.error("Clerk webhook error:", error);
      return new Response(
        JSON.stringify({ 
          error: "Internal server error",
          message: error instanceof Error ? error.message : String(error)
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
  });

// Handle Clerk Billing events (subscription.*)
async function handleBillingEvent(ctx: any, type: string, data: any) {
  console.log("Handling Billing event:", type);
  
  // Extract user_id, plan, and status from data
  // Handle both camelCase and snake_case
  const clerkUserId = data.user_id || data.userId;
  const plan = data.plan;
  const status = data.status;
  
  console.log("Extracted billing data:", { clerkUserId, plan, status });
  
  if (!clerkUserId || !plan || !status) {
    console.error("Missing required fields:", { clerkUserId, plan, status });
    return new Response(
      JSON.stringify({ 
        error: "Missing required fields in billing webhook data",
        received: { clerkUserId, plan, status }
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Validate plan key
  if (plan !== "basic" && plan !== "pro") {
    console.error("Invalid plan key:", plan);
    return new Response(
      JSON.stringify({ error: "Invalid plan key", received: plan }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  // Get workspace for this user
  console.log("Looking up workspace for user:", clerkUserId);
  const workspaceId = await ctx.runMutation((internal as any).platform.billing.webhooks.getWorkspaceByOwner, {
    clerkUserId,
  });
  
  if (!workspaceId) {
    console.error("Workspace not found for user:", clerkUserId);
    return new Response(
      JSON.stringify({ error: "Workspace not found for user", userId: clerkUserId }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
  
  console.log("Found workspace:", workspaceId);
  
  // Map Clerk status to system status
  const systemStatus = mapClerkStatusToSystem(status);
  console.log("Mapped status:", status, "->", systemStatus);
  
  // Sync subscription to database
  await ctx.runMutation((internal as any).platform.billing.webhooks.syncSubscription, {
    clerkUserId,
    workspaceId,
    planKey: plan,
    status: systemStatus,
  });
  
  console.log("Subscription synced successfully");
  
  return new Response(
    JSON.stringify({ received: true, synced: true, eventType: "billing" }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

// Handle standard Clerk events (user.*, session.*, organization.*)
async function handleStandardEvent(ctx: any, type: string, data: any, eventObject: string | undefined) {
  console.log("Handling standard Clerk event:", type);
  console.log("Event object:", eventObject);
  console.log("Event data:", JSON.stringify(data, null, 2));
  
  // Log the event for audit purposes
  // You can extend this to store events in a database table if needed
  
  // Handle specific event types
  switch (type) {
    case "user.created":
      console.log("User created:", data.id);
      // TODO: Add user creation logic if needed
      break;
      
    case "user.updated":
      console.log("User updated:", data.id);
      // TODO: Add user update logic if needed
      break;
      
    case "user.deleted":
      console.log("User deleted:", data.id);
      // TODO: Add user deletion logic if needed
      break;
      
    case "session.created":
      console.log("Session created:", data.id);
      // TODO: Add session tracking logic if needed
      break;
      
    case "organization.created":
      console.log("Organization created:", data.id);
      // TODO: Add organization creation logic if needed
      break;
      
    case "organization.updated":
      console.log("Organization updated:", data.id);
      // TODO: Add organization update logic if needed
      break;
      
    case "organization.deleted":
      console.log("Organization deleted:", data.id);
      // TODO: Add organization deletion logic if needed
      break;
      
    default:
      console.log("Unhandled event type:", type);
  }
  
  return new Response(
    JSON.stringify({ 
      received: true, 
      eventType: "standard",
      type,
      message: "Event logged successfully"
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

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
// Some Clerk configurations use /api/clerk/webhook instead of /api/clerk/billing/webhook
http.route({
  path: "/api/clerk/webhook",
  method: "POST",
  handler: clerkWebhookHandler,
});

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
