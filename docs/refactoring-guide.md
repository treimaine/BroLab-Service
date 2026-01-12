# Code Refactoring Guide
## BroLab Entertainment - Duplication & Dead Code Cleanup

---

## Phase 1: Remove Empty Directories (HIGH PRIORITY)

### Step 1.1: Delete .gitkeep Files

```bash
# Remove all .gitkeep files
rm src/lib/.gitkeep
rm src/stores/.gitkeep
rm src/shared/types/.gitkeep
rm src/shared/constants/.gitkeep
rm src/modules/beats/components/.gitkeep
rm src/modules/beats/server/.gitkeep
rm src/modules/beats/types/.gitkeep
rm src/modules/services/components/.gitkeep
rm src/modules/services/server/.gitkeep
rm src/modules/services/types/.gitkeep
rm convex/modules/.gitkeep
rm convex/platform/.gitkeep
rm src/platform/auth/.gitkeep
rm src/platform/billing/.gitkeep
rm src/platform/domains/.gitkeep
rm src/platform/entitlements/.gitkeep
rm src/platform/i18n/.gitkeep
rm src/platform/jobs/.gitkeep
rm src/platform/observability/.gitkeep
rm src/platform/quotas/.gitkeep
rm src/platform/tenancy/.gitkeep
```

### Step 1.2: Remove Empty Directories

```bash
# Remove empty parent directories (if no other files exist)
rmdir src/lib
rmdir src/stores
rmdir src/shared/types
rmdir src/shared/constants
rmdir src/modules/beats/components
rmdir src/modules/beats/server
rmdir src/modules/beats/types
rmdir src/modules/services/components
rmdir src/modules/services/server
rmdir src/modules/services/types
rmdir convex/modules
rmdir convex/platform
rmdir src/platform/auth
rmdir src/platform/billing
rmdir src/platform/domains
rmdir src/platform/entitlements
rmdir src/platform/i18n
rmdir src/platform/jobs
rmdir src/platform/observability
rmdir src/platform/quotas
rmdir src/platform/tenancy
```

### Step 1.3: Verify No Broken Imports

```bash
npm run typecheck
npm run lint
```

---

## Phase 2: Consolidate Info Modules (HIGH PRIORITY)

### Step 2.1: Create Unified InfoModule Component

**File:** `src/platform/ui/dribbble/InfoModule.tsx` (NEW)

```tsx
'use client'

import { Award, Check, TrendingUp, Users, type LucideIcon } from 'lucide-react'

/**
 * InfoModule - Flexible info display component (Dribbble style)
 * 
 * Supports two variants:
 * - 'bullets': Simple bullet list with icons (MicroInfoModule)
 * - 'constellation': Bullet list with connecting constellation lines (ConstellationInfo)
 */

interface InfoItem {
  text: string
  icon?: LucideIcon
}

interface InfoModuleProps {
  /** List of info items */
  items: InfoItem[]
  /** Display variant */
  variant?: 'bullets' | 'constellation'
  /** Additional CSS classes */
  className?: string
}

// Default icons for items without custom icon
const defaultIcons = [Award, Users, TrendingUp, Check]

export function InfoModule({ 
  items, 
  variant = 'bullets',
  className = '' 
}: Readonly<InfoModuleProps>) {
  
  if (variant === 'constellation') {
    return <ConstellationVariant items={items} className={className} />
  }
  
  return <BulletsVariant items={items} className={className} />
}

InfoModule.displayName = 'InfoModule'

// ============================================================================
// Bullets Variant (formerly MicroInfoModule)
// ============================================================================

function BulletsVariant({ 
  items, 
  className = '' 
}: Readonly<{ items: InfoItem[], className?: string }>) {
  return (
    <div
      className={`
        glass border border-[rgba(var(--border),0.3)]
        rounded-2xl px-5 py-4
        max-w-[280px]
        ${className}
      `}
    >
      <ul className="space-y-2.5">
        {items.map((item, index) => {
          const Icon = item.icon || defaultIcons[index % defaultIcons.length]
          return (
            <li
              key={item.text}
              className="flex items-center gap-3 text-sm"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                <Icon className="w-3 h-3 text-accent" />
              </span>
              <span className="text-muted">{item.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ============================================================================
// Constellation Variant (formerly ConstellationInfo)
// ============================================================================

function ConstellationVariant({ 
  items, 
  className = '' 
}: Readonly<{ items: InfoItem[], className?: string }>) {
  return (
    <div className={`relative ${className}`}>
      {/* Connecting lines SVG */}
      <svg 
        className="absolute left-0 top-0 w-full h-full pointer-events-none"
        viewBox="0 0 300 200"
        preserveAspectRatio="none"
      >
        {/* Horizontal line */}
        <line 
          x1="0" y1="100" x2="40" y2="100" 
          stroke="rgb(var(--accent))" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          opacity="0.6"
        />
        {/* Vertical connecting lines between items */}
        <line 
          x1="50" y1="30" x2="50" y2="170" 
          stroke="rgb(var(--accent))" 
          strokeWidth="1" 
          strokeDasharray="4 4"
          opacity="0.4"
        />
        {/* Dots at intersections */}
        <circle cx="50" cy="30" r="3" fill="rgb(var(--accent))" />
        <circle cx="50" cy="70" r="3" fill="rgb(var(--accent))" />
        <circle cx="50" cy="110" r="3" fill="rgb(var(--accent))" />
        <circle cx="50" cy="150" r="3" fill="rgb(var(--accent))" />
      </svg>
      
      {/* Info items */}
      <ul className="space-y-4 pl-16 relative z-10">
        {items.map((item, index) => {
          const Icon = item.icon || defaultIcons[index % defaultIcons.length]
          return (
            <li key={item.text} className="flex items-center gap-3 text-sm">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[rgba(var(--accent),0.15)] flex items-center justify-center">
                <Icon className="w-3 h-3 text-accent" />
              </span>
              <span className="text-muted text-xs">{item.text}</span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

// ============================================================================
// Backward Compatibility Exports
// ============================================================================

/**
 * @deprecated Use InfoModule with variant="bullets" instead
 */
export const MicroInfoModule = InfoModule

/**
 * @deprecated Use InfoModule with variant="constellation" instead
 */
export const ConstellationInfo = InfoModule
```

