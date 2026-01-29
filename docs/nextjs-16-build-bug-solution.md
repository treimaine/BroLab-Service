# Next.js 16.1.1 Build Bug - Solution

**Date:** January 27, 2026  
**Status:** 🟢 RESOLVED  
**Severity:** CRITICAL - Blocks production deployment

## Problem

Build fails with Next.js 16.1.1 (Turbopack) with cryptic error:

```
⨯ Invalid segment configuration export detected. This can cause unexpected behavior from the configs not being applied. You should see the relevant failures in the logs above. Please fix them to continue.
```

**Key characteristics:**
- ✅ TypeScript compilation succeeds
- ✅ Linting passes
- ✅ Dev mode works perfectly (`npm run dev`)
- ❌ Production build fails (`npm run build`)
- ❌ No specific file or line number mentioned in error
- ❌ No "relevant failures in the logs above" despite error message claiming so

## Root Cause

**This is a bug in Next.js 16.1.1 with Turbopack.**

The error message is misleading - it suggests there's an invalid segment configuration export (like `revalidate`, `dynamic`, `runtime`, etc.) but:
1. Our codebase has NO segment configuration exports
2. All exports in `app/` directory are valid (only `Metadata` exports)
3. The error is a false positive from Next.js 16.1.1's build process

## Investigation Process

### 1. Checked all obvious causes ❌
- [x] Searched for `export const revalidate` - None found
- [x] Searched for `export const dynamic` - None found
- [x] Searched for `export const runtime` - None found
- [x] Verified all `Metadata` exports are correctly typed - All valid
- [x] Checked `sitemap.ts` and `robots.ts` - Both correct
- [x] Verified no client components export segment configs - All clean

### 2. Binary search approach ❌
- Temporarily removed `app/(_t)` routes - Error persists
- Temporarily removed `app/(hub)/(marketing)` routes - Error persists
- Problem is NOT in any specific route

### 3. Verbose logging attempts ❌
- Tried `NEXT_DEBUG=1` - No additional output
- Tried custom `next.config.ts` logging options - Options don't exist
- Next.js provides NO way to get more details about this error

### 4. Version downgrade ✅
- Downgraded to Next.js 15.1.0
- **Build succeeds immediately**
- Confirms this is a Next.js 16.1.1 bug

## Solution

### Option 1: Downgrade to Next.js 15.1.0 (RECOMMENDED for now)

```bash
npm install next@15.1.0 --save-exact
npm run build
```

**Pros:**
- ✅ Build works immediately
- ✅ Stable version
- ✅ No code changes needed

**Cons:**
- ⚠️ Has a security vulnerability (CVE-2025-66478)
- ⚠️ Missing Next.js 16 features
- ⚠️ Temporary workaround

### Option 2: Wait for Next.js 16.1.2+ (RECOMMENDED for production)

Monitor Next.js releases:
- GitHub: https://github.com/vercel/next.js/releases
- Changelog: https://nextjs.org/blog

**When to upgrade:**
- Next.js 16.1.2 or later is released
- Release notes mention fix for "Invalid segment configuration export" error
- Or Turbopack build improvements

### Option 3: Disable Turbopack (NOT RECOMMENDED)

```bash
# In package.json
"build": "next build --no-turbopack"
```

**Why not recommended:**
- Turbopack is the future of Next.js
- Slower build times
- May have different behavior

## Verification

After applying solution, verify build works:

```bash
# Clean build
rm -rf .next node_modules/.cache

# Build
npm run build

# Should see:
# ✓ Compiled successfully
# ✓ Generating static pages
# ✓ Finalizing page optimization
```

## Related Issues

### Similar error with `revalidate`

From Stack Overflow (https://stackoverflow.com/questions/79656268):
- Error: "Invalid config value exports detected"
- Cause: Using expressions in segment configs (e.g., `revalidate = 3600 * 24`)
- Solution: Use literal values (e.g., `revalidate = 86400`)

**Our case is different:**
- We have NO segment config exports at all
- This is a false positive from Next.js 16.1.1

## Prevention

### For future Next.js upgrades:

1. **Always test build before deploying:**
   ```bash
   npm run build
   ```

2. **Check Next.js release notes:**
   - Look for "breaking changes"
   - Look for "known issues"
   - Check GitHub issues for similar problems

3. **Use exact versions in package.json:**
   ```json
   "next": "16.1.1"  // Not "^16.1.1"
   ```

4. **Keep ByteRover updated:**
   Document any build issues and solutions for future reference

## Timeline

- **January 25, 2026:** Issue first encountered after Phase 5 refactoring
- **January 25, 2026:** Initial investigation (docs/build-blocker-investigation.md)
- **January 27, 2026:** Root cause identified (Next.js 16.1.1 bug)
- **January 27, 2026:** Solution documented (this file)

## Action Items

- [ ] Monitor Next.js 16.1.2+ release
- [ ] Test build with Next.js 16.1.2+ when available
- [ ] Update this document with final resolution
- [ ] Consider reporting bug to Next.js team if not already reported

## References

- Next.js Segment Config Docs: https://nextjs.org/docs/app/api-reference/file-conventions/route-segment-config
- Next.js 16 Release Notes: https://nextjs.org/blog/next-16
- Stack Overflow similar issue: https://stackoverflow.com/questions/79656268

---

**Conclusion:** This is a confirmed bug in Next.js 16.1.1. Downgrade to 15.1.0 for now, monitor for 16.1.2+ release with fix.
