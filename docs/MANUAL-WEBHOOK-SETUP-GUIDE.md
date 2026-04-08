# Manual Webhook Setup Guide

This guide walks you through the manual steps required to complete the production synchronization between Clerk, Convex, and Stripe.

---

## Prerequisites

- ✅ All code fixes deployed to Vercel
- ✅ Environment variables configured locally
- ✅ Convex auth configuration in place
- ✅ Webhook handlers implemented

---

## Step 1: Configure Clerk Webhook

### 1.1 Access Clerk Dashboard

1. Go to https://dashboard.clerk.com
2. Select your application: **BroLab Entertainment**
3. Navigate to **Webhooks** in the left sidebar

### 1.2 Create Webhook Endpoint

1. Click **Add Endpoint**
2. Enter the endpoint URL:
   ```
   https://brolabentertainment.com/api/clerk/webhook
   ```
3. Select the following events:
   - ✅ `user.created`
   - ✅ `user.updated`
   - ✅ `user.deleted`
   - ✅ `subscription.created`
   - ✅ `subscription.updated`
   - ✅ `subscription.active`
   - ✅ `subscription.canceled`
   - ✅ `subscriptionItem.active`
   - ✅ `subscriptionItem.canceled`
   - ✅ `subscriptionItem.ended`

4. Click **Create**

### 1.3 Copy Webhook Secret

1. After creating the endpoint, Clerk will show you the **Signing Secret**
2. Copy this secret (starts with `whsec_`)
3. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
4. Update or add `CLERK_WEBHOOK_SECRET` with the copied value
5. Redeploy your application for the change to take effect

### 1.4 Test Webhook

1. In Clerk Dashboard, go to your webhook endpoint
2. Click **Send Test Event**
3. Select `user.created` event
4. Click **Send**
5. Check the response - should be `200 OK`

---

## Step 2: Configure Stripe Webhook

### 2.1 Access Stripe Dashboard

1. Go to https://dashboard.stripe.com
2. Make sure you're in **Test Mode** (toggle in top right)
3. Navigate to **Developers** → **Webhooks**

### 2.2 Create Webhook Endpoint

1. Click **Add endpoint**
2. Enter the endpoint URL:
   ```
   https://brolabentertainment.com/api/stripe/webhook
   ```
3. Click **Select events**
4. Search for and select:
   - ✅ `checkout.session.completed`
5. Click **Add events**
6. Click **Add endpoint**

### 2.3 Copy Webhook Secret

1. After creating the endpoint, click on it to view details
2. In the **Signing secret** section, click **Reveal**
3. Copy the secret (starts with `whsec_`)
4. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
5. Update or add `STRIPE_CONNECT_WEBHOOK_SECRET` with the copied value
6. Redeploy your application for the change to take effect

### 2.4 Test Webhook

1. In Stripe Dashboard, go to your webhook endpoint
2. Click **Send test webhook**
3. Select `checkout.session.completed` event
4. Click **Send test webhook**
5. Check the response - should be `200 OK`

### 2.5 Repeat for Production Mode

Once you're ready to go live:
1. Switch to **Live Mode** in Stripe Dashboard
2. Repeat steps 2.2-2.4 with the same endpoint URL
3. Update `STRIPE_CONNECT_WEBHOOK_SECRET` in Vercel with the **Live Mode** secret

---

## Step 3: Deploy Convex to Production

### 3.1 Check Current Deployment

```bash
npx convex env list
```

This should show:
- `CLERK_JWT_ISSUER_DOMAIN=https://natural-rattler-88.clerk.accounts.dev`
- `CLERK_FRONTEND_API_URL=https://natural-rattler-88.clerk.accounts.dev`

### 3.2 Deploy to Production

```bash
npx convex deploy
```

This will:
- Deploy your Convex functions to production
- Apply the auth configuration
- Make your HTTP endpoints available

### 3.3 Verify Deployment

1. Go to https://dashboard.convex.dev
2. Select your project: **brolab-ent**
3. Check the **Logs** tab - should show no errors
4. Check the **Functions** tab - should show all your functions deployed

---

## Step 4: Verify Environment Variables in Vercel

### 4.1 Access Vercel Dashboard

1. Go to https://vercel.com
2. Select your project: **BroLab Entertainment**
3. Navigate to **Settings** → **Environment Variables**

### 4.2 Verify Required Variables

Make sure the following variables are set for **Production**:

#### Clerk
- ✅ `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- ✅ `CLERK_SECRET_KEY`
- ✅ `CLERK_JWT_ISSUER_DOMAIN`
- ✅ `CLERK_WEBHOOK_SECRET` (from Step 1.3)
- ✅ `NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/onboarding`
- ✅ `NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding`
- ✅ `CLERK_BILLING_ENABLED=true`

#### Convex
- ✅ `NEXT_PUBLIC_CONVEX_URL`
- ✅ `CONVEX_DEPLOYMENT`

#### Stripe
- ✅ `STRIPE_SECRET_KEY`
- ✅ `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- ✅ `STRIPE_CONNECT_CLIENT_ID`
- ✅ `STRIPE_WEBHOOK_SECRET`
- ✅ `STRIPE_CONNECT_WEBHOOK_SECRET` (from Step 2.3)

#### Email
- ✅ `RESEND_API_KEY`

#### Site
- ✅ `NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com`
- ✅ `BRAND_NAME=BroLab Entertainment`
- ✅ `BRAND_EMAIL`
- ✅ `BRAND_ADDRESS`
- ✅ `BRAND_PHONE`
- ✅ `BRAND_WEBSITE`

### 4.3 Redeploy if Needed

If you made any changes to environment variables:
1. Go to **Deployments** tab
2. Click **Redeploy** on the latest deployment
3. Wait for deployment to complete

