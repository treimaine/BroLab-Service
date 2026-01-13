# Theme-Coherent Chrome Surfaces - Implementation Guide

**Date:** 2026-01-13  
**Status:** ✅ Implemented  
**Requirement:** 33 (Theme-Coherent Chrome Surfaces)

## Problem Statement

Header and footer components were using `GlassSurface` which applies `bg-card/80` by default. Since `--card` is white in the design system, this created a **light grey overlay** even in dark mode, breaking theme coherence.

### Visual Impact

**Before (broken):**
- Header: Light grey tint in dark mode (should be transparent/dark)
- Footer: Light grey background in dark mode (should be dark)
- Inconsistent with Dribbble ELECTRI-X design language

**After (fixed):**
- Header: Transparent at top, theme-coherent tinted glass on scroll
- Footer: Theme-coherent dark background
- Matches current theme perfectly (light/dark)

## Root Cause

```tsx
// GlassSurface.tsx - applies card tokens
<Component className="bg-card/80 backdrop-blur-md">
  {/* bg-card = white → light grey overlay */}
</Component>
```

**Problem:** Chrome surfaces (header/footer) are NOT cards. They need background tokens, not card tokens.

## Solution Architecture

### 1. Surface Taxonomy

**Chrome Surfaces:**
- Header, Footer, Navigation bars
- Use ONLY bg tokens: `rgb(var(--bg))`, `rgb(var(--bg-2))`
- Component: `ChromeSurface`

**Card Surfaces:**
- Large content cards, Modules, Overlays
- Use ONLY card tokens: `bg-card/*`, `bg-card-alpha`
- Component: `CardSurface` or `DribbbleCard`

**Small UI Elements (CRITICAL RULE):**
- Badges, Chips, Toggles, Pills (non-CTA)
- Use ONLY bg tokens: `bg-[rgba(var(--bg-2),0.8)]`
- NO component wrapper - use direct Tailwind classes
- **Reason:** Card tokens are white-based (`--card: 255 255 255`) and create light grey in dark mode

### Design Rule Summary

| Element Type | Tokens | Component | Example |
|--------------|--------|-----------|---------|
| Chrome (header/footer/nav) | `--bg`, `--bg-2` | `ChromeSurface` | Header, Footer |
| Large content cards | `--card`, `bg-card/*` | `CardSurface` or `DribbbleCard` | Feature cards, pricing cards |
| Small UI elements | `--bg-2` | Direct Tailwind | Trust badges, toggles, info chips |
| CTA buttons | `--accent` gradient | `PillCTA` | Primary actions |

**Critical Rule:** Never use `bg-card/*` for small UI elements (badges, toggles, chips). Always use `bg-[rgba(var(--bg-2),0.8)]` for theme coherence.

### 2. New Primitives

#### ChromeSurface

```tsx
import { ChromeSurface } from '@/platform/ui'

// Header (transparent → elevated on scroll)
<ChromeSurface 
  as="header" 
  mode={isScrolled ? "elevated" : "transparent"}
  blur={isScrolled ? "sm" : "none"}
>
  Header content
</ChromeSurface>

// Footer (always base)
<ChromeSurface as="footer" mode="base" bordered>
  Footer content
</ChromeSurface>
```

**Modes:**
- `transparent` - No background (header at top)
- `base` - Solid `bg-[rgb(var(--bg))]` (footer)
- `elevated` - Semi-transparent `bg-[rgb(var(--bg))]/95` with blur (header on scroll)

#### CardSurface

```tsx
import { CardSurface } from '@/platform/ui'

<CardSurface as="div" padding="md" radius="xl" bordered blur="md">
  Card content
</CardSurface>
```

Uses card tokens for glass morphism effect on content cards.

### 3. Guardrails (Prevent Future Regressions)

#### A. Dev-time Runtime Warning

```tsx
// ChromeSurface.tsx
if (process.env.NODE_ENV === 'development') {
  const forbiddenPatterns = ['bg-card', 'bg-white', 'bg-slate-50']
  const hasViolation = forbiddenPatterns.some(p => className?.includes(p))
  
  if (hasViolation) {
    console.warn(
      `[ChromeSurface] FORBIDDEN PATTERN DETECTED: ${className}\n` +
      `Use CardSurface for card-style components instead.`
    )
  }
}
```

