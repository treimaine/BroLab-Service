# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: checkout-flow.spec.ts >> Stripe Checkout Flow - Error Scenarios (P1) >> should reject webhook with missing metadata
- Location: tests\e2e\checkout-flow.spec.ts:250:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 400
Received: 404
```

# Test source

```ts
  171 |         'stripe-signature': 'test_signature',
  172 |       },
  173 |     })
  174 | 
  175 |     expect(webhookResponse.status()).toBeLessThan(400)
  176 | 
  177 |     // Step 3: Verify booking creation
  178 |     const convexResponse = await request.post(`${TEST_CONFIG.convexUrl}/api/query`, {
  179 |       data: {
  180 |         path: 'bookings:getBySessionId',
  181 |         args: { sessionId: checkoutData.sessionId },
  182 |       },
  183 |     })
  184 | 
  185 |     const bookingData = await convexResponse.json()
  186 |     expect(bookingData).toBeTruthy()
  187 |   })
  188 | 
  189 |   test('should handle order creation and all database mutations', async ({ request }) => {
  190 |     const sessionId = `cs_test_${Date.now()}`
  191 | 
  192 |     const webhookPayload = {
  193 |       id: `evt_${Date.now()}`,
  194 |       type: 'checkout.session.completed',
  195 |       data: {
  196 |         object: {
  197 |           id: sessionId,
  198 |           payment_status: 'paid',
  199 |           metadata: {
  200 |             workspaceId: mockWorkspace.id,
  201 |             itemType: 'track',
  202 |             itemId: mockTrack.id,
  203 |             licenseTier: 'basic',
  204 |           },
  205 |         },
  206 |       },
  207 |     }
  208 | 
  209 |     const webhookResponse = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  210 |       data: webhookPayload,
  211 |       headers: {
  212 |         'Content-Type': 'application/json',
  213 |         'stripe-signature': 'test_signature',
  214 |       },
  215 |     })
  216 | 
  217 |     expect(webhookResponse.status()).toBe(200)
  218 | 
  219 |     // Verify all expected database records
  220 |     // 1. Order created
  221 |     // 2. ProcessedEvents entry for idempotency
  222 |     // 3. checkout_success event logged
  223 |     // 4. PurchaseEntitlements for track access
  224 |     // 5. License generated
  225 |     // 6. LicenseDocument created
  226 |     // 7. Job queued for PDF generation
  227 |   })
  228 | })
  229 | 
  230 | test.describe('Stripe Checkout Flow - Error Scenarios (P1)', () => {
  231 |   test('should reject checkout with invalid workspace ID', async ({ request }) => {
  232 |     const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/checkout`, {
  233 |       data: {
  234 |         workspaceId: 'invalid_workspace_999',
  235 |         itemType: 'track',
  236 |         itemId: mockTrack.id,
  237 |         licenseTier: 'basic',
  238 |       },
  239 |       headers: {
  240 |         'Content-Type': 'application/json',
  241 |       },
  242 |     })
  243 | 
  244 |     expect(response.status()).toBeGreaterThanOrEqual(400)
  245 |     const errorData = await response.json()
  246 |     expect(errorData).toHaveProperty('error')
  247 |     expect(errorData.error).toContain('workspace')
  248 |   })
  249 | 
  250 |   test('should reject webhook with missing metadata', async ({ request }) => {
  251 |     const webhookPayload = {
  252 |       id: `evt_${Date.now()}`,
  253 |       type: 'checkout.session.completed',
  254 |       data: {
  255 |         object: {
  256 |           id: `cs_test_${Date.now()}`,
  257 |           payment_status: 'paid',
  258 |           metadata: {}, // Missing required fields
  259 |         },
  260 |       },
  261 |     }
  262 | 
  263 |     const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  264 |       data: webhookPayload,
  265 |       headers: {
  266 |         'Content-Type': 'application/json',
  267 |         'stripe-signature': 'test_signature',
  268 |       },
  269 |     })
  270 | 
> 271 |     expect(response.status()).toBe(400)
      |                               ^ Error: expect(received).toBe(expected) // Object.is equality
  272 |     const errorData = await response.json()
  273 |     expect(errorData.error).toContain('Missing required metadata')
  274 |   })
  275 | 
  276 |   test('should reject webhook with missing stripe-signature header', async ({ request }) => {
  277 |     const webhookPayload = {
  278 |       id: `evt_${Date.now()}`,
  279 |       type: 'checkout.session.completed',
  280 |       data: {
  281 |         object: {
  282 |           id: `cs_test_${Date.now()}`,
  283 |           payment_status: 'paid',
  284 |           metadata: {
  285 |             workspaceId: mockWorkspace.id,
  286 |             itemType: 'track',
  287 |             itemId: mockTrack.id,
  288 |           },
  289 |         },
  290 |       },
  291 |     }
  292 | 
  293 |     const response = await request.post(`${TEST_CONFIG.baseUrl}/api/stripe/webhook`, {
  294 |       data: webhookPayload,
  295 |       headers: {
  296 |         'Content-Type': 'application/json',
  297 |         // Intentionally missing stripe-signature header
  298 |       },
  299 |     })
  300 | 
  301 |     expect(response.status()).toBe(400)
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
```