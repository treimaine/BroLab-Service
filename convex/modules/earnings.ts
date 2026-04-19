// @ts-nocheck - Temporary: Convex query builder types issue
/**
 * Earnings Transparency Dashboard Module
 *
 * Handles producer earnings tracking, sales records, and monthly payout calculations.
 *
 * Spec: BRO-158 MAY-W2
 * Owner: CTO
 * Timeline: April 22-26 (2-3 days after BRO-157)
 */

import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get producer earnings - Single producer view
 * Returns: total earned, sales count, recent sales list, monthly breakdown
 * Use case: Producer dashboard showing "You've earned $X.XX"
 *
 * Requirements: BRO-158
 */
export const getProducerEarnings = query({
  args: {
    sellerId: v.string(), // Producer's Clerk user ID
    startDate: v.optional(v.number()), // Unix timestamp (ms) - optional date range start
    endDate: v.optional(v.number()), // Unix timestamp (ms) - optional date range end
  },
  handler: async (ctx, args) => {
    const { sellerId, startDate, endDate } = args;

    // Get cached earnings total
    const cachedEarnings = await ctx.db
      .query("sellerEarnings")
      .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
      .first();

    // Query beat sales for this seller
    let salesQuery = ctx.db
      .query("beatSales")
      .withIndex("by_seller", (q) => q.eq("sellerId", sellerId));

    // Apply date range filters if provided
    if (startDate && endDate) {
      // Note: Convex doesn't support range queries directly in the index chain,
      // so we'll filter in memory for date range
      salesQuery = salesQuery.withIndex("by_seller_date", (q) =>
        q.eq("sellerId", sellerId)
      );
    }

    const allSales = await salesQuery.collect();

    // Filter by date range if provided
    let filteredSales = allSales;
    if (startDate && endDate) {
      filteredSales = allSales.filter(
        (sale) => sale.soldAt >= startDate && sale.soldAt <= endDate
      );
    }

    // Only include completed sales in earnings calculation
    const completedSales = filteredSales.filter(
      (sale) => sale.status === "completed"
    );

    // Calculate totals
    const totalEarnings = completedSales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
    const salesCount = completedSales.length;

    // Get recent sales (last 10)
    const recentSales = completedSales
      .sort((a, b) => b.soldAt - a.soldAt)
      .slice(0, 10)
      .map((sale) => ({
        id: sale._id,
        beatId: sale.beatId,
        buyerId: sale.buyerId,
        amount: sale.amount,
        currency: sale.currency,
        licenseTier: sale.licenseTier,
        soldAt: sale.soldAt,
      }));

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

    return {
      sellerId,
      totalEarnings,
      salesCount,
      recentSales,
      monthlyBreakdown,
      cachedAt: cachedEarnings?.lastUpdated || null,
    };
  },
});

/**
 * List all sales - Admin view of all sales
 * Query: date range, filter by seller/buyer/status
 * Return: paginated sales list with buyer/seller names, amounts, timestamps
 * Use case: Operations analytics
 *
 * Requirements: BRO-158
 */
export const listAllSales = query({
  args: {
    sellerId: v.optional(v.string()), // Filter by seller
    buyerId: v.optional(v.string()), // Filter by buyer
    status: v.optional(v.union(v.literal("completed"), v.literal("refunded"), v.literal("disputed"))), // Filter by status
    startDate: v.optional(v.number()), // Unix timestamp (ms)
    endDate: v.optional(v.number()), // Unix timestamp (ms)
    limit: v.optional(v.number()), // Default 50, max 100
    offset: v.optional(v.number()), // Pagination offset
  },
  handler: async (ctx, args) => {
    const {
      sellerId,
      buyerId,
      status,
      startDate,
      endDate,
      limit = 50,
      offset = 0,
    } = args;

    // Validate pagination params
    const validLimit = Math.min(Math.max(limit, 1), 100);
    const validOffset = Math.max(offset, 0);

    // Start query - use index if available
    let query;
    if (sellerId) {
      query = ctx.db
        .query("beatSales")
        .withIndex("by_seller", (q) => q.eq("sellerId", sellerId));
    } else if (buyerId) {
      query = ctx.db
        .query("beatSales")
        .withIndex("by_buyer", (q) => q.eq("buyerId", buyerId));
    } else if (status) {
      query = ctx.db
        .query("beatSales")
        .withIndex("by_status", (q) => q.eq("status", status));
    } else {
      query = ctx.db.query("beatSales");
    }

    const allSales = await query.collect();

    // Apply filters in memory
    let filteredSales = allSales;

    // Filter by additional criteria
    if (sellerId && !query) filteredSales = filteredSales.filter((s) => s.sellerId === sellerId);
    if (buyerId && !query) filteredSales = filteredSales.filter((s) => s.buyerId === buyerId);
    if (status && !query) filteredSales = filteredSales.filter((s) => s.status === status);

    if (startDate && endDate) {
      filteredSales = filteredSales.filter(
        (s) => s.soldAt >= startDate && s.soldAt <= endDate
      );
    }

    // Sort by date descending
    const sorted = filteredSales.sort((a, b) => b.soldAt - a.soldAt);

    // Paginate
    const total = sorted.length;
    const paginatedSales = sorted.slice(validOffset, validOffset + validLimit);

    // Format response
    const sales = paginatedSales.map((sale) => ({
      id: sale._id,
      beatId: sale.beatId,
      sellerId: sale.sellerId,
      buyerId: sale.buyerId,
      amount: sale.amount,
      currency: sale.currency,
      licenseTier: sale.licenseTier,
      status: sale.status,
      soldAt: sale.soldAt,
    }));

    return {
      success: true,
      total,
      count: sales.length,
      limit: validLimit,
      offset: validOffset,
      sales,
    };
  },
});

