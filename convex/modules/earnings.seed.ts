/**
 * Earnings Module Seed Data Generator
 *
 * Generates test data for earnings dashboard testing.
 * Creates 20+ beat sales across 5 test producers.
 *
 * Run with: npx convex run modules/earnings.seed:seedEarningsTestData
 */

import { internalMutation } from "../_generated/server";

/**
 * Seed test data for earnings dashboard
 *
 * Creates:
 * - 5 test producers (sellers)
 * - 20+ beat sales with varying amounts and dates
 * - Test data across multiple months
 *
 * @internal
 */
export const seedEarningsTestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Test producer IDs (Clerk user IDs)
    const sellers = [
      "user_test_producer_1",
      "user_test_producer_2",
      "user_test_producer_3",
      "user_test_producer_4",
      "user_test_producer_5",
    ];

    // Test buyer IDs
    const buyers = [
      "user_test_buyer_1",
      "user_test_buyer_2",
      "user_test_buyer_3",
      "user_test_buyer_4",
      "user_test_buyer_5",
    ];

    // Test beat prices (in cents)
    const prices = [
      { amount: 2999, tier: "basic" as const },    // $29.99 Basic
      { amount: 4999, tier: "premium" as const },  // $49.99 Premium
      { amount: 9999, tier: "unlimited" as const }, // $99.99 Unlimited
    ];

    // Create test workspace IDs (we'll use fake Convex IDs)
    // const workspaceId1 = "z7x4k2m1p5" as Id<"workspaces">;

    const createdSales = [];

    // Generate sales for each seller
    for (const sellerId of sellers) {
      // Create 4-5 sales per seller
      const salesPerSeller = 4 + Math.floor(Math.random() * 2);

      for (let i = 0; i < salesPerSeller; i++) {
        // Random date within last 90 days
        const daysAgo = Math.floor(Math.random() * 90);
        const soldAt = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

        // Random buyer and price
        const buyerId = buyers[Math.floor(Math.random() * buyers.length)];
        const priceInfo = prices[Math.floor(Math.random() * prices.length)];

        // Create beat sale
        const saleId = await ctx.db.insert("beatSales", {
          beatId: `beat_${sellerId}_${i}`,
          sellerId,
          buyerId,
          amount: priceInfo.amount,
          currency: "usd",
          licenseTier: priceInfo.tier,
          // orderId omitted for test data (optional field)
          status: Math.random() > 0.9 ? "refunded" : "completed", // 10% refunded
          soldAt,
        });

        createdSales.push({
          saleId,
          sellerId,
          buyerId,
          amount: priceInfo.amount,
          soldAt,
        });
      }
    }

    // Update seller earnings caches
    for (const sellerId of sellers) {
      // Get all sales for this seller (used for logging)
      // const sellerSales = createdSales.filter((s) => s.sellerId === sellerId);

      // Calculate totals (only completed)
      const completedSales = await ctx.db
        .query("beatSales")
        .filter((q) =>
          q.and(
            q.eq(q.field("sellerId"), sellerId),
            q.eq(q.field("status"), "completed")
          )
        )
        .collect();

      const totalEarnings = completedSales.reduce(
        (sum, s) => sum + s.amount,
        0
      );
      const salesCount = completedSales.length;

      // Calculate monthly breakdown
      const monthlyBreakdown: Record<string, number> = {};
      completedSales.forEach((sale) => {
        const date = new Date(sale.soldAt);
        const monthKey = `${date.getFullYear()}-${String(
          date.getMonth() + 1
        ).padStart(2, "0")}`;
        monthlyBreakdown[monthKey] =
          (monthlyBreakdown[monthKey] || 0) + sale.amount;
      });

      // Create/update seller earnings record
      const existing = await ctx.db
        .query("sellerEarnings")
        .filter((q) => q.eq(q.field("sellerId"), sellerId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, {
          totalEarnings,
          salesCount,
          lastUpdated: Date.now(),
          monthlyBreakdown,
        });
      } else {
        await ctx.db.insert("sellerEarnings", {
          sellerId,
          totalEarnings,
          salesCount,
          lastUpdated: Date.now(),
          monthlyBreakdown,
        });
      }
    }

    // Log summary
    const totalSales = createdSales.length;
    const totalEarnings = createdSales.reduce((sum, s) => sum + s.amount, 0);

    console.log("✅ Earnings test data seeded successfully!");
    console.log(`   - Created ${totalSales} beat sales`);
    console.log(`   - Across ${sellers.length} test sellers`);
    console.log(`   - Total platform earnings: $${(totalEarnings / 100).toFixed(2)}`);
    console.log(`   - Average beat price: $${(totalEarnings / totalSales / 100).toFixed(2)}`);

    return {
      success: true,
      totalSales,
      totalEarnings,
      sellersCount: sellers.length,
      message: "Earnings test data created",
    };
  },
});

/**
 * Clear all earnings test data
 *
 * Removes all beatSales and sellerEarnings records for clean slate testing.
 *
 * @internal
 */
export const clearEarningsTestData = internalMutation({
  args: {},
  handler: async (ctx) => {
    // Get all beat sales and delete them
    const allSales = await ctx.db.query("beatSales").collect();
    for (const sale of allSales) {
      await ctx.db.delete(sale._id);
    }

    // Get all seller earnings and delete them
    const allEarnings = await ctx.db.query("sellerEarnings").collect();
    for (const earning of allEarnings) {
      await ctx.db.delete(earning._id);
    }

    console.log(
      `✅ Cleared ${allSales.length} beat sales and ${allEarnings.length} earnings records`
    );

    return {
      success: true,
      deletedSales: allSales.length,
      deletedEarnings: allEarnings.length,
    };
  },
});