### Step 2.2: Update Exports

**File:** `src/platform/ui/dribbble/index.ts`

```tsx
// Replace these lines:
// export { ConstellationInfo } from './ConstellationInfo'
// export { MicroInfoModule } from './MicroInfoModule'

// With this:
export { InfoModule, MicroInfoModule, ConstellationInfo } from './InfoModule'
```

**File:** `src/platform/ui/index.ts`

```tsx
// Replace these lines:
// export { ConstellationInfo } from './dribbble/ConstellationInfo'
// export { MicroInfoModule } from './dribbble/MicroInfoModule'

// With this:
export { InfoModule, MicroInfoModule, ConstellationInfo } from './dribbble/InfoModule'
```

### Step 2.3: Update All Usages

**Search and replace in all files:**
```
// Old imports
import { MicroInfoModule } from '@/platform/ui'
import { ConstellationInfo } from '@/platform/ui'

// New imports (backward compatible)
import { InfoModule } from '@/platform/ui'

// Usage examples
// Old: <MicroInfoModule items={items} />
// New: <InfoModule items={items} variant="bullets" />

// Old: <ConstellationInfo items={items} />
// New: <InfoModule items={items} variant="constellation" />
```

**Files to update:**
- `app/(hub)/HubLandingPageClient.tsx` - Uses MicroInfoModule

### Step 2.4: Delete Old Files

```bash
rm src/platform/ui/dribbble/MicroInfoModule.tsx
rm src/platform/ui/dribbble/ConstellationInfo.tsx
```

### Step 2.5: Verify

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Phase 3: Consolidate Motion Utilities (MEDIUM PRIORITY)

### Step 3.1: Merge Motion Files

**File:** `src/platform/ui/motion.ts` (UPDATED)

