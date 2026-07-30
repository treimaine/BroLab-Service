# Licensing system audit — 2026-07-26

## Scope

- Beat tier definitions and storefront presentation
- Stripe Checkout creation and Connect webhook fulfillment
- Purchase entitlements and protected downloads
- License snapshotting, PDF generation, delivery, and refunds
- Studio pricing configuration and buyer-facing accessibility

## State after remediation

- Basic, Premium, and Unlimited rights come from one shared versioned source.
- Checkout prices are loaded server-side and signed into a fulfillment snapshot.
- Webhook fulfillment requires a paid session, a valid snapshot signature, the expected
  amount/currency, the correct connected Stripe account, and an item owned by that workspace.
- Download authorization derives the buyer from the authenticated identity; callers cannot
  choose another buyer ID.
- Full refunds mark the order refunded, revoke the license, remove download access, and update
  recorded beat-sale earnings. Partial refunds preserve the license.
- Purchase snapshots now include common ownership, Content ID, refund, termination, and
  governing-law clauses.
- Generated PDFs include the common clauses, wrap long text, and paginate.
- Studio default prices match the shared contract reference: $29.99 / $49.99 / $149.99.
- Buyer tier choices are keyboard-accessible and link to the complete license terms.

## Verification

- `npm run typecheck`
- `npm run build:worker`
- `npm run test:unit` (39 tests)
- Targeted ESLint on all changed licensing surfaces
- `npm run build`
- `npx convex dev --once`
- Browser checks on `/studio/tracks`, `/tenant-demo`, and `/terms#licensing`
- Anonymous download request returns HTTP 401

## Jurisdiction

- France is the single governing-law source for both the platform Terms and standard beat
  licenses. Paris is the exclusive venue. Both surfaces derive from the shared versioned
  license source.

## Remaining historic-data follow-up

- Orders created before `stripePaymentIntentId` started being recorded cannot be automatically
  matched from a future `charge.refunded` event. New purchases are covered; historic purchases
  need a one-off Stripe-assisted backfill if automatic legacy revocation is required.