---

## Step 5: Test Complete Flow

### 5.1 Test Authentication

1. Go to https://brolabentertainment.com
2. Click **Sign Up**
3. Create a new account
4. Verify you're redirected to `/onboarding`
5. Complete onboarding (select role)
6. Verify you're redirected to the correct dashboard

**Check Logs**:
- Clerk Dashboard → Logs: Should show `user.created` event
- Convex Dashboard → Logs: Should show user upsert

### 5.2 Test Subscription (Clerk Billing)

1. Sign in as a provider (producer/engineer)
2. Go to pricing page
3. Click **Subscribe to Basic**
4. Complete checkout
5. Verify subscription is active

**Check Logs**:
- Clerk Dashboard → Logs: Should show `subscriptionItem.active` event
- Convex Dashboard → Logs: Should show subscription sync

### 5.3 Test Purchase (Stripe Connect)

1. Sign in as an artist
2. Browse a provider's storefront
3. Add a beat to cart
4. Complete checkout
5. Verify purchase confirmation email
6. Verify download access

**Check Logs**:
- Stripe Dashboard → Events: Should show `checkout.session.completed`
- Convex Dashboard → Logs: Should show order creation, entitlement creation

---

## Step 6: Monitor Production

### 6.1 Set Up Monitoring

1. **Vercel Analytics**
   - Go to Vercel Dashboard → Analytics
   - Monitor page views, errors, performance

2. **Convex Logs**
   - Go to Convex Dashboard → Logs
   - Set up log filters for errors
   - Monitor webhook events

3. **Clerk Logs**
   - Go to Clerk Dashboard → Logs
   - Monitor authentication events
   - Check webhook delivery status

4. **Stripe Logs**
   - Go to Stripe Dashboard → Developers → Events
   - Monitor webhook deliveries
   - Check for failed events

### 6.2 Set Up Alerts

1. **Vercel**
   - Go to Settings → Notifications
   - Enable deployment failure alerts
   - Enable error rate alerts

2. **Stripe**
   - Go to Developers → Webhooks → Your Endpoint
   - Enable email notifications for failed webhooks

3. **Clerk**
   - Go to Webhooks → Your Endpoint
   - Enable email notifications for failed webhooks

---

## Troubleshooting

### Webhook Not Receiving Events

**Symptoms**: Webhook endpoint shows 0 events received

**Solutions**:
1. Verify endpoint URL is correct (no typos)
2. Check that endpoint is publicly accessible
3. Verify webhook secret is correct in Vercel
4. Check Vercel function logs for errors
5. Test with "Send test event" in dashboard

### Webhook Signature Verification Failed

**Symptoms**: Webhook returns 400 error with "signature verification failed"

**Solutions**:
1. Verify webhook secret matches between dashboard and Vercel
2. Check that you're using the correct secret (test vs live mode)
3. Ensure no extra whitespace in environment variable
4. Redeploy after updating environment variable

### User Not Synced to Convex

**Symptoms**: User created in Clerk but not in Convex database

**Solutions**:
1. Check Clerk webhook is configured and active
2. Verify `user.created` event is subscribed
3. Check Convex logs for errors
4. Verify `CLERK_JWT_ISSUER_DOMAIN` matches in Convex and Clerk

### Subscription Not Synced

**Symptoms**: User subscribed but status not updated in app

**Solutions**:
1. Check Clerk webhook is receiving `subscriptionItem.*` events
2. Verify webhook handler is processing billing events
3. Check Convex logs for subscription sync errors
4. Verify workspace exists for user

### Order Not Created After Purchase

**Symptoms**: Checkout completes but no order in database

**Solutions**:
1. Check Stripe webhook is configured and active
2. Verify `checkout.session.completed` event is subscribed
3. Check Convex logs for order creation errors
4. Verify session metadata includes required fields

---

## Checklist

Use this checklist to track your progress:

- [ ] Step 1: Clerk webhook configured
  - [ ] Endpoint created
  - [ ] Events subscribed
  - [ ] Secret copied to Vercel
  - [ ] Test event sent successfully

- [ ] Step 2: Stripe webhook configured
  - [ ] Endpoint created (Test Mode)
  - [ ] Events subscribed
  - [ ] Secret copied to Vercel
  - [ ] Test event sent successfully
  - [ ] Endpoint created (Live Mode) - when ready

- [ ] Step 3: Convex deployed
  - [ ] `npx convex deploy` executed
  - [ ] Deployment successful
  - [ ] Functions visible in dashboard

- [ ] Step 4: Vercel environment variables verified
  - [ ] All Clerk variables set
  - [ ] All Convex variables set
  - [ ] All Stripe variables set
  - [ ] All email variables set
  - [ ] All site variables set
  - [ ] Redeployed if needed

- [ ] Step 5: Complete flow tested
  - [ ] Authentication flow works
  - [ ] Subscription flow works
  - [ ] Purchase flow works
  - [ ] Emails are sent
  - [ ] Downloads work

- [ ] Step 6: Monitoring set up
  - [ ] Vercel Analytics enabled
  - [ ] Convex logs monitored
  - [ ] Clerk logs monitored
  - [ ] Stripe logs monitored
  - [ ] Alerts configured

---

## Support

If you encounter issues not covered in this guide:

1. Check the logs in all three dashboards (Clerk, Convex, Stripe)
2. Review the error messages carefully
3. Consult the official documentation:
   - Clerk: https://clerk.com/docs
   - Convex: https://docs.convex.dev
   - Stripe: https://docs.stripe.com

---

**Document Version**: 1.0  
**Last Updated**: April 8, 2026  
**Status**: Ready for Production Setup
