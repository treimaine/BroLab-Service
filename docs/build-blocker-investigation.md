# Build Blocker Investigation - Phase 4.5

**Date:** January 25, 2026  
**Status:** 🔴 CRITICAL - Build Failing  
**Error:** `Invalid segment configuration export detected`

## Error Message

```
⨯ Invalid segment configuration export detected. This can cause unexpected behavior from the configs not being applied. You should see the relevant failures in the logs above. Please fix them to continue.
```

## Investigation Steps

### 1. Initial Checks ✅

- [x] Checked all `page.tsx` files for invalid exports
- [x] Checked all `layout.tsx` files for invalid exports
- [x] Verified `Metadata` exports are correctly typed
- [x] Checked `sitemap.ts` and `robots.ts` - both correct

### 2. Files Audited

| File | Status | Notes |
|------|--------|-------|
| `app/layout.tsx` | ✅ Clean | Valid Metadata export |
| `app/(hub)/page.tsx` | ✅ Clean | Valid Metadata export |
| `app/(hub)/onboarding/page.tsx` | ✅ Clean | Client component, no exports |
| `app/(hub)/(marketing)/layout.tsx` | ✅ Clean | No exports |
| `app/(hub)/(marketing)/*/page.tsx` | ✅ Clean | All have valid Metadata |
| `app/sitemap.ts` | ✅ Clean | Correct MetadataRoute.Sitemap |
| `app/robots.ts` | ✅ Clean | Correct MetadataRoute.Robots |

### 3. Possible Causes

#### A. Hidden Export in Client Component ⚠️

**Hypothesis:** A client component (`'use client'`) might be exporting a segment configuration.

**Next.js Rule:** Segment configs (`dynamic`, `revalidate`, `runtime`) are ONLY valid in Server Components.

**Files to check:**
- `app/(hub)/onboarding/page.tsx` - Client component with complex logic
- Any other `'use client'` files in `app/` directory

#### B. TypeScript Type Export Confusion ⚠️

**Hypothesis:** Exporting a type/interface that Next.js mistakes for a segment config.

**Example of problematic pattern:**
```typescript
// ❌ BAD - Could confuse Next.js
export type dynamic = 'force-dynamic'

// ✅ GOOD - Clear type export
export type PageProps = { params: { id: string } }
```

#### C. Indirect Export via Re-export ⚠️

**Hypothesis:** A component imported in a route file might be exporting something invalid.

**Files to check:**
- `src/platform/ui/dribbble/*` - All Dribbble components
- `src/components/*` - All shared components

#### D. Next.js 16.1.1 Bug 🐛

**Hypothesis:** This could be a Next.js bug with Turbopack.

**Test:** Try building without Turbopack:
```bash
TURBOPACK=0 npm run build
```

### 4. Diagnostic Commands

```bash
# Find all exports in app/ directory
grep -r "^export" app/ --include="*.tsx" --include="*.ts"

# Find all 'use client' directives
grep -r "'use client'" app/ --include="*.tsx"

# Find segment config exports
grep -r "export const \(dynamic\|revalidate\|runtime\|fetchCache\)" app/

# Build with verbose logging
npm run build 2>&1 | tee build-log.txt
```

### 5. Next Steps

1. **Try building without Turbopack:**
   ```bash
   TURBOPACK=0 npm run build
   ```

2. **Binary search approach:**
   - Comment out half of the routes
   - Build
   - If succeeds, problem is in commented half
   - If fails, problem is in active half
   - Repeat until file is found

3. **Check for recent changes:**
   ```bash
   git log --oneline --since="2 days ago" -- app/
   ```

4. **Verify Next.js version:**
   ```bash
   npm list next
   # Should be 16.1.1
   ```

## Workaround (Temporary)

If the issue persists and blocks development:

1. **Downgrade Next.js:**
   ```bash
   npm install next@15.1.0 --save-exact
   npm run build
   ```

2. **Report to Next.js:**
   - Create minimal reproduction
   - Open issue: https://github.com/vercel/next.js/issues

## Resolution

**Status:** 🔴 Not yet resolved

**Action Required:** Complete Task 4.5.1 in tasks.md

---

## Update Log

- **2026-01-25 Initial Investigation:** Checked all obvious files, no invalid exports found. Suspect hidden issue in client component or Next.js bug.
