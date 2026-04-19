# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout-flow.spec.ts >> Stripe Checkout Flow - Edge Cases (P2) >> should handle idempotency key collision
- Location: tests\e2e\checkout-flow.spec.ts:512:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "cs_test_1776601658861"
Received: "cs_test_1776601658789"
```

# Test source

```ts
  452 | 
  453 |     // All should have unique session IDs
  454 |     const sessionIds = await Promise.all(
  455 |       responses.map(async (r) => {
  456 |         const data = await r.json()
  457 |         return data.sessionId
  458 |       })
  459 |     )
  460 | 
  461 |     const uniqueIds = new Set(sessionIds)
  462 |     expect(uniqueIds.size).toBe(5)
  463 |   })
  464 | 
  465 |   test('should handle partial failure: order created but license generation fails', async ({ request }) => {
  466 |     // This test verifies error recovery mechanisms
  467 |     const sessionId = `cs_test_${Date.now()}_partial`
  468 | 
  469 |     const webhookPayload = {
  470 |       id: `evt_${Date.now()}`,
  471 |       type: 'checkout.session.completed',
  472 |       data: {
  473 |         object: {
  474 |           id: sessionId,
  475 |           payment_status: 'paid',
  476 |           metadata: {
  477 |             workspaceId: mockWorkspace.id,
  478 |             itemType: 'track',
  479 |             itemId: 'invalid_track_for_license',
  480 |             licenseTier: 'basic',
  481 |           },
  482 |         },
  483 |       },
  484 |     }
  485 | 
  486 |     const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  487 |       data: webhookPayload,
  488 |       headers: {
  489 |         'Content-Type': 'application/json',
  490 |         'stripe-signature': 'test_signature',
  491 |       },
  492 |     })
  493 | 
  494 |     // Webhook should still return success for event processing
  495 |     // But license job should be marked as failed or retry-pending
  496 |     expect(response.status()).toBeLessThan(500)
  497 | 
  498 |     // Verify order exists even if license generation failed
  499 |     const orderResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
  500 |       data: {
  501 |         path: 'orders:getBySessionId',
  502 |         args: { sessionId },
  503 |       },
  504 |     })
  505 | 
  506 |     const orderData = await orderResponse.json()
  507 |     expect(orderData).toBeTruthy()
  508 | 
  509 |     // Verify failed job is tracked for retry
  510 |   })
  511 | 
  512 |   test('should handle idempotency key collision', async ({ request }) => {
  513 |     const idempotencyKey = `idem_${Date.now()}`
  514 | 
  515 |     // First request with idempotency key
  516 |     const firstResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
  517 |       data: {
  518 |         workspaceId: mockWorkspace.id,
  519 |         itemType: 'track',
  520 |         itemId: mockTrack.id,
  521 |         licenseTier: 'basic',
  522 |       },
  523 |       headers: {
  524 |         'Content-Type': 'application/json',
  525 |         'Idempotency-Key': idempotencyKey,
  526 |         'x-test-user-id': 'test_user_001',
  527 |       },
  528 |     })
  529 | 
  530 |     expect(firstResponse.ok()).toBeTruthy()
  531 |     const firstData = await firstResponse.json()
  532 | 
  533 |     // Second request with same idempotency key
  534 |     const secondResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
  535 |       data: {
  536 |         workspaceId: mockWorkspace.id,
  537 |         itemType: 'track',
  538 |         itemId: mockTrack.id,
  539 |         licenseTier: 'basic',
  540 |       },
  541 |       headers: {
  542 |         'Content-Type': 'application/json',
  543 |         'Idempotency-Key': idempotencyKey,
  544 |         'x-test-user-id': 'test_user_001',
  545 |       },
  546 |     })
  547 | 
  548 |     expect(secondResponse.ok()).toBeTruthy()
  549 |     const secondData = await secondResponse.json()
  550 | 
  551 |     // Should return same session ID
> 552 |     expect(firstData.sessionId).toBe(secondData.sessionId)
      |                                 ^ Error: expect(received).toBe(expected) // Object.is equality
  553 |   })
  554 | })
  555 | 
```