# Visual Parity Checklist - Dribbble Design Language

> **Last Updated:** 2026-01-12
> 
> Utiliser cette checklist pour valider que chaque page respecte le langage visuel Dribbble.
> Comparer avec les frames de référence dans `/docs/dribbble-frames/`.

## 🎯 Checklist Globale

### Layout & Composition

- [ ] **Asymétrie** : La composition n'est PAS centrée/symétrique
- [ ] **Modules latéraux** : Présence de side modules (stats, listes) sur desktop
- [ ] **Densité** : Contenu éditorial dense, pas de grands espaces vides "SaaS"
- [ ] **Grid variée** : Cards de tailles différentes, pas de grille uniforme
- [ ] **No empty SaaS spaces** : Chaque section a du contenu significatif

### Typography

- [ ] **Outline Stack** : Titres principaux avec layers décalés derrière
- [ ] **Hiérarchie** : Display font pour titres, Inter pour body
- [ ] **Section headers** : Uppercase + horizontal rule + action link

### Navigation

- [ ] **Icon Rail** : Visible sur desktop (≥1024px), 80px de large
- [ ] **Bottom Nav** : Visible sur mobile (<768px), safe-area padding
- [ ] **TopBar minimal** : Brand centré, CTA pill à droite
- [ ] **No horizontal nav** : Pas de navigation horizontale classique sur desktop

### Visual Effects

- [ ] **Glass morphism** : Cards avec backdrop-blur et border subtile
- [ ] **Glow effects** : Accent glow sur éléments actifs/hover
- [ ] **Background art** : Blobs, noise overlay, wavy lines présents
- [ ] **Gradient borders** : Visible au hover sur les cards

### Motion

- [ ] **Page enter** : Fade + y + blur transition
- [ ] **Stagger** : Enfants animés séquentiellement (0.08s delay)
- [ ] **Scroll reveal** : Sections apparaissent au scroll
- [ ] **Hover lift** : Cards se soulèvent au hover (-4px)
- [ ] **Hover glow** : Glow accent au hover sur éléments interactifs
- [ ] **Reduced motion** : Animations désactivées si préférence

### Responsive

- [ ] **Pas de scroll horizontal** : À tous les breakpoints
- [ ] **Touch targets** : ≥44px sur mobile
- [ ] **Breakpoints testés** : 320, 390, 768, 1024, 1280, 1440px
- [ ] **Icon Rail hidden** : Caché sur mobile (<1024px)
- [ ] **Bottom Nav visible** : Visible sur mobile (<768px)

### Density Rules

- [ ] **Hero section** : Max 40% espace vide, reste = contenu/modules
- [ ] **Feature sections** : Cards variées, pas de grille uniforme 3x3
- [ ] **Sidebar modules** : Présents sur desktop (stats, activity, quick actions)
- [ ] **Footer** : Dense avec colonnes, pas de footer minimal

---

## 📄 Checklist par Page

### Hub Landing (`/(hub)/page.tsx`)

- [ ] Hero asymétrique (texte gauche, modules droite)
- [ ] OutlineStackTitle pour "BROLAB"
- [ ] 3 CTAs en pills (Producer, Engineer, Artist)
- [ ] Features en cards variées avec glow
- [ ] Background avec blobs + noise + waves
- [ ] Scroll indicator animé
- [ ] Footer dense avec colonnes

### Hub Pricing (`/(hub)/pricing/page.tsx`)

- [ ] Titre avec outline stack
- [ ] Cards BASIC/PRO avec glass + glow
- [ ] Toggle mensuel/annuel
- [ ] Feature comparison dense
- [ ] CTA pills pour subscribe
- [ ] Side module avec FAQ ou stats

### Studio Dashboard (`/(hub)/studio/page.tsx`)

- [ ] Icon rail visible (desktop)
- [ ] Header dense avec outline title
- [ ] Micro modules (stats: revenue, tracks, etc.)
- [ ] Recent activity list module
- [ ] Quick actions en pills
- [ ] Stagger animation au load

### Studio Tracks (`/(hub)/studio/tracks/page.tsx`)

