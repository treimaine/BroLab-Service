# E2E Tests Documentation

## Overview

End-to-end tests for BroLab platform covering critical user flows and integrations.

## Test Suites

### Authentication (`auth/sign-in.spec.ts`)
Tests the complete sign-in flow with Clerk authentication.

### Checkout Flow (`checkout-flow.spec.ts`)
Comprehensive tests for Stripe checkout and webhook processing.

**Coverage:**
- **P0 (Happy Paths):**
  - Track purchase: checkout → payment → order → license generation
  - Service booking: checkout → payment → booking creation
  - Database mutations verification

- **P1 (Error Scenarios):**
  - Invalid workspace ID rejection
  - Missing metadata validation
  - Signature verification failures
  - Webhook delivery timeout handling

- **P2 (Edge Cases):**
  - Duplicate webhook delivery (idempotency)
  - Race conditions with simultaneous purchases
  - Partial failures (order created, license generation fails)
  - Idempotency key collision

## Test Environment Setup

### Prerequisites

1. **Environment Variables** (`.env.local` or `.env.test`):
   ```bash
   # Stripe Test Mode Credentials
   STRIPE_SECRET_KEY=sk_test_...
   STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
   
   # Application URLs
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   NEXT_PUBLIC_CONVEX_URL=https://your-convex-deployment.convex.cloud
   
   # Test User Credentials (optional, for auth tests)
   TEST_USER_EMAIL=test@example.com
   TEST_USER_PASSWORD=test_password_123
   ```

2. **Stripe Test Mode Setup:**
   - Create a Stripe test account
   - Enable Stripe Connect
   - Configure webhook endpoint: `http://localhost:3000/api/stripe/webhook`
   - Copy webhook signing secret to `STRIPE_CONNECT_WEBHOOK_SECRET`

3. **Test Data:**
   - Create a test workspace with `paymentsStatus = active`
   - Publish test tracks and services
   - Note workspace and item IDs for test configuration

### Running Tests

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Run all E2E tests
npm run test:e2e

# Run specific test file
npx playwright test tests/e2e/checkout-flow.spec.ts

# Run in headed mode (watch browser)
npx playwright test --headed

# Run in debug mode
npx playwright test --debug

# Generate HTML report
npx playwright show-report
```

### CI/CD Integration

E2E tests run automatically on:
- Pull requests to `main` or `develop`
- Pushes to `main` or `develop`

**Workflow:** `.github/workflows/qa-gates.yml`

**Steps:**
1. Checkout code
2. Setup Node.js 20
3. Install dependencies
4. Install Playwright browsers
5. Run E2E tests
6. Upload test results as artifacts

**Artifacts:**
- Playwright HTML report (30-day retention)
- Screenshots on failure
- Video recordings (on failure)

## Test Data Management

### Mock Data Strategy

Tests use consistent mock data defined in test files:

```typescript
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
```

### Stripe Test Cards

- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- Authentication required: `4000 0027 6000 3184`

## Debugging Failed Tests

1. **Check Playwright Report:**
   ```bash
   npx playwright show-report
   ```

2. **Review Screenshots:**
   Screenshots are saved in `test-results/` on failure.

3. **Watch Test Execution:**
   ```bash
   npx playwright test --headed --debug
   ```

4. **Check Logs:**
   - Application logs: `npm run dev` output
   - Webhook logs: Stripe dashboard webhook logs
   - Database logs: Convex dashboard

## Best Practices

1. **Test Isolation:**
   - Each test uses unique IDs to avoid state conflicts
   - Tests don't depend on execution order
   - Clean up test data when possible

2. **Deterministic Tests:**
   - Use fixed timestamps for reproducibility
   - Mock external dependencies where appropriate
   - Avoid time-based assertions (use `waitFor` instead)

3. **Clear Assertions:**
   - Use descriptive expect messages
   - Test one logical concept per test
   - Include comments for complex flows

4. **Error Handling:**
   - Tests verify both success and failure paths
   - Error messages are validated, not just status codes
   - Timeout scenarios are explicitly tested

## Maintenance

- **Update Mock Data:** When business logic changes, update mock data in test files
- **Update Selectors:** If UI changes, update page selectors
- **Review Coverage:** Regularly check that critical paths are covered
- **Remove Flaky Tests:** Investigate and fix flaky tests immediately

## Related Documentation

- [Stripe Checkout Webhook Verification](../../docs/stripe-checkout-webhook-verification.md)
- [QA Framework](../README.md) (if exists)
- [Playwright Configuration](../../playwright.config.ts)
