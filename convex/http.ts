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

// Clerk Billing webhook endpoint
// Handles subscription lifecycle events from Clerk Billing
// Requirements: 3.1, 3.4, 3.7, 3.8
http.route({
  path: "/api/clerk/billing/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      
      // Clerk Billing webhook payload structure:
      // {
      //   type: "subscription.created" | "subscription.updated" | "subscription.deleted",
      //   data: {
      //     id: string,
      //     user_id: string,
      //     plan: string, // "basic" or "pro"
      //     status: "active" | "canceled" | "incomplete" | etc.
      //   }
      // }
      
      const { type, data } = body;
      
      if (!type || !data) {
        return new Response(
          JSON.stringify({ error: "Invalid webhook payload" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Only process subscription events
      if (!type.startsWith("subscription.")) {
        return new Response(
          JSON.stringify({ received: true, skipped: "Not a subscription event" }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      const { user_id: clerkUserId, plan, status } = data;
      
      if (!clerkUserId || !plan || !status) {
        return new Response(
          JSON.stringify({ error: "Missing required fields in webhook data" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Validate plan key
      if (plan !== "basic" && plan !== "pro") {
        return new Response(
          JSON.stringify({ error: "Invalid plan key" }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Get workspace for this user
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const workspaceId = await ctx.runMutation((internal as any).platform.billing.webhooks.getWorkspaceByOwner, {
        clerkUserId,
      });
      
      if (!workspaceId) {
        return new Response(
          JSON.stringify({ error: "Workspace not found for user" }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      
      // Map Clerk status to system status
      const systemStatus = mapClerkStatusToSystem(status);
      
      // Sync subscription to database
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await ctx.runMutation((internal as any).platform.billing.webhooks.syncSubscription, {
        clerkUserId,
        workspaceId,
        planKey: plan,
        status: systemStatus,
      });
      
      return new Response(
        JSON.stringify({ received: true, synced: true }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        }
      );
    } catch (error) {
      console.error("Clerk Billing webhook error:", error);
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
