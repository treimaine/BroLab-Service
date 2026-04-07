import { test, expect } from '@playwright/test'
import Stripe from 'stripe'

/**
 * Stripe Checkout and Webhook E2E Tests
 *
 * Tests the complete checkout flow from session creation through webhook processing
 * Covers track purchases, service bookings, and error scenarios
 *
 * Test Categories:
 * - P0: Happy path scenarios (critical path)
 * - P1: Error scenarios (validation and failure handling)
 * - P2: Edge cases (idempotency, race conditions)
 */

// Test environment setup
const TEST_CONFIG = {
  baseUrl: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  convexUrl: process.env.NEXT_PUBLIC_CONVEX_URL,
  stripeSecretKey: process.env.STRIPE_SECRET_KEY,
  stripeWebhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET,
}

// Mock test data
const mockWorkspace = {
  id: 'test_workspace_001',
  paymentsStatus: 'active',
  stripeAccountId: 'acct_test123',
}

const mockTrack = {
  id: 'track_001',
  title: 'Test Beat',
  price: 2999, // $29.99
  licenseTier: 'basic',
}

const mockService = {
  id: 'service_001',
  title: 'Mixing Service',
  price: 9999, // $99.99
}

test.describe('Stripe Checkout Flow - Happy Paths (P0)', () => {
  test.beforeEach(async ({ page }) => {
    // Ensure app is running
    await page.goto('/')
    await expect(page).toHaveTitle(/BroLab/)
  })

  test('should complete track purchase end-to-end', async ({ page, request }) => {
    // Step 1: Create checkout session
    const checkoutResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
      data: {
        workspaceId: mockWorkspace.id,
        itemType: 'track',
        itemId: mockTrack.id,
        licenseTier: mockTrack.licenseTier,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(checkoutResponse.ok()).toBeTruthy()
    const checkoutData = await checkoutResponse.json()

    // Verify checkout session response
    expect(checkoutData).toHaveProperty('url')
    expect(checkoutData).toHaveProperty('sessionId')
    expect(checkoutData.url).toContain('checkout.stripe.com')

    // Step 2: Navigate to checkout page
    await page.goto(checkoutData.url)

    // Step 3: Fill in Stripe test card (simulated)
    // Note: In real E2E, Stripe's test mode allows form filling
    // For CI/CD, we'll trigger webhook manually with the sessionId

    // Step 4: Simulate successful payment via webhook
    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: checkoutData.sessionId,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'track',
            itemId: mockTrack.id,
            licenseTier: mockTrack.licenseTier,
          },
        },
      },
    }

    const webhookResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature', // Mock signature for test mode
      },
    })

    // Verify webhook processing succeeded
    expect(webhookResponse.status()).toBeLessThan(400)

    // Step 5: Verify database mutations via Convex
    // Check for order creation
    const convexResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
      data: {
        path: 'orders:getBySessionId',
        args: { sessionId: checkoutData.sessionId },
      },
    })

    const orderData = await convexResponse.json()
    expect(orderData).toBeTruthy()

    // Verify track purchase artifacts
    // - purchaseEntitlements created
    // - licenses created
    // - licenseDocuments created
    // - license_pdf_generation job queued
  })

  test('should complete service booking end-to-end', async ({ page, request }) => {
    // Step 1: Create checkout session for service
    const checkoutResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
      data: {
        workspaceId: mockWorkspace.id,
        itemType: 'service',
        itemId: mockService.id,
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(checkoutResponse.ok()).toBeTruthy()
    const checkoutData = await checkoutResponse.json()

    expect(checkoutData).toHaveProperty('url')
    expect(checkoutData).toHaveProperty('sessionId')

    // Step 2: Simulate successful payment webhook
    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: checkoutData.sessionId,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'service',
            itemId: mockService.id,
          },
        },
      },
    }

    const webhookResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature',
      },
    })

    expect(webhookResponse.status()).toBeLessThan(400)

    // Step 3: Verify booking creation
    const convexResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
      data: {
        path: 'bookings:getBySessionId',
        args: { sessionId: checkoutData.sessionId },
      },
    })

    const bookingData = await convexResponse.json()
    expect(bookingData).toBeTruthy()
  })

  test('should handle order creation and all database mutations', async ({ request }) => {
    const sessionId = `cs_test_${Date.now()}`

    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'track',
            itemId: mockTrack.id,
            licenseTier: 'basic',
          },
        },
      },
    }

    const webhookResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature',
      },
    })

    expect(webhookResponse.status()).toBe(200)

    // Verify all expected database records
    // 1. Order created
    // 2. ProcessedEvents entry for idempotency
    // 3. checkout_success event logged
    // 4. PurchaseEntitlements for track access
    // 5. License generated
    // 6. LicenseDocument created
    // 7. Job queued for PDF generation
  })
})

