# Architectural Decisions

This document records deviations from the original spec and architectural decisions made during implementation.

## Version Deviations

### Task 1.1: Dependency Version Changes

**Date:** 2026-01-07

**Original Spec Versions:**
- `next@16.1.4`
- `@clerk/nextjs@6.10.3`

**Actual Versions Used:**
- `next@16.1.1`
- `@clerk/nextjs@6.36.5`

**Reason:**
The original spec specified `@clerk/nextjs@6.10.3`, but this version only supports Next.js `^13.5.4 || ^14.0.3 || ^15.0.0` and does not support Next.js 16.x.

To use Next.js 16.x as required by the project, we upgraded to `@clerk/nextjs@6.36.5` which supports `^13.5.7 || ^14.2.25 || ^15.2.3 || ^16`.

Additionally, `@clerk/nextjs@6.36.5` requires `react@^18.0.0 || ~19.0.3 || ~19.1.4 || ~19.2.3 || ~19.3.0-0`, but we're using `react@19.0.0`. This required using `--legacy-peer-deps` during npm install.

**Impact:**
- The Clerk SDK is newer than originally specified, which may include API changes
- The `--legacy-peer-deps` flag is required for npm install
- All Clerk functionality should work as expected with the newer version

**Recommendation:**
Consider updating React to `19.0.3` or later to resolve the peer dependency warning cleanly.

---

## Architectural Boundaries

### Overview

BroLab Entertainment follows a **Micro-SaaS Modular Architecture** with clear separation between Platform Core and Business Modules. This section defines the boundaries and responsibilities of each layer.

### Layer Definitions

#### 1. Frontend (`src/`)

**Location:** `src/`

**Responsibilities:**
- React components (UI rendering)
- Custom hooks (state logic, data fetching)
- Zustand stores (client-side state management)
- Design system primitives (`src/platform/ui/`)
- i18n message files (`src/i18n/messages/`)

**Sub-directories:**
| Directory | Purpose |
|-----------|---------|
| `src/platform/` | Platform Core frontend: auth, tenancy, billing, entitlements, quotas, domains, jobs, observability, i18n, ui |
| `src/modules/` | Business Modules frontend: beats, services |
| `src/components/` | Shared UI components: ui, tenant, hub, audio |
| `src/stores/` | Zustand stores for client-side state |
| `src/lib/` | Utility functions and helpers |
| `src/shared/` | Shared types, constants, license terms |

**Rules:**
- ✅ React components, hooks, stores
- ✅ Client-side logic only
- ✅ Import from `convex/_generated/api` for data fetching
- ❌ NO direct database access
- ❌ NO server-side secrets
- ❌ NO heavy processing (ffmpeg, pdf-lib)

---

#### 2. Convex Backend (`convex/`)

**Location:** `convex/`

**Responsibilities:**
- Database schema definition (`schema.ts`)
- Queries (read-only data fetching)
- Mutations (data modifications)
- Actions (external API calls, side effects)
- HTTP endpoints (`http.ts`)
- File Storage management

**Sub-directories:**
| Directory | Purpose |
|-----------|---------|
| `convex/platform/` | Platform Core backend: users, workspaces, domains, subscriptions, usage, auditLogs, events, jobs, processedEvents |
| `convex/modules/` | Business Modules backend: tracks, services, orders, purchaseEntitlements, bookings |

**Rules:**
- ✅ Schema, queries, mutations, actions
- ✅ Server-side validation and authorization
- ✅ Access control via `getWorkspacePlan`, `assertEntitlement`, `assertQuota`
- ✅ File Storage upload URL generation
- ❌ NO heavy CPU processing (use Worker instead)
- ❌ NO long-running tasks (use Job queue instead)
- ❌ NO client-side code

**Authorization Pattern:**
```typescript
// ALWAYS verify server-side, never trust client
const identity = await ctx.auth.getUserIdentity();
if (!identity) throw new Error("Not authenticated");

await assertEntitlement(workspaceId, "customDomain");
await assertQuota(workspaceId, "tracks");
```

---

#### 3. Worker (`worker/`)

**Location:** `worker/`

**Responsibilities:**
- Background job processing
- Heavy CPU tasks (ffmpeg audio processing)
- PDF generation (pdf-lib)
- Long-running operations
- Job queue polling and execution

**Files:**
| File | Purpose |
|------|---------|
| `worker/index.ts` | Main job runner entry point |
| `worker/tsconfig.json` | TypeScript configuration for worker |

**Job Types:**
| Job Type | Description |
|----------|-------------|
| `preview_generation` | Extract 30s mp3 preview from full audio using ffmpeg |
| `license_pdf_generation` | Generate license PDF using pdf-lib |
| `waveform_generation` | (Future) Generate audio waveform |
| `loudness_analysis` | (Future) Analyze audio loudness |

**Rules:**
- ✅ Heavy CPU processing (ffmpeg, pdf-lib)
- ✅ Poll Convex jobs table for pending jobs
- ✅ Lock jobs before processing (`lockedAt`, `lockedBy`)
- ✅ Upload results to Convex Storage
- ✅ Update job status (processing → completed/failed)
- ❌ NO direct client interaction
- ❌ NO HTTP endpoints (use Convex for API)

**Job Processing Pattern:**
```typescript
// 1. Poll for pending jobs
// 2. Lock job (lockedAt, lockedBy)
// 3. Process (ffmpeg, pdf-lib)
// 4. Upload result to Convex Storage
// 5. Update job status + record event
// 6. Handle failures (increment attempts, record error)
```

**Build & Run:**
```bash
npm run build:worker  # tsc -p worker/tsconfig.json
npm run worker        # node dist/worker/index.js
```

