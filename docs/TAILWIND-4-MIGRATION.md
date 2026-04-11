# Tailwind CSS 4.x Migration Guide

## Status: IN PROGRESS

## Critical Changes Made

### 1. CSS Import Directive ✅
- **Changed**: `@tailwind base/components/utilities` → `@import "tailwindcss"`
- **File**: `app/globals.css`
- **Status**: DONE

### 2. Configuration Migration ✅
- **Changed**: `tailwind.config.ts` (JavaScript) → `@theme` directive in CSS
- **File**: `app/globals.css`
- **Status**: DONE (config moved to CSS with `@theme`)
- **Removed**: `tailwind.config.ts` (no longer needed)

### 3. PostCSS Plugin ✅
- **Changed**: `tailwindcss` → `@tailwindcss/postcss`
- **File**: `postcss.config.mjs`
- **Status**: DONE

## Remaining Breaking Changes

### Utility Class Renames (NOT YET DONE)

According to Tailwind 4.x upgrade guide, these utilities have been renamed:

| v3 Class | v4 Class | Occurrences | Priority |
|----------|----------|-------------|----------|
| `outline-none` | `outline-hidden` | ~50+ | HIGH |
| `ring` (bare) | `ring-3` | ~30+ | HIGH |
| `rounded-sm` | `rounded-xs` | ~20+ | MEDIUM |
| `shadow-sm` | `shadow-xs` | ~10+ | MEDIUM |
| `blur-sm` | `blur-xs` | ~5+ | LOW |
| `rounded` (bare) | `rounded-sm` | ~15+ | MEDIUM |
| `shadow` (bare) | `shadow-sm` | ~10+ | MEDIUM |
| `blur` (bare) | `blur-sm` | ~5+ | LOW |

### Files Affected

Major files with deprecated classes:
- `src/platform/ui/dribbble/*.tsx` (multiple components)
- `src/components/hub/*.tsx` (header, footer, forms)
- `src/components/interviews/*.tsx`
- `src/components/monitoring/*.tsx`
- `src/components/marketplace/*.tsx`
- `src/modules/beats/components/*.tsx`

## Migration Strategy

### Option 1: Automated Migration (RECOMMENDED)
```bash
npx @tailwindcss/upgrade
```

This official tool will:
- Update all deprecated utility classes
- Handle edge cases
- Generate a diff for review

### Option 2: Manual Migration
Use find-and-replace with regex:

```bash
# outline-none → outline-hidden
find src -name "*.tsx" -exec sed -i 's/outline-none/outline-hidden/g' {} +

# ring (standalone) → ring-3
# CAREFUL: Don't replace ring-offset, ring-accent, etc.
find src -name "*.tsx" -exec sed -i 's/\bring\b/ring-3/g' {} +

# rounded-sm → rounded-xs
find src -name "*.tsx" -exec sed -i 's/rounded-sm/rounded-xs/g' {} +

# shadow-sm → shadow-xs
find src -name "*.tsx" -exec sed -i 's/shadow-sm/shadow-xs/g' {} +

# blur-sm → blur-xs
find src -name "*.tsx" -exec sed -i 's/blur-sm/blur-xs/g' {} +
```

## Testing Checklist

After migration:
- [ ] Restart dev server (`npm run dev`)
- [ ] Visual inspection of homepage
- [ ] Check all interactive elements (buttons, forms, modals)
- [ ] Test focus states (keyboard navigation)
- [ ] Test hover states
- [ ] Compare with production screenshots
- [ ] Run TypeScript check (`npm run typecheck`)
- [ ] Run ESLint (`npm run lint`)

## Rollback Plan

If migration causes issues:

1. Revert to Tailwind 3.x:
```bash
npm install tailwindcss@3.4.17 --save-dev
npm uninstall @tailwindcss/postcss
```

2. Restore `tailwind.config.ts` from git:
```bash
git checkout HEAD -- tailwind.config.ts
```

3. Restore `app/globals.css`:
```bash
git checkout HEAD -- app/globals.css
```

4. Restore `postcss.config.mjs`:
```bash
git checkout HEAD -- postcss.config.mjs
```

## References

- [Tailwind 4.x Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [Tailwind 4.x Configuration](https://tailwindcss.com/docs/configuration)
- [Tailwind 4.x Theme Variables](https://tailwindcss.com/docs/theme)

## Notes

- Tailwind 4.x requires Safari 16.4+, Chrome 111+, Firefox 128+
- Uses modern CSS features like `@property` and `color-mix()`
- Configuration is now CSS-based with `@theme` directive
- PostCSS plugin is now `@tailwindcss/postcss` (separate package)
- Import/vendor prefixing is handled automatically (no need for `postcss-import` or `autoprefixer`)
