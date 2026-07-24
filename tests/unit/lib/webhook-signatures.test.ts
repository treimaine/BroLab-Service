import { createHmac, randomBytes } from 'node:crypto'
import { describe, expect, it } from 'vitest'
import {
  verifyClerkWebhookSignature,
  verifyStripeWebhookSignature,
} from '../../../convex/lib/webhookSignatures'

const NOW_MS = 1_800_000_000_000
const NOW_SECONDS = Math.floor(NOW_MS / 1000)

describe('webhook signature verification', () => {
  it('accepts a valid Clerk/Svix signature and rejects a modified payload', async () => {
    const key = randomBytes(32)
    const secret = `whsec_${key.toString('base64')}`
    const payload = JSON.stringify({ type: 'session.created', data: { id: 'sess_1' } })
    const svixId = 'msg_test_1'
    const signature = createHmac('sha256', key)
      .update(`${svixId}.${NOW_SECONDS}.${payload}`)
      .digest('base64')

    const valid = await verifyClerkWebhookSignature({
      payload,
      secret,
      svixId,
      svixTimestamp: String(NOW_SECONDS),
      svixSignature: `v1,${signature}`,
      nowMs: NOW_MS,
    })
    const modified = await verifyClerkWebhookSignature({
      payload: `${payload} `,
      secret,
      svixId,
      svixTimestamp: String(NOW_SECONDS),
      svixSignature: `v1,${signature}`,
      nowMs: NOW_MS,
    })

    expect(valid).toEqual({ ok: true })
    expect(modified.ok).toBe(false)
  })

  it('accepts a valid Stripe v1 signature and rejects stale deliveries', async () => {
    const secret = 'whsec_test_secret'
    const payload = JSON.stringify({ id: 'evt_1', type: 'checkout.session.completed' })
    const signature = createHmac('sha256', secret)
      .update(`${NOW_SECONDS}.${payload}`)
      .digest('hex')
    const signatureHeader = `t=${NOW_SECONDS},v1=${signature}`

    const valid = await verifyStripeWebhookSignature({
      payload,
      secret,
      signatureHeader,
      nowMs: NOW_MS,
    })
    const stale = await verifyStripeWebhookSignature({
      payload,
      secret,
      signatureHeader,
      nowMs: NOW_MS + 301_000,
    })

    expect(valid).toEqual({ ok: true })
    expect(stale).toMatchObject({ ok: false })
  })
})
