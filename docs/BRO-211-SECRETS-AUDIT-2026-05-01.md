# BRO-211 Secrets Scope Audit - 2026-05-01

## Summary
Critical review completed for exposed secret scope and rotation priority.

- No full high-risk secret values found in application source code paths.
- Exposure indicators exist in documentation/history and should be treated as potentially compromised until rotated.
- Immediate rotation is required for keys that appeared in docs, even if currently redacted.

## Confirmed Exposure Indicators
1. Clerk publishable key present in docs (non-secret but sensitive for inventory/scope):
   - docs/AGENT-PRODUCTION-ACCESS.md:29
   - docs/AGENT-PRODUCTION-ACCESS.md:813
2. Truncated Stripe secret/publishable key examples in docs:
   - docs/PRODUCTION-SYNC-VERIFICATION-APRIL-8-2026.md:104
   - docs/PRODUCTION-SYNC-VERIFICATION-APRIL-8-2026.md:105
3. Prior incident record indicates docs-based secret exposure and cleanup was done, with manual rotation still required:
   - docs/SECURITY-SECRETS-CLEANUP-APRIL-11-2026.md

## Scope Assessment
- Runtime code review shows secret loading via env and server-side usage, not hardcoded credentials in app code.
- Main risk is historical leakage through documentation and git history snapshots.
- Any secret previously committed should be considered compromised regardless of current redaction.

## Rotation Priority (Critical -> High -> Medium)
1. Critical (rotate now, same day)
   - STRIPE_SECRET_KEY
   - STRIPE_WEBHOOK_SECRET
   - STRIPE_CONNECT_WEBHOOK_SECRET
   - CLERK_SECRET_KEY
   - CLERK_WEBHOOK_SECRET
2. High (rotate if ever published in docs/history)
   - RESEND_API_KEY
   - Any OAuth client secret values used in production
3. Medium
   - Clerk publishable key (rotate only if instance/environment split is desired; not a secret)

## Required Owner Actions
- DevOps/Platform owner:
  - Rotate all Critical secrets in vendor dashboards.
  - Update secret store (Vercel/project env + local secure stores).
  - Redeploy services and verify startup + webhook signatures.
- QA owner:
  - Validate auth flows, Stripe checkout, Stripe Connect OAuth callback, and both webhook pipelines post-rotation.
- Security owner:
  - Confirm revocation/invalidation of old credentials and attach evidence links.

## Unblocks Needed
- Need platform credentials access for Stripe and Clerk dashboards to execute rotation.
- Need QA bandwidth for post-rotation validation window.

## Evidence Commands Used
- Pattern scan: rg secrets/token regex across repo
- High-confidence token scan: sk_/pk_/whsec_/AKIA/private-key patterns

## Proposed Issue Comment (for BRO-211)
"CTO audit complete (2026-05-01): no full live secrets found in source code; exposure risk remains from documented/history leakage. Treat previously committed secrets as compromised. Rotation priority set to Critical for Stripe + Clerk secret/webhook keys. Requested Platform to rotate and redeploy, QA to validate auth + Stripe/webhooks, Security to confirm revocation evidence. Blocker: dashboard credential access + QA window required to close."

## Additional Evidence (Continuation - 2026-05-01)
- Matching docs locations:
  - docs/AGENT-PRODUCTION-ACCESS.md:29
  - docs/AGENT-PRODUCTION-ACCESS.md:813
  - docs/PRODUCTION-SYNC-VERIFICATION-APRIL-8-2026.md:104
  - docs/PRODUCTION-SYNC-VERIFICATION-APRIL-8-2026.md:105
- Git history confirms remediation commits replacing exposed values with placeholders:
  - 342518c fix(docs): replace exposed secret values with placeholders in documentation
  - f5491b1 docs(security): replace exposed secrets with generic placeholders in cleanup documentation

## Execution Packet
### Platform (Owner)
- Rotate immediately: CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, STRIPE_CONNECT_WEBHOOK_SECRET.
- Update all environments (production/staging/dev) and redeploy.
- Record rotation timestamp and secret-version references (no secret values in ticket comments).

### QA (Owner)
- Run post-rotation smoke within 2 hours of redeploy:
  - Clerk sign-in/sign-out/session refresh
  - Stripe checkout
  - Stripe Connect OAuth callback
  - Platform + Connect webhook delivery and signature validation
- Post pass/fail + failing endpoint traces back to BRO-211.

### Security (Owner)
- Confirm old credentials are revoked and no longer accepted.
- Validate audit trail exists for who rotated what and when.
- Mark BRO-211 closure readiness only after revocation + QA pass evidence are both attached.

## Ticket Comment Draft (Updated)
"BRO-211 continuation (2026-05-01): extended audit confirms docs/history exposure indicators and remediation commits (342518c, f5491b1), but prior values must still be treated as compromised. No full live secrets found in current source. Critical rotation remains: Clerk/Stripe secret and webhook keys. Platform to rotate + redeploy now, QA to validate auth/Stripe/webhooks within 2h, Security to verify revocation evidence before close. Current blocker: dashboard credential access and QA execution window."

## Closure Addendum (2026-05-01)
BRO-211 marked done after CTO scope audit completion and publication of rotation priorities.

Handoff status:
- Follow-on execution moved to BRO-212 (Lead Engineer rotation task).
- Remaining operational blocker is privileged dashboard access for Stripe and Clerk to perform key/webhook rotations.

Definition of done for BRO-212 dependency chain:
- Critical secrets rotated.
- Services redeployed with updated secrets.
- QA post-rotation checks passed.
- Security revocation evidence attached.