- [ ] Section header "YOUR TRACKS"
- [ ] Grid de track cards (tailles variées)
- [ ] Upload CTA prominent
- [ ] Status badges (draft, published, processing)
- [ ] Hover lift sur cards
- [ ] Empty state stylé

### Tenant Storefront (`/(_t)/[slug]/page.tsx`)

- [ ] Hero avec branding workspace
- [ ] "Latest Drops" section avec stagger
- [ ] Featured services section
- [ ] Sticky player bar
- [ ] Glass cards pour beats/services
- [ ] Contact CTA

### Tenant Beats (`/(_t)/[slug]/beats/page.tsx`)

- [ ] Grid asymétrique de beat cards
- [ ] Play button avec glow
- [ ] Price badges
- [ ] Filter/sort options
- [ ] Scroll reveal animation

### Artist Dashboard (`/(hub)/artist/page.tsx`)

- [ ] Purchased tracks avec download
- [ ] Bookings list
- [ ] Order history
- [ ] Micro modules (stats)
- [ ] Empty states stylés

### PlayerBar (Global Audio Player)

- [ ] **Glass background** : backdrop-blur + border subtile
- [ ] **Glow accent** : Glow sur bouton play actif
- [ ] **Pill buttons** : Play/pause en pill (pas rectangulaire)
- [ ] **Progress rail** : Style Dribbble avec gradient fill
- [ ] **Volume pill** : Contrôle volume en pill style
- [ ] **Now Playing chip** : Chip compact pour track info
- [ ] **Hover lift** : Boutons se soulèvent au hover
- [ ] **Enter animation** : Fade + y au mount
- [ ] **Reduced motion** : Animations simplifiées si préférence
- [ ] **Touch targets** : ≥44px sur mobile
- [ ] **Responsive** : Layout adapté mobile/desktop

---

## 🚫 Anti-Patterns à Éviter

### Code Architecture Anti-Patterns

| Anti-Pattern | Problème | Solution Correcte |
|--------------|----------|-------------------|
| **Glass styles outside kit** | `className="backdrop-blur-sm bg-white/10"` dans composants | Utiliser `<GlassSurface>` ou `<DribbbleCard>` de `@/platform/ui` |
| **Motion variants outside kit** | `animate={{ opacity: 1, y: 0 }}` inline | Utiliser `dribbblePageEnter`, `dribbbleHoverLift` de `@/platform/ui/dribbble/motion` |
| **Direct dribbble imports** | `import { OutlineStackTitle } from '@/platform/ui/dribbble/OutlineStackTitle'` | Importer via `@/platform/ui` : `import { OutlineStackTitle } from '@/platform/ui'` |
| **Header duplication** | Multiples composants `Header`, `TopBar`, `NavBar` | Un seul `TopMinimalBar` réutilisé via `@/platform/ui` |

### Layout Anti-Patterns

| Anti-Pattern | Problème | Solution Dribbble |
|--------------|----------|-------------------|
| Hero centré avec vide | Trop de whitespace, style SaaS générique | Asymétrie: texte gauche, modules droite |
| Grille uniforme 3x3 | Monotone, pas d'art direction | Cards variées, masonry, tailles différentes |
| Navigation horizontale | Style SaaS classique | Icon Rail vertical (desktop) |
| Footer minimal | Manque de densité | Footer dense avec colonnes |

### Typography Anti-Patterns

| Anti-Pattern | Problème | Solution Dribbble |
|--------------|----------|-------------------|
| Titre simple sans layers | Manque d'impact visuel | OutlineStackTitle avec 3-6 layers |
| Tout en Inter | Pas de hiérarchie display | Display font pour titres |
| Section headers simples | Pas de structure | Uppercase + rule + action link |

### Component Anti-Patterns

| Anti-Pattern | Problème | Solution Dribbble |
|--------------|----------|-------------------|
| Boutons rectangulaires | Style shadcn générique | PillCTA (border-radius: 9999px) |
| Cards sans glass | Plat, pas de profondeur | Glass morphism + backdrop-blur |
| Hover sans lift | Pas de feedback | Hover lift (-4px) + glow |
| Progress bar simple | Style HTML natif | ProgressRail avec gradient |

### Motion Anti-Patterns

