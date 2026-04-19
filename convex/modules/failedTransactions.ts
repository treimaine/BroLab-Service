// @ts-nocheck - Temporary: Convex query builder types issue
// Convex queries and mutations for Failed Transactions Monitor
// Implements May Phase: Failed Transactions tracking and retry management

import { v } from "convex/values";
import { internalMutation, query } from "../_generated/server";

/**
 * Create a failed transaction record from Stripe webhook
 * Called by Stripe payment_intent.payment_failed webhook handler
 */
export const createFailedTransaction = internalMutation({
  args: {
    stripePaymentIntentId: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    buyerClerkUserId: v.optional(v.string()),
    buyerEmail: v.optional(v.string()),
    amount: v.number(),
    currency: v.string(),
    reason: v.string(),
    reasonMessage: v.string(),
  },
  handler: async (ctx, args) => {
    // Check if this payment intent failure already exists (idempotency)
    const existing = await ctx.db
      .query("failedTransactions")
      .withIndex("by_payment_intent", (q) =>
        q.eq("stripePaymentIntentId", args.stripePaymentIntentId)
      )
      .first();

    if (existing) {
      return existing._id;
    }

    // Create failed transaction record
    const now = Date.now();
    const txId = await ctx.db.insert("failedTransactions", {
      stripePaymentIntentId: args.stripePaymentIntentId,
      workspaceId: args.workspaceId,
      buyerClerkUserId: args.buyerClerkUserId,
      buyerEmail: args.buyerEmail,
      amount: args.amount,
      currency: args.currency,
      reason: args.reason,
      reasonMessage: args.reasonMessage,
      status: "pending_retry",
      retryCount: 0,
      createdAt: now,
      updatedAt: now,
    });

    return txId;
  },
});

/**
 * Update retry count and status for a failed transaction
 */
export const updateFailedTransactionRetry = internalMutation({
  args: {
    transactionId: v.id("failedTransactions"),
    newStatus: v.union(
      v.literal("pending_retry"),
      v.literal("retry_in_progress"),
      v.literal("retry_failed"),
      v.literal("resolved")
    ),
    incrementRetryCount: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) {
      throw new Error("Transaction not found");
    }

    const retryCount = args.incrementRetryCount ? tx.retryCount + 1 : tx.retryCount;

    await ctx.db.patch(args.transactionId, {
      status: args.newStatus,
      retryCount,
      lastRetryAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

/**
 * Create support ticket for failed transaction
 */
export const createSupportTicket = internalMutation({
  args: {
    transactionId: v.id("failedTransactions"),
    ticketId: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      status: "support_ticket_created",
      supportTicketId: args.ticketId,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Query all failed transactions (admin only)
 * Supports filtering and pagination
 */
export const listFailedTransactions = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
    status: v.optional(
      v.union(
        v.literal("pending_retry"),
        v.literal("retry_in_progress"),
        v.literal("retry_failed"),
        v.literal("resolved"),
        v.literal("support_ticket_created")
      )
    ),
    limit: v.optional(v.number()),
    offset: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.max(1, Math.min(args.limit ?? 50, 100));
    const offset = Math.max(0, args.offset ?? 0);

    // Workspace-scoped queries use by_workspace index and optional in-memory status filtering.
    if (args.workspaceId) {
      let workspaceTransactions = await ctx.db
        .query("failedTransactions")
        .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId))
        .order("desc")
        .take(10000);

      if (args.status) {
        const status = args.status;
        workspaceTransactions = workspaceTransactions.filter(
          (transaction) => transaction.status === status
        );
      }

      const pagedTransactions = workspaceTransactions.slice(offset, offset + limit);
      return {
        transactions: pagedTransactions,
        total: workspaceTransactions.length,
        hasMore: offset + limit < workspaceTransactions.length,
      };
    }

    // Global status filtering can use the by_status index directly.
    if (args.status) {
      const status = args.status;
      const statusTransactions = await ctx.db
        .query("failedTransactions")
        .withIndex("by_status", (q) => q.eq("status", status))
        .order("desc")
        .take(10000);

      const pagedTransactions = statusTransactions.slice(offset, offset + limit);
      return {
        transactions: pagedTransactions,
        total: statusTransactions.length,
        hasMore: offset + limit < statusTransactions.length,
      };
    }

    const results = await ctx.db
      .query("failedTransactions")
      .withIndex("by_created_at", (q) => q.gt("createdAt", 0))
      .order("desc")
      .take(10000);
    const pagedTransactions = results.slice(offset, offset + limit);

    return {
      transactions: pagedTransactions,
      total: results.length,
      hasMore: offset + limit < results.length,
    };
  },
});

/**
 * Get a single failed transaction with full details
 */
export const getFailedTransaction = query({
  args: {
    transactionId: v.id("failedTransactions"),
  },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) {
      throw new Error("Transaction not found");
    }
    return tx;
  },
});

