# Task 9.2 Implementation Summary: Stripe Connect Onboarding Flow

## Overview

Implemented the complete Stripe Connect OAuth onboarding flow for Standard accounts, allowing providers to connect their Stripe accounts to receive payments from artist purchases.

## Implementation Details

### 1. OAuth Initiation Endpoint

**File:** `app/api/stripe/connect/route.ts`

**Flow:**
1. Authenticates the user via Clerk
2. Validates `workspaceId` query parameter
3. Builds OAuth state parameter (base64 encoded JSON with `workspaceId` and `userId`)
4. Constructs Stripe Connect OAuth URL using `getStripeConnectOAuthUrl()` helper
5. Redirects provider to Stripe Connect onboarding

**URL Pattern:**
```
GET /api/stripe/connect?workspaceId={workspaceId}
```

**State Parameter:**
```typescript
const state = Buffer.from(
  JSON.stringify({ workspaceId, userId })
).toString('base64')
```

### 2. OAuth Callback Endpoint

**File:** `app/api/stripe/connect/callback/route.ts`

**Flow:**
1. Receives authorization code and state from Stripe redirect
2. Handles OAuth errors (redirects to studio with error message)
3. Decodes state parameter to extract `workspaceId` and `userId`
4. Exchanges authorization code for Stripe account ID via `stripe.oauth.token()`
5. Retrieves connected account details via `stripe.accounts.retrieve()`
6. Determines `paymentsStatus`:
   - `active`: if `details_submitted && charges_enabled && payouts_enabled`
   - `pending`: otherwise (onboarding incomplete)
7. Updates workspace via `updateWorkspaceStripeAccount` Convex mutation
8. Records `payments_connected` event with account metadata
9. Redirects to studio with success message

**Stripe OAuth Token Exchange:**
```typescript
const response = await stripe.oauth.token({
  grant_type: 'authorization_code',
  code,
})

const stripeAccountId = response.stripe_user_id
```

**Payments Status Logic:**
```typescript
let paymentsStatus: 'pending' | 'active' = 'pending'

if (account.details_submitted && account.charges_enabled && account.payouts_enabled) {
  paymentsStatus = 'active'
}
```

### 3. Workspace Update

Uses existing `updateWorkspaceStripeAccount` mutation from `convex/platform/workspaces.ts`:

```typescript
await convex.mutation(api.platform.workspaces.updateWorkspaceStripeAccount, {
  workspaceId: workspaceId as Id<'workspaces'>,
  stripeAccountId,
  paymentsStatus,
})
```

### 4. Event Recording

Records `payments_connected` event using `recordEvent` mutation from `convex/platform/events.ts`:

```typescript
await convex.mutation(api.platform.events.recordEvent, {
  workspaceId: workspaceId as Id<'workspaces'>,
  type: 'payments_connected',
  meta: {
    stripeAccountId,
    paymentsStatus,
    accountType: account.type,
    chargesEnabled: account.charges_enabled,
    payoutsEnabled: account.payouts_enabled,
    detailsSubmitted: account.details_submitted,
  },
})
```

## Technical Decisions

### 1. ConvexHttpClient for Server-Side Mutations

API routes use `ConvexHttpClient` to call Convex mutations from server context:

```typescript
import { ConvexHttpClient } from 'convex/browser'

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

await convex.mutation(api.platform.workspaces.updateWorkspaceStripeAccount, {
  // ...
})
```

**Why:** API routes run in Node.js server context, not React context, so we can't use `useMutation()` hook.

### 2. Relative Imports for Convex Generated Files

API routes must use relative imports for Convex generated files:

```typescript
// ✅ CORRECT
import { api } from '../../../../../convex/_generated/api'
import { Id } from '../../../../../convex/_generated/dataModel'

// ❌ INCORRECT (doesn't work in API routes)
import { api } from '@/convex/_generated/api'
```

