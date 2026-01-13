# UI Architecture

## Overview

The BroLab Entertainment UI system follows a **single entry point architecture** where all UI components are imported through `@/platform/ui`. This ensures consistency, prevents duplication, and maintains a clear separation between internal implementation and public API.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         @/platform/ui (SINGLE ENTRY POINT)                   │
│                         src/platform/ui/index.ts                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  Re-exports all UI primitives from internal modules                         │
│  This is the ONLY import path for UI components                             │
│                                                                              │
│  Usage: import { DribbbleCard, PillCTA } from '@/platform/ui'               │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ re-exports
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                    INTERNAL IMPLEMENTATION (dribbble/)                       │
│                    src/platform/ui/dribbble/                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Background & Effects                                                 │  │
│  │  • BackgroundMusicPattern.tsx                                         │  │
│  │  • WavyBackground.tsx                                                 │  │
│  │  • WavyLines.tsx                                                      │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Typography                                                           │  │
│  │  • OutlineStackTitle.tsx                                              │  │
│  │  • PixelTitle.tsx                                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Navigation                                                           │  │
│  │  • IconRail.tsx                                                       │  │
│  │  • TopMinimalBar.tsx                                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Buttons                                                              │  │
│  │  • PillCTA.tsx                                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Cards & Modules                                                      │  │
│  │  • DribbbleCard.tsx                                                   │  │
│  │  • GlassChip.tsx                                                      │  │
│  │  • GlassSurface.tsx                                                   │  │
│  │  • MicroModule.tsx                                                    │  │
│  │  • MicroInfoModule.tsx                                                │  │
│  │  • RoleCTACard.tsx                                                    │  │
│  │  • TrustChip.tsx                                                      │  │
│  │  • GlassSkeletonCard.tsx                                              │  │
│  │  • GlassSkeletonPulse.tsx                                             │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Surface Primitives (Theme-Coherent)                                  │  │
│  │  • CardSurface.tsx                                                    │  │
│  │  • ChromeSurface.tsx                                                  │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Decorations (ELECTRI-X style)                                        │  │
│  │  • ConstellationDots.tsx                                              │  │
│  │  • CyanOrb.tsx                                                        │  │
│  │  • EditionBadge.tsx                                                   │  │
│  │  • OrganicBlob.tsx                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Layout                                                               │  │
│  │  • MarketingPageShell.tsx                                             │  │
│  │  • MarketingSection.tsx                                               │  │
│  │  • SectionHeader.tsx                                                  │  │
│  │  • GlassHeader.tsx                                                    │  │
│  │  • GlassFooter.tsx                                                    │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Animation Wrappers                                                   │  │
│  │  • DribbbleSectionEnter.tsx                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Audio Primitives                                                     │  │
│  │  audio/                                                               │  │
│  │    • NowPlayingChip.tsx                                               │  │
│  │    • PlayerPillButton.tsx                                             │  │
│  │    • ProgressRail.tsx                                                 │  │
│  │    • VolumePill.tsx                                                   │  │
│  │    • WaveformPlaceholder.tsx                                          │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Motion Utilities                                                     │  │
│  │  • motion.ts (Dribbble motion patterns)                               │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Internal Exports                                                     │  │
│  │  • index.ts (internal re-exports, NOT used by consumers)              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ consumed by
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CONSUMERS (app/ & components/)                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  App Routes (Direct Consumers)                                        │  │
│  │  app/                                                                 │  │
│  │    • (hub)/HubLandingPageClient.tsx                                   │  │
│  │    • (hub)/(marketing)/pricing/PricingPageClient.tsx                  │  │
│  │    • (hub)/(marketing)/about/AboutPageClient.tsx                      │  │
│  │    • (hub)/(marketing)/contact/ContactPageClient.tsx                  │  │
│  │    • (hub)/(marketing)/layout.tsx                                     │  │
│  │    • (hub)/(marketing)/loading.tsx                                    │  │
│  │    • tenant-demo/page.tsx                                             │  │
│  │                                                                        │  │
│  │  All import from: '@/platform/ui'                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │  Wrapper Components (Composition Layer)                               │  │
│  │  src/components/                                                      │  │
│  │    • hub/Header.tsx                                                   │  │
│  │    • hub/Footer.tsx                                                   │  │
│  │    • tenant/TenantLayout.tsx                                          │  │
│  │    • tenant/LeftRail.tsx                                              │  │
│  │    • tenant/MobileNav.tsx                                             │  │
│  │    • audio/PlayerBar.tsx                                              │  │
│  │                                                                        │  │
│  │  Purpose: Compose primitives with business logic                      │  │
│  │  All import from: '@/platform/ui'                                     │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Architecture Rules

### 1. Single Entry Point (CRITICAL)

**Rule:** ALL UI components MUST be imported through `@/platform/ui`

```typescript
// ✅ CORRECT
import { DribbbleCard, PillCTA, IconRail } from '@/platform/ui'

// ❌ WRONG - Never import directly from dribbble/
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
```

