# 🚀 Deployment Checklist

## Pre-Deployment

- [ ] All code committed and pushed to GitHub
- [ ] Tests passing locally (`npm run test:all`)
- [ ] TypeScript compiles (`npm run typecheck`)
- [ ] Linting passes (`npm run lint`)
- [ ] Environment variables checked (`npm run check-env`)

## Vercel Setup

### Step 1: Configure Build-Time Variables

Add these in Vercel Dashboard → Settings → Environment Variables (Production):

- [ ] `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- [ ] `CLERK_SECRET_KEY`
- [ ] `CLERK_JWT_ISSUER_DOMAIN`
- [ ] `NEXT_PUBLIC_CONVEX_URL`
- [ ] `CONVEX_DEPLOYMENT`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `RESEND_API_KEY`
- [ ] `NEXT_PUBLIC_SITE_URL`

### Step 2: Deploy

- [ ] Push to main branch or click "Deploy" in Vercel
- [ ] Wait for build to complete
- [ ] Verify app loads at production URL

### Step 3: Configure Runtime Variables

After first successful deploy:

#### Clerk Webhook
- [ ] Create webhook endpoint in Clerk Dashboard
- [ ] URL: `https://yourdomain.com/api/webhooks/clerk`
- [ ] Subscribe to events: `user.*`, `organization.*`, `session.*`
- [ ] Add `CLERK_WEBHOOK_SECRET` to Vercel
- [ ] Test webhook delivery in Clerk Dashboard

#### Stripe Webhooks
- [ ] Create webhook endpoint: `https://yourdomain.com/api/webhooks/stripe`
- [ ] Subscribe to events: `checkout.session.completed`, `customer.subscription.*`
- [ ] Add `STRIPE_WEBHOOK_SECRET` to Vercel
- [ ] Create Connect webhook: `https://yourdomain.com/api/webhooks/stripe-connect`
- [ ] Subscribe to events: `account.*`, `payout.*`
- [ ] Add `STRIPE_CONNECT_WEBHOOK_SECRET` to Vercel
- [ ] Test webhook deliveries in Stripe Dashboard

#### Stripe Connect OAuth
- [ ] Configure redirect URI in Stripe Dashboard
- [ ] URL: `https://yourdomain.com/api/stripe/connect/callback`
- [ ] Add `STRIPE_CONNECT_CLIENT_ID` to Vercel

### Step 4: Redeploy

- [ ] Redeploy after adding runtime variables
- [ ] Verify webhooks are working
- [ ] Check Vercel logs for errors

## Post-Deployment

### Functionality Tests
- [ ] User sign up works
- [ ] User sign in works
- [ ] Organization creation works
- [ ] Stripe checkout works
- [ ] Email delivery works (Resend)
- [ ] Webhooks are being received

### Monitoring
- [ ] Check Vercel logs for errors
- [ ] Check Clerk Dashboard for webhook deliveries
- [ ] Check Stripe Dashboard for webhook deliveries
- [ ] Check Convex Dashboard for function logs
- [ ] Set up error tracking (Sentry, etc.)

### Security
- [ ] All production keys (no `_test_` keys)
- [ ] HTTPS only
- [ ] Webhook secrets are unique
- [ ] CORS configured correctly
- [ ] Rate limiting enabled

### Performance
- [ ] Lighthouse score > 90
- [ ] Core Web Vitals passing
- [ ] Images optimized
- [ ] Bundle size acceptable

## Rollback Plan

If deployment fails:

1. Check Vercel logs for errors
2. Verify all environment variables are set
3. Test locally with production env vars
4. If needed, rollback: Vercel Dashboard → Deployments → Previous → Promote

## Documentation

- [ ] Update README with production URL
- [ ] Document any new environment variables
- [ ] Update API documentation if needed
- [ ] Create runbook for common issues

## Communication

- [ ] Notify team of deployment
- [ ] Update status page if applicable
- [ ] Monitor for user reports

---

**Last Updated:** January 2026
**Maintained By:** BroLab Entertainment Team