```tsx
'use client'

import { type Transition, type Variants } from 'framer-motion'
import { useEffect, useState } from 'react'

/**
 * BroLab Entertainment Motion Utilities
 * 
 * Unified motion system combining base and Dribbble-enhanced animations.
 * All animations respect prefers-reduced-motion via useReducedMotion hook.
 * 
 * Requirements: 24.1-24.4 (Motion and Animation)
 */

// ============================================================================
// useReducedMotion Hook
// ============================================================================

export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    if (globalThis.window === undefined) return

    const mediaQuery = globalThis.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleChange)
    }
  }, [])

  return prefersReducedMotion
}

// ============================================================================
// Page Enter Animation (Dribbble-enhanced)
// ============================================================================

export const pageEnter: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
}

// Backward compatibility
export const dribbblePageEnter = pageEnter

// ============================================================================
// Stagger Container Animation (Dribbble-enhanced)
// ============================================================================

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
}

export const dribbbleStaggerContainer = staggerContainer

export const staggerChild: Variants = {
  initial: {
    opacity: 0,
    y: 16,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2,
    },
  },
}

export const dribbbleStaggerChild = staggerChild

// ============================================================================
// Scroll Reveal
// ============================================================================

export const scrollReveal: Variants = {
  initial: {
    opacity: 0,
    y: 30,
  },
  whileInView: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}

export const dribbbleScrollReveal = scrollReveal

export const scrollRevealViewport = {
  once: true,
  margin: '-50px' as const,
}

// ============================================================================
// Hover Effects
// ============================================================================

export const hoverLift = {
  whileHover: {
    y: -4,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
}

export const dribbbleHoverLift = hoverLift

export const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 30px rgba(var(--accent), 0.3)',
    transition: { duration: 0.2 },
  },
}

export const dribbbleHoverGlow = hoverGlow

export const hoverScale = {
  whileHover: {
    scale: 1.02,
    transition: { duration: 0.2 },
  },
  whileTap: {
    scale: 0.98,
  },
}

export const dribbbleHoverScale = hoverScale

// ============================================================================
// Hero Float Animation
// ============================================================================

export const heroFloat: Variants = {
  initial: {
    y: 0,
  },
  animate: {
    y: [-8, 8, -8],
    transition: {
      duration: 6,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

export const dribbbleHeroFloat = heroFloat

export function createHeroFloat(duration: number = 8): Variants {
  return {
    initial: {
      y: 0,
    },
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration,
        ease: 'easeInOut',
        repeat: Infinity,
        repeatType: 'loop',
      },
    },
  }
}

// ============================================================================
// Blob Animation
// ============================================================================

export const blobFloat: Variants = {
  initial: {
    scale: 1,
    x: 0,
    y: 0,
  },
  animate: {
    scale: [1, 1.1, 1],
    x: [-20, 20, -20],
    y: [-10, 10, -10],
    transition: {
      duration: 20,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'loop',
    },
  },
}

export const dribbbleBlobFloat = blobFloat

// ============================================================================
// Card Enter
// ============================================================================

export const cardEnter: Variants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.25, 0.1, 0.25, 1],
    },
  },
}

export const dribbbleCardEnter = cardEnter

// ============================================================================
// Slide In
// ============================================================================

export const slideInLeft: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2,
    },
  },
}

export const dribbbleSlideInLeft = slideInLeft

export const slideInRight: Variants = {
  initial: {
    opacity: 0,
    x: 20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.2,
    },
  },
}

export const dribbbleSlideInRight = slideInRight

// ============================================================================
// Fade Scale
// ============================================================================

export const fadeScale: Variants = {
  initial: {
    opacity: 0,
    scale: 0.95,
  },
  animate: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.2,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.15,
    },
  },
}

export const dribbbleFadeScale = fadeScale

// ============================================================================
// Reduced Motion Variants
// ============================================================================

export const reducedMotion: Variants = {
  initial: { opacity: 0 },
  animate: { 
    opacity: 1, 
    transition: { duration: 0.2 } 
  },
  exit: { 
    opacity: 0, 
    transition: { duration: 0.15 } 
  },
}

export const dribbbleReducedMotion = reducedMotion

// ============================================================================
// Fade Only (for reduced motion fallback)
// ============================================================================

export const fadeOnly: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
}

// ============================================================================
// Transition Presets
// ============================================================================

export const springTransition: Transition = {
  type: 'spring',
  stiffness: 400,
  damping: 30,
}

export const smoothTransition: Transition = {
  duration: 0.3,
  ease: [0.25, 0.1, 0.25, 1],
}

// ============================================================================
// Helper Functions
// ============================================================================

export function getReducedMotionVariants(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (prefersReducedMotion) {
    return reducedMotion
  }
  return variants
}

export function getMotionProps(
  variants: Variants,
  prefersReducedMotion: boolean
): Variants {
  if (prefersReducedMotion) {
    return reducedMotion
  }
  return variants
}

// ============================================================================
// Utility Types
// ============================================================================

export type MotionVariantKey = 'initial' | 'animate' | 'exit'

// ============================================================================
// Page Enter Variants (legacy - for backward compatibility)
// ============================================================================

export const pageEnterTransition: Transition = {
  duration: 0.35,
  ease: 'easeOut',
}

export const pageEnterVariants: Variants = {
  initial: {
    opacity: 0,
    y: 12,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: pageEnterTransition,
  },
  exit: {
    opacity: 0,
    y: -12,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
}
```

### Step 3.2: Delete Old Motion File

```bash
rm src/platform/ui/dribbble/motion.ts
```

### Step 3.3: Update Exports

**File:** `src/platform/ui/index.ts`