**Why:**
- Prevents import path fragmentation
- Enables easy refactoring of internal structure
- Provides clear public API surface
- Simplifies dependency tracking

### 2. Internal Implementation (dribbble/)

**Rule:** The `dribbble/` directory is INTERNAL ONLY

- Contains all primitive implementations
- Has its own `index.ts` for internal organization
- Should NOT be imported directly by consumers
- Can be refactored without breaking consumers

### 3. Wrapper Components (components/)

**Rule:** `src/components/` contains COMPOSITION ONLY, not primitives

**Purpose:**
- Compose primitives with business logic
- Add application-specific behavior
- Provide domain-specific abstractions

**Examples:**
- `PlayerBar` - Composes audio primitives with playback logic
- `TenantLayout` - Composes IconRail/MobileNav with routing
- `Header` - Composes TopMinimalBar with auth state

**Anti-pattern:**
```typescript
// ❌ WRONG - Don't create new primitives in components/
// src/components/ui/MyButton.tsx
export function MyButton() { ... }

// ✅ CORRECT - Primitives go in platform/ui/dribbble/
// src/platform/ui/dribbble/MyButton.tsx
export function MyButton() { ... }
```

### 4. App Routes (Direct Consumers)

**Rule:** App routes can import directly from `@/platform/ui`

- Pages are leaf nodes in the dependency tree
- Can compose primitives inline
- Should prefer wrapper components for complex compositions

## Import Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Consumer Code (app/ or components/)                            │
│                                                                 │
│  import { DribbbleCard } from '@/platform/ui'                   │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ resolves to
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/platform/ui/index.ts                                       │
│                                                                 │
│  export { DribbbleCard } from './dribbble/DribbbleCard'         │
└─────────────────────────────────────────────────────────────────┘
                            │
                            │ imports from
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  src/platform/ui/dribbble/DribbbleCard.tsx                      │
│                                                                 │
│  export function DribbbleCard() { ... }                         │
└─────────────────────────────────────────────────────────────────┘
```

## Component Categories

### Dribbble UI Kit (Primary)

All components follow the ELECTRI-X design language from the Dribbble reference video.

**Categories:**
1. **Background & Effects** - Visual atmosphere (waves, patterns, blobs)
2. **Typography** - Outline stack, pixel fonts
3. **Navigation** - Icon rail, top bar
4. **Buttons** - Pill CTAs with hover effects
5. **Cards & Modules** - Glass surfaces, micro modules
6. **Surface Primitives** - Theme-coherent base surfaces
7. **Decorations** - Constellation, orbs, badges
8. **Layout** - Page shells, sections, headers
9. **Animation** - Motion wrappers and utilities
10. **Audio** - Player controls and visualizations

### Additional Components

- `PageTransition` - Page transition wrapper
- Legacy motion utilities (complement Dribbble motion)

## Adding New Components

### 1. Create the Component

```typescript
// src/platform/ui/dribbble/MyNewComponent.tsx
export function MyNewComponent() {
  return <div>...</div>
}
```

### 2. Export from index.ts

```typescript
// src/platform/ui/index.ts
export { MyNewComponent } from './dribbble/MyNewComponent'
```

### 3. Use in Consumer Code

```typescript
// app/some-page/page.tsx
import { MyNewComponent } from '@/platform/ui'
```

## Migration from Legacy Components

If you find components NOT following this architecture:

1. **Move to dribbble/** - If it's a primitive
2. **Export from index.ts** - Add to public API
3. **Update imports** - Change to `@/platform/ui`
4. **Mark old location** - Add `@deprecated` comment
5. **Remove after migration** - Delete old file

## Verification

To verify the architecture is being followed:

```bash
# Check for direct dribbble/ imports (should be none in app/ or components/)
grep -r "from.*dribbble" app/ src/components/

# Check for proper @/platform/ui imports
grep -r "from '@/platform/ui'" app/ src/components/
```

## Benefits

1. **Single Source of Truth** - One import path for all UI
2. **Refactoring Safety** - Internal changes don't break consumers
3. **Clear Boundaries** - Primitives vs composition vs pages
4. **Discoverability** - All components visible in one file
5. **Consistency** - Enforces design system usage
6. **Type Safety** - TypeScript resolves through single entry point

## Anti-Patterns to Avoid

❌ **Direct dribbble/ imports**
```typescript
import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
```

❌ **Creating primitives in components/**
```typescript
// src/components/ui/MyPrimitive.tsx
```

❌ **Bypassing the entry point**
```typescript
import { DribbbleCard } from '../../../platform/ui/dribbble/DribbbleCard'
```

❌ **Mixing import paths**
```typescript
import { DribbbleCard } from '@/platform/ui'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA' // Inconsistent!
```

## Related Documentation

- `/docs/dribbble-style-guide.md` - Design language reference
- `/docs/visual-parity-check.md` - Visual QA checklist
- `src/platform/ui/index.ts` - Public API definition
- `src/platform/ui/dribbble/motion.ts` - Motion utilities