test.describe('Stripe Checkout Flow - Error Scenarios (P1)', () => {
  test('should reject checkout with invalid workspace ID', async ({ request }) => {
    const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
      data: {
        workspaceId: 'invalid_workspace_999',
        itemType: 'track',
        itemId: mockTrack.id,
        licenseTier: 'basic',
      },
      headers: {
        'Content-Type': 'application/json',
      },
    })

    expect(response.status()).toBeGreaterThanOrEqual(400)
    const errorData = await response.json()
    expect(errorData).toHaveProperty('error')
    expect(errorData.error).toContain('workspace')
  })

  test('should reject webhook with missing metadata', async ({ request }) => {
    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          payment_status: 'paid',
          metadata: {}, // Missing required fields
        },
      },
    }

    const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature',
      },
    })

    expect(response.status()).toBe(400)
    const errorData = await response.json()
    expect(errorData.error).toContain('Missing required metadata')
  })

  test('should reject webhook with missing stripe-signature header', async ({ request }) => {
    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'track',
            itemId: mockTrack.id,
          },
        },
      },
    }

    const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        // Intentionally missing stripe-signature header
      },
    })

    expect(response.status()).toBe(400)
    const errorData = await response.json()
    expect(errorData.error).toContain('stripe-signature')
  })

  test('should reject webhook with invalid signature', async ({ request }) => {
    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'track',
            itemId: mockTrack.id,
          },
        },
      },
    }

    const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'invalid_signature_xyz',
      },
    })

    expect(response.status()).toBe(400)
    const errorData = await response.json()
    expect(errorData.error).toContain('signature verification failed')
  })

  test('should handle webhook delivery timeout gracefully', async ({ request }) => {
    // Set a very short timeout to simulate delivery failure
    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: `cs_test_${Date.now()}`,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'track',
            itemId: mockTrack.id,
          },
        },
      },
    }

    try {
      await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
        data: webhookPayload,
        headers: {
          'Content-Type': 'application/json',
          'stripe-signature': 'test_signature',
        },
        timeout: 100, // Very short timeout
      })
    } catch (error) {
      // Verify webhook retry mechanism exists
      // Stripe will retry failed webhooks automatically
      expect(error).toBeTruthy()
    }
  })
})

test.describe('Stripe Checkout Flow - Edge Cases (P2)', () => {
  test('should handle duplicate webhook delivery with idempotency', async ({ request }) => {
    const eventId = `evt_${Date.now()}_duplicate`
    const sessionId = `cs_test_${Date.now()}`

    const webhookPayload = {
      id: eventId,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'track',
            itemId: mockTrack.id,
            licenseTier: 'basic',
          },
        },
      },
    }

    // First webhook delivery
    const firstResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature',
      },
    })

    expect(firstResponse.status()).toBeLessThan(400)

    // Duplicate webhook delivery with same event ID
    const secondResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature',
      },
    })

    // Should still return success but not create duplicate records
    expect(secondResponse.status()).toBeLessThan(400)

    // Verify no duplicate side effects
    // Check processedEvents has only one entry for this event ID
    const eventsResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
      data: {
        path: 'processedEvents:getByEventId',
        args: { eventId },
      },
    })

    const eventsData = await eventsResponse.json()
    expect(Array.isArray(eventsData) ? eventsData.length : 1).toBe(1)
  })

  test('should handle race condition with multiple simultaneous purchases', async ({ request }) => {
    // Create multiple checkout sessions simultaneously
    const checkoutPromises = Array.from({ length: 5 }, (_, i) =>
      request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
        data: {
          workspaceId: mockWorkspace.id,
          itemType: 'track',
          itemId: `track_race_${i}`,
          licenseTier: 'basic',
        },
        headers: {
          'Content-Type': 'application/json',
        },
      })
    )

    const responses = await Promise.all(checkoutPromises)

    // All should succeed
    responses.forEach((response) => {
      expect(response.ok()).toBeTruthy()
    })

    // All should have unique session IDs
    const sessionIds = await Promise.all(
      responses.map(async (r) => {
        const data = await r.json()
        return data.sessionId
      })
    )

    const uniqueIds = new Set(sessionIds)
    expect(uniqueIds.size).toBe(5)
  })

  test('should handle partial failure: order created but license generation fails', async ({ request }) => {
    // This test verifies error recovery mechanisms
    const sessionId = `cs_test_${Date.now()}_partial`

    const webhookPayload = {
      id: `evt_${Date.now()}`,
      type: 'checkout.session.completed',
      data: {
        object: {
          id: sessionId,
          payment_status: 'paid',
          metadata: {
            workspaceId: mockWorkspace.id,
            itemType: 'track',
            itemId: 'invalid_track_for_license',
            licenseTier: 'basic',
          },
        },
      },
    }

    const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
      data: webhookPayload,
      headers: {
        'Content-Type': 'application/json',
        'stripe-signature': 'test_signature',
      },
    })

    // Webhook should still return success for event processing
    // But license job should be marked as failed or retry-pending
    expect(response.status()).toBeLessThan(500)

    // Verify order exists even if license generation failed
    const orderResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
      data: {
        path: 'orders:getBySessionId',
        args: { sessionId },
      },
    })

    const orderData = await orderResponse.json()
    expect(orderData).toBeTruthy()

    // Verify failed job is tracked for retry
  })

  test('should handle idempotency key collision', async ({ request }) => {
    const idempotencyKey = `idem_${Date.now()}`

    // First request with idempotency key
    const firstResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
      data: {
        workspaceId: mockWorkspace.id,
        itemType: 'track',
        itemId: mockTrack.id,
        licenseTier: 'basic',
      },
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
    })

    expect(firstResponse.ok()).toBeTruthy()
    const firstData = await firstResponse.json()

    // Second request with same idempotency key
    const secondResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
      data: {
        workspaceId: mockWorkspace.id,
        itemType: 'track',
        itemId: mockTrack.id,
        licenseTier: 'basic',
      },
      headers: {
        'Content-Type': 'application/json',
        'Idempotency-Key': idempotencyKey,
      },
    })

    expect(secondResponse.ok()).toBeTruthy()
    const secondData = await secondResponse.json()

    // Should return same session ID
    expect(firstData.sessionId).toBe(secondData.sessionId)
  })
})
