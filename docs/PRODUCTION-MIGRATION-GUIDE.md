# Production Migration Guide

## 🔴 CRITICAL: Migrate from Test to Production Keys

**Current Status:** Using test credentials in production (DANGEROUS)

---

## Step 1: Clerk Production Setup

### 1.1 Create Production Instance

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create a new **Production** instance (not Development)
3. Configure authentication methods:
   - ✅ Email/Password
   - ✅ Google OAuth
   - ✅ GitHub OAuth (optional)

### 1.2 Configure Production Domain

1. In Clerk Dashboard → **Domains**
2. Add production domain: `brolabentertainment.com`
3. Add custom Clerk domain: `clerk.brolabentertainment.com`
4. Follow DNS configuration instructions

### 1.3 Enable Organizations

1. Go to **Organizations** settings
2. Enable Organizations
3. Set membership mode: **Required** (all users must belong to an org)
4. Configure roles:
   - `org:admin` - Full control
   - `org:member` - Standard member

### 1.4 Create JWT Template

1. Go to **JWT Templates**
2. Click **New template** → **Convex**
3. **DO NOT rename** - must be called `convex`
4. Copy the **Issuer URL** (Frontend API URL)
   - Format: `https://clerk.brolabentertainment.com`

### 1.5 Configure Webhooks

1. Go to **Webhooks**
2. Create endpoint: `https://brolabentertainment.com/api/webhooks/clerk`
3. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
   - `organization.created`
   - `organization.updated`
   - `organization.deleted`
   - `organizationMembership.created`
   - `organizationMembership.deleted`
4. Copy the **Signing Secret** (starts with `whsec_`)

### 1.6 Get Production Keys

1. Go to **API Keys**
2. Copy:
   - **Publishable Key** (starts with `pk_live_`)
   - **Secret Key** (starts with `sk_live_`)

---

## Step 2: Stripe Production Setup

### 2.1 Activate Stripe Account