| Anti-Pattern | Problème | Solution Dribbble |
|--------------|----------|-------------------|
| Animations snap | Trop rapide, pas premium | Smooth transitions (0.3-0.5s) |
| Pas de stagger | Tout apparaît en même temps | Stagger children (0.08s delay) |
| Ignorer reduced-motion | Accessibilité | Toujours vérifier useReducedMotion |
| Animations trop longues | Lent, frustrant | Max 0.6s pour reveals |

### Visual Anti-Patterns

| Anti-Pattern | Problème | Solution Dribbble |
|--------------|----------|-------------------|
| Background plat | Pas d'art direction | Blobs + noise + wavy lines |
| Pas de glow | Manque d'accent | Glow sur éléments actifs/hover |
| Borders opaques | Trop harsh | Borders semi-transparentes |
| Couleurs saturées | Pas premium | Couleurs désaturées + glow subtil |

---

## 📱 Breakpoint Behaviors

### Mobile (<768px)

- Icon Rail: **HIDDEN**
- Bottom Nav: **VISIBLE** (64px + safe-area)
- Side modules: **HIDDEN** (stack below main content)
- Cards: **FULL WIDTH** (1 column)
- TopBar: **COMPACT** (hamburger menu)
- PlayerBar: **SIMPLIFIED** (no volume slider)

### Tablet (768px - 1023px)

- Icon Rail: **HIDDEN**
- Bottom Nav: **VISIBLE**
- Side modules: **HIDDEN** or **BELOW**
- Cards: **2 COLUMNS**
- TopBar: **FULL** (inline nav)
- PlayerBar: **FULL**

### Desktop (≥1024px)

- Icon Rail: **VISIBLE** (80px left)
- Bottom Nav: **HIDDEN**
- Side modules: **VISIBLE** (280-320px right)
- Cards: **2-3 COLUMNS** (variées)
- TopBar: **FULL** (inline nav + CTAs)
- PlayerBar: **FULL** (all controls)

---

## 🔍 Frames de Référence

Les frames extraites de la vidéo Dribbble sont dans `/docs/dribbble-frames/`.

### Frames Clés à Comparer

1. **Frame Hero** : Composition asymétrique, outline text, modules
2. **Frame Dashboard** : Icon rail, micro modules, density
3. **Frame Cards** : Glass effect, hover states, glow
4. **Frame Mobile** : Bottom nav, responsive layout

---

## ❌ Anti-Patterns Détectés

Lister ici les violations du design language trouvées :

| Page | Problème | Status |
|------|----------|--------|
| ~~LeftRail.tsx~~ | ~~Utilisait `<img>` au lieu de `next/image`~~ | ✅ CORRIGÉ (2026-01-12) |
| ~~TenantLayout.tsx~~ | ~~Utilisait `<img>` au lieu de `next/image`~~ | ✅ CORRIGÉ (2026-01-12) |
| ~~Header.tsx~~ | ~~Theme toggle manuel~~ | ✅ CORRIGÉ - Utilise `next-themes` |
| ~~TenantLayout.tsx~~ | ~~Theme toggle manuel~~ | ✅ CORRIGÉ - Utilise `next-themes` |

---

## ✅ Validation Finale

### Lint & Build Status (2026-01-12)
- [x] `npm run lint` - 0 errors, 0 warnings
- [x] `npm run typecheck` - Passes
- [x] `npm run build` - Passes

### Pages Validées
- [x] Hub Landing (`app/(hub)/page.tsx`) - ELECTRI-X style
- [x] Tenant Demo (`app/tenant-demo/page.tsx`) - ELECTRI-X storefront
- [ ] Hub Pricing - À valider
- [ ] Studio Dashboard - À implémenter (Phase 5+)
- [ ] Tenant Storefront - À implémenter (Phase 6)

### Composants Migrés
- [x] `OutlineStackTitle` - Centralisé
- [x] `WavyLines` - Centralisé
- [x] `OrganicBlob` - Centralisé avec `useId()`
- [x] `ConstellationDots` - Centralisé
- [x] Theme toggle - Migré vers `next-themes`
- [x] Images - Migrées vers `next/image`

**Date de validation** : 2026-01-12
**Validé par** : Kiro AI