---

#### 4. Shared (`src/shared/`)

**Location:** `src/shared/`

**Responsibilities:**
- TypeScript types and interfaces
- Constants and configuration
- License terms definitions
- Shared utilities used by multiple layers

**Sub-directories:**
| Directory | Purpose |
|-----------|---------|
| `src/shared/types/` | TypeScript type definitions |
| `src/shared/constants/` | Application constants |
| `src/shared/licenses/` | License terms JSON and helpers |

**Rules:**
- ✅ Types, interfaces, constants
- ✅ Pure functions (no side effects)
- ✅ Importable by Frontend, Convex, and Worker
- ❌ NO React components
- ❌ NO database access
- ❌ NO external API calls

---

### Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                           USER BROWSER                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      FRONTEND (src/)                                 │
│  • React components render UI                                        │
│  • Hooks call Convex queries/mutations                              │
│  • Zustand stores manage client state                               │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                    useQuery / useMutation
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      CONVEX (convex/)                                │
│  • Queries return data (real-time subscriptions)                    │
│  • Mutations modify data + enqueue jobs                             │
│  • Actions call external APIs (Stripe, Clerk)                       │
│  • HTTP endpoints for webhooks                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                          enqueueJob()
                                    ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      WORKER (worker/)                                │
│  • Polls jobs table for pending jobs                                │
│  • Processes heavy tasks (ffmpeg, pdf-lib)                          │
│  • Uploads results to Convex Storage                                │
│  • Updates job status                                                │
└─────────────────────────────────────────────────────────────────────┘
```

---

### Import Rules

| From → To | Allowed? | Notes |
|-----------|----------|-------|
| Frontend → Convex API | ✅ | Via `convex/_generated/api` |
| Frontend → Shared | ✅ | Types, constants |
| Convex → Shared | ✅ | Types, constants |
| Worker → Convex API | ✅ | Via HTTP or SDK |
| Worker → Shared | ✅ | Types, constants |
| Convex → Frontend | ❌ | Never import React in Convex |
| Worker → Frontend | ❌ | Never import React in Worker |

---

### Decision Record

**Date:** 2026-01-07

**Decision:** Establish clear architectural boundaries between Frontend, Convex, Worker, and Shared layers.

**Rationale:**
1. **Separation of Concerns:** Each layer has distinct responsibilities
2. **Scalability:** Worker can scale independently for heavy processing
3. **Security:** Server-side authorization in Convex, no secrets in Frontend
4. **Maintainability:** Clear boundaries make code easier to understand and modify
5. **Testability:** Each layer can be tested independently

**Consequences:**
- Heavy processing (ffmpeg, pdf-lib) MUST go through Worker
- All authorization MUST be enforced in Convex (never trust client)
- Shared code MUST be pure (no side effects, no external dependencies)

---

## Theme Management

### Task 3.7: next-themes Integration

**Date:** 2026-01-12

**Decision:** Use `next-themes` library for theme management instead of manual localStorage/classList manipulation.

**Actions Taken:**
1. Installed `next-themes@0.4.4` (exact version)
2. Created `ThemeProvider` wrapper in `src/components/ThemeProvider.tsx`
3. Added `ThemeProvider` to root layout with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`
4. Added `suppressHydrationWarning` on `<html>` element
5. Refactored theme toggles in `Header.tsx` and `TenantLayout.tsx` to use `useTheme()` hook

**Rationale:**
- **SSR-safe:** Prevents hydration mismatch issues
- **System preference:** Automatically respects `prefers-color-scheme`
- **Persistence:** Handles localStorage automatically
- **Simplicity:** Single hook `useTheme()` replaces manual state management

**Code Pattern:**
```tsx
// Before (manual)
const [isDark, setIsDark] = useState(false)
const toggleTheme = () => {
  document.documentElement.classList.toggle('dark')
  localStorage.setItem('theme', ...)
}

// After (next-themes)
const { theme, setTheme } = useTheme()
const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark')
```

---

## Image Optimization

### ESLint Fix: next/image Usage

**Date:** 2026-01-12

**Decision:** Replace all `<img>` elements with `<Image>` from `next/image` to comply with `@next/next/no-img-element` rule.

**Files Fixed:**
- `src/components/tenant/LeftRail.tsx`
- `src/components/tenant/TenantLayout.tsx`

**Code Pattern:**
```tsx
// Before
<img src={workspaceLogo} alt="..." className="w-10 h-10 rounded-xl object-cover" />

// After
import Image from 'next/image'
<Image src={workspaceLogo} alt="..." width={40} height={40} className="rounded-xl object-cover" />
```

**Rationale:**
- **Performance:** Automatic image optimization, lazy loading, responsive images
- **LCP:** Improved Largest Contentful Paint scores
- **Bandwidth:** Automatic format conversion (WebP/AVIF)

---

## ESLint Rules

### Task D4.6.1: Glass Styles Restriction

**Date:** 2026-01-13

**Decision:** Add ESLint rule to forbid glass styles outside of `src/platform/ui/`.

**Actions Taken:**
1. Added `no-restricted-syntax` rule in `eslint.config.mjs` to forbid:
   - `className="glass"` or `className` containing `glass`
   - `backdrop-blur` in className
   - `border-[rgba(var(--border)` in className

2. Added override to allow these patterns in `src/platform/ui/` (design system primitives)

3. Rule detects violations in:
   - JSX string literals: `className="glass"`
   - Template literals: `className={\`glass ${other}\`}`

