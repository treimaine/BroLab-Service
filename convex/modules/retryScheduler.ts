// Failed Transaction Retry Scheduler
// Implements May Phase: Automated retry scheduling for failed payments
// Runs periodically to attempt payment retries for pending_retry transactions

import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";

/**
 * Constants
 */
const RETRY_BATCH_SIZE = 10; // Process 10 retries per run
const RETRY_DELAY_MS = 1000; // 1 second between retry attempts (to avoid rate limiting)
const MAX_RETRIES = 3;

/**
 * Retry a single failed transaction via Stripe
 *
 * Attempts to create a new payment intent for the failed charge
 * or confirms an existing payment intent if it supports retries
 */
async function retryTransactionPayment(args: {
  transactionId: string;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  retryCount: number;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const stripe = new (await import("stripe")).default(
      process.env.STRIPE_SECRET_KEY!,
      { apiVersion: "2026-06-24.dahlia" }
    );

    // Retrieve the original payment intent to check if it can be retried
    const originalIntent = await stripe.paymentIntents.retrieve(
      args.stripePaymentIntentId
    );

    // For failed payment intents, attempt to confirm it again with a fresh request
    // This works for certain failure reasons (e.g., rate limit, temporary network issue)
    if (originalIntent.status === "requires_payment_method" || originalIntent.status === "requires_action") {
      // Payment method needs to be set or action needs to be taken
      // In production, you'd need to retrieve the saved payment method from your DB
      // For now, we'll attempt to confirm the existing intent
      console.log(`Attempting to confirm payment intent: ${args.stripePaymentIntentId}`);

      try {
        const confirmedIntent = await stripe.paymentIntents.confirm(
          args.stripePaymentIntentId,
          {
            // Note: In production, include payment_method here if available
          }
        );

        if (confirmedIntent.status === "succeeded") {
          return { success: true };
        } else if (confirmedIntent.status === "requires_payment_method" ||
                   confirmedIntent.status === "requires_action") {
          return {
            success: false,
            error: `Payment intent requires ${confirmedIntent.status}`,
          };
        } else {
          return {
            success: false,
            error: `Payment intent status: ${confirmedIntent.status}`,
          };
        }
      } catch (confirmError) {
        return {
          success: false,
          error: confirmError instanceof Error ? confirmError.message : "Failed to confirm payment intent",
        };
      }
    }

    // If the original intent has a specific failure code that might be retryable
    if (originalIntent.last_payment_error) {
      const failureCode = originalIntent.last_payment_error.code;

      // List of potentially retryable failure codes
      const retryableCodes = [
        "rate_limit",
        "api_connection_error",
        "api_error",
        "authentication_error",
        "card_error", // For certain card errors
      ];

      if (failureCode && retryableCodes.includes(failureCode)) {
        console.log(`Retryable failure detected: ${failureCode}. Attempting to confirm intent.`);

        try {
          const confirmedIntent = await stripe.paymentIntents.confirm(
            args.stripePaymentIntentId,
            {}
          );

          if (confirmedIntent.status === "succeeded") {
            return { success: true };
          } else {
            return {
              success: false,
              error: `Retry failed. Intent status: ${confirmedIntent.status}`,
            };
          }
        } catch (error) {
          return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to retry payment",
          };
        }
      } else {
        // Non-retryable failure code
        return {
          success: false,
          error: `Non-retryable failure code: ${failureCode}`,
        };
      }
    }

    return {
      success: false,
      error: "Payment intent in unknown state, cannot retry",
    };
  } catch (error) {
    console.error("Error retrying transaction:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Scheduled action: Retry failed transactions
 *
 * Runs periodically to query for pending_retry transactions and attempt retries.
 * This is designed to be invoked by Convex scheduled functions or external schedulers.
 *
 * Process:
 * 1. Query for transactions with status "pending_retry"
 * 2. Limit batch to RETRY_BATCH_SIZE to avoid overwhelming Stripe API
 * 3. For each transaction:
 *    - Attempt to retry payment via Stripe
 *    - If successful, mark as "resolved"
 *    - If failure is non-retryable, mark as "retry_failed"
 *    - If retryCount >= MAX_RETRIES, mark as "retry_failed"
 * 4. Log results for monitoring
 */
export const retryFailedTransactionsScheduled = internalAction({
  args: {},
  handler: async (ctx) => {
    const startTime = Date.now();
    console.log("Starting failed transaction retry scheduler...");

    try {
      // Query for transactions with pending_retry status (no workspace filter)
      const pendingTransactions = await ctx.runQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any)["modules/failedTransactions"].listFailedTransactions,
        {
          status: "pending_retry",
          limit: RETRY_BATCH_SIZE,
        }
      );

      if (!pendingTransactions || !pendingTransactions.transactions || pendingTransactions.transactions.length === 0) {
        console.log("No pending retry transactions found");
        return { processed: 0, succeeded: 0, failed: 0 };
      }

      const transactions = pendingTransactions.transactions;
      console.log(`Found ${transactions.length} pending retry transactions`);

      // Process in batches
      let succeeded = 0;
      let failed = 0;

      for (const transaction of transactions) {
        try {
          // Add delay between retries to avoid rate limiting
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));

          console.log(`Processing retry for transaction: ${transaction._id}`);

          // Skip if already at max retries
          if (transaction.retryCount >= MAX_RETRIES) {
            console.log(
              `Transaction ${transaction._id} has reached max retries (${MAX_RETRIES})`
            );

            // Mark as retry_failed
            await ctx.runMutation(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (internal as any)["modules/failedTransactions"].updateFailedTransactionRetry,
              {
                transactionId: transaction._id,
                newStatus: "retry_failed",
                incrementRetryCount: false,
              }
            );

            failed++;
            continue;
          }

          // Attempt to retry the payment
          const retryResult = await retryTransactionPayment({
            transactionId: transaction._id,
            stripePaymentIntentId: transaction.stripePaymentIntentId,
            amount: transaction.amount,
            currency: transaction.currency,
            retryCount: transaction.retryCount,
          });

          if (retryResult.success) {
            console.log(`Retry successful for transaction: ${transaction._id}`);

            // Mark as resolved
            await ctx.runMutation(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (internal as any)["modules/failedTransactions"].updateFailedTransactionRetry,
              {
                transactionId: transaction._id,
                newStatus: "resolved",
                incrementRetryCount: true,
              }
            );

            succeeded++;
          } else {
            console.log(
              `Retry failed for transaction: ${transaction._id}. Error: ${retryResult.error}`
            );

            // Check if error is non-retryable
            const nonRetryablePatterns = ["non-retryable", "card error", "declined"];
            const isNonRetryable = nonRetryablePatterns.some((pattern) =>
              retryResult.error?.toLowerCase().includes(pattern.toLowerCase())
            );

            if (isNonRetryable) {
              console.log(`Non-retryable error. Marking transaction as retry_failed.`);

              await ctx.runMutation(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (internal as any)["modules/failedTransactions"].updateFailedTransactionRetry,
                {
                  transactionId: transaction._id,
                  newStatus: "retry_failed",
                  incrementRetryCount: true,
                }
              );
            } else {
              // Retryable error - just increment retry count and keep status as pending_retry
              console.log(`Retryable error detected. Will retry again on next scheduler run.`);

              await ctx.runMutation(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (internal as any)["modules/failedTransactions"].updateFailedTransactionRetry,
                {
                  transactionId: transaction._id,
                  newStatus: "pending_retry",
                  incrementRetryCount: true,
                }
              );
            }

            failed++;
          }
        } catch (txError) {
          console.error("Error processing retry for transaction:", txError);
          failed++;
        }
      }

      const duration = Date.now() - startTime;
      console.log(
        `Retry scheduler completed. Processed: ${succeeded + failed}, Succeeded: ${succeeded}, Failed: ${failed}, Duration: ${duration}ms`
      );

      return {
        processed: succeeded + failed,
        succeeded,
        failed,
        duration,
      };
    } catch (error) {
      console.error("Retry scheduler error:", error);
      throw error;
    }
  },
});

