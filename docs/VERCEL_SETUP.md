# 🚀 Vercel Deployment - Quick Setup

## Important: Build-Time vs Runtime Variables

Vercel builds your app in two phases:

1. **Build Phase**: Compiles your Next.js app (needs build-time variables)
2. **Runtime Phase**: Runs your app (needs all variables)

### Build-Time Variables (Required for Build)

These MUST be set before deploying:

```bash
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_ISSUER_DOMAIN=https://clerk.yourdomain.com

# Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://your-prod-deployment.convex.cloud

# Stripe Payments
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Resend Email
RESEND_API_KEY=re_...

# Site URL
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

### Runtime-Only Variables (Add After First Deploy)

These can be added AFTER your first successful build:

```bash
# Convex Deployment (runtime only)
CONVEX_DEPLOYMENT=prod:your-deployment

# Webhooks (configure after you have a production URL)
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...

# Stripe Connect OAuth
STRIPE_CONNECT_CLIENT_ID=ca_...
```

## Step 1: Configure Build-Time Variables in Vercel

Go to Vercel Dashboard → Your Project → Settings → Environment Variables

Add all **Build-Time Variables** listed above for the **Production** environment.

## Step 2: Deploy

Click "Deploy" or push to your main branch.

## Step 3: Add Runtime Variables & Configure Webhooks

Once you have a production URL from Step 2, add the runtime-only variables:

### Add CONVEX_DEPLOYMENT

1. Get your Convex deployment name from Convex Dashboard
2. Add to Vercel: `CONVEX_DEPLOYMENT=prod:your-deployment`
3. Redeploy

### Add CONVEX_DEPLOYMENT

1. Get your Convex deployment name from Convex Dashboard
2. Add to Vercel: `CONVEX_DEPLOYMENT=prod:your-deployment`
3. Redeploy

### Configure Clerk Webhook

1. Clerk Dashboard → Webhooks → Add Endpoint
2. URL: `https://yourdomain.com/api/webhooks/clerk`
3. Events: `user.*`, `organization.*`, `session.*`
4. Copy signing secret
5. Add to Vercel: `CLERK_WEBHOOK_SECRET=whsec_...`
6. Redeploy

### Configure Stripe Webhooks

1. Stripe Dashboard → Webhooks → Add Endpoint
2. URL: `https://yourdomain.com/api/webhooks/stripe`
3. Events: `checkout.session.completed`, `customer.subscription.*`
4. Copy signing secret
5. Add to Vercel: `STRIPE_WEBHOOK_SECRET=whsec_...`

6. Add Connect Endpoint: `https://yourdomain.com/api/webhooks/stripe-connect`
7. Events: `account.*`, `payout.*`
8. Copy signing secret
9. Add to Vercel: `STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...`
10. Redeploy

### Configure Stripe Connect OAuth

1. Stripe Dashboard → Connect → Settings
2. Redirect URI: `https://yourdomain.com/api/stripe/connect/callback`
3. Copy Client ID
4. Add to Vercel: `STRIPE_CONNECT_CLIENT_ID=ca_...`
5. Redeploy

## Troubleshooting

### Build Error: "CONVEX_DEPLOYMENT is required"

**Cause:** This variable is runtime-only but the build is trying to validate it.

**Solution:** This has been fixed in the latest version. Pull the latest code and redeploy.

### Build Error: "X is required"

**Solution:** Add the missing **build-time** variable in Vercel environment variables and redeploy.

### Webhooks Not Working

**Solution:**
1. Check webhook URL is accessible
2. Verify signing secret matches
3. Check Vercel logs for errors

### Using Test Keys in Production

**Error:** "Cannot use test credentials in production"

**Solution:** Replace all `_test_` keys with `_live_` keys.

## Security Checklist

- [ ] All production keys (no `_test_` keys)
- [ ] HTTPS URLs only
- [ ] Unique webhook secrets
- [ ] Correct domain in Clerk JWT issuer
- [ ] Correct redirect URIs in Stripe Connect

## Need Help?

See full documentation: `docs/vercel-deployment.md`
