# BRO-212 Credential Rotation Execution Checklist

Date: 2026-05-01
Owner: Lead Engineer

## 1) Platform rotation handoff (blocking)
Platform posts one comment with:
- Provider: Stripe + Clerk
- Environment: production
- Actor
- UTC timestamp for each rotated credential
- Confirmation that env vars were updated in hosting platform

Critical vars:
- STRIPE_SECRET_KEY
- STRIPE_WEBHOOK_SECRET
- STRIPE_CONNECT_WEBHOOK_SECRET
- CLERK_SECRET_KEY
- CLERK_WEBHOOK_SECRET

## 2) Lead Engineer environment/deploy step
1. Update local secure env store and hosting env vars with new credentials.
2. Run validation script:
   - `node scripts/validate-rotated-secrets.mjs`
3. Redeploy or restart workloads so new secrets are loaded.

## 3) QA smoke suite
QA validates and comments pass/fail + UTC timestamp:
- Clerk sign-up/sign-in
- Stripe checkout path
- Stripe platform webhook path
- Stripe connect webhook path

## 4) Security/CTO sign-off
Security/CTO confirms old credentials are revoked and unusable.

## Done criteria
- All critical vars rotated and active.
- Validation script passes.
- QA smoke checks pass.
- Security/CTO revocation sign-off posted.
