# Stripe Connect Setup Guide

## Overview

BroLab Entertainment uses **dual Stripe integration**:

1. **Platform Stripe Account** - For Clerk Billing (provider subscriptions → platform revenue)
2. **Stripe Connect** - For artist purchases (artist payments → provider's Stripe account)

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    DUAL PAYMENT FLOW                         │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Provider Subscriptions (Clerk Billing):                    │
│  Provider → Clerk Billing → YOUR Stripe → YOUR Bank         │
│                                                              │
│  Artist Purchases (Stripe Connect):                         │
│  Artist → Stripe Checkout → Provider's Stripe → Provider    │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Environment Variables

### Required Variables

```env
# Platform Stripe Account (YOUR account)
STRIPE_SECRET_KEY=sk_test_...                    # Test: sk_test_... | Live: sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Test: pk_test_... | Live: pk_live_...

# Stripe Connect Configuration
STRIPE_CONNECT_CLIENT_ID=ca_...                 # From Stripe Dashboard → Settings → Connect

# Webhook Secrets
STRIPE_WEBHOOK_SECRET=whsec_...                 # Platform webhooks (Clerk Billing)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...         # Connect webhooks (artist purchases)
```

## Setup Steps

### 1. Get Stripe API Keys

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
2. Copy **Secret key** → `STRIPE_SECRET_KEY`
3. Copy **Publishable key** → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

**Note:** Use test keys (`sk_test_...`, `pk_test_...`) for development.

### 2. Enable Stripe Connect

1. Go to [Stripe Dashboard → Settings → Connect](https://dashboard.stripe.com/test/settings/connect)
2. Click **Get started with Connect**
3. Choose **Platform or marketplace** as your business type
4. Complete the Connect setup form:
   - **Business name**: BroLab Entertainment
   - **Business type**: Platform/Marketplace
   - **Integration type**: Standard accounts (recommended)
5. Copy **Client ID** → `STRIPE_CONNECT_CLIENT_ID`

### 3. Configure Platform Webhook (Clerk Billing)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://your-domain.com/api/stripe/webhook`
   - **Events to send**:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`
4. Click **Add endpoint**
5. Copy **Signing secret** → `STRIPE_WEBHOOK_SECRET`

### 4. Configure Connect Webhook (Artist Purchases)

1. Go to [Stripe Dashboard → Webhooks](https://dashboard.stripe.com/test/webhooks)
2. Click **Add endpoint**
3. Configure:
   - **Endpoint URL**: `https://your-domain.com/api/stripe/connect-webhook`
   - **Events to send**:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `payment_intent.payment_failed`
     - `account.updated` (for Connect account status)
   - **Filter events**: Select **Connect** (important!)
4. Click **Add endpoint**
5. Copy **Signing secret** → `STRIPE_CONNECT_WEBHOOK_SECRET`

## Connect Account Types

BroLab uses **Standard** Connect accounts:

| Feature | Standard | Express | Custom |
|---------|----------|---------|--------|
| Stripe Dashboard Access | ✅ Full | ⚠️ Limited | ❌ None |
| Branding | Provider's | Stripe + Provider | Platform |
| Compliance | Provider | Shared | Platform |
| Setup Complexity | Low | Medium | High |
| **Recommended for** | **Marketplaces** | Platforms | Full control |

**Why Standard?**
- Providers get full Stripe Dashboard access
- Providers handle their own compliance/taxes
- Simpler integration (OAuth flow)
- 0% platform fee (providers pay standard Stripe fees only)

## OAuth Flow (Standard Accounts)

```typescript
// 1. Redirect provider to Stripe Connect OAuth
const authUrl = `https://connect.stripe.com/oauth/authorize?` +
  `response_type=code&` +
  `client_id=${process.env.STRIPE_CONNECT_CLIENT_ID}&` +
  `scope=read_write&` +
  `redirect_uri=${encodeURIComponent(redirectUri)}`

// 2. Stripe redirects back with authorization code
// GET /api/stripe/connect/callback?code=ac_...

// 3. Exchange code for account ID
const response = await stripe.oauth.token({
  grant_type: 'authorization_code',
  code: authorizationCode,
})

const stripeAccountId = response.stripe_user_id // acct_...

// 4. Store stripeAccountId on workspace
await updateWorkspaceStripeAccount({
  workspaceId,
  stripeAccountId,
  paymentsStatus: 'active'
})
```

## Creating Checkout Sessions (Direct Charges)

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

// Create checkout session on provider's connected account
const session = await stripe.checkout.sessions.create(
  {
    mode: 'payment',
    line_items: [
      {
        price_data: {
          currency: 'usd',
          product_data: {
            name: track.title,
            description: `License: ${licenseTier}`,
          },
          unit_amount: priceInCents,
        },
        quantity: 1,
      },
    ],
    success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${siteUrl}/beats/${trackId}`,
    metadata: {
      workspaceId,
      itemType: 'track',
      itemId: trackId,
      buyerClerkUserId,
      licenseTier,
    },
  },
  {
    stripeAccount: workspace.stripeAccountId, // Direct charge to provider
  }
)
```

**Key Points:**
- Use `stripeAccount` parameter for Direct Charges
- Payment goes directly to provider's Stripe account
- Platform fee = 0 (can be added later via `application_fee_amount`)
- Metadata is preserved for webhook processing

## Webhook Verification

```typescript
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: Request) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_CONNECT_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return new Response('Webhook Error', { status: 400 })
  }

  // Process event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    // Create order and entitlement
  }

  return new Response('OK', { status: 200 })
}
```

## Idempotency

**Critical:** Webhooks can be sent multiple times. Use `processedEvents` table:

```typescript
// Check if event already processed
const existing = await ctx.db
  .query('processedEvents')
  .withIndex('by_provider_and_event', (q) =>
    q.eq('provider', 'stripe_connect').eq('eventId', event.id)
  )
  .first()

