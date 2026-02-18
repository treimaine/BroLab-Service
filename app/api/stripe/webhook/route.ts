/**
 * Stripe Webhook - Next.js Route Handler
 *
 * Forwards Stripe webhook events to the Convex HTTP endpoint for processing.
 * Stripe sends webhooks to this Next.js route; we proxy to Convex which handles
 * signature verification, idempotency, order creation, and booking creation.
 *
 * Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 13.6
 */

import { CONVEX_CONFIG } from '@/lib/env'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')

    if (!signature) {
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // Forward to Convex HTTP endpoint which handles:
    // - Signature verification (Req 14.1)
    // - Idempotency check (Req 14.2, 14.3)
    // - Order creation (Req 13.4)
    // - Booking creation for service purchases (Req 13.6)
    // - Entitlement creation for track purchases (Req 13.5)
    const convexWebhookUrl = `${CONVEX_CONFIG.url}/api/stripe/webhook`

    const convexResponse = await fetch(convexWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body,
    })

    const result = await convexResponse.json()

    return NextResponse.json(result, { status: convexResponse.status })
  } catch (error) {
    console.error('Stripe webhook proxy error:', error)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