1. Go to [Stripe Dashboard](https://dashboard.stripe.com)
2. Complete account activation:
   - Business details
   - Bank account
   - Identity verification
3. Switch to **Live mode** (toggle in top-right)

### 2.2 Enable Stripe Connect

1. Go to **Connect** → **Settings**
2. Enable **Standard accounts**
3. Configure branding:
   - Platform name: BroLab Entertainment
   - Icon/Logo
   - Brand color: `#22d3ee`
4. Copy **Connect Client ID** (starts with `ca_`)

### 2.3 Configure Webhooks

#### Platform Webhook (for subscriptions)
1. Go to **Developers** → **Webhooks**
2. Add endpoint: `https://brolabentertainment.com/api/webhooks/stripe`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
4. Copy **Signing secret** (starts with `whsec_`)

#### Connect Webhook (for artist purchases)
1. Add endpoint: `https://brolabentertainment.com/api/webhooks/stripe-connect`
2. Select **Connect** events:
   - `account.updated`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.succeeded`
   - `charge.failed`
3. Copy **Signing secret** (starts with `whsec_`)

### 2.4 Get Production Keys

1. Go to **Developers** → **API keys**
2. Reveal and copy:
   - **Publishable key** (starts with `pk_live_`)
   - **Secret key** (starts with `sk_live_`)

---

## Step 3: Convex Production Setup

### 3.1 Update Auth Config

1. Update `convex/auth.config.ts`:
```ts
export default {
  providers: [
    {
      domain: "https://clerk.brolabentertainment.com", // Production domain
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

2. Deploy to production:
```bash
npx convex deploy --prod
```

---

## Step 4: Update Vercel Environment Variables

### 4.1 Go to Vercel Dashboard

1. Open project: `brolabentertainment`
2. Go to **Settings** → **Environment Variables**
3. Select **Production** environment

### 4.2 Update Variables

**Delete:**
```
ALLOW_TEST_CREDENTIALS_IN_PRODUCTION
```

**Update Clerk:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (from Step 1.6)
CLERK_SECRET_KEY=sk_live_... (from Step 1.6)
CLERK_JWT_ISSUER_DOMAIN=https://clerk.brolabentertainment.com (from Step 1.4)
CLERK_WEBHOOK_SECRET=whsec_... (from Step 1.5)
```

**Update Stripe:**
```env
STRIPE_SECRET_KEY=sk_live_... (from Step 2.4)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (from Step 2.4)
STRIPE_CONNECT_CLIENT_ID=ca_... (from Step 2.2)
STRIPE_WEBHOOK_SECRET=whsec_... (from Step 2.3 - Platform)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_... (from Step 2.3 - Connect)
```

**Keep unchanged:**
```env
NEXT_PUBLIC_CONVEX_URL=https://famous-starling-265.convex.cloud
CONVEX_DEPLOYMENT=prod:famous-starling-265
RESEND_API_KEY=re_... (already production)
UPSTASH_REDIS_REST_URL=... (already production)
UPSTASH_REDIS_REST_TOKEN=... (already production)
BRAND_NAME=BroLab Entertainment
BRAND_EMAIL=treigua@brolabentertainment.com
BRAND_ADDRESS="Fr, Lille"
BRAND_PHONE=+33 7 50 47 13 17
BRAND_WEBSITE=https://brolabentertainment.com
NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com
```

---

## Step 5: Redeploy

### 5.1 Trigger Deployment

```bash
git commit --allow-empty -m "chore: migrate to production credentials"
git push origin main
```

Or manually trigger in Vercel Dashboard.

### 5.2 Verify Deployment

1. Check deployment logs for errors
2. Verify environment variables are loaded
3. Test the site

---

## Step 6: Testing Checklist

### 6.1 Authentication
- [ ] Sign up with email works
- [ ] Sign in with email works
- [ ] Google OAuth works
- [ ] User profile loads
- [ ] Organization creation works
- [ ] Organization switching works

### 6.2 Payments
- [ ] Checkout page loads
- [ ] Test payment with real card (use $0.50 test)
- [ ] Webhook received in Stripe Dashboard
- [ ] Order confirmation email sent
- [ ] License PDF generated
- [ ] Files downloadable

### 6.3 Stripe Connect
- [ ] Provider can connect Stripe account
- [ ] Provider receives payouts
- [ ] Platform fee deducted correctly

### 6.4 Webhooks
- [ ] Clerk webhook endpoint responds 200
- [ ] Stripe webhook endpoint responds 200
- [ ] Check Convex logs for webhook processing

---

## Step 7: Rollback Plan (If Issues)

### 7.1 Quick Rollback

If critical issues occur:

1. Go to Vercel Dashboard → **Deployments**
2. Find last working deployment
3. Click **...** → **Promote to Production**

### 7.2 Revert Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Restore test keys temporarily
3. Add back `ALLOW_TEST_CREDENTIALS_IN_PRODUCTION=true`
4. Redeploy

---

## Step 8: Post-Migration Monitoring

### 8.1 Monitor for 24 Hours

- [ ] Check Vercel logs for errors
- [ ] Monitor Stripe Dashboard for failed payments
- [ ] Check Clerk Dashboard for auth issues
- [ ] Monitor Convex logs for webhook failures

### 8.2 Set Up Alerts

1. **Vercel:** Enable deployment notifications
2. **Stripe:** Enable email alerts for failed payments
3. **Clerk:** Enable webhook failure alerts
4. **Sentry:** Set up error tracking (recommended)

---

## Common Issues & Solutions

### Issue: Clerk "Invalid JWT Issuer"
**Solution:** Verify `CLERK_JWT_ISSUER_DOMAIN` matches production domain exactly

### Issue: Stripe Webhook Signature Mismatch
**Solution:** Verify `STRIPE_WEBHOOK_SECRET` is from production webhook endpoint

### Issue: Convex Auth Fails
**Solution:** Run `npx convex deploy --prod` after updating `auth.config.ts`

### Issue: CORS Errors
**Solution:** Verify production domain in middleware CORS allowlist

---

## Security Checklist

- [ ] All test keys removed from production
- [ ] Webhook secrets are production secrets
- [ ] JWT issuer domain is production domain
- [ ] CSP headers allow production domains only
- [ ] HTTPS enforced (Strict-Transport-Security)
- [ ] Rate limiting enabled
- [ ] Error messages don't leak sensitive info

---

## Support Contacts

- **Clerk Support:** support@clerk.com
- **Stripe Support:** https://support.stripe.com
- **Convex Support:** support@convex.dev

---

**Last Updated:** 2026-01-08
**Status:** Ready for migration