/**
 * Manual retry trigger
 * Allows manual triggering of retry for a specific transaction
 * Used by admin/support API endpoints
 */
export const manualRetryTransaction = internalAction({
  args: {
    transactionId: v.id("failedTransactions"),
  },
  handler: async (ctx, args) => {
    try {
      // Retrieve transaction
      const transaction = await ctx.runQuery(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (internal as any)["modules/failedTransactions"].getFailedTransaction,
        { transactionId: args.transactionId }
      );

      if (!transaction) {
        throw new Error("Transaction not found");
      }

      // Attempt retry
      const retryResult = await retryTransactionPayment({
        transactionId: transaction._id,
        stripePaymentIntentId: transaction.stripePaymentIntentId,
        amount: transaction.amount,
        currency: transaction.currency,
        retryCount: transaction.retryCount,
      });

      if (retryResult.success) {
        // Mark as resolved
        await ctx.runMutation(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (internal as any)["modules/failedTransactions"].updateFailedTransactionRetry,
          {
            transactionId: args.transactionId,
            newStatus: "resolved",
            incrementRetryCount: true,
          }
        );

        return {
          success: true,
          message: "Manual retry succeeded",
          status: "resolved",
        };
      } else {
        // Keep status as pending_retry unless non-retryable
        const newStatus = retryResult.error?.includes("non-retryable")
          ? "retry_failed"
          : "pending_retry";

        await ctx.runMutation(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (internal as any)["modules/failedTransactions"].updateFailedTransactionRetry,
          {
            transactionId: args.transactionId,
            newStatus,
            incrementRetryCount: true,
          }
        );

        return {
          success: false,
          message: `Manual retry failed: ${retryResult.error}`,
          status: newStatus,
        };
      }
    } catch (error) {
      console.error("Manual retry error:", error);
      throw error;
    }
  },
});
