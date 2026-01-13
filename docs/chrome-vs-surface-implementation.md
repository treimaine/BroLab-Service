# Chrome vs Surface Implementation Summary

**Date:** 2026-01-13  
**Context:** Response to ChatGPT feedback on glass violations

## Problem Identified

ChatGPT correctly identified that the codebase had a **fundamental design system issue**:

> "Kiro a fait une migration 'mécanique' : glass → GlassSurface mais sans règle de 'tone'. Sur des composants fixes (header/footer/nav/player), c'est le pire endroit : tu vois tout de suite le 'card tint' (gris) au lieu du fond dark."

### Root Cause

Using `bg-card` (which has a grey tint) on **fixed UI elements** (Chrome) instead of `rgb(var(--bg))` creates visible inconsistency in dark mode.

## Solution Implemented

### Phase 0: Base Anti-Dérive ✅

1. **Created `ChromeSurface` component** (`src/platform/ui/dribbble/ChromeSurface.tsx`)
   - Background: `rgb(var(--bg))` + alpha (95% default)
   - Border: token-based `border-[rgba(var(--border),var(--border-alpha))]`
   - **NEVER** uses `bg-card`
   - Props: `blur`, `border`, `opacity`, `mode`, `as`

2. **Documented Chrome vs Surface rule** in `design.md`
   - Chrome (UI fixe): Header, Footer, Nav, Player → `<ChromeSurface>`
   - Surface (contenu): Cards, Chips, Badges → `<GlassSurface>` or `<DribbbleCard>`
   - Includes examples, API reference, and comparison table

3. **Updated violation report** (`docs/glass-violations-report.md`)
   - Corrected mapping: Chrome elements vs Surface elements
   - Clear action plan with Phase 0, 1, 2

4. **Added tasks** in `tasks.md` (Section D4.6.5)
   - Phase 0: ChromeSurface creation ✅
   - Phase 1: Create GlassChip, GlassToggle, GlassSkeletonCard
   - Phase 2: Replace all 18 violations
   - Phase 3: Verification

## Chrome vs Surface Rule

### Chrome (UI Fixe)

**Usage:** Header, Footer, Navigation, PlayerBar

**Background:** `rgb(var(--bg))` + alpha

**Component:** `<ChromeSurface>`

**Why?** Fixed UI elements must blend into the app background. The grey tint of `bg-card` is visible and creates visual inconsistency.

### Surface (Contenu)

**Usage:** Cards, Chips, Badges, Modules

**Background:** `bg-card` or `bg-[rgba(var(--bg-2))]`

**Components:** `<GlassSurface>`, `<DribbbleCard>`, `<GlassChip>`

**Why?** Content elements need subtle contrast to create visual hierarchy.

## Mapping of 18 Violations

### Chrome Elements (3 violations)

| File | Line | Element | Fix |
|------|------|---------|-----|
| `HubLandingPageClient.tsx` | 101 | Header sticky | `<ChromeSurface as="header">` |
| `PlayerBar.tsx` | 144 | PlayerBar container | `<ChromeSurface as="section">` |
| `MobileNav.tsx` | 82 | Bottom nav | `<ChromeSurface as="nav">` |

### Surface Elements (15 violations)

| File | Lines | Element | Fix |
|------|-------|---------|-----|
| `loading.tsx` | 75 | Skeleton cards | `<GlassSkeletonCard>` |
| `PricingPageClient.tsx` | 155 | Toggle | `<GlassToggle>` |
| `PricingPageClient.tsx` | 361, 365, 369 | Trust badges (3×) | `<GlassChip>` |
| `PlayerBar.tsx` | 210, 234 | BPM/Key chips (2×) | `<GlassChip>` |

## Next Steps

### Phase 1: Create Components (TODO)

- [ ] `GlassChip` - For badges and content chips
- [ ] `GlassToggle` - For annual/monthly toggle
- [ ] `GlassSkeletonCard` - For loading states

### Phase 2: Replace Violations (TODO)

- [ ] Fix 3 Chrome elements with `<ChromeSurface>`
- [ ] Fix 15 Surface elements with dedicated components

### Phase 3: Verification (TODO)

- [ ] Run `npm run lint` → expect 0 errors
- [ ] Visual regression check
- [ ] Update documentation

## Impact

### Before

- ❌ 18 ESLint violations
- ❌ Grey tint visible on fixed UI elements
- ❌ No clear distinction between Chrome and Surface
- ❌ Inconsistent visual language

### After (when complete)

- ✅ 0 ESLint violations
- ✅ Chrome elements blend into background
- ✅ Clear Chrome vs Surface distinction
- ✅ Consistent visual language
- ✅ Documented design system rules

## References

- **Component:** `src/platform/ui/dribbble/ChromeSurface.tsx`
- **Documentation:** `.kiro/specs/brolab-entertainment/design.md` (Chrome vs Surface section)
- **Violations Report:** `docs/glass-violations-report.md`
- **Tasks:** `.kiro/specs/brolab-entertainment/tasks.md` (Section D4.6.5)
- **ESLint Rule:** `eslint.config.mjs` (Task D4.6.1)

## Key Takeaway

> **If the element is fixed/sticky and part of permanent UI → Chrome**  
> **If the element is content that scrolls with the page → Surface**

This distinction is **non-negotiable** and must be enforced in code review.