**Rationale:**
- **Design System Enforcement:** Glass styles should only be defined in design system primitives
- **Consistency:** All glass effects should come from `GlassSurface`, `DribbbleCard`, or other Dribbble components
- **Maintainability:** Centralizing glass styles makes it easier to update the design system
- **Code Quality:** Prevents scattered glass implementations across the codebase

**Error Messages:**
```
Direct 'glass' className is forbidden outside src/platform/ui/. 
Use GlassSurface or DribbbleCard components instead.

Direct 'backdrop-blur' is forbidden outside src/platform/ui/. 
Use GlassSurface or DribbbleCard components instead.

Direct 'border-[rgba(var(--border)' is forbidden outside src/platform/ui/. 
Use GlassSurface or DribbbleCard components instead.
```

**Current Violations:**
As of 2026-01-13, the rule detected 18 violations in:
- `app/(hub)/(marketing)/loading.tsx` (2 violations)
- `app/(hub)/(marketing)/pricing/PricingPageClient.tsx` (8 violations)
- `app/(hub)/HubLandingPageClient.tsx` (1 violation)
- `src/components/audio/PlayerBar.tsx` (6 violations)
- `src/components/tenant/MobileNav.tsx` (2 violations)

**Next Steps:**
These violations should be fixed by:
1. Extracting glass styles into reusable components in `src/platform/ui/dribbble/`
2. Replacing direct glass className usage with component imports
3. Following the Dribbble design system patterns

**Code Review Rules:**
- ❌ REJECT: New code with `className="glass"` outside `src/platform/ui/`
- ❌ REJECT: New code with `backdrop-blur` outside `src/platform/ui/`
- ❌ REJECT: New code with `border-[rgba(var(--border)` outside `src/platform/ui/`
- ✅ ACCEPT: Usage of `GlassSurface`, `DribbbleCard`, or other Dribbble components
- ✅ ACCEPT: New glass components in `src/platform/ui/dribbble/`

**Configuration:**
```javascript
// eslint.config.mjs
{
  rules: {
    "no-restricted-syntax": [
      "error",
      {
        selector: "JSXAttribute[name.name='className'] Literal[value=/glass/]",
        message: "Direct 'glass' className is forbidden outside src/platform/ui/. Use GlassSurface or DribbbleCard components instead.",
      },
      // ... additional selectors for backdrop-blur and border patterns
    ],
  },
}

// Override for src/platform/ui/
{
  files: ["src/platform/ui/**/*.{ts,tsx}"],
  rules: {
    "no-restricted-syntax": "off",
  },
}
```

**Verification:**
```bash
npm run lint  # Will show violations outside src/platform/ui/
```

---

## UI Architecture Rules

### Overview

**Date:** 2026-01-13

**Decision:** Establish strict UI architecture rules to enforce the Dribbble design system and prevent style fragmentation.

These rules ensure:
1. **Single Import Point:** All UI components come from `@/platform/ui`
2. **No Styles Outside Kit:** Glass, glow, and motion styles only in design system
3. **GlassSurface as Primitive:** All glass effects use `GlassSurface` or Dribbble components
4. **Motion Centralization:** All animations use utilities from `@/platform/ui/motion` or `@/platform/ui/dribbble/motion`

---

### Rule 1: Single Import Point

**Rule:** All UI components MUST be imported from `@/platform/ui`.

**Rationale:**
- **Centralized Exports:** Single source of truth for all UI components
- **Easy Refactoring:** Change implementation without updating imports across codebase
- **Clear API:** Developers know exactly where to import from
- **Version Control:** Easy to track what components are available

**Correct Pattern:**
```tsx
// ✅ CORRECT - Import from @/platform/ui
import { 
  PillCTA, 
  DribbbleCard, 
  OutlineStackTitle,
  GlassSurface,
  IconRail 
} from '@/platform/ui'
```

**Incorrect Patterns:**
```tsx
// ❌ WRONG - Direct import from dribbble/
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'

// ❌ WRONG - Import from nested path
import { DribbbleCard } from '@/platform/ui/dribbble'

// ❌ WRONG - Import from legacy files
import { Button } from '@/platform/ui/LEGACY_Button'
```

**Enforcement:**
- Code review checklist: Verify all UI imports come from `@/platform/ui`
- ESLint rule (future): Restrict imports to `@/platform/ui` only

---

### Rule 2: No Styles Outside Kit

**Rule:** Glass, glow, backdrop-blur, and border styles MUST NOT be defined outside `src/platform/ui/`.

**Rationale:**
- **Design System Consistency:** All visual effects come from design system primitives
- **Maintainability:** Centralized styles are easier to update
- **Prevents Drift:** Stops developers from creating one-off glass implementations
- **Code Quality:** Reduces duplication and inconsistency

**Correct Pattern:**
```tsx
// ✅ CORRECT - Use design system components
import { GlassSurface, DribbbleCard } from '@/platform/ui'

function MyComponent() {
  return (
    <GlassSurface>
      <DribbbleCard>
        Content with glass effect
      </DribbbleCard>
    </GlassSurface>
  )
}
```

**Incorrect Patterns:**
```tsx
// ❌ WRONG - Direct glass className
<div className="glass">Content</div>

// ❌ WRONG - Direct backdrop-blur
<div className="backdrop-blur-xl bg-card/80">Content</div>

// ❌ WRONG - Direct border with CSS variables
<div className="border border-[rgba(var(--border),0.1)]">Content</div>

// ❌ WRONG - Inline glass styles
<div style={{ backdropFilter: 'blur(12px)', background: 'rgba(...)' }}>
  Content
</div>
```

