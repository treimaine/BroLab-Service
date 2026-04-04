# Stripe Checkout And Webhook Verification

## Purpose

Use this runbook to verify the artist purchase flow end-to-end with Stripe Connect and confirm that checkout events reach the BroLab webhook pipeline.

## Current Routing Contract

- Next.js entrypoint: `/api/stripe/webhook`
- Convex processing endpoint: `${NEXT_PUBLIC_CONVEX_URL}/api/stripe/webhook`
- Connect signing secret env var: `STRIPE_CONNECT_WEBHOOK_SECRET`

Do not configure Stripe or Stripe CLI against `/api/stripe/connect-webhook`. That path is not implemented in the app.

## Preconditions

- `.env.local` contains valid Stripe test keys and webhook secrets.
- `NEXT_PUBLIC_SITE_URL` points at the running app base URL.
- A provider workspace exists with:
  - `paymentsStatus = active`
  - a valid `stripeAccountId`
- At least one published track or active service exists for that workspace.
- Local app is running with `npm run dev`.
- Convex dev or the target Convex deployment is reachable.

## Local Verification

1. Start the app:
   ```bash
   npm run dev
   ```
2. Forward Stripe Connect events to the implemented route:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```
3. Copy the generated signing secret into `STRIPE_CONNECT_WEBHOOK_SECRET`.
4. Sign in as a buyer and initiate a checkout against:
   - `POST /api/stripe/checkout`
   - body fields:
     - `workspaceId`
     - `itemType`
     - `itemId`
     - `licenseTier` for tracks
5. Complete payment with a Stripe test card such as `4242 4242 4242 4242`.
6. Confirm the webhook reaches the app and Convex without signature errors.

## Expected Evidence

- `POST /api/stripe/checkout` returns `200` with:
  - `url`
  - `sessionId`
- Stripe CLI shows `checkout.session.completed` forwarded to `/api/stripe/webhook`.
- Next.js webhook route returns the Convex response payload without a 4xx or 5xx.
- Convex records:
  - an `orders` row for the `stripeSessionId`
  - a `processedEvents` row for the Stripe event id
  - a `checkout_success` event
- Track purchase path also creates:
  - `purchaseEntitlements`
  - `licenses`
  - `licenseDocuments`
  - `jobs` entry for `license_pdf_generation`
- Service purchase path also creates:
  - a `bookings` row

## Failure Checks

- `400 Missing stripe-signature header`
  - Stripe or the proxy call is not sending the signature header.
- `400 Webhook signature verification failed`
  - `STRIPE_CONNECT_WEBHOOK_SECRET` does not match the secret for the endpoint or CLI listener.
- `400 Missing required metadata`
  - Checkout session metadata is incomplete.
- Duplicate event with no duplicate side effects
  - Expected when Stripe retries an already-processed event.

## Known Limits

- This repo currently has no automated checkout/webhook regression test coverage.
- This workspace currently does not include installed `node_modules`, so no local script-based verification was executed in this pass.
- End-to-end proof still requires a live Stripe test-mode session plus Convex access.