```tsx
// Replace all motion exports with unified versions
export {
    blobFloat,
    cardEnter,
    createHeroFloat,
    dribbbleBlobFloat,
    dribbbleCardEnter,
    dribbbleFadeScale,
    dribbbleHeroFloat,
    dribbbleHoverGlow,
    dribbbleHoverLift,
    dribbbleHoverScale,
    dribbblePageEnter,
    dribbbleReducedMotion,
    dribbbleScrollReveal,
    dribbbleSlideInLeft,
    dribbbleSlideInRight,
    dribbbleStaggerChild,
    dribbbleStaggerContainer,
    fadeOnly,
    fadeScale,
    getMotionProps,
    getReducedMotionVariants,
    heroFloat,
    hoverGlow,
    hoverLift,
    hoverScale,
    pageEnter,
    pageEnterTransition,
    pageEnterVariants,
    reducedMotion,
    scrollReveal,
    scrollRevealViewport,
    slideInLeft,
    slideInRight,
    smoothTransition,
    springTransition,
    staggerChild,
    staggerContainer,
    useReducedMotion,
    type MotionVariantKey
} from './motion'
```

### Step 3.4: Verify

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Phase 4: Refactor Header Component (MEDIUM PRIORITY)

### Step 4.1: Update Header to Use TopMinimalBar

**File:** `src/components/hub/Header.tsx` (UPDATED)

```tsx
'use client'

import { TopMinimalBar } from '@/platform/ui'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'

/**
 * Hub Header Component (ELECTRI-X Style)
 * 
 * Wrapper around TopMinimalBar with Hub-specific configuration.
 * Provides brand, navigation, and CTA for the Hub landing page.
 */
export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const { theme, setTheme } = useTheme()
  const pathname = usePathname()

  // Scroll detection for navbar transparency
  const handleScroll = () => {
    setIsScrolled(window.scrollY > 50)
  }

  // Attach scroll listener
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', handleScroll)
  }

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <TopMinimalBar
      brand={
        <span className="text-sm font-medium text-muted uppercase tracking-[0.3em] hover:text-text transition-colors">
          BROLAB
        </span>
      }
      brandHref="/"
      cta={{ label: 'Explore', href: '/sign-up' }}
      secondaryAction={{ label: 'Sign In', href: '/sign-in' }}
      onThemeToggle={toggleTheme}
      isDark={theme === 'dark'}
      isScrolled={isScrolled}
    />
  )
}
```

### Step 4.2: Verify

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Phase 5: Remove Unused Dependencies (LOW PRIORITY)

### Step 5.1: Update package.json

**File:** `package.json`

```json
{
  "dependencies": {
    "@clerk/nextjs": "6.36.5",
    "convex": "1.17.4",
    "framer-motion": "11.15.0",
    "lucide-react": "0.469.0",
    "next": "16.1.1",
    "next-themes": "0.4.4",
    "react": "19.0.0",
    "react-dom": "19.0.0"
    // Removed: zustand, pdf-lib, resend, stripe
  }
}
```

### Step 5.2: Update Lock File

```bash
npm install
```

### Step 5.3: Verify

```bash
npm run typecheck
npm run lint
npm run build
```

---

## Phase 6: Audit and Clean Exports (LOW PRIORITY)

### Step 6.1: Review All Index Files

Check these files for unused exports:
- `src/platform/ui/index.ts`
- `src/platform/ui/dribbble/index.ts`
- `src/components/hub/index.ts`
- `src/components/tenant/index.ts`
- `src/components/audio/index.ts`

### Step 6.2: Remove Unused Exports

Remove any exports that are:
- Not used anywhere in the codebase
- Duplicated in multiple index files
- Marked as deprecated

### Step 6.3: Document Public API

Create `docs/api-surface.md` documenting:
- All public exports from `@/platform/ui`
- All public exports from `@/components`
- Usage examples for each

---

## Testing Checklist

After each phase, verify:

- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run build` succeeds
- [ ] No console errors in dev mode
- [ ] Mobile responsive design works
- [ ] Dark/light theme toggle works
- [ ] All animations play smoothly
- [ ] No broken imports

---

## Rollback Plan

If issues arise:

1. **Revert to last commit:**
   ```bash
   git reset --hard HEAD~1
   ```

2. **Or revert specific files:**
   ```bash
   git checkout HEAD -- src/platform/ui/motion.ts
   ```

3. **Verify:**
   ```bash
   npm run build
   ```

---

## Timeline Estimate

| Phase | Task | Effort | Status |
|-------|------|--------|--------|
| 1 | Remove .gitkeep files | 15 min | Ready |
| 2 | Consolidate InfoModule | 1 hour | Ready |
| 3 | Consolidate motion.ts | 1 hour | Ready |
| 4 | Refactor Header | 1 hour | Ready |
| 5 | Remove unused deps | 30 min | Ready |
| 6 | Audit exports | 30 min | Ready |
| **Total** | | **4-5 hours** | |

---

## Questions & Support

For questions about this refactoring:
1. Review the code-duplication-analysis.md report
2. Check the specific file references
3. Run tests to verify changes
4. Consult with team on design decisions