**Enforcement:**
- ESLint rule: `no-restricted-syntax` forbids `glass`, `backdrop-blur`, and `border-[rgba(var(--border)` outside `src/platform/ui/`
- Code review: Reject PRs with direct glass/blur styles
- Verification: `npm run lint` shows violations

**Current Violations (as of 2026-01-13):**
- 18 violations detected across 5 files
- See "ESLint Rules > Task D4.6.1" section for details
- These should be fixed by extracting into reusable components

---

### Rule 3: GlassSurface as Primitive

**Rule:** All glass effects MUST use `GlassSurface` component or Dribbble components that wrap it.

**Rationale:**
- **Single Source of Truth:** One component defines glass styling
- **Consistent Behavior:** All glass effects look and behave the same
- **Easy Updates:** Change glass effect globally by updating one component
- **Composability:** GlassSurface can be composed with other primitives

**GlassSurface API:**
```tsx
interface GlassSurfaceProps {
  children: React.ReactNode
  className?: string
  glow?: boolean // Optional glow effect
  intensity?: 'light' | 'medium' | 'heavy' // Blur intensity
}
```

**Correct Patterns:**
```tsx
// ✅ CORRECT - Direct GlassSurface usage
import { GlassSurface } from '@/platform/ui'

<GlassSurface glow>
  <h2>Title</h2>
  <p>Content</p>
</GlassSurface>

// ✅ CORRECT - Dribbble components (wrap GlassSurface internally)
import { DribbbleCard, TopMinimalBar } from '@/platform/ui'

<DribbbleCard>Content</DribbbleCard>
<TopMinimalBar>Navigation</TopMinimalBar>

// ✅ CORRECT - Compose with other primitives
<GlassSurface className="p-6 rounded-2xl">
  <OutlineStackTitle>TITLE</OutlineStackTitle>
</GlassSurface>
```

**Incorrect Patterns:**
```tsx
// ❌ WRONG - Recreating glass effect manually
<div className="backdrop-blur-xl bg-card/80 border border-border/10">
  Content
</div>

// ❌ WRONG - Partial glass implementation
<div className="glass border-none">Content</div>

// ❌ WRONG - Custom glass variant
<div className="backdrop-blur-sm bg-white/5">Content</div>
```

**Component Hierarchy:**
```
GlassSurface (primitive)
  ├── DribbbleCard (wraps GlassSurface + hover effects)
  ├── TopMinimalBar (wraps GlassSurface + layout)
  ├── MicroModule (wraps GlassSurface + compact layout)
  └── Custom components (should wrap GlassSurface)
```

**When to Create New Components:**
If you need a glass effect with specific layout/behavior:
1. Create component in `src/platform/ui/dribbble/`
2. Wrap `GlassSurface` internally
3. Add layout/behavior on top
4. Export from `src/platform/ui/index.ts`

**Example:**
```tsx
// src/platform/ui/dribbble/MyGlassComponent.tsx
import { GlassSurface } from './GlassSurface'

export function MyGlassComponent({ children }: { children: React.ReactNode }) {
  return (
    <GlassSurface glow className="p-8 rounded-3xl">
      <div className="flex items-center gap-4">
        {children}
      </div>
    </GlassSurface>
  )
}
```

---

### Rule 4: Motion Centralization

**Rule:** All animations MUST use utilities from `@/platform/ui/motion` or `@/platform/ui/dribbble/motion`.

**Rationale:**
- **Consistent Timing:** All animations use same easing and duration
- **Reduced Motion Support:** Centralized utilities respect `prefers-reduced-motion`
- **Reusability:** Common animation patterns defined once
- **Performance:** Optimized animation configurations

**Motion Utilities:**

**From `@/platform/ui/motion`:**
```typescript
// Page transitions
export const pageEnter = {
  initial: { opacity: 0, y: 12, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
  transition: { duration: 0.35, ease: 'easeOut' }
}

// Stagger animations
export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.05 } }
}

// Hero float
export const heroFloat = {
  y: [-10, 10, -10],
  transition: { duration: 8, repeat: Infinity, ease: 'easeInOut' }
}

// Reduced motion hook
export function useReducedMotion(): boolean
```

**From `@/platform/ui/dribbble/motion`:**
```typescript
// Dribbble-specific animations
export const dribbblePageEnter = { /* ... */ }
export const dribbbleStaggerContainer = { /* ... */ }
export const dribbbleScrollReveal = { /* ... */ }
export const dribbbleHoverLift = { /* ... */ }
export const dribbbleHoverGlow = { /* ... */ }
export const dribbbleHeroFloat = { /* ... */ }
export const dribbbleBlobFloat = { /* ... */ }
```

**Correct Patterns:**
```tsx
// ✅ CORRECT - Use motion utilities
import { motion } from 'framer-motion'
import { pageEnter, staggerContainer } from '@/platform/ui/motion'

<motion.div {...pageEnter}>
  <motion.div {...staggerContainer}>
    {items.map((item) => (
      <motion.div key={item.id} variants={staggerChild}>
        {item.content}
      </motion.div>
    ))}
  </motion.div>
</motion.div>

// ✅ CORRECT - Use Dribbble motion utilities
import { dribbbleHoverLift } from '@/platform/ui/dribbble/motion'

<motion.button whileHover={dribbbleHoverLift}>
  Click me
</motion.button>

// ✅ CORRECT - Respect reduced motion
import { useReducedMotion } from '@/platform/ui/motion'

const shouldAnimate = !useReducedMotion()
<motion.div animate={shouldAnimate ? { opacity: 1 } : {}}>
  Content
</motion.div>
```

