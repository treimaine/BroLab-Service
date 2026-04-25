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
import { logWebhookReceived } from '@/lib/monitoring'

export async function POST(request: Request) {
  const startTime = Date.now()
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')
    const isTestMode = request.headers.get('x-test-user-id')

    if (!signature) {
      console.error('Missing stripe-signature header')
      return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
    }

    // In test mode, just ack the webhook without processing
    if (isTestMode && process.env.ALLOW_TEST_CREDENTIALS_IN_PRODUCTION === 'true') {
      console.log('Test mode: skipping Convex webhook processing')
      return NextResponse.json({ received: true, testMode: true }, { status: 200 })
    }

    // Extract event ID from body for monitoring
    let eventId = 'unknown'
    let eventType = 'unknown'
    try {
      const bodyJson = JSON.parse(body)
      eventId = bodyJson.id || 'unknown'
      eventType = bodyJson.type || 'unknown'
    } catch {
      // Ignore parse errors here, let Convex handle it
    }

    // Log webhook received
    logWebhookReceived({
      eventId,
      eventType,
      signature: true,
    })

    // Forward to Convex HTTP endpoint which handles:
    // - Signature verification (Req 14.1)
    // - Idempotency check (Req 14.2, 14.3)
    // - Order creation (Req 13.4)
    // - Booking creation for service purchases (Req 13.6)
    // - Entitlement creation for track purchases (Req 13.5)
    const convexWebhookUrl = `${CONVEX_CONFIG.url}/api/stripe/webhook`

    console.log('Forwarding webhook to Convex:', convexWebhookUrl)

    // Create AbortController for timeout (Node 15+, modern browsers)
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

    const convexResponse = await fetch(convexWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': signature,
      },
      body,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    console.log('Convex webhook response:', convexResponse.status, convexResponse.statusText)

    let responseText = ''
    try {
      responseText = await convexResponse.text()
      console.log('Convex response text:', responseText.substring(0, 500))
    } catch (textError) {
      console.error('Failed to read Convex response text:', textError)
      // If we can't read the response, treat as degraded
      return NextResponse.json(
        {
          received: true,
          degraded: true,
          error: 'failed_to_read_response',
        },
        { status: 202 }
      )
    }

    let result: Record<string, unknown> = {}
    if (responseText) {
      try {
        result = JSON.parse(responseText)
      } catch (parseError) {
        console.error('Failed to parse Convex response as JSON:', parseError)
        console.error('Response was:', responseText.substring(0, 1000))
        result = {
          received: true,
          degraded: true,
          parseError: 'invalid_json_response',
          preview: responseText.substring(0, 200),
        }
      }
    }

    // Add timing info to response
    const duration = Date.now() - startTime
    console.log(`[MONITORING] Webhook ${eventType} processed in ${duration}ms`)

    // If Convex had a server error, still ack webhook (202) so Stripe doesn't retry forever
    if (convexResponse.status >= 500) {
      console.warn(`[ALERT] Convex returned 5xx status: ${convexResponse.status}`)
      return NextResponse.json(
        {
          received: true,
          degraded: true,
          upstreamStatus: convexResponse.status,
          ...(Object.keys(result).length ? { upstream: result } : {}),
        },
        { status: 202 }
      )
    }

    // For 4xx errors, return the error to Stripe so it doesn't retry
    if (convexResponse.status >= 400) {
      console.warn(`[ALERT] Convex returned 4xx status: ${convexResponse.status}`)
      return NextResponse.json(result, { status: convexResponse.status })
    }

    // For 2xx/3xx success, return the response as-is
    return NextResponse.json(result, { status: convexResponse.status })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('Stripe webhook proxy error:', error)
    console.error(`[MONITORING] Webhook processing failed after ${duration}ms`)
    return NextResponse.json(
      {
        error: 'Webhook processing failed',
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
