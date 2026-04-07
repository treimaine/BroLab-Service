const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://famous-starling-265.convex.cloud");

async function getSignupMetrics() {
  try {
    console.log("=== PHASE 3 SIGNUP METRICS ===");
    console.log("Date range: Apr 6-7, 2026");
    console.log("");

    // Time boundaries
    const apr6Start = new Date('2026-04-06T00:00:00Z').getTime();
    const apr8Start = new Date('2026-04-08T00:00:00Z').getTime();

    // We need to query the raw database. Since ConvexHttpClient doesn't expose raw queries,
    // let's use the aggregation functions through API calls

    // Try to get metrics from Stripe instead (more reliable for transactions)
    console.log("📊 WORKSPACE CREATION DATA:");
    console.log("  To get precise signup counts, check:");
    console.log("  1. Convex Dashboard: https://dashboard.convex.dev");
    console.log("  2. Project: brolab-ent (famous-starling-265)");
    console.log("  3. Table: workspaces");
    console.log("  4. Filter: createdAt between " + apr6Start + " and " + apr8Start);
    console.log("");

    console.log("💳 STRIPE TRANSACTION DATA:");
    console.log("  1. Stripe Dashboard: https://dashboard.stripe.com/test/payments");
    console.log("  2. Look for charges created Apr 6-7, 2026");
    console.log("  3. Filter by: test_charge (test mode)");
    console.log("");

    console.log("🤝 CLERK SIGNUP DATA:");
    console.log("  1. Clerk Dashboard: https://dashboard.clerk.com");
    console.log("  2. Project: natural-rattler-88");
    console.log("  3. View Users → Filter by created_at >= 2026-04-06");
    console.log("");

  } catch (error) {
    console.error("Error:", error.message);
  }
}

getSignupMetrics();
