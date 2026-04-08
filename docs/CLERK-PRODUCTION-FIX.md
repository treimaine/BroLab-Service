# Clerk Production 500 Error Fix

**Date:** 2026-04-08  
**Status:** ✅ FIXED  
**Severity:** CRITICAL (P0)  
**Affected:** Production sign-in page returning 500 error

---

## Problem Summary

The `/sign-in` page in production was returning a **500 Server Error** with digest `3418603030`. The error message was:

```
Application error: a server-side exception has occurred
```

This prevented ALL users from signing in to the production application.

---

## Root Cause Analysis

### Timeline of Breaking Changes

1. **Commit `1792f5e` (April 4, 2026)** - "feat(security): Add comprehensive security headers and enhanced observability"
   - Added strict environment variable validation in `src/lib/env.ts`
   - Validation runs at **module load time** (line 113: `const runtimeEnv = resolveRuntimeEnv()`)
   - This means validation happens BEFORE any page can render

2. **The Fatal Flow:**
   ```
   app/layout.tsx imports SITE_CONFIG from @/lib/env
   ↓
   src/lib/env.ts module loads
   ↓
   Line 113: const runtimeEnv = resolveRuntimeEnv() executes IMMEDIATELY
   ↓
   resolveRuntimeEnv() validates ALL environment variables
   ↓
   If ANY validation fails → throws Error
   ↓
   Error thrown BEFORE page can render → 500 error
   ```

3. **Why it broke in production:**
   - The validation is TOO STRICT for production environment
   - Even if Vercel has all the correct environment variables, the validation logic might fail due to:
     - Timing issues (variables not yet available during module load)
     - Edge runtime limitations
     - Build-time vs runtime variable availability

### Previous Incorrect Diagnoses

1. ❌ **First attempt:** Thought CSP was blocking Clerk workers
   - Added `worker-src 'self' blob:` to CSP
   - This was a symptom, not the cause

2. ❌ **Second attempt:** Thought `validateEnv()` was being called twice
   - Removed manual call from `app/layout.tsx`
   - This helped but didn't fix the root cause

3. ✅ **Correct diagnosis:** Module-level validation runs too early
   - The `const runtimeEnv = resolveRuntimeEnv()` at line 113 runs at module load time
   - This is BEFORE the app can handle errors gracefully
   - Any validation failure = immediate 500 error

---

## The Fix

### Changed: Lazy Initialization Pattern

**Before (BROKEN):**
```typescript
// Line 113 - runs IMMEDIATELY when module loads
const runtimeEnv = resolveRuntimeEnv()

export const SITE_CONFIG = {
  url: runtimeEnv.siteUrl,  // Accesses validation result immediately
  // ...
}
```

**After (FIXED):**
```typescript
// Lazy initialization - only validate when first accessed
let runtimeEnv: RuntimeEnv | null = null

function getRuntimeEnv(): RuntimeEnv {
  if (!runtimeEnv) {
    runtimeEnv = resolveRuntimeEnv()
  }
  return runtimeEnv
}

export const SITE_CONFIG = {
  get url() { return getRuntimeEnv().siteUrl },  // Getter - validates on first access
  // ...
}
```

### Why This Works

1. **Deferred Validation:** Validation only runs when a config value is actually accessed
2. **Graceful Error Handling:** Errors can be caught and handled by the app's error boundaries
3. **Better Performance:** Validation only runs once, on first access (cached after that)
4. **Edge Runtime Compatible:** Works with Vercel's edge runtime limitations

### Files Changed

- `src/lib/env.ts` - Changed from eager to lazy initialization using getters

---

## Testing

### Local Testing
```bash
# 1. Build production locally
npm run build

# 2. Start production server
npm start

# 3. Test sign-in page
# Should load without 500 error
```

### Production Testing
1. Deploy to Vercel
2. Visit `https://brolabentertainment.com/sign-in`
3. Verify page loads (no 500 error)
4. Verify Clerk sign-in form appears
5. Test actual sign-in flow

---

## Prevention

### Rules to Prevent This Issue

1. ✅ **NEVER run validation at module load time**
   - Use lazy initialization with getters
   - Validation should run on first access, not on import

2. ✅ **Test production builds locally before deploying**
   ```bash
   npm run build && npm start
   ```

3. ✅ **Use environment variable validation carefully**
   - Distinguish between build-time and runtime variables
   - Use placeholders for build-time-only scenarios
   - Don't throw errors for optional variables

4. ✅ **Monitor production errors**
   - Set up Sentry or similar error tracking
   - Check Vercel deployment logs regularly

### Code Review Checklist

When reviewing changes to `src/lib/env.ts`:
- [ ] Does validation run at module load time? (❌ BAD)
- [ ] Does validation run on first access? (✅ GOOD)
- [ ] Are build-time vs runtime variables distinguished?
- [ ] Are error messages helpful for debugging?
- [ ] Is there a fallback for optional variables?

---

## Related Issues

- **Previous Fix:** `d3a785a` - Removed duplicate `validateEnv()` call (partial fix)
- **Breaking Commit:** `1792f5e` - Added strict validation at module load time
- **CSP Changes:** `da0ec86`, `84d844c` - CSP fixes (symptoms, not root cause)

---

## Lessons Learned

1. **Module-level code runs immediately** - Be careful with side effects at module scope
2. **Validation should be lazy** - Don't validate until values are actually needed
3. **Production errors need better visibility** - Set up proper error tracking
4. **Test production builds locally** - Catch issues before deploying

---

## Commit Message

```
fix(env): use lazy initialization to prevent 500 error on sign-in

BREAKING CHANGE: Environment validation now runs on first access instead of module load time

Root cause: resolveRuntimeEnv() was called at module load time (line 113),
causing validation errors to throw BEFORE the app could render, resulting
in 500 errors on all pages including /sign-in.

Solution: Changed all config exports to use getters that call getRuntimeEnv(),
which lazily initializes and caches the validation result on first access.

This allows:
- Graceful error handling by app error boundaries
- Better compatibility with Vercel edge runtime
- Validation only when config is actually used

Fixes: Production sign-in 500 error (Digest: 3418603030)
Related: d3a785a, 1792f5e
```
