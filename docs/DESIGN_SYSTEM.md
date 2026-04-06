# BroLab Entertainment Design System

## Overview

BroLab's design system creates a modern, premium music platform experience with glass morphism, cyan accents, and smooth animations. Built for music producers and artists.

## Color Tokens

### Light Theme
```css
--bg: 247 250 255        /* Main background - light blue-gray */
--bg-2: 236 245 255      /* Secondary background */
--card: 236 245 255      /* Card background */
--border: 15 23 42       /* Border color (α: 0.12) */
--text: 7 16 34          /* Primary text - near black */
--muted: 71 85 105       /* Muted text */
--accent: 8 145 178      /* Primary cyan accent */
--accent-2: 6 182 212    /* Secondary cyan accent */
--glow: 8 145 178        /* Glow effect (α: 0.22) */
```

### Dark Theme
```css
--bg: 7 10 15            /* Main background - deep navy */
--bg-2: 10 16 32         /* Secondary background */
--card: 15 23 42         /* Card background */
--border: 255 255 255    /* Border color (α: 0.10) */
--text: 234 242 255      /* Primary text - near white */
--muted: 155 168 199     /* Muted text */
--accent: 34 211 238     /* Primary cyan accent (brighter) */
--accent-2: 6 182 212    /* Secondary cyan accent */
--glow: 34 211 238       /* Glow effect (α: 0.35) */
```

### Usage with Tailwind
```tsx
<div className="bg-bg text-text border-border">
  <h1 className="text-accent">BroLab</h1>
  <p className="text-muted">Premium beats marketplace</p>
</div>
```

## Typography

### Font Families
- **Sans**: `Inter, system-ui, -apple-system, sans-serif` (default)
- **Pixel**: `Press Start 2P, monospace` (decorative)

### Font Sizes
- `text-hero`: `clamp(48px, 12vw, 140px)` - Hero headings with outline effect
- Standard Tailwind scale: `text-sm`, `text-base`, `text-lg`, `text-xl`, `text-2xl`, etc.

### Usage
```tsx
<h1 className="text-hero font-black">BroLab</h1>
<p className="text-lg text-muted">Discover beats from top producers</p>
```

## Spacing (8px Grid)

All spacing follows an 8px base grid for visual consistency:

```
grid-1: 8px    grid-2: 16px   grid-3: 24px   grid-4: 32px
grid-5: 40px   grid-6: 48px   grid-8: 64px   grid-10: 80px
```

### Usage
```tsx
<div className="p-grid-3 gap-grid-2">
  <div className="mb-grid-4">Content</div>
</div>
```

## Components

### Glass Morphism Cards
```tsx
<div className="bg-card/60 backdrop-blur-glass border border-border/[var(--border-alpha)] rounded-2xl p-grid-3">
  Card content with glass effect
</div>
```

### Glow Effects
```tsx
<button className="shadow-glow hover:shadow-glow-strong transition-shadow">
  Premium Button
</button>
```

### Border Radius
- `rounded-2xl`: 16px (1rem) - Standard cards
- `rounded-3xl`: 24px (1.5rem) - Hero sections

## Animation Principles

### Motion Standards
- Use `framer-motion` for complex animations
- Respect `prefers-reduced-motion`
- Smooth transitions: `transition-all duration-300 ease-in-out`

### Reduced Motion
```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ 
    duration: 0.5,
    ease: [0.22, 1, 0.36, 1] // Smooth easing curve
  }}
>
  Content
</motion.div>
```

## Responsive Design

### Breakpoints (Tailwind defaults)
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### Mobile-First Approach
```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-grid-3">
  {/* Cards adapt to screen size */}
</div>
```

## Component Library

### Existing Components (from Dribbble UI Kit)

#### Cards & Surfaces
- `DribbbleCard` - Glass morphism card with glow
- `ChromeSurface` - Layered surface with depth
- `GlassCard` - Pure glass background card

#### Buttons & CTAs
- `PillCTA` - Rounded pill button with glow
- `IconButton` - Icon-only button
- `PlayButton` - Audio play/pause button

#### Audio Components
- `PlayerBar` - Global audio player bar
- `EnhancedGlobalAudioPlayer` - Full-featured player
- `WaveformVisualizer` - Audio waveform display (placeholder)

#### Navigation
- `NavBar` - Top navigation bar
- `SideNav` - Sidebar navigation
- `BreadcrumbNav` - Breadcrumb trail

#### Data Display
- `TrackCard` - Beat/track card with preview
- `ProducerCard` - Producer profile card
- `LicenseCard` - License tier card

## Design Patterns

### Marketplace Beat Card
```tsx
<DribbbleCard className="group hover:shadow-glow-strong transition-shadow">
  <div className="aspect-square bg-gradient-to-br from-accent/20 to-accent-2/20 rounded-xl mb-grid-2">
    <PlayButton />
  </div>
  <h3 className="text-lg font-semibold text-text">Beat Title</h3>
  <p className="text-sm text-muted">Producer Name</p>
  <div className="flex items-center justify-between mt-grid-2">
    <span className="text-accent font-bold">$29.99</span>
    <button className="text-sm text-accent hover:text-accent-2">Preview</button>
  </div>
</DribbbleCard>
```

### Search Bar Pattern
```tsx
<div className="relative">
  <input
    type="search"
    placeholder="Search beats..."
    className="w-full bg-card/60 backdrop-blur-glass border border-border/[var(--border-alpha)] rounded-2xl px-grid-3 py-grid-2 text-text placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent"
  />
  <SearchIcon className="absolute right-grid-3 top-1/2 -translate-y-1/2 text-muted" />
</div>
```

### Genre Pills
```tsx
<div className="flex flex-wrap gap-grid-1">
  {genres.map(genre => (
    <button
      key={genre}
      className="px-grid-2 py-grid-1 rounded-full bg-accent/10 hover:bg-accent/20 text-accent text-sm font-medium transition-colors"
    >
      {genre}
    </button>
  ))}
</div>
```

## Accessibility

### Requirements
- Color contrast ratio: 4.5:1 minimum for text
- Focus visible states on all interactive elements
- ARIA labels on icon-only buttons
- Keyboard navigation support
- Screen reader friendly

### Example
```tsx
<button
  aria-label="Play beat preview"
  className="focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
>
  <PlayIcon />
</button>
```

## Performance

### Image Optimization
```tsx
import Image from 'next/image'

<Image
  src="/beats/cover.jpg"
  alt="Beat cover art"
  width={400}
  height={400}
  className="rounded-xl"
  loading="lazy"
/>
```

### Code Splitting
- Use dynamic imports for heavy components
- Lazy load marketplace sections below fold
- Defer non-critical animations

## Summary

**Design Principles:**
1. **Glass + Glow** - Premium visual depth
2. **Cyan Accent** - Music tech brand identity
3. **8px Grid** - Consistent spacing rhythm
4. **Mobile-First** - Responsive by default
5. **Motion** - Smooth, purposeful animations

**Key Files:**
- `app/globals.css` - CSS custom properties
- `tailwind.config.ts` - Tailwind theme config
- `src/platform/ui/` - Reusable component library
