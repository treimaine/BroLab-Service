# Secret Rotation Runbook

## Scope

Use this runbook for BroLab credentials stored in `.env.local`, Vercel environment settings, or any managed secret store:

- Clerk publishable and secret keys
- Clerk webhook signing secret
- Stripe platform API keys
- Stripe platform and Connect webhook secrets
- Stripe Connect client ID when regenerated
- Resend API key

## Rotation Triggers

- Before the first production deployment
- Every 90 days for standing production credentials
- Immediately after any suspected leak, offboarding event, or dashboard access issue
- Any time a placeholder or test credential is found in a production environment

## Rotation Order

1. Create replacement credentials in the provider dashboard.
2. Update non-production environments first and verify the app still boots.
3. Update production secrets in the deployment platform.
4. Redeploy or restart workloads so the new secrets are loaded.
5. Run smoke checks for auth, checkout, webhooks, and email delivery.
6. Revoke the old credentials only after the new ones are confirmed working.

## Provider Checklist

### Clerk

1. Generate a new secret key and publishable key if the app instance is changing.
2. Regenerate the webhook signing secret for the configured endpoint.
3. Update `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, and `CLERK_WEBHOOK_SECRET`.
4. Verify sign-in, sign-up, and Convex JWT issuance.

### Stripe

1. Rotate the platform API secret and publishable key.
2. Regenerate the platform webhook signing secret.
3. Regenerate the Connect webhook signing secret separately.
4. Update `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, and `STRIPE_CONNECT_WEBHOOK_SECRET`.
5. Verify `/api/stripe/checkout`, `/api/stripe/connect/*`, and `/api/stripe/webhook`.

### Resend

1. Create a replacement API key with the minimum required scope.
2. Update `RESEND_API_KEY`.
3. Send a test transactional email and confirm delivery.

## Verification

- `npm run typecheck`
- Start the app and confirm the runtime validator does not throw.
- Confirm production uses `https://` in `NEXT_PUBLIC_SITE_URL`.
- Confirm no production credential contains `_test_`.
- Confirm Stripe webhook secrets are different values.

## Failure Handling

- If the app fails on startup after a rotation, restore the previous known-good secret only long enough to recover service.
- Document which provider failed, which variable was changed, and what smoke check failed.
- Repeat the rotation with a fresh credential instead of reusing the rejected one.
