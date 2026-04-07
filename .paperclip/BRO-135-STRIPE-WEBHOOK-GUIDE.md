# Stripe Webhook Setup Guide - BRO-135

**For**: Backend/Lead Engineer implementing Failed Transactions Monitor  
**Event Type**: `payment_intent.payment_failed`  
**Endpoint**: `https://brolabentertainment.com/api/webhooks/stripe/payment_failed`  
**Time Required**: 5 minutes  

---

## Step 1: Login to Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Login with credentials (provided separately)
3. Ensure you're in **TEST mode** (toggle in top-right)

---

## Step 2: Navigate to Webhooks

1. Left sidebar → **Developers** (gear icon)
2. Click **Webhooks**
3. Current page shows all registered webhooks

---

## Step 3: Add New Endpoint

1. Click **+ Add an endpoint** button (top-right)
2. This opens the webhook registration form

---

## Step 4: Enter Endpoint URL

**Field**: "Endpoint URL"  
**Value**: `https://brolabentertainment.com/api/webhooks/stripe/payment_failed`

⚠️ **Important**: Use HTTPS (not http), full domain, exact path

---

## Step 5: Select Events

1. Click **Select events** button
2. In the popup, search for: `payment_intent.payment_failed`
3. CHECK the checkbox next to `payment_intent.payment_failed`
4. Click **Add event** to confirm selection

**What this does**: Stripe will send a webhook to your endpoint whenever a payment intent fails

---

## Step 6: Create the Endpoint

1. Click **Add endpoint** button
2. Stripe will create the webhook and show you the **Signing Secret**

---

## Step 7: Copy the Signing Secret

The Signing Secret appears on the confirmation page:

```
whsec_XXXXXXXXXXXXXXXXXXXX
```

**Copy this value** - you'll need it in the next step

---

## Step 8: Store in Environment

Add to your production environment variables (`.env.production` or Vercel/hosting dashboard):

```
STRIPE_WEBHOOK_SECRET_PROD=whsec_XXXXXXXXXXXXXXXXXXXX
```

Replace `XXXXXXXXXXXXXXXXXXXX` with the actual secret from Stripe

---

## Step 9: Verify Endpoint Status

1. Go back to Stripe Webhooks page
2. Click on your endpoint URL
3. Scroll down to "Events"
4. You should see:
   - Event name: `payment_intent.payment_failed`
   - Status: "Pending" or "Sent" (once you send test events)

---

## Testing the Webhook

Once your backend code is implemented:

1. In Stripe Dashboard, find your webhook endpoint
2. Click **Send test event**
3. Choose event type: `payment_intent.payment_failed`
4. Click **Send test event**
5. Check your backend logs for incoming webhook

**Expected behavior**:
- Webhook POST received at `/api/webhooks/stripe/payment_failed`
- Signature verified using `STRIPE_WEBHOOK_SECRET_PROD`
- Data parsed and processed
- Log entry created in `failedTransactions` collection

---

## What the Webhook Contains

When a payment fails, Stripe sends:

```json
{
  "id": "evt_1234567890",
  "type": "payment_intent.payment_failed",
  "data": {
    "object": {
      "id": "pi_1234567890",
      "amount": 50000,
      "currency": "usd",
      "status": "requires_payment_method",
      "last_payment_error": {
        "code": "card_declined",
        "message": "Your card was declined",
        "param": "card",
        "payment_intent": {
          "id": "pi_1234567890",
          "client_secret": "pi_1234567890_secret_XXXX"
        },
        "payment_method": {
          "id": "pm_1234567890"
        },
        "type": "card_error"
      }
    }
  }
}
```

**Store from this**:
- `data.object.id` → transactionId
- `data.object.amount` → amount (in cents)
- `data.object.last_payment_error.code` → reason
- `data.object.last_payment_error.message` → reason (human-readable)
- Current timestamp → created_at

---

## Integration with Backend

Your backend endpoint should:

```typescript
// POST /api/webhooks/stripe/payment_failed

1. Verify webhook signature (Stripe provides library)
2. Extract: transactionId, amount, reason, timestamp, userId
3. Create record in failedTransactions collection
4. Optionally: Send alert email to admin
5. Return 200 OK to acknowledge receipt
```

See spec (`bro135_failed_transactions_spec.md`) for full implementation details

---

## Troubleshooting

**"Endpoint URL is invalid"**
- ✅ Check: HTTPS (not http)
- ✅ Check: Full domain (https://brolabentertainment.com/...)
- ✅ Check: Exact path (/api/webhooks/stripe/payment_failed)

**"Signing secret not found"**
- ✅ Go back to Webhooks → Click endpoint → "Signing secret" section
- ✅ Copy the value that starts with `whsec_`

**"Webhook not receiving events"**
- ✅ Endpoint registered? (Check Stripe dashboard)
- ✅ Signature verification working? (Code check)
- ✅ Endpoint returning 200? (Check backend logs)

---

## Timeline

- **Step 1-9**: 5 minutes (if you have Stripe Dashboard access)
- **Backend integration**: ~2-3 hours (handled by engineer)
- **E2E testing**: 30 minutes (using test payment failure)

---

## When to Do This

1. **Best**: After reading spec (`bro135_failed_transactions_spec.md`)
2. **Must be done**: Before deploying to production
3. **Ideal timing**: Day 1 morning (while schema is being created)

---

## Questions?

Contact CTO (3b069e49-39b1-4984-b227-2c805895a576) if:
- Webhook registration fails
- Can't find Signing Secret
- Need to update endpoint details after creation
- Need to test webhook delivery

---

**Status**: Ready to implement  
**Related**: BRO-135 (Failed Transactions Monitor backend)  
**Generated**: 2026-04-07