/**
 * Get earnings metrics - Platform-wide analytics
 * Return: total platform sales, avg beat price, top sellers, refund rate
 * Use case: Board metrics dashboard
 *
 * Requirements: BRO-158
 */
export const getEarningsMetrics = query({
  args: {},
  handler: async (ctx) => {
    // Get all beat sales
    const allSales = await ctx.db.query("beatSales").collect();

    if (allSales.length === 0) {
      return {
        totalPlatformSales: 0,
        totalSalesCount: 0,
        averageBeatPrice: 0,
        topSellers: [],
        refundRate: 0,
        completedSales: 0,
        refundedSales: 0,
        disputedSales: 0,
      };
    }

    // Calculate totals
    const totalPlatformSales = allSales
      .filter((s) => s.status === "completed")
      .reduce((sum, sale) => sum + sale.amount, 0);

    const completedSales = allSales.filter((s) => s.status === "completed").length;
    const refundedSales = allSales.filter((s) => s.status === "refunded").length;
    const disputedSales = allSales.filter((s) => s.status === "disputed").length;
    const refundRate = allSales.length > 0 ? (refundedSales / allSales.length) * 100 : 0;

    // Calculate average beat price (completed sales only)
    const completedSalesData = allSales.filter((s) => s.status === "completed");
    const averageBeatPrice =
      completedSalesData.length > 0
        ? Math.round(totalPlatformSales / completedSalesData.length)
        : 0;

    // Get top sellers by revenue
    const sellerRevenue: Record<string, number> = {};
    completedSalesData.forEach((sale) => {
      sellerRevenue[sale.sellerId] = (sellerRevenue[sale.sellerId] || 0) + sale.amount;
    });

    const topSellers = Object.entries(sellerRevenue)
      .map(([sellerId, earnings]) => ({
        sellerId,
        earnings,
        salesCount: completedSalesData.filter(
          (s) => s.sellerId === sellerId
        ).length,
      }))
      .sort((a, b) => b.earnings - a.earnings)
      .slice(0, 10); // Top 10

    return {
      totalPlatformSales,
      totalSalesCount: allSales.length,
      completedSales,
      refundedSales,
      disputedSales,
      averageBeatPrice,
      refundRate: parseFloat(refundRate.toFixed(2)),
      topSellers,
    };
  },
});

// ============================================================================
// MUTATIONS
// ============================================================================

/**
 * Create beat sale record - Called by Stripe webhook
 *
 * This is called from the Stripe webhook handler when checkout completes.
 * It creates a beatSales record and updates the sellerEarnings cache.
 *
 * @internal Internal mutation called only from HTTP webhook actions
 * Requirements: BRO-158
 */
export const createBeatSale = internalMutation({
  args: {
    beatId: v.string(),
    sellerId: v.string(),
    buyerId: v.string(),
    amount: v.number(),
    currency: v.string(),
    licenseTier: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
    orderId: v.id("orders"),
    soldAt: v.number(),
  },
  handler: async (ctx, args) => {
    // Check if beat sale already exists for this order (idempotency)
    const existing = await ctx.db
      .query("beatSales")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();

    if (existing) {
      return existing._id;
    }

    // Create beat sale record
    const saleId = await ctx.db.insert("beatSales", {
      beatId: args.beatId,
      sellerId: args.sellerId,
      buyerId: args.buyerId,
      amount: args.amount,
      currency: args.currency,
      licenseTier: args.licenseTier,
      orderId: args.orderId,
      status: "completed",
      soldAt: args.soldAt,
    });

    // Update seller earnings cache
    await updateSellerEarnings(ctx, args.sellerId);

    return saleId;
  },
});

/**
 * Record refunded beat sale
 * Called when charge.refunded webhook is received
 *
 * @internal Internal mutation called only from HTTP webhook actions
 * Requirements: BRO-158
 */
