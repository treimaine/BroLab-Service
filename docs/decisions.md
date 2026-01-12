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
