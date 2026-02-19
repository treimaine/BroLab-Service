# Dribbble Design Language - BroLab Entertainment

> **Single Source of Truth** pour la direction artistique de l'application.
> Toutes les pages (Hub, Studio, Tenant, Artist) DOIVENT suivre ce langage visuel.

## 🎯 Philosophie

Le template Dribbble se distingue par :
- **Asymétrie** : Compositions déséquilibrées intentionnellement, modules latéraux
- **Densité** : Moins de "vide SaaS", plus de contenu éditorial
- **Layering typographique** : Titres avec outlines répétés/décalés
- **Art direction** : Wavy lines, noise, blobs, gradients subtils
- **Motion premium** : Entrées staggerées, hover lift, parallax subtil

## 📐 Layout Primitives

### Grid System

```
Desktop (≥1024px):
┌─────────────────────────────────────────────────────────────┐
│ TopBar (minimal, brand centré, CTA pill à droite)           │
├────────┬────────────────────────────────────┬───────────────┤
│ IconRail│         Main Content              │ Side Modules  │
│ (80px)  │         (flexible)                │ (280-320px)   │
│         │                                   │ (optionnel)   │
└────────┴────────────────────────────────────┴───────────────┘

Mobile (<768px):
┌─────────────────────────────────────────────────────────────┐
│ TopBar (compact)                                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                    Main Content                             │
│                    (full width)                             │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│ BottomNav (safe-area)                                       │
└─────────────────────────────────────────────────────────────┘
```

### Asymmetric Compositions

- Hero sections : texte à gauche (60%), visuel/modules à droite (40%)
- Feature grids : 2 colonnes inégales (1fr 1.2fr) ou masonry
- Cards : tailles variées dans une même grille
- Modules latéraux : stats, charts, listes compactes

### Spacing Scale (8px grid)

```css
--space-1: 8px;    /* micro gaps */
--space-2: 16px;   /* element spacing */
--space-3: 24px;   /* section padding */
--space-4: 32px;   /* card padding */
--space-5: 40px;   /* section gaps */
--space-6: 48px;   /* major sections */
--space-8: 64px;   /* hero padding */
--space-10: 80px;  /* page sections */
```

## 🔤 Typography System

### Font Stack

```css
--font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
--font-body: 'Inter', system-ui, sans-serif;
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Outline Stack Title Pattern

Le pattern signature : titre principal + 3-6 copies décalées en outline derrière.

```
Layer 5 (back):  opacity 0.05, offset: -8px, -8px
Layer 4:         opacity 0.08, offset: -6px, -6px
Layer 3:         opacity 0.12, offset: -4px, -4px
Layer 2:         opacity 0.18, offset: -2px, -2px
Layer 1 (front): opacity 1.0,  solid fill
```

### Type Scale

```css
/* Display (hero, section titles) */
--text-display-xl: clamp(48px, 10vw, 120px);  /* Hero main */
--text-display-lg: clamp(36px, 6vw, 72px);    /* Section hero */
--text-display-md: clamp(28px, 4vw, 48px);    /* Page titles */

/* Headings */
--text-h1: 32px;
--text-h2: 24px;
--text-h3: 20px;
--text-h4: 18px;

/* Body */
--text-body: 16px;
--text-body-sm: 14px;
--text-caption: 12px;
--text-micro: 10px;
```

## 🎨 Visual Effects

### Background Layers

```
1. Base gradient (bg → bg-2)
2. Radial glow blobs (accent color, 15-25% opacity)
3. Noise overlay (2-4% opacity, mix-blend-mode: overlay)
4. Wavy lines pattern (SVG, 3-5% opacity)
5. Content
```

### Glass Morphism (Cards)

```css
.glass-card {
  background: rgba(var(--card), var(--card-alpha));
  backdrop-filter: blur(14px);
  border: 1px solid rgba(var(--border), var(--border-alpha));
  border-radius: 16px;
}

.glass-card-hover {
  /* On hover */
  transform: translateY(-4px);
  box-shadow: 
    0 0 0 1px rgba(var(--accent), 0.25),
    0 20px 40px rgba(0, 0, 0, 0.15);
}
```

### Glow Effects

```css
/* Subtle glow */
.glow-subtle {
  box-shadow: 0 0 30px rgba(var(--accent), 0.15);
}

/* Strong glow (CTAs, active states) */
.glow-strong {
  box-shadow: 
    0 0 0 1px rgba(var(--accent), 0.3),
    0 0 40px rgba(var(--accent), 0.35);
}

/* Pulse glow (attention) */
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(var(--accent), 0.2); }
  50% { box-shadow: 0 0 40px rgba(var(--accent), 0.4); }
}
```

### Noise Overlay

```css
.noise-overlay::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,..."); /* noise pattern */
  opacity: 0.03;
  mix-blend-mode: overlay;
  pointer-events: none;
}
```

### Wavy Lines Background

```css
.wavy-bg {
  background-image: url("data:image/svg+xml,..."); /* wavy SVG */
  background-size: 100px 100px;
  opacity: 0.04;
}
```

## 🧩 Component Patterns

### Icon Rail (Desktop Navigation)

```
┌──────┐
│ [H]  │ ← Active (glow + accent bg)
├──────┤
│ [M]  │
├──────┤
│ [S]  │
├──────┤
│ [E]  │
└──────┘
   │
   └── Active indicator (vertical bar or glow)
