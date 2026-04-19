import { auth, currentUser } from '@clerk/nextjs/server';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * POST /api/admin/failed-transactions/create-ticket
 * Creates a support ticket for a failed transaction and notifies customer
 * 
 * Note: This endpoint creates a support ticket and sends notification email.
 * The actual ticket creation in Convex is handled by the HTTP endpoint.
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

    const { transactionId, buyerEmail, amount, currency, reason } = await request.json();

    if (!transactionId || !buyerEmail) {
      return Response.json(
        { error: 'Missing required fields: transactionId, buyerEmail' },
        { status: 400 }
      );
    }

    // Generate support ticket ID (format: TKT-XXXXXX)
    const ticketId = `TKT-${Date.now()}-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Call Convex HTTP endpoint to create support ticket
    const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL?.replace('/api', '');
    const response = await fetch(`${convexUrl}/admin/failed-transactions/create-ticket`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        transactionId,
        ticketId,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return Response.json(
        { error: 'Failed to create support ticket', details: error },
        { status: response.status }
      );
    }

    // Format amount for email
    const symbols: Record<string, string> = { usd: '$', eur: '€', gbp: '£' };
    const symbol = symbols[currency?.toLowerCase()] || currency?.toUpperCase() || '';
    const amountFormatted = `${symbol}${(amount / 100).toFixed(2)}`;

    // Send notification email to customer
    try {
      await resend.emails.send({
        from: 'support@brolabentertainment.com',
        to: buyerEmail,
        subject: `Support Ticket Created: Payment Issue - ${ticketId}`,
        html: `
          <h2>We've Created a Support Ticket for Your Payment Issue</h2>
          <p>Dear Customer,</p>
          <p>We've received your failed payment notification and created a support ticket to help resolve the issue.</p>

          <h3>Ticket Details</h3>
          <ul>
            <li><strong>Ticket ID:</strong> ${ticketId}</li>
            <li><strong>Amount:</strong> ${amountFormatted}</li>
            <li><strong>Issue:</strong> ${reason}</li>
          </ul>

          <p>Our support team will review your case and reach out to you shortly with next steps.</p>

          <p>In the meantime, you can:</p>
          <ul>
            <li>Check your payment method and try again</li>
            <li>Use a different payment method</li>
            <li>Contact our support team directly</li>
          </ul>

          <p>Thank you for using BroLab Entertainment!</p>
          <p>Best regards,<br/>BroLab Support Team</p>
        `,
      });
    } catch (emailError) {
      console.error('[Create-Ticket] Email send error:', emailError);
      // Continue even if email fails - ticket was created
    }

    return Response.json({
      success: true,
      message: 'Support ticket created and customer notified.',
      ticketId,
      transactionId,
    });
  } catch (error) {
    console.error('[Create-Ticket] Error:', error);
    return Response.json(
      {
        error: 'Failed to create support ticket',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