**Incorrect Patterns:**
```tsx
// ❌ WRONG - Inline animation config
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>

// ❌ WRONG - Custom timing without reduced motion support
<motion.div
  animate={{ scale: [1, 1.1, 1] }}
  transition={{ duration: 2, repeat: Infinity }}
>
  Content
</motion.div>

// ❌ WRONG - Hardcoded easing
<motion.div
  animate={{ x: 100 }}
  transition={{ ease: [0.6, 0.01, -0.05, 0.95] }}
>
  Content
</motion.div>
```

**When to Add New Motion Utilities:**
If you need a new animation pattern:
1. Add to `src/platform/ui/motion.ts` (generic) or `src/platform/ui/dribbble/motion.ts` (Dribbble-specific)
2. Include reduced motion fallback
3. Document the use case
4. Export from `@/platform/ui/index.ts`

**Example:**
```typescript
// src/platform/ui/dribbble/motion.ts
export const dribbbleCardHover = {
  scale: 1.02,
  y: -4,
  transition: { duration: 0.2, ease: 'easeOut' }
}

export const dribbbleCardHoverReducedMotion = {
  scale: 1.01,
  transition: { duration: 0.1 }
}
```

---

### Violation Examples

**Example 1: Direct Glass Styles**
```tsx
// ❌ VIOLATION
function MyCard() {
  return (
    <div className="backdrop-blur-xl bg-card/80 border border-border/10 rounded-2xl p-6">
      Content
    </div>
  )
}

// ✅ FIX
import { DribbbleCard } from '@/platform/ui'

function MyCard() {
  return (
    <DribbbleCard>
      Content
    </DribbbleCard>
  )
}
```

**Example 2: Inline Animations**
```tsx
// ❌ VIOLATION
function MyComponent() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      Content
    </motion.div>
  )
}

// ✅ FIX
import { motion } from 'framer-motion'
import { pageEnter } from '@/platform/ui/motion'

function MyComponent() {
  return (
    <motion.div {...pageEnter}>
      Content
    </motion.div>
  )
}
```

**Example 3: Direct Import from Nested Path**
```tsx
// ❌ VIOLATION
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { DribbbleCard } from '@/platform/ui/dribbble'

// ✅ FIX
import { PillCTA, DribbbleCard } from '@/platform/ui'
```

**Example 4: Custom Glass Implementation**
```tsx
// ❌ VIOLATION
function GlassBox({ children }: { children: React.ReactNode }) {
  return (
    <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 rounded-xl">
      {children}
    </div>
  )
}

// ✅ FIX - Use GlassSurface
import { GlassSurface } from '@/platform/ui'

function GlassBox({ children }: { children: React.ReactNode }) {
  return (
    <GlassSurface className="rounded-xl">
      {children}
    </GlassSurface>
  )
}

// ✅ BETTER - Create reusable component in design system
// src/platform/ui/dribbble/GlassBox.tsx
import { GlassSurface } from './GlassSurface'

export function GlassBox({ children }: { children: React.ReactNode }) {
  return (
    <GlassSurface className="rounded-xl p-4">
      {children}
    </GlassSurface>
  )
}
```

---

### Code Review Checklist

When reviewing UI code, verify:

**Imports:**
- [ ] All UI components imported from `@/platform/ui` (not nested paths)
- [ ] No imports from `LEGACY_*.tsx` files
- [ ] No direct imports from `src/platform/ui/dribbble/*`

**Styles:**
- [ ] No `className="glass"` outside `src/platform/ui/`
- [ ] No `backdrop-blur` outside `src/platform/ui/`
- [ ] No `border-[rgba(var(--border)` outside `src/platform/ui/`
- [ ] No inline glass/blur styles

**Components:**
- [ ] Glass effects use `GlassSurface` or Dribbble components
- [ ] No custom glass implementations
- [ ] New glass components created in `src/platform/ui/dribbble/` if needed

**Animations:**
- [ ] Animations use utilities from `@/platform/ui/motion` or `@/platform/ui/dribbble/motion`
- [ ] No inline animation configs
- [ ] Reduced motion support included
- [ ] New animation patterns added to motion utilities if needed

**General:**
- [ ] Follows Dribbble design system patterns
- [ ] No SaaS-generic styling
- [ ] Consistent with existing components

---

### Enforcement

**Automated:**
- ESLint rule: `no-restricted-syntax` forbids glass/blur styles outside `src/platform/ui/`
- TypeScript: Strict imports ensure type safety
- Build: Fails if imports are broken

**Manual:**
- Code review: Use checklist above
- PR template: Include UI architecture verification
- Documentation: Reference this section in PR reviews

**Verification Commands:**
```bash
npm run lint              # Check for style violations
npm run typecheck         # Verify imports are valid
npm run build             # Ensure no broken imports
```

---

### Migration Guide

**If you find violations:**

1. **Identify the pattern:**
   - Direct glass styles → Use `GlassSurface` or `DribbbleCard`
   - Inline animations → Use motion utilities
   - Direct imports → Import from `@/platform/ui`

2. **Check if component exists:**
   - Search `src/platform/ui/dribbble/` for similar component
   - Check `src/platform/ui/index.ts` exports

3. **Use existing component OR create new one:**
   - If exists: Replace with import from `@/platform/ui`
   - If not: Create in `src/platform/ui/dribbble/`, export from `index.ts`

4. **Test the change:**
   - Visual: Verify appearance matches original
   - Functional: Verify behavior works
   - Responsive: Test all breakpoints
   - Motion: Test with reduced motion enabled

5. **Update imports:**
   - Replace all instances in the file
   - Run `npm run lint` to verify
   - Run `npm run typecheck` to verify