if (existing) {
  return new Response('Already processed', { status: 200 })
}

// Process event...

// Mark as processed
await ctx.db.insert('processedEvents', {
  provider: 'stripe_connect',
  eventId: event.id,
  meta: {
    type: event.type,
    accountId: event.account, // Connected account ID
  },
  createdAt: Date.now(),
})
```

## Testing

### Test Mode

1. Use test API keys (`sk_test_...`, `pk_test_...`)
2. Use [Stripe test cards](https://stripe.com/docs/testing):
   - Success: `4242 4242 4242 4242`
   - Decline: `4000 0000 0000 0002`
   - 3D Secure: `4000 0025 0000 3155`

### Webhook Testing (Local Development)

Use Stripe CLI to forward webhooks to localhost:

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward webhooks
stripe listen --forward-to localhost:3000/api/stripe/connect-webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Production Checklist

- [ ] Switch to live API keys (`sk_live_...`, `pk_live_...`)
- [ ] Update webhook endpoints to production URLs
- [ ] Verify webhook signatures are working
- [ ] Test Connect OAuth flow end-to-end
- [ ] Test checkout with real payment methods
- [ ] Verify payouts are going to provider accounts
- [ ] Set up monitoring for failed webhooks
- [ ] Document Connect onboarding flow for providers

## Security Best Practices

1. **Never expose secret keys** - Keep `STRIPE_SECRET_KEY` server-side only
2. **Always verify webhook signatures** - Prevent replay attacks
3. **Use HTTPS in production** - Required for webhooks
4. **Validate metadata** - Don't trust client-provided data
5. **Implement idempotency** - Use `processedEvents` table
6. **Rate limit API calls** - Prevent abuse
7. **Log all transactions** - For debugging and compliance

## Troubleshooting

### "No such customer" error
- Ensure you're using the correct Stripe account (test vs live)
- Check that `stripeAccount` parameter is set correctly

### Webhook not receiving events
- Verify webhook endpoint URL is correct
- Check webhook signing secret matches
- Ensure endpoint is publicly accessible (not localhost)
- Use Stripe CLI for local testing

### OAuth redirect fails
- Verify `STRIPE_CONNECT_CLIENT_ID` is correct
- Check redirect URI matches exactly (including protocol)
- Ensure Connect is enabled in Stripe Dashboard

### Payment goes to wrong account
- Verify `stripeAccount` parameter is set in checkout session
- Check workspace has correct `stripeAccountId`
- Ensure `paymentsStatus === 'active'`

## Resources

- [Stripe Connect Documentation](https://stripe.com/docs/connect)
- [Standard Accounts Guide](https://stripe.com/docs/connect/standard-accounts)
- [OAuth Flow](https://stripe.com/docs/connect/oauth-reference)
- [Direct Charges](https://stripe.com/docs/connect/direct-charges)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Testing Guide](https://stripe.com/docs/testing)

## Support

For Stripe-specific issues:
- [Stripe Support](https://support.stripe.com/)
- [Stripe Discord](https://discord.gg/stripe)

For BroLab implementation issues:
- Check `docs/decisions.md` for architecture decisions
- Review `convex/platform/workspaces.ts` for workspace mutations
- See `app/api/stripe/` for webhook handlers
