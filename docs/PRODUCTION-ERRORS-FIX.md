# Production Errors - Analysis & Fixes

## Date: 2026-01-08

## Errors Identified

### 1. ✅ CSP Blocking Clerk Web Workers
**Error:**
```
Creating a worker from 'blob:...' violates the following Content Security Policy directive: "script-src..."
```

**Cause:** CSP policy missing `worker-src 'self' blob:` directive

**Fix Applied:**
- Added `worker-src 'self' blob:` to CSP in `middleware.ts`
- Added `https://vercel.live` to `script-src` for Vercel Live Feedback

**File:** `middleware.ts`

---

### 2. ✅ Missing Favicon (500 Error)
**Error:**
```
favicon.ico:1 Failed to load resource: the server responded with a status of 500 ()
```

**Cause:** No favicon configured in the app

**Fix Applied:**
- Created `app/icon.tsx` - Dynamic favicon generator (32x32)
- Created `app/apple-icon.tsx` - Apple touch icon (180x180)
- Uses Next.js metadata API for automatic favicon generation

**Files:** `app/icon.tsx`, `app/apple-icon.tsx`

---

### 3. ⚠️ Server Components Error (Digest)
**Error:**
```
Uncaught Error: An error occurred in the Server Components render. The specific message is omitted in production builds to avoid leaking sensitive details. A digest property is included on this error instance which may provide additional details about the nature of the error.
```

**Cause:** Unknown - error message hidden in production

**Action Required:**
1. Check Vercel deployment logs for the full error with digest
2. Add error boundaries to critical Server Components
3. Enable error logging with Sentry or similar

**Recommendation:**
```tsx
// Add to critical pages
import { ErrorBoundary } from '@/components/ErrorBoundary'

export default function Page() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      {/* Your content */}
    </ErrorBoundary>
  )
}
```

---

### 4. 🔴 CRITICAL: Test Credentials in Production
**Error:** Using test Stripe/Clerk keys in production

**Current State:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Action Required (URGENT):**
1. Create production Clerk instance
2. Create production Stripe account
3. Update environment variables in Vercel:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...`
   - `CLERK_SECRET_KEY=sk_live_...`
   - `STRIPE_SECRET_KEY=sk_live_...`
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...`
   - `CLERK_JWT_ISSUER_DOMAIN=https://clerk.brolabentertainment.com`
4. Remove `ALLOW_TEST_CREDENTIALS_IN_PRODUCTION=true`

**Risks:**
- ❌ No real payments processed
- ❌ Test data mixed with production
- ❌ Stripe/Clerk may suspend account
- ❌ Users cannot complete purchases

---

### 5. ⚠️ Browser Extension Errors
**Error:**
```
Error handling response: TypeError: Cannot read properties of null (reading 'querySelector')
at chrome-extension://...
```

**Cause:** Browser extension (1Password, Element Cloner) conflicts

**Action:** Not a production issue - user-specific browser extensions

---

## Deployment Checklist

### Before Next Deployment:

- [x] Fix CSP to allow Clerk workers
- [x] Add favicon generation
- [ ] Switch to production Clerk keys
- [ ] Switch to production Stripe keys
- [ ] Update `CLERK_JWT_ISSUER_DOMAIN` to production domain
- [ ] Remove `ALLOW_TEST_CREDENTIALS_IN_PRODUCTION`
- [ ] Add error boundaries to critical pages
- [ ] Set up error monitoring (Sentry)
- [ ] Test checkout flow with real Stripe account
- [ ] Verify Clerk webhooks point to production URL
- [ ] Verify Stripe webhooks point to production URL

### Environment Variables to Update in Vercel:

```env
# Clerk Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_ISSUER_DOMAIN=https://clerk.brolabentertainment.com
CLERK_WEBHOOK_SECRET=whsec_... (new production webhook)

# Stripe Production
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_... (new production webhook)
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_... (new production webhook)
STRIPE_CONNECT_CLIENT_ID=ca_... (production Connect client ID)

# Remove
# ALLOW_TEST_CREDENTIALS_IN_PRODUCTION (delete this)
```

---

## Testing After Fixes

1. **CSP Fix:**
   - Open browser console
   - Verify no CSP errors for Clerk workers
   - Test sign-in/sign-up flow

2. **Favicon:**
   - Check browser tab shows "B" icon
   - Verify no 500 errors in Network tab

3. **Production Keys:**
   - Test real payment with Stripe
   - Verify Clerk authentication works
   - Check webhooks are received

---

## References

- [Clerk Production Checklist](https://clerk.com/docs/deployments/production-checklist)
- [Stripe Production Checklist](https://stripe.com/docs/keys#production-keys)
- [Next.js Metadata API](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/app-icons)
- [CSP Worker-Src](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy/worker-src)