#### B. Lint Scripts

**lint:chrome** - Checks chrome surfaces for forbidden card tokens
```bash
npm run lint:chrome
```

**What it checks:**
- Chrome surface files (header/footer/nav)
- Forbidden patterns: `bg-card`, `bg-white`, `bg-slate-50`
- Exits with error if violations found

**Files checked:**
- `src/components/hub/Footer.tsx`
- `src/platform/ui/dribbble/TopMinimalBar.tsx`
- `src/platform/ui/dribbble/GlassHeader.tsx`
- `src/platform/ui/dribbble/GlassFooter.tsx`
- `src/platform/ui/dribbble/ChromeSurface.tsx`
- `app/**/layout.tsx`

**Exceptions:**
- `CardSurface.tsx` (allowed to use card tokens)
- `GlassSurface.tsx` (legacy, deprecated)

**lint:surfaces** - Prevents GlassSurface usage outside UI kit
```bash
npm run lint:surfaces
```

**What it checks:**
- Application code (app/**, src/components/**, src/features/**)
- Forbidden: `GlassSurface` imports and usage
- Enforces: Use ChromeSurface or CardSurface instead

**Allowed:**
- `src/platform/ui/**` (UI kit internals)

#### C. CI Integration

Add to CI pipeline:
```yaml
- name: Lint Chrome Surfaces
  run: npm run lint:chrome

- name: Lint Surface Usage
  run: npm run lint:surfaces
```

## Fix for Tasks D4.4.4 & D4.4.5 (Color Drift Issue)

**Problem:** Tasks D4.4.4 and D4.4.5 incorrectly used `GlassSurface` and `CardSurface` which both use `bg-card/80`. Since `--card: 255 255 255` (white) in both light and dark modes, this created light grey surfaces in dark mode.

**Root Cause:** Card tokens (`--card`) are white-based for glass morphism effect on cards. Using them for small UI elements (badges, toggles) breaks theme coherence.

**Solution:** Use `--bg-2` tokens directly for theme-coherent backgrounds.

### Files Fixed

**app/(hub)/(marketing)/loading.tsx:**
```tsx
// ❌ Before (light grey in dark mode)
<CardSurface as={motion.div} radius="xl" padding="md">
  <SkeletonPulse />
</CardSurface>

// ✅ After (theme-coherent)
<motion.div className="p-6 rounded-2xl bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--border),var(--border-alpha))]">
  <SkeletonPulse />
</motion.div>
```

**app/(hub)/(marketing)/pricing/PricingPageClient.tsx:**
```tsx
// ❌ Before (light grey badges in dark mode)
<CardSurface radius="full" padding="sm">
  <Lock /> <span>Powered by secure billing</span>
</CardSurface>

// ✅ After (theme-coherent)
<div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--border),var(--border-alpha))]">
  <Lock /> <span>Powered by secure billing</span>
</div>

// ❌ Before (light grey toggle in dark mode)
<CardSurface as="button" radius="full" padding="none">
  <span className="toggle-indicator" />
</CardSurface>

// ✅ After (theme-coherent)
<button className="rounded-full bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--accent),0.2)]">
  <span className="toggle-indicator" />
</button>
```

### Design Rule

**Small UI elements (badges, chips, toggles) should use `--bg-2` tokens, NOT card tokens.**

- ✅ `bg-[rgba(var(--bg-2),0.8)]` - Theme-coherent
- ❌ `bg-card/80` - Always light grey (white-based)

**Card tokens are ONLY for large content cards** (DribbbleCard, feature cards, etc.)
- `src/platform/ui/dribbble/GlassFooter.tsx`
- `src/platform/ui/dribbble/ChromeSurface.tsx`
- `app/**/layout.tsx`

**Exceptions:**
- `CardSurface.tsx` (allowed to use card tokens)
- `GlassSurface.tsx` (legacy, deprecated)

#### C. CI Integration

Add to CI pipeline:
```yaml
- name: Lint Chrome Surfaces
  run: npm run lint:chrome
```

## Implementation

### Files Created

1. **src/platform/ui/dribbble/ChromeSurface.tsx**
   - Theme-coherent surface for chrome elements
   - Modes: transparent, base, elevated
   - Dev-time warnings for violations

2. **src/platform/ui/dribbble/CardSurface.tsx**
   - Glass morphism surface for cards
   - Uses card tokens only

3. **scripts/lint-chrome-surfaces.js**
   - Lint script to catch violations
   - Checks chrome surface files
   - Exits with error if violations found

### Files Updated

1. **src/platform/ui/index.ts**
   - Export ChromeSurface and CardSurface

2. **src/components/hub/Footer.tsx**
   - Migrated to ChromeSurface with mode="base"

3. **src/platform/ui/dribbble/TopMinimalBar.tsx**
   - Migrated to ChromeSurface with dynamic mode

4. **package.json**
   - Added `lint:chrome` script
   - Added `glob` dev dependency

5. **.kiro/specs/brolab-entertainment/requirements.md**
   - Added Requirement 33: Theme-Coherent Chrome Surfaces

6. **.kiro/specs/brolab-entertainment/design.md**
   - Added Surface Taxonomy section

7. **docs/theme-coherent-chrome-surfaces.md**
   - This implementation guide

## Verification Checklist

### Visual Checks

- [ ] Light theme: Header transparent at top, light tinted on scroll
- [ ] Light theme: Footer light background
- [ ] Dark theme: Header transparent at top, dark tinted on scroll
- [ ] Dark theme: Footer dark background
- [ ] No light grey overlays in dark mode

### Code Checks

- [ ] `npm run lint:chrome` passes
- [ ] TypeScript compilation passes
- [ ] No `bg-card` usage in chrome components
- [ ] ChromeSurface exports correctly
- [ ] CardSurface exports correctly

### Integration Checks

- [ ] Header scroll behavior works
- [ ] Footer displays correctly on all pages
- [ ] Theme toggle works (light/dark)
- [ ] Mobile menu displays correctly

## Usage Guidelines

### When to Use ChromeSurface

✅ Header / Top bars  
✅ Footer  
✅ Navigation bars  
✅ App chrome elements  

### When to Use CardSurface

✅ Content cards  
✅ Modules  
✅ Overlays  
✅ Floating panels  

### Forbidden Patterns

❌ `bg-card/*` in header/footer  
❌ `GlassSurface` for header/footer  
❌ `bg-white` in chrome surfaces  
❌ `bg-slate-50` in chrome surfaces  
❌ Manual theme toggle with `document.documentElement.classList`  

## Migration Path

### Old Pattern (Broken)

```tsx
// ❌ Creates light grey overlay in dark mode
<header className="bg-card/80 backdrop-blur-sm">
  Header content
</header>

<footer className="bg-card/80">
  Footer content
</footer>
```

### New Pattern (Correct)

```tsx
// ✅ Theme-coherent
<ChromeSurface 
  as="header" 
  mode={isScrolled ? "elevated" : "transparent"}
  blur={isScrolled ? "sm" : "none"}
>
  Header content
</ChromeSurface>

<ChromeSurface as="footer" mode="base" bordered>
  Footer content
</ChromeSurface>
```

## Future Considerations

### Deprecation of GlassSurface

`GlassSurface` is now considered legacy. New code should use:
- `ChromeSurface` for chrome elements
- `CardSurface` for card elements

### Extending ChromeSurface

If additional modes are needed:
- `overlay` - For modal overlays
- `sidebar` - For side navigation

Add to `ChromeSurface` modes enum and `modeStyles` object.

## References

- Requirement 33: Theme-Coherent Chrome Surfaces
- Design Document: Surface Taxonomy section
- Dribbble ELECTRI-X Design Language
- Issue: docs/glass-components-issue.md

## Related Issues

- **D4.4.3 Reverted:** GlassHeader/GlassFooter usage caused color drift
- **Color Drift:** Light grey overlays in dark mode
- **Theme Coherence:** Header/footer must match current theme

## Success Metrics

✅ No visual regressions in light/dark themes  
✅ Lint script catches violations  
✅ Dev warnings prevent misuse  
✅ Documentation updated  
✅ All checks pass  