```

> **Icons:** Always use Lucide React SVG icons (e.g. `Home`, `Music2`, `Mic`, `Mail`). Never use emojis as UI icons.

- Width: 80px
- Icons: 24px, centered
- Active: accent background + glow
- Hover: subtle lift + glow

### Pill CTA Button

```css
.pill-cta {
  padding: 12px 24px;
  border-radius: 9999px;
  font-weight: 600;
  background: linear-gradient(135deg, var(--accent), var(--accent-2));
  color: white;
  box-shadow: 0 4px 14px rgba(var(--accent), 0.3);
}

.pill-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(var(--accent), 0.4);
}
```

### Micro Module Cards

Petites cards compactes pour stats, listes, progress.

```
┌─────────────────────┐
│ [icon] Revenue      │
│ $12,450             │
│ ↑ 12% vs last month │
└─────────────────────┘
```

> **Icons:** Use Lucide icons (e.g. `TrendingUp`, `DollarSign`, `BarChart2`) passed as `LucideIcon` props. Never use emojis.

- Padding: 16px
- Border-radius: 12px
- Glass background
- Icon + label + value + delta

### Info Module Card

```
┌─────────────────────────────┐
│ Recent Activity             │
├─────────────────────────────┤
│ • Track "Sunset" uploaded   │
│ • New purchase: $49         │
│ • Service booked            │
│ • Preview generated         │
└─────────────────────────────┘
```

### Section Header (Dense)

```
LATEST DROPS ─────────────────
View all →
```

- Uppercase label
- Horizontal rule
- Action link aligned right
- Compact, no extra spacing

## 🎬 Motion Language

### Page Enter

```typescript
const pageEnter = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' }
}
```

### Stagger Children

```typescript
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
}

const staggerChild = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}
```

### Hover Lift

```typescript
const hoverLift = {
  whileHover: { 
    y: -4, 
    transition: { duration: 0.2 } 
  }
}
```

### Hover Glow

```typescript
const hoverGlow = {
  whileHover: {
    boxShadow: '0 0 40px rgba(var(--accent), 0.4)',
    transition: { duration: 0.3 }
  }
}
```

### Glow Pulse (Attention States)

```typescript
const glowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(var(--accent), 0.2)',
      '0 0 40px rgba(var(--accent), 0.4)',
      '0 0 20px rgba(var(--accent), 0.2)'
    ],
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' }
  }
}
```

### Scroll Reveal

```typescript
const scrollReveal = {
  initial: { opacity: 0, y: 30 },
  whileInView: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  },
  viewport: { once: true, margin: '-50px' }
}
```

### Parallax (Background Elements)

```typescript
// Subtle parallax for blobs/decorations
import { useScroll, useTransform } from 'framer-motion'

function ParallaxBlob() {
  const { scrollY } = useScroll()
  const y = useTransform(scrollY, [0, 1000], [0, -100])
  
  return (
    <motion.div 
      style={{ y }}
      className="absolute w-[600px] h-[600px] rounded-full bg-accent/10 blur-3xl"
    />
  )
}

// Faster parallax for foreground elements
const yFast = useTransform(scrollY, [0, 1000], [0, -200])

