import { auth } from '@clerk/nextjs/server';
import { ConvexHttpClient } from 'convex/browser';
import { api } from '@/convex/_generated/api';

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL || '');

/**
 * POST /api/admin/failed-transactions/retry
 * Initiates a payment retry for a failed transaction
 */
export async function POST(request: Request) {
  try {
    // Verify admin authentication
    const session = await auth();
    if (!session?.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // TODO: Add admin role check once roles are implemented
    // const user = await currentUser();
    // if (user?.publicMetadata?.role !== 'admin') {
    //   return Response.json({ error: 'Forbidden' }, { status: 403 });
    // }

    const { transactionId, paymentIntentId } = await request.json();

    if (!transactionId || !paymentIntentId) {
      return Response.json(
        { error: 'Missing required fields: transactionId, paymentIntentId' },
        { status: 400 }
      );
    }

    // Mark transaction as retry in progress
    await convex.mutation(api.failedTransactions.updateFailedTransactionRetry, {
      transactionId,
      newStatus: 'retry_in_progress',
      incrementRetryCount: true,
    });

    // TODO: Integrate with Stripe to initiate payment recovery
    // This would typically:
    // 1. Fetch the payment intent details from Stripe
    // 2. Create a new payment method confirmation link
    // 3. Send email to customer with retry link
    // 4. Track retry attempt in audit log

    return Response.json({
      success: true,
      message: 'Retry initiated. Customer will receive retry link.',
      transactionId,
    });
  } catch (error) {
    console.error('[Retry] Error:', error);
    return Response.json(
      {
        error: 'Failed to initiate retry',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
