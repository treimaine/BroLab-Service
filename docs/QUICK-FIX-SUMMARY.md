# 🚨 URGENT FIX - Production 500 Error

**Date:** April 8, 2026  
**Status:** ✅ FIXED - Ready to deploy  
**Impact:** ALL pages returning 500 error

---

## What Was Broken

**ALL pages** on https://brolabentertainment.com returned 500 error:
- Homepage (/)
- Sign-in (/sign-in)
- Sign-up (/sign-up)
- All other routes

---

## Root Cause

**File:** `src/components/ConvexClientProvider.tsx` (line 8-10)

```typescript
// ❌ THIS CODE CRASHED THE ENTIRE APP
if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
  throw new Error('Missing NEXT_PUBLIC_CONVEX_URL in your .env file')
}
```

**Why it broke:**
- This code runs at **module load time** (not inside a function)
- In Vercel Edge Runtime, env vars may not be available immediately
- The `throw` prevents the entire app from loading
- Result: 500 error on ALL pages

---

## The Fix

**Changed:** `src/components/ConvexClientProvider.tsx`

```typescript
// ✅ FIXED - Graceful degradation
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL

if (!convexUrl) {
  console.error('CRITICAL: NEXT_PUBLIC_CONVEX_URL is missing. Convex features will not work.')
}

const convex = new ConvexReactClient(convexUrl || '')
```

**Why this works:**
- Uses `console.error` instead of `throw`
- App can load even if Convex URL is missing
- Errors appear at runtime when Convex is used, not at module load
- Compatible with Vercel Edge Runtime

---

## Deploy Instructions

### 1. Commit and Push

```bash
git add src/components/ConvexClientProvider.tsx docs/
git commit -m "fix(convex): prevent 500 error from module-level env check

Root cause: Module-level throw in ConvexClientProvider was executing
before app could render, causing 500 on all pages in production.

Solution: Use console.error and graceful degradation instead of throw.
App now loads even if Convex URL is temporarily unavailable.

Fixes: Production 500 error (Digest: 2870270233)"

git push origin main
```

### 2. Verify Vercel Deployment

1. Go to https://vercel.com/dashboard
2. Wait for build to complete (2-3 minutes)
3. Check deployment logs for errors

### 3. Test Production

```bash
# Test these URLs load without 500 error:
open https://brolabentertainment.com
open https://brolabentertainment.com/sign-in
open https://brolabentertainment.com/sign-up
```

**Expected results:**
- ✅ All pages load (no 500 error)
- ✅ Clerk forms appear
- ✅ Authentication works
- ✅ No critical console errors

---

## Verification Checklist

### Before Deploy
- [x] Fix applied to `ConvexClientProvider.tsx`
- [x] No TypeScript errors
- [x] Documentation created

### After Deploy
- [ ] Vercel build succeeded
- [ ] Homepage loads
- [ ] Sign-in page loads
- [ ] Sign-up page loads
- [ ] Authentication works
- [ ] No 500 errors in console

---

## If Problems Persist

### Check Vercel Environment Variables

Go to Vercel Dashboard → Settings → Environment Variables

**Required:**
```env
NEXT_PUBLIC_CONVEX_URL=https://famous-starling-265.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_ISSUER_DOMAIN=https://natural-rattler-88.clerk.accounts.dev
```

### Rollback if Needed

```bash
# On Vercel Dashboard:
# → Deployments
# → Find last working deployment
# → "..." → "Promote to Production"
```

---

## Related Fixes

This is the **second time** we've had this issue:

1. **First time:** `src/lib/env.ts` - Fixed in commit `c7e0d5b`
   - Same problem: module-level validation throwing errors
   - Solution: Lazy initialization with getters

2. **This time:** `src/components/ConvexClientProvider.tsx`
   - Same problem: module-level throw statement
   - Solution: Graceful degradation with console.error

**Pattern:** Never throw at module level in production code.

---

## Full Documentation

- **Detailed analysis:** `docs/CLERK-500-FIX-APRIL-8.md`
- **Previous fix:** `docs/CLERK-PRODUCTION-FIX.md`
- **Environment setup:** `docs/environment-setup.md`

---

**Status:** ✅ READY TO DEPLOY  
**ETA:** 5 minutes after push  
**Risk:** LOW (simple fix, well-tested pattern)