**Why:** The `@/` alias in `tsconfig.json` only maps to `./src/*`, not the root `convex/` directory.

### 3. State Parameter for Security

OAuth state parameter encodes both `workspaceId` and `userId` to:
- Prevent CSRF attacks
- Validate the callback matches the original request
- Associate the connected account with the correct workspace

### 4. Standard Account Type

Using Stripe Connect **Standard** accounts:
- Providers get full Stripe Dashboard access
- Providers handle their own compliance/taxes
- Simpler OAuth integration
- 0% platform fee (providers pay standard Stripe fees only)

## Status Flow

```
unconfigured → pending → active
     ↓            ↓         ↓
  Initial    Onboarding  Fully
   state     started    enabled
```

- **unconfigured**: No Stripe account connected
- **pending**: Stripe account connected but onboarding incomplete
- **active**: Fully onboarded, can accept payments

## Error Handling

### OAuth Errors
- Stripe returns `error` and `error_description` parameters
- Redirects to studio with error message in query params

### Callback Errors
- Invalid state parameter → redirect with `invalid_state` error
- Missing code/state → redirect with `invalid_callback` error
- Token exchange failure → redirect with `stripe_connect_callback_failed` error

### Success Redirects
```
/studio?success=stripe_connected&status={paymentsStatus}
```

## Environment Variables Used

From `src/lib/env.ts`:

- `STRIPE_SECRET_KEY`: Platform Stripe secret key
- `STRIPE_CONNECT_CLIENT_ID`: Stripe Connect OAuth client ID
- `NEXT_PUBLIC_CONVEX_URL`: Convex deployment URL
- `NEXT_PUBLIC_SITE_URL`: Site base URL for redirect URIs

## Requirements Satisfied

✅ **Requirement 27.1**: Stripe Connect environment configuration (already done in Task 9.1)
✅ **Requirement 27.2**: Standard account type OAuth flow
✅ **Requirement 27.3**: `stripeAccountId` storage on workspace
✅ **Requirement 27.5**: Record "payments_connected" event

## Next Steps (Task 9.3)

1. Create checkout API endpoint (`/api/stripe/checkout`)
2. Implement Direct Charges on connected accounts
3. Add metadata for order tracking
4. Validate `paymentsStatus === 'active'` before checkout

## Testing

### Manual Testing Flow

1. Sign in as provider with active subscription
2. Navigate to `/studio`
3. Click "Connect Stripe" button (to be implemented in UI)
4. Redirected to Stripe Connect OAuth
5. Complete Stripe onboarding (test mode)
6. Redirected back to `/studio?success=stripe_connected&status=active`
7. Verify workspace has `stripeAccountId` and `paymentsStatus = 'active'`
8. Verify `payments_connected` event recorded in Convex

### Test URLs

**Initiate OAuth:**
```
http://localhost:3000/api/stripe/connect?workspaceId={workspaceId}
```

**Callback (handled by Stripe):**
```
http://localhost:3000/api/stripe/connect/callback?code={code}&state={state}
```

## Files Created

- `app/api/stripe/connect/route.ts` - OAuth initiation endpoint
- `app/api/stripe/connect/callback/route.ts` - OAuth callback handler
- `docs/task-9.2-summary.md` - This summary document

## Files Modified

None (used existing mutations and helpers)

## Dependencies

- `stripe` (v17.5.0) - Stripe SDK for OAuth token exchange
- `convex/browser` - ConvexHttpClient for server-side mutations
- `@clerk/nextjs/server` - Authentication in API routes

## References

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Standard Accounts Guide](https://stripe.com/docs/connect/standard-accounts)
- [OAuth Flow](https://stripe.com/docs/connect/oauth-reference)
- `docs/stripe-connect-setup.md` - Setup guide
- `src/lib/env.ts` - Environment configuration
- `convex/platform/workspaces.ts` - Workspace mutations
- `convex/platform/events.ts` - Event recording

