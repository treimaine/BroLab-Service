const { ConvexHttpClient } = require("convex/browser");

const client = new ConvexHttpClient("https://famous-starling-265.convex.cloud");

async function getPhase3Metrics() {
  try {
    console.log("=== BROLAB PHASE 3 METRICS ===");
    console.log("Pulling data from Convex: famous-starling-265.convex.cloud");
    console.log("Date range: Apr 6-7, 2026");
    console.log("");

    // Get checkout funnel stats
    console.log("📊 CHECKOUT FUNNEL STATS:");
    const funnelStats = await client.query("modules/analytics:getCheckoutFunnelStats", {});
    console.log("  View Checkout: " + funnelStats.stepCounts.view_checkout);
    console.log("  Select License: " + funnelStats.stepCounts.select_license);
    console.log("  Enter Email: " + funnelStats.stepCounts.enter_email);
    console.log("  Begin Payment: " + funnelStats.stepCounts.begin_payment);
    console.log("  Complete Payment: " + funnelStats.stepCounts.complete_payment);
    console.log("  Unique Users in Funnel: " + funnelStats.uniqueUsers);
    console.log("");

    // Get conversion rates
    console.log("📈 CONVERSION RATES:");
    console.log("  View → Select License: " + (funnelStats.conversionRates.viewToSelect * 100).toFixed(1) + "%");
    console.log("  Select → Email: " + (funnelStats.conversionRates.selectToEmail * 100).toFixed(1) + "%");
    console.log("  Email → Payment: " + (funnelStats.conversionRates.emailToPayment * 100).toFixed(1) + "%");
    console.log("  Payment → Complete: " + (funnelStats.conversionRates.paymentToComplete * 100).toFixed(1) + "%");
    console.log("  Overall (View → Complete): " + (funnelStats.conversionRates.overall * 100).toFixed(1) + "%");
    console.log("");

    // Get checkout completion rate
    console.log("✅ ORDER COMPLETION STATS:");
    const checkoutRate = await client.query("modules/analytics:getCheckoutCompletionRate", {});
    console.log("  Completed Orders: " + checkoutRate.completed);
    console.log("  Pending Orders: " + checkoutRate.pending);
    console.log("  Failed Orders: " + checkoutRate.failed);
    console.log("  Total Orders: " + checkoutRate.total);
    console.log("  Completion Rate: " + (checkoutRate.rate * 100).toFixed(1) + "%");
    console.log("");

    // Get revenue per user
    console.log("💰 REVENUE METRICS:");
    const revenueData = await client.query("modules/analytics:getRevenuePerUser", {});
    console.log("  Total Revenue (cents): " + revenueData.totalRevenueCents);
    console.log("  Total Revenue: $" + (revenueData.totalRevenueCents / 100).toFixed(2));
    console.log("  Active Producers: " + revenueData.activeProducers);
    console.log("  Revenue per Producer: $" + (revenueData.revenuePerUserCents / 100).toFixed(2));
    console.log("");

    // Get user counts
    console.log("👥 USER COUNTS:");
    const userCounts = await client.query("modules/analytics:getUserCounts", {});
    console.log("  Producers: " + userCounts.producer);
    console.log("  Engineers: " + userCounts.engineer);
    console.log("  Artists: " + userCounts.artist);
    console.log("  Total Users: " + userCounts.total);

  } catch (error) {
    console.error("Error fetching metrics:", error.message);
    if (error.data) {
      console.error("Details:", error.data);
    }
  }
}

getPhase3Metrics();
