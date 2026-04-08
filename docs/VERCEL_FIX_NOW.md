# 🚨 Fix Vercel Build Error NOW

## The Problem

Build fails with:
```
CLERK_WEBHOOK_SECRET is required.
CONVEX_DEPLOYMENT is required.
STRIPE_CONNECT_CLIENT_ID is required.
```

## The Solution

I've updated the code to allow building without runtime-only variables. Now you need to:

### 1. Add Missing Build-Time Variables in Vercel

Go to: **Vercel Dashboard → Your Project → Settings → Environment Variables**

Add these for **Production** environment:

```bash
CONVEX_DEPLOYMENT=prod:your-deployment-name
```

Get this value from your Convex Dashboard.

### 2. Redeploy

After adding the variable, click "Redeploy" in Vercel.

### 3. Add Runtime Variables After First Deploy

Once the app is deployed and you have a production URL, add these:

```bash
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

**How to get these:**

1. **CLERK_WEBHOOK_SECRET**: 
   - Clerk Dashboard → Webhooks → Add Endpoint
   - URL: `https://yourdomain.com/api/webhooks/clerk`
   - Copy signing secret

2. **STRIPE_WEBHOOK_SECRET**:
   - Stripe Dashboard → Webhooks → Add Endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe`
   - Copy signing secret

3. **STRIPE_CONNECT_WEBHOOK_SECRET**:
   - Stripe Dashboard → Webhooks → Add Endpoint
   - URL: `https://yourdomain.com/api/webhooks/stripe-connect`
   - Copy signing secret

4. **STRIPE_CONNECT_CLIENT_ID**:
   - Stripe Dashboard → Connect → Settings
   - Copy Client ID

## What Changed

The code now distinguishes between:
- **Build-time variables**: Required to build the app
- **Runtime-only variables**: Only needed when the app is running (webhooks, OAuth)

This allows you to deploy first, then configure webhooks after you have a production URL.

## Verify Everything Works

After deploying:

1. Check the app loads: `https://yourdomain.com`
2. Test authentication: Sign in/up
3. Check Vercel logs for any errors
4. Configure webhooks (step 3 above)
5. Test webhooks in Clerk/Stripe dashboards

## Still Having Issues?

Check:
- All environment variables are set for **Production** environment
- No typos in variable names
- Values don't contain placeholder text like `your-...` or `...`
- Using production keys (not test keys) if `NODE_ENV=production`

See full docs: `docs/vercel-deployment.md`
