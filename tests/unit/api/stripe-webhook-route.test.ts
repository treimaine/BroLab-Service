import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/lib/env', () => ({
  CONVEX_CONFIG: {
    url: 'https://convex.test',
  },
}))

vi.mock('@/lib/monitoring', () => ({
  logWebhookReceived: vi.fn(),
}))

describe('Stripe webhook route', () => {
  beforeEach(() => {
    vi.resetModules()
    vi.clearAllMocks()
    vi.unstubAllEnvs()
  })

  it('returns 502 when Convex upstream returns 5xx', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      status: 500,
      statusText: 'Internal Server Error',
      text: async () => JSON.stringify({ error: 'upstream failure' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { POST } = await import('../../../app/api/stripe/webhook/route')

    const request = new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'sig_test',
      },
      body: JSON.stringify({
        id: 'evt_test_1',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_1' } },
      }),
    })

    const response = await POST(request)
    const body = await response.json()

    expect(response.status).toBe(502)
    expect(body).toMatchObject({
      error: 'Upstream webhook processing failed',
      upstreamStatus: 500,
    })
    expect(fetchMock).toHaveBeenCalledWith(
      'https://convex.test/api/stripe/webhook',
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('routes Convex HTTP webhooks to the .convex.site host derived from NEXT_PUBLIC_CONVEX_URL', async () => {
    vi.doMock('@/lib/env', () => ({
      CONVEX_CONFIG: {
        url: 'https://famous-starling-265.convex.cloud',
      },
    }))

    const fetchMock = vi.fn().mockResolvedValue({
      status: 400,
      statusText: 'Bad Request',
      text: async () => JSON.stringify({ error: 'Webhook signature verification failed' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const { POST } = await import('../../../app/api/stripe/webhook/route')

    const request = new Request('http://localhost:3000/api/stripe/webhook', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'sig_test',
      },
      body: JSON.stringify({
        id: 'evt_test_2',
        type: 'checkout.session.completed',
        data: { object: { id: 'cs_test_2' } },
      }),
    })

    await POST(request)

    expect(fetchMock).toHaveBeenCalledWith(
      'https://famous-starling-265.convex.site/api/stripe/webhook',
      expect.objectContaining({ method: 'POST' })
    )
  })
})
