# Legacy Components - DO NOT USE

> **Last Updated:** 2026-01-12

## Overview

This document lists deprecated legacy components that should NOT be used in new code. These components exist only for backward compatibility and will be removed in a future version.

## ⚠️ FORBIDDEN IN NEW CODE

The following components are marked as LEGACY and must NOT be used in any new code:

### 1. LEGACY_Button.tsx
- **Status**: DEPRECATED
- **Location**: `src/platform/ui/LEGACY_Button.tsx`
- **Replacement**: Use `PillCTA` from `@/platform/ui`
- **Migration**:
  ```tsx
  // ❌ OLD (DO NOT USE)
  import { Button } from '@/platform/ui'
  <Button variant="primary">Click me</Button>
  
  // ✅ NEW (USE THIS)
  import { PillCTA } from '@/platform/ui'
  <PillCTA variant="primary">Click me</PillCTA>
  ```

### 2. LEGACY_GlassCard.tsx
- **Status**: DEPRECATED
- **Location**: `src/platform/ui/LEGACY_GlassCard.tsx`
- **Replacement**: Use `DribbbleCard` from `@/platform/ui`
- **Migration**:
  ```tsx
  // ❌ OLD (DO NOT USE)
  import { GlassCard } from '@/platform/ui'
  <GlassCard glow>Content</GlassCard>
  
  // ✅ NEW (USE THIS)
  import { DribbbleCard } from '@/platform/ui'
  <DribbbleCard glow>Content</DribbbleCard>
  ```

### 3. LEGACY_OutlineText.tsx
- **Status**: DEPRECATED
- **Location**: `src/platform/ui/LEGACY_OutlineText.tsx`
- **Replacement**: Use `OutlineStackTitle` from `@/platform/ui`
- **Migration**:
  ```tsx
  // ❌ OLD (DO NOT USE)
  import { OutlineText } from '@/platform/ui'
  <OutlineText hero as="h1">Title</OutlineText>
  
  // ✅ NEW (USE THIS)
  import { OutlineStackTitle } from '@/platform/ui'
  <OutlineStackTitle size="hero" as="h1">Title</OutlineStackTitle>
  ```

## Code Review Checklist

When reviewing code, ensure:

- [ ] No new imports of `Button`, `GlassCard`, or `OutlineText` from `@/platform/ui`
- [ ] All new UI components use Dribbble primitives (`PillCTA`, `DribbbleCard`, `OutlineStackTitle`)
- [ ] Existing legacy usage is documented with a migration plan
- [ ] No direct imports from `LEGACY_*.tsx` files

## Existing Usage

All legacy component usage has been migrated. The following files now use Dribbble components:

### app/(hub)/page.tsx
- ✅ **MIGRATED** - Uses `OutlineStackTitle`, `WavyLines`, `OrganicBlob`, `ConstellationDots`, `DribbbleCard`, `PillCTA`, etc.

### app/tenant-demo/page.tsx
- ✅ **MIGRATED** - Uses ELECTRI-X components: `DribbbleCard`, `DribbbleSectionEnter`, `DribbbleStaggerItem`, `EditionBadge`, `CyanOrb`, `MicroInfoModule`, `PillCTA`

### src/components/tenant/*.tsx
- ✅ **MIGRATED** - Uses `next/image` instead of `<img>`, `useTheme()` from `next-themes`

## Removal Timeline

- **Phase 1** (Current): Legacy files renamed with `LEGACY_` prefix, marked as deprecated
- **Phase 2** (Next): Migrate all remaining usage to Dribbble components
- **Phase 3** (Future): Remove legacy files entirely

## Questions?

If you need to use a legacy component for a valid reason, discuss with the team first. In most cases, the Dribbble equivalent should be used instead.
