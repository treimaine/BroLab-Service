// Convex HTTP endpoints for BroLab Entertainment
// Implements HTTP API routes for external integrations

import { httpRouter } from "convex/server";
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

// Domain resolution endpoint (for proxy.ts)
// Will be fully implemented in Phase 6 (Task 6.3)
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

      // TODO: Implement domain resolution in Phase 6
      // For now, return null (no custom domains configured)
      return new Response(
        JSON.stringify({ slug: null }),
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

export default http;