**Example Migration:**
```tsx
// BEFORE
function PricingCard() {
  return (
    <motion.div
      className="backdrop-blur-xl bg-card/80 border border-border/10 rounded-2xl p-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02, y: -4 }}
    >
      <h3>Pro Plan</h3>
      <p>$29.99/month</p>
    </motion.div>
  )
}

// AFTER
import { motion } from 'framer-motion'
import { DribbbleCard } from '@/platform/ui'
import { pageEnter, dribbbleHoverLift } from '@/platform/ui/motion'

function PricingCard() {
  return (
    <motion.div {...pageEnter} whileHover={dribbbleHoverLift}>
      <DribbbleCard>
        <h3>Pro Plan</h3>
        <p>$29.99/month</p>
      </DribbbleCard>
    </motion.div>
  )
}
```

---

### Benefits

**For Developers:**
- ✅ Clear rules: Know exactly where to import from
- ✅ Less decisions: Use existing components instead of creating new ones
- ✅ Faster development: Reuse design system primitives
- ✅ Better IDE support: Single import point improves autocomplete

**For Codebase:**
- ✅ Consistency: All UI follows same patterns
- ✅ Maintainability: Centralized styles are easier to update
- ✅ Less duplication: Reuse instead of recreate
- ✅ Better quality: Enforced through linting and code review

**For Design System:**
- ✅ Single source of truth: All components in one place
- ✅ Easy evolution: Update primitives without touching app code
- ✅ Clear API: Developers know what's available
- ✅ Documentation: One place to document all components

---

## Future Decisions

_Document any additional deviations or architectural decisions here._


---

## UI Component Cleanup

### Task D1.5.2: Legacy Component Deprecation

**Date:** 2026-01-08

**Decision:** Rename legacy UI components with `LEGACY_` prefix and forbid new usage.

**Actions Taken:**
1. Renamed legacy wrapper components:
   - `Button.tsx` → `LEGACY_Button.tsx`
   - `GlassCard.tsx` → `LEGACY_GlassCard.tsx`
   - `OutlineText.tsx` → `LEGACY_OutlineText.tsx`

2. Updated exports in `src/platform/ui/index.ts` to:
   - Export from renamed `LEGACY_*.tsx` files
   - Added warning: "⚠️ LEGACY FILE - DO NOT USE IN NEW CODE"
   - Maintained backward compatibility

3. Deleted truly unused files:
   - `src/components/ui/` (empty directory)

4. Created documentation:
   - `docs/legacy-components.md` - Migration guide and code review checklist
   - `docs/cleanup-summary.md` - Detailed cleanup summary

**Rationale:**
- **Dribbble Design System First:** All new code must use Dribbble primitives (`PillCTA`, `DribbbleCard`, `OutlineStackTitle`)
- **Clear Deprecation:** `LEGACY_` prefix makes it obvious these components should not be used
- **Backward Compatibility:** Existing code continues to work while we plan migration
- **Code Review Enforcement:** Clear documentation makes it easy to reject PRs using legacy components

**Files Kept:**
- `PageTransition.tsx` - Still valid, no Dribbble replacement
- `src/components/hub/*` - Actively used in hub layout (already using Dribbble components)
- `app/tenant-demo/page.tsx` - ✅ Migrated to ELECTRI-X components

**Code Review Rules:**
- ❌ REJECT: New imports of `Button`, `GlassCard`, or `OutlineText` from `@/platform/ui`
- ❌ REJECT: Direct imports from `LEGACY_*.tsx` files
- ❌ REJECT: New UI components not following Dribbble design system
- ✅ ACCEPT: Migration of existing code from legacy to Dribbble components

**Migration Timeline:**
- **Phase 1** (Current): Legacy files renamed, marked as deprecated
- **Phase 2** (Next): Migrate remaining usage to Dribbble components
- **Phase 3** (Future): Remove legacy files entirely

**Impact:**
- No breaking changes - all exports maintained
- Improved developer experience - clear deprecation warnings in IDE
- Improved codebase health - legacy code clearly marked
- Easier future maintenance - clear path to remove legacy code

**Verification:**
- ✅ TypeScript compilation passes
- ✅ All exports maintained for backward compatibility
- ✅ No broken imports
- ✅ Legacy components clearly marked

**References:**
- See `docs/legacy-components.md` for migration guide
- See `docs/cleanup-summary.md` for detailed cleanup actions
- See `docs/dribbble-style-guide.md` for Dribbble design system reference

---

## Convex Backend Configuration

### Task 4.1: Convex Project Initialization

**Date:** 2026-01-26

**Decision:** Initialize Convex backend with proper configuration for Clerk authentication and HTTP endpoints.

**Actions Taken:**
1. Created `convex.json` configuration file with external packages:
   - `stripe` - For Stripe Connect integration
   - `pdf-lib` - For license PDF generation
   - `resend` - For transactional emails

2. Created `convex/auth.config.ts` for Clerk JWT validation:
   - Domain: `process.env.CLERK_JWT_ISSUER_DOMAIN`
   - Application ID: `convex` (must match Clerk JWT template name)

3. Implemented `convex/http.ts` with HTTP endpoints:
   - `GET /health` - Health check endpoint
   - `POST /api/domains/resolve` - Domain resolution for proxy.ts (Phase 6)
   - `POST /api/stripe/webhook` - Stripe webhook handler (Phase 9)

4. Created `convex/README.md` with:
   - Directory structure documentation
   - Development commands
   - Environment variables reference
   - HTTP endpoints documentation
   - Authentication setup guide

