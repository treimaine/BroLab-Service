# Vercel Build Fix - Changelog

## Problem

Vercel production builds were failing with:
```
Error: Invalid environment configuration:
  - CLERK_WEBHOOK_SECRET is required.
  - CONVEX_DEPLOYMENT is required.
  - STRIPE_CONNECT_CLIENT_ID is required.
```

## Root Cause

The environment validation in `src/lib/env.ts` was treating all variables as build-time requirements, but some variables (webhook secrets, OAuth client IDs) are only needed at runtime after the app is deployed.

This created a chicken-and-egg problem:
1. Can't deploy without webhook secrets
2. Can't create webhooks without a production URL
3. Can't get production URL without deploying

## Solution

### Code Changes

**File: `src/lib/env.ts`**

Added build-time detection using `process.env.NEXT_PHASE`:

```typescript
const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
```

Runtime-only variables now use placeholder values during build:

```typescript
// Webhook secrets - only needed at runtime
const clerkWebhookSecret = isBuildTime 
  ? 'whsec_build_placeholder' 
  : validateRequiredPrefixedValue('CLERK_WEBHOOK_SECRET', 'whsec_', errors)

const stripeWebhookSecret = isBuildTime
  ? 'whsec_build_placeholder'
  : validateRequiredPrefixedValue('STRIPE_WEBHOOK_SECRET', 'whsec_', errors)

const stripeConnectWebhookSecret = isBuildTime
  ? 'whsec_build_placeholder'
  : validateRequiredPrefixedValue('STRIPE_CONNECT_WEBHOOK_SECRET', 'whsec_', errors)

// Connect Client ID - only needed at runtime for OAuth
const stripeConnectClientId = isBuildTime
  ? 'ca_build_placeholder'
  : validateRequiredPrefixedValue('STRIPE_CONNECT_CLIENT_ID', 'ca_', errors)
```

### Documentation Added

1. **VERCEL_FIX_NOW.md** - Immediate fix guide
2. **VERCEL_SETUP.md** - Quick setup guide
3. **docs/vercel-deployment.md** - Complete deployment guide
4. **DEPLOYMENT_CHECKLIST.md** - Step-by-step checklist
5. **.env.example** - Updated with clear comments
6. **docs/environment-setup.md** - Updated with variable categories

### Scripts Added

**scripts/check-env.mjs** - Environment variable checker

```bash
npm run check-env
```

Validates all required variables and warns about placeholders or test credentials in production.

Added as `prebuild` hook in package.json to run automatically before builds.

## Variable Categories

### Build-Time Variables (Required for `npm run build`)

These must be configured before building:

- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `CLERK_SECRET_KEY`
- `CLERK_JWT_ISSUER_DOMAIN`
- `NEXT_PUBLIC_CONVEX_URL`
- `CONVEX_DEPLOYMENT`
- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `RESEND_API_KEY`
- `NEXT_PUBLIC_SITE_URL`

### Runtime-Only Variables (Can be added after build)

These are only needed when the app is running:

- `CLERK_WEBHOOK_SECRET` (webhook verification)
- `STRIPE_WEBHOOK_SECRET` (webhook verification)
- `STRIPE_CONNECT_WEBHOOK_SECRET` (Connect webhook verification)
- `STRIPE_CONNECT_CLIENT_ID` (OAuth flow)

## Deployment Flow

### Before (Broken)

1. Try to deploy → Build fails (missing webhook secrets)
2. Can't create webhooks (no production URL yet)
3. Stuck in loop

### After (Fixed)

1. Configure build-time variables in Vercel
2. Deploy successfully (runtime vars use placeholders during build)
3. Get production URL
4. Configure webhooks with production URL
5. Add runtime variables to Vercel
6. Redeploy (now with real webhook secrets)
7. Everything works ✅

## Testing

### Local Testing

```bash
# Check environment variables
npm run check-env

# Build locally
npm run build

# Start production server
npm start
```

### Vercel Testing

1. Push to GitHub
2. Vercel auto-deploys
3. Check build logs
4. Verify app loads
5. Configure webhooks
6. Add runtime variables
7. Redeploy
8. Test webhooks

## Breaking Changes

None. This is a backward-compatible fix.

Existing deployments with all variables configured will continue to work.

## Migration Guide

If you have an existing deployment:

1. No action needed if all variables are already configured
2. If missing runtime variables, add them now (see VERCEL_SETUP.md)
3. Redeploy to pick up the new validation logic

## Future Improvements

- [ ] Add environment variable validation in CI/CD
- [ ] Create Vercel deployment script
- [ ] Add health check endpoint
- [ ] Implement graceful degradation if webhooks fail
- [ ] Add monitoring for webhook delivery failures

## References

- [Next.js Environment Variables](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)
- [Clerk Webhooks](https://clerk.com/docs/integrations/webhooks)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)

---

**Date:** January 2026
**Author:** BroLab Entertainment Team
**Status:** ✅ Fixed and Deployed
