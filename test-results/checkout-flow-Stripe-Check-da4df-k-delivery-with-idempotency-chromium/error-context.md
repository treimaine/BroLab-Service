# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout-flow.spec.ts >> Stripe Checkout Flow - Edge Cases (P2) >> should handle duplicate webhook delivery with idempotency
- Location: tests\e2e\checkout-flow.spec.ts:372:7

# Error details

```
Error: expect(received).toBeLessThan(expected)

Expected: < 400
Received:   404
```

# Test source

```ts
  302 |     const errorData = await response.json()
  303 |     expect(errorData.error).toContain('stripe-signature')
  304 |   })
  305 | 
  306 |   test('should reject webhook with invalid signature', async ({ request }) => {
  307 |     const webhookPayload = {
  308 |       id: `evt_${Date.now()}`,
  309 |       type: 'checkout.session.completed',
  310 |       data: {
  311 |         object: {
  312 |           id: `cs_test_${Date.now()}`,
  313 |           payment_status: 'paid',
  314 |           metadata: {
  315 |             workspaceId: mockWorkspace.id,
  316 |             itemType: 'track',
  317 |             itemId: mockTrack.id,
  318 |           },
  319 |         },
  320 |       },
  321 |     }
  322 | 
  323 |     const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  324 |       data: webhookPayload,
  325 |       headers: {
  326 |         'Content-Type': 'application/json',
  327 |         'stripe-signature': 'invalid_signature_xyz',
  328 |       },
  329 |     })
  330 | 
  331 |     expect(response.status()).toBe(400)
  332 |     const errorData = await response.json()
  333 |     expect(errorData.error).toContain('signature verification failed')
  334 |   })
  335 | 
  336 |   test('should handle webhook delivery timeout gracefully', async ({ request }) => {
  337 |     // Set a very short timeout to simulate delivery failure
  338 |     const webhookPayload = {
  339 |       id: `evt_${Date.now()}`,
  340 |       type: 'checkout.session.completed',
  341 |       data: {
  342 |         object: {
  343 |           id: `cs_test_${Date.now()}`,
  344 |           payment_status: 'paid',
  345 |           metadata: {
  346 |             workspaceId: mockWorkspace.id,
  347 |             itemType: 'track',
  348 |             itemId: mockTrack.id,
  349 |           },
  350 |         },
  351 |       },
  352 |     }
  353 | 
  354 |     try {
  355 |       await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  356 |         data: webhookPayload,
  357 |         headers: {
  358 |           'Content-Type': 'application/json',
  359 |           'stripe-signature': 'test_signature',
  360 |         },
  361 |         timeout: 100, // Very short timeout
  362 |       })
  363 |     } catch (error) {
  364 |       // Verify webhook retry mechanism exists
  365 |       // Stripe will retry failed webhooks automatically
  366 |       expect(error).toBeTruthy()
  367 |     }
  368 |   })
  369 | })
  370 | 
  371 | test.describe('Stripe Checkout Flow - Edge Cases (P2)', () => {
  372 |   test('should handle duplicate webhook delivery with idempotency', async ({ request }) => {
  373 |     const eventId = `evt_${Date.now()}_duplicate`
  374 |     const sessionId = `cs_test_${Date.now()}`
  375 | 
  376 |     const webhookPayload = {
  377 |       id: eventId,
  378 |       type: 'checkout.session.completed',
  379 |       data: {
  380 |         object: {
  381 |           id: sessionId,
  382 |           payment_status: 'paid',
  383 |           metadata: {
  384 |             workspaceId: mockWorkspace.id,
  385 |             itemType: 'track',
  386 |             itemId: mockTrack.id,
  387 |             licenseTier: 'basic',
  388 |           },
  389 |         },
  390 |       },
  391 |     }
  392 | 
  393 |     // First webhook delivery
  394 |     const firstResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  395 |       data: webhookPayload,
  396 |       headers: {
  397 |         'Content-Type': 'application/json',
  398 |         'stripe-signature': 'test_signature',
  399 |       },
  400 |     })
  401 | 
> 402 |     expect(firstResponse.status()).toBeLessThan(400)
      |                                    ^ Error: expect(received).toBeLessThan(expected)
  403 | 
  404 |     // Duplicate webhook delivery with same event ID
  405 |     const secondResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  406 |       data: webhookPayload,
  407 |       headers: {
  408 |         'Content-Type': 'application/json',
  409 |         'stripe-signature': 'test_signature',
  410 |       },
  411 |     })
  412 | 
  413 |     // Should still return success but not create duplicate records
  414 |     expect(secondResponse.status()).toBeLessThan(400)
  415 | 
  416 |     // Verify no duplicate side effects
  417 |     // Check processedEvents has only one entry for this event ID
  418 |     const eventsResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
  419 |       data: {
  420 |         path: 'processedEvents:getByEventId',
  421 |         args: { eventId },
  422 |       },
  423 |     })
  424 | 
  425 |     const eventsData = await eventsResponse.json()
  426 |     expect(Array.isArray(eventsData) ? eventsData.length : 1).toBe(1)
  427 |   })
  428 | 
  429 |   test('should handle race condition with multiple simultaneous purchases', async ({ request }) => {
  430 |     // Create multiple checkout sessions simultaneously
  431 |     const checkoutPromises = Array.from({ length: 5 }, (_, i) =>
  432 |       request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
  433 |         data: {
  434 |           workspaceId: mockWorkspace.id,
  435 |           itemType: 'track',
  436 |           itemId: `track_race_${i}`,
  437 |           licenseTier: 'basic',
  438 |         },
  439 |         headers: {
  440 |           'Content-Type': 'application/json',
  441 |           'x-test-user-id': 'test_user_001',
  442 |         },
  443 |       })
  444 |     )
  445 | 
  446 |     const responses = await Promise.all(checkoutPromises)
  447 | 
  448 |     // All should succeed
  449 |     responses.forEach((response) => {
  450 |       expect(response.ok()).toBeTruthy()
  451 |     })
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
```