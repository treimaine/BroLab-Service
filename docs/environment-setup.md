# Environment Setup Guide

## Overview

This guide covers setting up all required environment variables for BroLab Entertainment.

## Quick Start

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in the required values (see sections below)

3. Verify setup:
   ```bash
   npm run typecheck
   npm run dev
   ```

## Environment Variables by Service

### 1. Clerk Authentication

**Required for:** User authentication, Organizations, Billing

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/onboarding
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
CLERK_BILLING_ENABLED=true
CLERK_WEBHOOK_SECRET=whsec_...
```

**Setup:**
1. Create account at [clerk.com](https://clerk.com)
2. Create new application
3. Copy keys from **API Keys** page
4. Enable Organizations in **Organizations** settings
5. Enable Billing in **Billing** settings
6. Create webhook endpoint for `/api/clerk/webhook`

**Documentation:** See `docs/clerk-setup.md`

### 2. Convex Backend

**Required for:** Database, File Storage, Real-time subscriptions

```env
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
CONVEX_DEPLOYMENT=dev:your-deployment-name
```

**Setup:**
1. Install Convex: `npm install convex`
2. Run: `npx convex dev`
3. Login with GitHub
4. Create new project
5. Copy `NEXT_PUBLIC_CONVEX_URL` from output
6. Copy `CLERK_JWT_ISSUER_DOMAIN` from Clerk Dashboard → JWT Templates

**Documentation:** See `docs/convex-setup.md`

### 3. Stripe Payments

**Required for:** Provider subscriptions (Clerk Billing) + Artist purchases (Connect)

```env
# Platform Account (YOUR Stripe account)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Stripe Connect
STRIPE_CONNECT_CLIENT_ID=ca_...

# Webhooks
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
```

**Setup:**
1. Create account at [stripe.com](https://stripe.com)
2. Get API keys from **Developers → API keys**
3. Enable Connect in **Settings → Connect**
4. Create webhook endpoints:
   - Platform: `/api/stripe/webhook`
   - Connect: `/api/stripe/webhook`

**Documentation:** See `docs/stripe-connect-setup.md`

### 4. Resend Email

**Required for:** Transactional emails (purchase confirmations, licenses)

```env
RESEND_API_KEY=re_...
```

**Setup:**
1. Create account at [resend.com](https://resend.com)
2. Verify your domain (or use test domain)
3. Copy API key from **API Keys** page

**Documentation:** See `docs/email-setup.md`

### 5. Site Configuration

**Required for:** URLs, branding, metadata

```env
# Site URL (change for production)
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Brand Info
BRAND_NAME=BroLab Entertainment
BRAND_EMAIL=contact@brolabentertainment.com
BRAND_ADDRESS="Your Address"
BRAND_PHONE=+1234567890
BRAND_WEBSITE=https://brolabentertainment.com
```

**Setup:**
- Development: Use `http://localhost:3000`
- Production: Use your actual domain (e.g., `https://brolabentertainment.com`)

### 6. System Environment (Windows)

**Required for:** Playwright browser automation

```env
HOME=C:\Users\%USERNAME%
```

**Setup:**
- Windows: Set to your user profile directory
- Linux/Mac: Usually auto-detected, can omit

## Environment Files

### `.env.local` (Local Development)

- **Location:** Project root
- **Git:** Ignored (never commit)
- **Purpose:** Your personal development environment
- **Priority:** Overrides all other env files

### `.env.example` (Template)

- **Location:** Project root
- **Git:** Committed
- **Purpose:** Template showing all required variables
- **Usage:** Copy to `.env.local` and fill in values

### `.env.production` (Production - Optional)

- **Location:** Project root
- **Git:** Ignored (never commit)
- **Purpose:** Production-specific overrides
- **Usage:** Deployed via Vercel/hosting platform

## Verification Checklist

After setting up environment variables, verify:

- [ ] `npm run dev` starts without errors
- [ ] Can access `http://localhost:3000`
- [ ] Clerk sign-in page loads at `/sign-in`
- [ ] Convex queries work (check browser console)
- [ ] No "Missing environment variable" errors

## Common Issues

### "Missing NEXT_PUBLIC_CONVEX_URL"

**Solution:** Run `npx convex dev` to generate Convex deployment

### "Clerk publishable key is invalid"

**Solution:** 
1. Check key starts with `pk_test_` or `pk_live_`
2. Verify key is from correct Clerk application
3. Restart dev server after changing env vars

### "Stripe webhook signature verification failed"

**Solution:**
1. Verify `STRIPE_WEBHOOK_SECRET` matches Stripe Dashboard
2. For Stripe Connect checkout events, use Stripe CLI for local testing: `stripe listen --forward-to localhost:3000/api/stripe/webhook`
3. Check webhook endpoint URL is correct

### "CLERK_JWT_ISSUER_DOMAIN is not set"

**Solution:**
1. Go to Clerk Dashboard → JWT Templates
2. Create template named "convex"
3. Copy Issuer URL (Frontend API URL)
4. Add to `.env.local`

## Security Best Practices

1. **Never commit `.env.local`** - Contains secrets
2. **Use test keys in development** - Prefix with `test_` or `sk_test_`
3. **Rotate keys regularly** - Especially after team changes
4. **Use different keys per environment** - Dev, staging, production
5. **Limit key permissions** - Use restricted API keys when possible
6. **Monitor key usage** - Check Stripe/Clerk dashboards for anomalies

## Production Deployment

### Vercel

1. Go to project settings → Environment Variables
2. Add all variables from `.env.local`
3. Set environment: Production, Preview, Development
4. Redeploy after changes

### Other Platforms

1. Use platform-specific env var management
2. Ensure all `NEXT_PUBLIC_*` vars are available at build time
3. Server-side vars can be set at runtime

## Environment Variable Precedence

Next.js loads env vars in this order (highest to lowest priority):

1. `.env.local` (all environments, ignored by git)
2. `.env.production` or `.env.development` (environment-specific)
3. `.env` (all environments, committed to git)

**Rule:** Use `.env.local` for secrets, `.env` for defaults.

## Operator Runbooks

- Use `docs/security-secret-rotation.md` before any production deploy, incident-driven credential reset, or scheduled 90-day rotation.
- Keep Stripe platform and Stripe Connect webhook secrets distinct. The runtime validator now rejects duplicate values.

## Troubleshooting

### Variables not loading

1. Restart dev server (`npm run dev`)
2. Check file name is exactly `.env.local` (not `.env.local.txt`)
3. Verify no syntax errors (no spaces around `=`)
4. Check variable name doesn't have typos

### "Cannot find module" errors

1. Run `npm install` to ensure all dependencies installed
2. Check `package.json` has correct versions
3. Delete `node_modules` and `package-lock.json`, reinstall

### Convex not connecting

1. Verify `NEXT_PUBLIC_CONVEX_URL` is correct
2. Run `npx convex dev` in separate terminal
3. Check Convex dashboard for deployment status

## Resources

- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Clerk Setup Guide](https://clerk.com/docs/quickstarts/nextjs)
- [Convex Setup Guide](https://docs.convex.dev/quickstart/nextjs)
- [Stripe Connect Guide](https://stripe.com/docs/connect)
- [Resend Setup Guide](https://resend.com/docs/introduction)

## Support

For environment setup issues:
1. Check this guide first
2. Review service-specific docs (Clerk, Convex, Stripe)
3. Check `docs/decisions.md` for architecture context
4. Ask in project Discord/Slack
