import { auth, currentUser } from '@clerk/nextjs/server';

/**
 * POST /api/admin/failed-transactions/retry
 * Initiates a payment retry for a failed transaction
 * 
 * Note: This endpoint marks the transaction as retry_in_progress.
 * The actual retry logic is handled by the Convex HTTP endpoint at /admin/failed-transactions/retry
 */
export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await auth();
    if (!session?.userId) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const user = await currentUser();
    if (user?.publicMetadata?.role !== 'admin') {
      return Response.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const { transactionId, paymentIntentId } = await request.json();

    if (!transactionId || !paymentIntentId) {
      return Response.json(
        { error: 'Missing required fields: transactionId, paymentIntentId' },
        { status: 400 }
      );
    }

    // Call Convex HTTP endpoint to handle the retry
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/api', '');
    const response = await fetch(`${convexUrl}/admin/failed-transactions/retry`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        paymentIntentId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(
        { error: 'Failed to initiate retry', details: error },
        { status: response.status }
      );
    }

    const result = await response.json();
    
    // Note: Stripe payment recovery typically requires either:
    // 1. Customer manually retrying with updated payment method via recovery email
    // 2. Automated retry via Stripe Billing (if subscription-based)
    // 3. Custom recovery flow redirecting to checkout with same payment intent
    //
    // For BroLab (pay-per-beat model), we rely on:
    // - Customer re-initiating purchase with valid payment method
    // - Support team follow-up (handled via support ticket creation)
    // - Admin manual retry if needed (via Stripe dashboard)
    
    return Response.json(result);
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