export const recordBeatSaleRefund = internalMutation({
  args: {
    orderId: v.id("orders"),
  },
  handler: async (ctx, args) => {
    // Find the beat sale by order ID
    const sale = await ctx.db
      .query("beatSales")
      .filter((q) => q.eq(q.field("orderId"), args.orderId))
      .first();

    if (!sale) {
      throw new Error(`Beat sale not found for order ${args.orderId}`);
    }

    // Update status to refunded
    await ctx.db.patch(sale._id, {
      status: "refunded",
    });

    // Update seller earnings cache
    await updateSellerEarnings(ctx, sale.sellerId);

    return sale._id;
  },
});

/**
 * Trigger monthly payout batch - Finance team monthly settlement
 *
 * This calculates payouts for all sellers for a given month and prepares
 * the payout schedule. In a production system, this would trigger actual
 * payout transfers to sellers' Stripe Connect accounts.
 *
 * Requirements: BRO-158
 */
export const triggerMonthlyPayoutBatch = query({
  args: {
    month: v.optional(v.string()), // Format: "YYYY-MM", defaults to current month
  },
  handler: async (ctx, args) => {
    const month = args.month || getCurrentMonthKey();

    // Get all beat sales for this month
    const startDate = new Date(`${month}-01`).getTime();
    const endDate = new Date(
      new Date(`${month}-01`).getTime() + 32 * 24 * 60 * 60 * 1000
    ).getTime(); // +32 days to cover full month

    const monthlySales = await ctx.db
      .query("beatSales")
      .withIndex("by_date", (q) => q.gte("soldAt", startDate))
      .collect()
      .then((sales) =>
        sales.filter((s) => s.soldAt <= endDate && s.status === "completed")
      );

    // Group sales by seller
    const payoutsBySellerMap: Record<
      string,
      {
        sellerId: string;
        totalAmount: number;
        salesCount: number;
        sales: typeof monthlySales;
      }
    > = {};

    monthlySales.forEach((sale) => {
      if (!payoutsBySellerMap[sale.sellerId]) {
        payoutsBySellerMap[sale.sellerId] = {
          sellerId: sale.sellerId,
          totalAmount: 0,
          salesCount: 0,
          sales: [],
        };
      }
      payoutsBySellerMap[sale.sellerId].totalAmount += sale.amount;
      payoutsBySellerMap[sale.sellerId].salesCount += 1;
      payoutsBySellerMap[sale.sellerId].sales.push(sale);
    });

    // Convert to array and format payout schedule
    const payoutSchedule = Object.values(payoutsBySellerMap).map((payout) => ({
      sellerId: payout.sellerId,
      amount: payout.totalAmount,
      amountUsd: payout.totalAmount / 100, // Convert cents to dollars
      salesCount: payout.salesCount,
      month,
      status: "pending", // In production: "pending" → "processing" → "completed"
      sales: payout.sales.map((s) => ({
        beatId: s.beatId,
        buyerId: s.buyerId,
        amount: s.amount,
        licenseTier: s.licenseTier,
        soldAt: s.soldAt,
      })),
    }));

    // Calculate platform metrics for this month
    const totalPlatformRevenue = monthlySales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );
    const totalPayouts = payoutSchedule.reduce(
      (sum, payout) => sum + payout.amount,
      0
    );

    // In a production system, you might:
    // - Store this payout batch in a database table
    // - Trigger actual Stripe Connect transfers
    // - Send notifications to sellers
    // - Create finance reports

    return {
      month,
      totalPlatformRevenue,
      totalPayouts,
      payoutCount: payoutSchedule.length,
      payoutSchedule,
      status: "ready_for_processing",
      generatedAt: Date.now(),
    };
  },
});

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Update seller earnings cache
 *
 * Recalculates and updates the sellerEarnings record with current totals.
 * Called after each sale or refund.
 *
 * @internal
 */
async function updateSellerEarnings(ctx: any, sellerId: string): Promise<void> {
  // Get all sales for this seller
  const sales = await ctx.db
    .query("beatSales")
    .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
    .collect();

  // Calculate totals (only completed sales)
  const completedSales = sales.filter((s) => s.status === "completed");
  const totalEarnings = completedSales.reduce(
    (sum, sale) => sum + sale.amount,
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

  // Check if earnings record exists
  const existing = await ctx.db
    .query("sellerEarnings")
    .withIndex("by_seller", (q) => q.eq("sellerId", sellerId))
    .first();

  if (existing) {
    // Update existing
    await ctx.db.patch(existing._id, {
      totalEarnings,
      salesCount,
      lastUpdated: Date.now(),
      monthlyBreakdown,
    });
  } else {
    // Create new
    await ctx.db.insert("sellerEarnings", {
      sellerId,
      totalEarnings,
      salesCount,
      lastUpdated: Date.now(),
      monthlyBreakdown,
    });
  }
}

/**
 * Get current month key in "YYYY-MM" format
 *
 * @internal
 */
function getCurrentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