5. Updated `.env.example` with all required Convex variables:
   - `NEXT_PUBLIC_CONVEX_URL` - Convex deployment URL
   - `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer for auth
   - `CONVEX_DEPLOYMENT` - Convex deployment identifier

**Rationale:**
- **Clerk Integration:** Convex validates Clerk JWT tokens for authenticated requests
- **HTTP Endpoints:** Provides external API access for webhooks and domain resolution
- **External Packages:** Allows using Node.js packages (Stripe, pdf-lib, Resend) in Convex actions
- **Documentation:** Clear setup guide for developers

**Environment Variables:**
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
CONVEX_DEPLOYMENT=dev:your-deployment-name
```

**Clerk JWT Template:**
- **CRITICAL:** The JWT template in Clerk Dashboard MUST be named `convex` (do not rename)
- This name must match the `applicationID` in `auth.config.ts`
- Template should be created using the "Convex" preset in Clerk Dashboard

**HTTP Endpoints:**
All HTTP endpoints are accessible at:
```
https://your-deployment.convex.cloud/endpoint-path
```

Current endpoints:
- `GET /health` - Returns `{ status: "ok", timestamp: number }`
- `POST /api/domains/resolve` - Accepts `{ hostname: string }`, returns `{ slug: string | null }`
- `POST /api/stripe/webhook` - Stripe webhook handler (placeholder for Phase 9)

**Development Workflow:**
```bash
# Start Convex dev server (watches for changes)
npx convex dev

# Deploy to production
npx convex deploy

# Open Convex dashboard
npx convex dashboard
```

**Next Steps:**
- **Phase 4 (Task 4.2)**: Implement full database schema in `convex/schema.ts`
- **Phase 4 (Task 4.3-4.7)**: Implement platform core helpers (users, workspaces, billing, jobs)
- **Phase 5 (Task 5.4)**: Create `ConvexClientProvider` with Clerk integration in Next.js
- **Phase 6 (Task 6.3)**: Implement domain resolution logic in `/api/domains/resolve`
- **Phase 9 (Task 9.4)**: Implement Stripe webhook handler in `/api/stripe/webhook`

**Verification:**
- ✅ TypeScript compilation passes (`npm run typecheck`)
- ✅ `convex.json` exists with external packages configuration
- ✅ `convex/auth.config.ts` exists with Clerk domain configuration
- ✅ `convex/http.ts` implements health check and placeholder endpoints
- ✅ `convex/README.md` documents setup and usage
- ✅ `.env.example` includes all Convex variables

**References:**
- Convex Documentation: https://docs.convex.dev
- Convex + Clerk Integration: https://docs.convex.dev/auth/clerk
- Convex HTTP Endpoints: https://docs.convex.dev/functions/http-actions

---


---

## Convex Backend Configuration

### Task 4.1: Convex Project Initialization

**Date:** 2026-01-26

**Decision:** Initialize Convex backend with external packages and HTTP endpoints.

**Actions Taken:**
1. Created `convex.json` with external packages configuration:
   - `stripe@17.5.0` - For Stripe Connect webhooks and checkout
   - `pdf-lib@1.17.1` - For license PDF generation in actions
   - `resend@4.1.2` - For transactional emails

2. Created `convex/auth.config.ts` for Clerk JWT validation:
   - Domain: `process.env.CLERK_JWT_ISSUER_DOMAIN`
   - Application ID: `convex` (MUST match JWT template name in Clerk Dashboard)

3. Implemented `convex/http.ts` with three HTTP endpoints:
   - `GET /health` - Health check endpoint (returns 200 OK)
   - `POST /api/domains/resolve` - Domain resolution (placeholder for Phase 6)
   - `POST /api/stripe/webhook` - Stripe webhook handler (placeholder for Phase 9)

4. Created `convex/README.md` with comprehensive documentation

5. Updated `.env.example` with required Convex environment variables

**Environment Variables:**
```env
# Convex
NEXT_PUBLIC_CONVEX_URL=https://famous-starling-265.convex.cloud
CONVEX_DEPLOYMENT=dev:famous-starling-265

# Clerk (for Convex auth)
CLERK_JWT_ISSUER_DOMAIN=https://natural-rattler-88.clerk.accounts.dev
```

**Rationale:**
- **External Packages:** Allows Convex actions to use Stripe, pdf-lib, and Resend
- **Auth Config:** Enables Clerk JWT validation in Convex functions
- **HTTP Endpoints:** Provides webhook handlers and domain resolution API
- **Documentation:** Ensures clear understanding of Convex setup

**Verification:**
- TypeScript compilation passes (`npm run typecheck`)
- Production build succeeds (`npm run build`)
- All 11 routes compile successfully

---

### Task 4.2: Convex Schema Implementation

**Date:** 2026-01-26

**Decision:** Implement complete Convex schema with all platform and module tables.

**Schema Structure:**

#### Platform Tables (9 tables)
1. **users** - User profiles with Clerk integration
   - Indexes: `by_clerk_id`
   - Fields: `clerkUserId`, `role`, `createdAt`

2. **workspaces** - Provider workspaces (storefronts)
   - Indexes: `by_slug`, `by_owner`
   - Fields: `slug`, `name`, `type`, `ownerClerkUserId`, `stripeAccountId`, `paymentsStatus`, `createdAt`

3. **domains** - Custom domain management
   - Indexes: `by_workspace`, `by_hostname`
   - Fields: `workspaceId`, `hostname`, `status`, `createdAt`

4. **providerSubscriptions** - Clerk Billing subscriptions
   - Indexes: `by_workspace`, `by_clerk_user`
   - Fields: `workspaceId`, `clerkUserId`, `planKey`, `status`, `updatedAt`