// Slower parallax for background elements
const ySlow = useTransform(scrollY, [0, 1000], [0, -50])
```

### Hero Float

```typescript
const heroFloat = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}
```

### Blob Float (Background)

```typescript
const blobFloat = {
  animate: {
    x: [-20, 20, -20],
    y: [-15, 15, -15],
    scale: [1, 1.05, 1],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
}
```

### Spring vs Smooth Transitions

```typescript
// Spring - for interactive elements (buttons, toggles, snappy feedback)
const springTransition = { 
  type: 'spring', 
  stiffness: 400, 
  damping: 30 
}

// Smooth - for page transitions, reveals, ambient motion
const smoothTransition = { 
  duration: 0.5, 
  ease: [0.25, 0.1, 0.25, 1] // Custom cubic-bezier
}

// Quick - for micro-interactions
const quickTransition = {
  duration: 0.2,
  ease: 'easeOut'
}
```

### Card Enter (Staggered Grid)

```typescript
const cardEnter = {
  initial: { opacity: 0, y: 20, scale: 0.95 },
  animate: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}
```

### Modal/Drawer Enter

```typescript
const modalEnter = {
  initial: { opacity: 0, scale: 0.95, y: 10 },
  animate: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: { 
    opacity: 0, 
    scale: 0.95, 
    y: 10,
    transition: { duration: 0.2 }
  }
}
```

### Reduced Motion

```typescript
// ALWAYS check prefers-reduced-motion
import { useReducedMotion } from 'framer-motion'

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion()

  // Fallback: simple opacity fade, no transforms
  const reducedMotion = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: 0.2 } }
  }

  // Full motion
  const fullMotion = {
    initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
    animate: { opacity: 1, y: 0, filter: 'blur(0px)' }
  }

  const motionProps = prefersReducedMotion ? reducedMotion : fullMotion

  return <motion.div {...motionProps}>Content</motion.div>
}
```

### Motion Helper Function

```typescript
// Helper to get motion props with reduced motion fallback
export function getMotionProps(
  fullMotion: MotionProps,
  prefersReducedMotion: boolean
): MotionProps {
  if (prefersReducedMotion) {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1, transition: { duration: 0.2 } }
    }
  }
  return fullMotion
}
```

## 📱 Responsive Breakpoints

```css
/* Mobile first */
@media (min-width: 640px)  { /* sm: tablets portrait */ }
@media (min-width: 768px)  { /* md: tablets landscape */ }
@media (min-width: 1024px) { /* lg: desktop */ }
@media (min-width: 1280px) { /* xl: large desktop */ }
@media (min-width: 1440px) { /* 2xl: wide screens */ }
```

### Layout Adaptations

| Breakpoint | Icon Rail | Side Modules | Grid Columns |
|------------|-----------|--------------|--------------|
| < 768px    | Hidden    | Hidden       | 1            |
| 768-1023px | Hidden    | Hidden       | 2            |
| ≥ 1024px   | Visible   | Optional     | 2-3          |
| ≥ 1280px   | Visible   | Visible      | 3-4          |

## ✅ Visual Parity Checklist

Avant de valider une page, vérifier :

- [ ] **Asymétrie** : La composition n'est pas centrée/symétrique
- [ ] **Outline Stack** : Les titres principaux ont des layers décalés
- [ ] **Densité** : Pas trop de vide, contenu éditorial
- [ ] **Rails/Modules** : Icon rail visible (desktop), modules latéraux si pertinent
- [ ] **Glass + Glow** : Cards avec backdrop-blur et glow subtil
- [ ] **Background Art** : Blobs, noise, wavy lines présents
- [ ] **Motion** : Entrées staggerées, hover lift, scroll reveal
- [ ] **Responsive** : Pas de scroll horizontal, touch targets ≥ 44px
- [ ] **Reduced Motion** : Animations désactivées si préférence

## 🚫 Anti-Patterns à Éviter

- ❌ Hero centré avec beaucoup de vide
- ❌ Cards toutes de même taille en grille régulière
- ❌ Titres simples sans layering
- ❌ Backgrounds plats sans texture
- ❌ Animations "snap" ou trop rapides
- ❌ Navigation horizontale classique (utiliser icon rail)
- ❌ Boutons rectangulaires (utiliser pills)
- ❌ Espacement uniforme partout

## 📁 Fichiers de Référence

- Vidéo template : `/Dribbble reference.mov`
- Frames extraites : `/docs/dribbble-frames/` (à créer)
- Composants UI : `/src/platform/ui/dribbble/` (source unique)
- Motion utilities : `/src/platform/ui/dribbble/motion.ts`
- CSS tokens : `/app/globals.css`
- Point d'entrée : `@/platform/ui` (imports unifiés)

## 🧱 Composants Disponibles (2026-01-12)

### Layout & Navigation
- `IconRail` - Desktop left navigation rail (80px)
- `TopMinimalBar` - Minimal header with centered brand
- `MobileNav` - Bottom navigation for mobile

### Typography
- `OutlineStackTitle` - Layered outline text effect (ELECTRI-X signature)

### Cards & Containers
- `DribbbleCard` - Glass morphism card with glow
- `MicroModule` / `MicroInfoModule` - Compact stat cards

### Decorative
- `WavyLines` - SVG wavy background pattern
- `OrganicBlob` - Gradient blob with unique IDs via `useId()`
- `ConstellationDots` - Decorative constellation pattern
- `CyanOrb` - Glowing accent orb
- `WavyBackground` - Full background with waves

### Interactive
- `PillCTA` - Pill-shaped CTA button with glow
- `EditionBadge` - Badge component
- `ThemeToggle` - Dark/light mode toggle (Sun/Moon Lucide icons, hydration-safe)

### Animation
- `DribbbleSectionEnter` - Section enter animation wrapper
- `DribbbleStaggerItem` - Staggered child animation
- `PageTransition` - Page transition wrapper

### Audio (Player Components)
- `PlayerPillButton` - Play/pause pill button
- `ProgressRail` - Audio progress bar
- `VolumePill` - Volume control
- `NowPlayingChip` - Current track info chip
- `WaveformPlaceholder` - Waveform visualization placeholder

### Import Pattern
```tsx
import {
  OutlineStackTitle,
  WavyLines,
  OrganicBlob,
  ConstellationDots,
  DribbbleCard,
  PillCTA,
  IconRail,
  TopMinimalBar,
  ThemeToggle,
} from '@/platform/ui'
```