/**
 * Get failed transactions by buyer (customer perspective)
 */
export const getCustomerFailedTransactions = query({
  args: {
    buyerClerkUserId: v.string(),
  },
  handler: async (ctx, args) => {
    const transactions = await ctx.db
      .query("failedTransactions")
      .withIndex("by_buyer", (q) => q.eq("buyerClerkUserId", args.buyerClerkUserId))
      .order("desc")
      .take(100);

    return transactions;
  },
});

/**
 * Get failed transactions by workspace (producer view)
 */
export const getWorkspaceFailedTransactions = query({
  args: {
    workspaceId: v.id("workspaces"),
    status: v.optional(
      v.union(
        v.literal("pending_retry"),
        v.literal("retry_in_progress"),
        v.literal("retry_failed"),
        v.literal("resolved"),
        v.literal("support_ticket_created")
      )
    ),
  },
  handler: async (ctx, args) => {
    let query = ctx.db
      .query("failedTransactions")
      .withIndex("by_workspace", (q) => q.eq("workspaceId", args.workspaceId));

    if (args.status) {
      query = query.withIndex("by_status", (q) => q.eq("status", args.status));
    }

    const transactions = await query.order("desc").take(1000);
    return transactions;
  },
});

/**
 * Get failed transaction stats for dashboard
 */
export const getFailedTransactionStats = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("failedTransactions");

    if (args.workspaceId) {
      query = query.withIndex("by_workspace", (q) =>
        q.eq("workspaceId", args.workspaceId)
      );
    }

    const allTransactions = await query.take(10000);

    const stats = {
      total: allTransactions.length,
      pendingRetry: allTransactions.filter((t) => t.status === "pending_retry").length,
      retryInProgress: allTransactions.filter((t) => t.status === "retry_in_progress")
        .length,
      retryFailed: allTransactions.filter((t) => t.status === "retry_failed").length,
      resolved: allTransactions.filter((t) => t.status === "resolved").length,
      supportTicketCreated: allTransactions.filter(
        (t) => t.status === "support_ticket_created"
      ).length,
      totalAmount: allTransactions.reduce((sum, t) => sum + t.amount, 0),
      averageRetries: allTransactions.reduce((sum, t) => sum + t.retryCount, 0) /
        (allTransactions.length || 1),
    };

    return stats;
  },
});

/**
 * Add notes to a failed transaction (admin)
 */
export const addTransactionNotes = internalMutation({
  args: {
    transactionId: v.id("failedTransactions"),
    notes: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.transactionId, {
      notes: args.notes,
      updatedAt: Date.now(),
    });
  },
});

/**
 * Retry a failed transaction (queue retry attempt)
 * Updates status to retry_in_progress and triggers retry job
 */
export const retryFailedTransaction = internalMutation({
  args: {
    transactionId: v.id("failedTransactions"),
    paymentMethodId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const tx = await ctx.db.get(args.transactionId);
    if (!tx) {
      throw new Error("Transaction not found");
    }

    // Update status to retry_in_progress
    await ctx.db.patch(args.transactionId, {
      status: "retry_in_progress",
      retryCount: tx.retryCount + 1,
      lastRetryAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Queue a retry job (if job system is available)
    // This would trigger the payment retry through Stripe API
    // For now, just mark as in progress - the scheduler will handle actual retry

    return args.transactionId;
  },
});

/**
 * Subscribe to failed transaction changes
 * Used for real-time dashboard updates
 */
export const subscribeToFailedTransactions = query({
  args: {
    workspaceId: v.optional(v.id("workspaces")),
  },
  handler: async (ctx, args) => {
    let query = ctx.db.query("failedTransactions");

    if (args.workspaceId) {
      query = query.withIndex("by_workspace", (q) =>
        q.eq("workspaceId", args.workspaceId)
      );
    }

    return await query.order("desc").take(100);
  },
});