5. **usage** - Workspace usage tracking
   - Indexes: `by_workspace`
   - Fields: `workspaceId`, `storageUsedBytes`, `publishedTracksCount`, `updatedAt`

6. **auditLogs** - Provider admin action logs
   - Indexes: `by_workspace`
   - Fields: `workspaceId`, `actorClerkUserId`, `action`, `entityType`, `entityId`, `meta`, `createdAt`

7. **events** - Lifecycle events
   - Indexes: `by_workspace`
   - Fields: `workspaceId`, `type`, `meta`, `createdAt`

8. **jobs** - Background job queue
   - Indexes: `by_workspace`, `by_status`, `by_status_createdAt`
   - Fields: `workspaceId`, `type`, `status`, `payload`, `attempts`, `error`, `lockedAt`, `lockedBy`, `createdAt`, `updatedAt`

9. **processedEvents** - Webhook idempotency
   - Indexes: `by_event`
   - Fields: `provider`, `eventId`, `createdAt`

#### Module Tables (5 tables)
1. **tracks** - Beat/track listings
   - Indexes: `by_workspace`, `by_workspace_status`
   - Fields: `workspaceId`, `title`, `bpm`, `key`, `tags`, `priceUsdByTier`, `priceEurByTier`, `status`, `fullStorageId`, `stemsStorageId`, `previewStorageId`, `processingStatus`, `previewDurationSec`, `previewPolicy`, `processingError`, `createdAt`

2. **services** - Service listings (mixing, mastering, etc.)
   - Indexes: `by_workspace`, `by_workspace_active`
   - Fields: `workspaceId`, `title`, `description`, `priceUSD`, `priceEUR`, `turnaround`, `features`, `isActive`, `createdAt`

3. **orders** - Purchase orders
   - Indexes: `by_workspace`, `by_buyer`, `by_stripe_session`
   - Fields: `workspaceId`, `buyerClerkUserId`, `buyerEmail`, `stripeSessionId`, `itemType`, `itemId`, `currency`, `amountCents`, `licenseTier`, `status`, `createdAt`

4. **purchaseEntitlements** - Track purchase entitlements
   - Indexes: `by_workspace`, `by_buyer`, `by_buyer_track`
   - Fields: `workspaceId`, `buyerClerkUserId`, `trackId`, `licenseTier`, `licenseTermsVersion`, `licenseTermsSnapshot`, `licensePdfStorageId`, `createdAt`

5. **bookings** - Service bookings
   - Indexes: `by_workspace`, `by_buyer`
   - Fields: `workspaceId`, `buyerClerkUserId`, `serviceId`, `status`, `createdAt`

#### Licensing Tables (2 tables)
1. **licenses** - License records with immutable terms
   - Indexes: `by_workspace`, `by_buyer`, `by_entitlement`, `by_order`, `by_track`
   - Fields: `workspaceId`, `orderId`, `buyerClerkUserId`, `buyerEmail`, `trackId`, `entitlementId`, `termsVersion`, `tierKey`, `includesStems`, `rightsSnapshot`, `prohibitedUsesSnapshot`, `creditLineSnapshot`, `publishingEnabled`, `licensorWriterSharePercent`, `licenseeWriterSharePercent`, `licensorPublisherSharePercent`, `licenseePublisherSharePercent`, `status`, `createdAt`

2. **licenseDocuments** - Generated license PDFs
   - Indexes: `by_license`, `by_workspace`
   - Fields: `workspaceId`, `licenseId`, `kind`, `storageId`, `status`, `error`, `createdAt`, `updatedAt`

#### Email Events Table (1 table)
1. **emailEvents** - Email idempotency tracking
   - Indexes: `by_dedupe`
   - Fields: `provider`, `dedupeKey`, `createdAt`

**Total:** 17 tables with 31 indexes

**Key Design Decisions:**

1. **License Tier Pricing:**
   - Tracks use `priceUsdByTier` object with `basic`, `premium`, `unlimited` keys
   - Replaces single `priceUSD` field to support tiered licensing
   - Optional `priceEurByTier` for EUR pricing

2. **Immutable License Terms:**
   - `licenseTermsSnapshot` stores complete terms at purchase time
   - `termsVersion` tracks which version was used (e.g., "v1.1-2026-01")
   - Prevents retroactive changes to purchased licenses

3. **Job Queue Pattern:**
   - Generic `jobs` table supports multiple job types
   - Concurrency lock via `lockedAt` and `lockedBy` fields
   - Retry support with `attempts` counter
   - Status tracking: pending → processing → completed/failed

4. **Idempotency:**
   - `processedEvents` table prevents duplicate webhook processing
   - `emailEvents` table prevents duplicate email sends
   - Both use `provider` + unique key pattern

5. **Multi-Currency Support:**
   - Optional `priceEUR` fields on tracks and services
   - `currency` field on orders tracks actual payment currency
   - Supports future expansion to additional currencies

**Rationale:**
- **Comprehensive:** Covers all platform and module requirements
- **Scalable:** Indexes support efficient queries at scale
- **Flexible:** Generic job queue and event tables support future features
- **Compliant:** Immutable license terms ensure legal compliance
- **Performant:** Proper indexing on all query patterns

**Verification:**
- TypeScript compilation passes (`npm run typecheck`)
- Production build succeeds (`npm run build`)
- Schema validates against Convex requirements

**Next Steps:**
- Task 4.3: Implement platform core helpers (users, workspaces, domains)
- Task 4.4: Implement billing/plans configuration
- Task 4.5: Implement entitlements and quotas helpers
- Task 4.6: Implement job queue
- Task 4.7: Implement observability (auditLogs, events)

