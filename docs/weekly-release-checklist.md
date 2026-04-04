# Weekly Release Checklist

## Purpose

Use this checklist before any BroLab production push to Vercel or any production-facing Convex change. The release is blocked until the required owner gate is recorded.

## Release Owners

- Technical gate owner: CTO
- Go-to-market and customer-impact gate owner: CMO
- Executive escalation owner: CEO

## Owner Gate Rule

Every production release must have a release note in the delivery ticket or deployment thread with:

- scope of change
- affected systems
- evidence links
- explicit `CTO approved`

Add `CMO approved` when the release changes public messaging, onboarding, pricing, checkout copy, domains, or any storefront surface.

Escalate to the CEO before release when any of the following are true:

- production credentials were rotated
- billing or payout flows changed materially
- customer-visible incident mitigation is part of the release
- rollback would affect active customers or paid transactions

## Weekly Flow

### 1. Prepare the candidate

- Freeze the release branch or commit set.
- Summarize the changed areas: app, Convex, worker, env, docs.
- Confirm all required secrets are present for the target environment.

### 2. Run technical checks

- `npm run lint`
- `npm run typecheck`
- `npm run build`
- `npm run build:worker` if `worker/` changed
- `npm run test:security` if auth, billing, middleware, or webhook code changed

If any check fails, stop the release and fix the issue before re-running the gate.

### 3. Run change-specific checks

For auth, middleware, or environment changes:

- Verify the runtime env validator passes at app startup.
- Recheck the setup guidance in `docs/environment-setup.md`.

For Stripe checkout, billing, or webhook changes:

- Follow `docs/stripe-checkout-webhook-verification.md`.
- Confirm `/api/stripe/checkout` returns a valid session.
- Confirm Stripe events reach `/api/stripe/webhook` without signature errors.

For secret or key changes:

- Follow `docs/security-secret-rotation.md`.
- Confirm production secrets are not test credentials.
- Confirm Stripe platform and Connect webhook secrets are different values.

For observability-sensitive changes:

- Confirm the affected flow still records the expected audit logs or events from `docs/observability.md`.

### 4. Smoke test production-facing paths

- Sign in and reach the provider studio.
- Open at least one public workspace page.
- Verify one purchase path for the changed release area.
- Verify domains or content publishing flows if those surfaces changed.

### 5. Record evidence

The release owner comment must include:

- commit or branch reference
- commands executed
- pass or fail outcome
- any skipped checks and why
- rollback note

## Handoff Expectations

### Engineer to CTO

- Provide the exact diff or PR reference.
- State which systems changed and which checks were run.
- Flag any skipped automation or manual-only validation.

### CTO to CMO

- Call out any storefront, pricing, onboarding, or customer journey changes.
- Include expected customer-visible differences and launch timing.

### CTO to CEO

- Escalate only for high-risk releases, incident releases, or credential rotations.
- Include rollout risk, rollback path, and customer impact.

## Rollback Rule

Do not push a production change unless the owner can name the rollback action first. Minimum rollback note:

- prior known-good commit or deployment
- required env reversal, if any
- whether Stripe, Clerk, Convex, or Resend settings also need to be reverted

## Definition of Ready for Production Push

A release is ready only when:

- all required checks passed
- evidence is posted
- the CTO gate is explicit
- the CMO gate is explicit when customer-facing surfaces changed
- CEO escalation happened when the release met escalation criteria
