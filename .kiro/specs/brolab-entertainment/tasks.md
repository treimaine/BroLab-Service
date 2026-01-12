# Implementation Plan: BroLab Entertainment

## Overview

This implementation plan follows a phased approach to build the BroLab Entertainment micro-SaaS platform from an empty folder. Each phase builds on the previous, with checkpoints to validate progress. Tasks are organized following the **Vertical Slice Priority** from the design document.

**Vertical Slice Priority (Build First):**
1. Onboarding provider → workspace creation (slug)
2. Routing subdomain (slug.brolabentertainment.com)
3. Upload track (Convex storage)
4. Preview job (ffmpeg worker)
5. Preview playback on storefront

**Then expand to:** services, custom domains, i18n, etc.

**Important Rules:**
- Use **npm** (not pnpm, not yarn). Use `package-lock.json`
- Pin **exact** dependency versions in `package.json` (no `^`, no `~`)
- Do NOT import/copy external code. Use only this spec to recreate the style
- If deviation is needed, document it in /docs/decisions.md
- **UI RULE (NON-NÉGOCIABLE)**: Aucune page ne doit être créée en style "SaaS générique". Utiliser EXCLUSIVEMENT les primitives Dribbble via `@/platform/ui`. Référence unique: `/docs/dribbble-style-guide.md`

**Manual Checkpoints (CP-X):**
> ⚠️ **Les tâches de checkpoint (CP-0, CP-1, CP-2, etc.) doivent être exécutées manuellement via Playwright MCP.**
> 
> Utiliser les outils MCP Playwright pour :
> - `mcp_playwright_browser_navigate` - Naviguer vers les URLs
> - `mcp_playwright_browser_snapshot` - Capturer l'état de la page (accessibility tree)
> - `mcp_playwright_browser_click` - Cliquer sur les éléments
> - `mcp_playwright_browser_resize` - Tester les breakpoints responsive
> - `mcp_playwright_browser_take_screenshot` - Prendre des captures d'écran si nécessaire
> 
> Ces checkpoints valident visuellement que l'implémentation respecte les requirements.

## Execution Phases

### Phase 0: Repo Structure & Conventions

- [x] Task 0.1: Add .gitignore (node_modules, .next, dist, .env): Create comprehensive .gitignore for Next.js + Convex + Worker project. Include: node_modules/, .next/, dist/, .env, .env.local, .env*.local, *.log, .DS_Store, .convex/

- [x] Task 0.2: Create /src/frontend, /src/server, /src/shared, /convex: Establish folder structure separating frontend components, server utilities, shared code, and Convex backend. Move existing app/ content appropriately.

- [x] Task 0.3: Move license terms JSON to src/shared/licenses/: Move docs/license_terms.v1.1-2026-01.json to src/shared/licenses/. Create index.ts exporting LICENSE_TERMS_BY_TIER and helper functions.

- [x] Task 0.4: Define rules in docs/decisions.md (Frontend vs Convex vs Worker): Document clear boundaries: Frontend (src/frontend) = React components, hooks, stores. Convex (convex/) = schema, queries, mutations, actions. Worker (worker/) = background jobs (ffmpeg, pdf-lib). Shared (src/shared) = types, constants, license terms.

- [x] Task 0.5: Ensure scripts run: npm run dev, npm run build, npm run worker: Verify all npm scripts work correctly. Fix any path issues after restructure. Test: dev server starts, build succeeds, worker compiles and runs.

- [x] CP-0: Manual Checkpoint Phase 0 Complete: Verify .gitignore exists and excludes correct paths. Verify folder structure: src/frontend, src/server, src/shared, convex, worker. Verify license terms in src/shared/licenses/. Verify docs/decisions.md has clear rules. Run npm run dev, npm run build, npm run build:worker → all succeed.

### Phase 0.5: Dribbble Design System Foundation

> ⚠️ **CRITICAL**: Cette phase DOIT être complétée avant de continuer. Le langage visuel Dribbble est la "skin" de l'application entière.

**Référence**: Vidéo `/Dribbble reference.mov` + Documentation `/docs/dribbble-style-guide.md`

- [x] Task 0.5.1: Create Dribbble Style Guide documentation: Create `/docs/dribbble-style-guide.md` as single source of truth. Document: layout primitives (grids, asymmetry, modules), typography system (outline stack, display fonts), visual effects (glass, glow, noise, waves), motion language (enter, hover, scroll, parallax), component patterns (icon rail, pills, micro modules). _Requirements: Dribbble Design Language_

- [x] Task 0.5.2: Create Dribbble UI Kit primitives in src/platform/ui/dribbble/: WavyBackground (CSS/SVG patterns + noise + blobs). OutlineStackTitle (title + 3-6 outline layers offset). IconRail (vertical nav, active indicator, tooltips). PillCTA (gradient pill button with hover lift). DribbbleCard (glass + gradient border + hover lift). MicroModule (compact stat/list cards). SectionHeader (dense, uppercase, horizontal rule). TopMinimalBar (brand centered, CTA pill right). DribbbleSectionEnter (scroll reveal + stagger wrapper). _Requirements: Dribbble Design Language_

- [x] Task 0.5.3: Create Dribbble motion utilities in src/platform/ui/dribbble/motion.ts: dribbblePageEnter (opacity + y + blur). dribbbleStaggerContainer/Child (0.08s stagger). dribbbleScrollReveal (whileInView). dribbbleHoverLift/Glow/Scale. dribbbleHeroFloat. dribbbleBlobFloat. dribbbleReducedMotion fallbacks. _Requirements: Dribbble Design Language_

- [x] Task 0.5.4: Create Visual Parity Checklist: Create `/docs/visual-parity-check.md`. Include checklist for: layout/composition, typography, navigation, visual effects, motion, responsive. Per-page checklists for Hub, Studio, Tenant, Artist. Anti-patterns section. _Requirements: Dribbble Design Language_

- [x] CP-0.5: Manual Checkpoint Dribbble Foundation Complete (Playwright): Verify src/platform/ui/dribbble/ contains all primitives. Verify docs/dribbble-style-guide.md is complete. Verify docs/visual-parity-check.md exists. Run TypeScript check to verify no broken imports.

### Phase 0.6: UI Consolidation & Legacy Migration

> ⚠️ **RÈGLE GLOBALE (NON-NÉGOCIABLE)**: Aucune page ne doit être créée en style "SaaS générique". Utiliser EXCLUSIVEMENT les primitives Dribbble via `@/platform/ui`.

**Objectif**: Consolider les exports et convertir les composants legacy en wrappers.

- [x] Task 0.6.1: Update design.md with UI Source of Truth section: Add "Design Source of Truth" section declaring Dribbble video as single reference. Add "Dribbble Design System Architecture" with folder structure. Add "Motion Language" with patterns. Add "Deprecation Plan" with migration status. _Requirements: UI Architecture_

- [x] Task 0.6.2: Update docs/dribbble-style-guide.md with motion patterns: Add complete motion patterns section with code examples. Document reduced-motion fallbacks. Add parallax patterns for background elements. Document spring vs smooth transitions. _Requirements: Motion Design_

- [x] Task 0.6.3: Update docs/visual-parity-check.md with density rules: Add density rules (no empty SaaS spaces). Add icon rail desktop / bottom nav mobile rules. Add specific breakpoint behaviors. Add anti-pattern examples. Add PlayerBar checklist. _Requirements: Visual QA_

- [x] Task 0.6.4: Update src/platform/ui/index.ts for unified exports: Re-export all dribbble/* components. Keep legacy exports (Button, GlassCard, OutlineText) with @deprecated. Ensure @/platform/ui is the single import point. _Requirements: Code Architecture_

- [x] Task 0.6.5: Convert legacy platform/ui primitives to wrappers: Convert Button.tsx to wrapper → PillCTA. Convert GlassCard.tsx to wrapper → DribbbleCard. Convert OutlineText.tsx to wrapper → OutlineStackTitle. Add @deprecated JSDoc comments. _Requirements: Code Architecture_

- [x] CP-0.6: Manual Checkpoint UI Consolidation Complete: Verify @/platform/ui exports all Dribbble components. Verify legacy components have @deprecated comments. Run TypeScript check. Verify build passes.

### Phase D0: Dribbble Audio Primitives & Structure Enhancement

> ⚠️ **PHASE PRIORITAIRE**: Créer les primitives audio Dribbble et finaliser la structure.

**Objectif**: Ajouter les composants audio au design system Dribbble.

#### D0.1: Audio Primitives

- [x] Task D0.1.1: Create src/platform/ui/dribbble/audio/ directory: Create audio/ subdirectory for PlayerBar primitives. _Requirements: Audio UI Dribbble_

- [x] Task D0.1.2: Create PlayerPillButton.tsx: Play/pause button in pill style. Gradient background like PillCTA. Hover lift + glow. Touch target ≥44px. _Requirements: Audio UI Dribbble_

- [x] Task D0.1.3: Create ProgressRail.tsx: Dribbble-style progress bar. Accent gradient fill. Hover glow effect. Seek functionality support. _Requirements: Audio UI Dribbble_

- [x] Task D0.1.4: Create VolumePill.tsx: Volume control in pill style. Slider with accent color. Mute toggle button. _Requirements: Audio UI Dribbble_

- [x] Task D0.1.5: Create NowPlayingChip.tsx: Compact chip for track info. Glass background. Truncated title. _Requirements: Audio UI Dribbble_

- [x] Task D0.1.6: Create WaveformPlaceholder.tsx: SVG/CSS waveform visual. Accent color bars. Can be static for MVP. _Requirements: Audio UI Dribbble_

#### D0.2: Exports Update

- [x] Task D0.2.1: Update src/platform/ui/dribbble/index.ts with audio exports: Export all audio/* components. Ensure clean public API. _Requirements: Code Architecture_

- [x] Task D0.2.2: Update src/platform/ui/index.ts with audio exports: Re-export audio components. Verify single import point works. _Requirements: Code Architecture_

- [x] CP-D0: Manual Checkpoint Phase D0 Complete: Verify audio/ directory exists with all components. Verify exports work via @/platform/ui. Run TypeScript check. Verify build passes.

### Phase D1: Refactor All Layouts to Dribbble-Only

> **Objectif**: Refactorer Hub, Studio, Tenant, Artist et PlayerBar pour utiliser 100% Dribbble primitives.

#### D1.1: Hub Refactor

- [x] Task D1.1.1: Refactor app/(hub)/page.tsx to Dribbble-only: Replace all legacy components with Dribbble equivalents. Use OutlineStackTitle for hero. Use WavyBackground with blobs/noise/waves. Use asymmetric composition (text left, modules right). Use PillCTA for all buttons. Add MicroModule sidebar elements. Implement DribbbleSectionEnter for scroll reveals. _Requirements: Hub Dribbble_

- [x] Task D1.1.2: Refactor app/(hub)/layout.tsx header/footer: Update header to TopMinimalBar style. Use PillCTA for nav CTAs. Add glass background. Ensure responsive behavior. _Requirements: Hub Dribbble_

#### D1.2: Tenant Layout Refactor

- [x] Task D1.2.1: Refactor src/components/tenant/TenantLayout.tsx: Import all UI from @/platform/ui. Use IconRail from Dribbble kit. Use TopMinimalBar pattern. Apply Dribbble motion utilities. Ensure same visual language as Hub. _Requirements: Tenant Dribbble_

- [x] Task D1.2.2: Refactor src/components/tenant/LeftRail.tsx: Use IconRail component from @/platform/ui. Apply Dribbble hover/active states. Use dribbbleHoverLift for icons. Ensure 80px width on desktop. _Requirements: Tenant Dribbble_

- [x] Task D1.2.3: Refactor src/components/tenant/MobileNav.tsx: Use Dribbble primitives for bottom nav. Apply glass background. Use PillCTA style for nav items. Ensure safe-area padding. _Requirements: Tenant Dribbble_

#### D1.3: PlayerBar Dribbble Refactor (CRITICAL)

- [x] Task D1.3.1: Refactor PlayerBar layout to Dribbble style: Keep audio logic (zustand store, play/pause, progress, volume). Keep real <audio> element. Replace layout/style with 100% Dribbble. Use glass background with glow. Apply Dribbble spacing rhythm. _Requirements: PlayerBar Dribbble_

- [x] Task D1.3.2: Replace PlayerBar buttons with Dribbble pills: Replace play/pause button with PlayerPillButton. Use PillCTA style (gradient, hover lift). Apply dribbbleHoverLift motion. Ensure touch targets ≥44px. _Requirements: PlayerBar Dribbble_

- [x] Task D1.3.3: Replace progress bar with ProgressRail: Use Dribbble-style progress rail. Apply accent gradient fill. Add hover glow effect. Ensure seek functionality works. _Requirements: PlayerBar Dribbble_

- [x] Task D1.3.4: Add NowPlayingChip and MicroModule layout: Add NowPlayingChip for track info. Use MicroModule pattern for compact layout. Apply glass + glow styling. _Requirements: PlayerBar Dribbble_

- [x] Task D1.3.5: Add WaveformPlaceholder visual: Create SVG/CSS waveform placeholder. Apply accent color. Add subtle animation (optional). Can be fake/static for MVP. _Requirements: PlayerBar Dribbble_

- [x] Task D1.3.6: Apply motion to PlayerBar: Add enter/exit animation (opacity + y + blur). Add hover lift on controls. Ensure reduced-motion compliant. _Requirements: PlayerBar Dribbble_

#### D1.4: Studio & Artist Refactor

- [ ] Task D1.4.1: Refactor Studio pages to Dribbble-only: Update app/(hub)/studio/page.tsx. Use IconRail for navigation. Use MicroModule for stats. Use SectionHeader for sections. Apply stagger animations. _Requirements: Studio Dribbble_

- [ ] Task D1.4.2: Refactor Artist pages to Dribbble-only: Update app/(hub)/artist/page.tsx. Use same Dribbble primitives. Ensure visual consistency. _Requirements: Artist Dribbble_

#### D1.5: Cleanup & Validation

- [x] Task D1.5.1: Audit used imports and identify unused files: Run import analysis across codebase. List files with zero imports. Identify legacy components still in use. _Requirements: Cleanup_

- [x] Task D1.5.2: Delete or mark LEGACY_ unused files: Delete truly unused files. Prefix remaining legacy with LEGACY_. Add @deprecated comments. Forbid new usages in code review. _Requirements: Cleanup_

- [x] Task D1.5.3: Final TypeScript and lint check: Run npm run typecheck. Run npm run lint. Fix any errors. Verify build passes. _Requirements: Cleanup_

- [x] CP-D1: Manual Checkpoint Phase D1 Complete (Playwright): Navigate to localhost:3000 (Hub). Verify Dribbble visual language throughout. Navigate to /studio. Verify IconRail, MicroModules, SectionHeaders. Navigate to tenant storefront. Verify same visual language. Verify PlayerBar is 100% Dribbble styled. Test responsive: 375px, 768px, 1024px, 1440px. Verify no horizontal scroll. Verify reduced-motion preference. Take screenshots for documentation.

### Phase D2: ELECTRI-X Visual Parity (CRITIQUE)

> ✅ **PHASE COMPLÉTÉE**: Le landing page Hub reproduit maintenant la composition ELECTRI-X du template vidéo.

**Référence**: Screenshot ELECTRI-X + `/docs/dribbble/frames/` + `/Dribbble reference.mov`

#### D2.0: Frames de Référence

- [x] Task D2.0.1: Extract frames from Dribbble reference video: ffmpeg installé. 21 frames extraites à 5fps dans `docs/dribbble/frames/frame_01.png` à `frame_21.png`. Ces frames sont la source de vérité visuelle. _Requirements: Visual Reference_

- [x] Task D2.0.2: Document key frames in visual-parity-check.md: Frames de référence identifiées. frame_01-05 = hero composition, frame_06-15 = scroll states, frame_16-21 = hover effects. _Requirements: Visual Reference_

#### D2.1: Hub Layout ELECTRI-X Refactor

- [x] Task D2.1.1: Replace Hub header with ELECTRI-X TopBar: Header SaaS supprimé. TopMinimalBar intégré dans hero: brand "BROLAB" centré, "Sign In" + "Explore →" pill CTA à droite, toggle thème (☀️/🌙) à gauche. _Requirements: ELECTRI-X Composition_

- [x] Task D2.1.2: IconRail retiré du Hub (décision): IconRail n'appartient PAS au landing page public. Réservé pour l'interface utilisateur connecté (tenant/studio). Landing page = page marketing sans navigation app. _Requirements: ELECTRI-X Composition_

- [x] Task D2.1.3: Refactor Hero to ELECTRI-X composition: Titre "EXPLORE" avec OutlineStackTitle (3 couches décalées, opacité 0.04-0.12). Police pixel "Press Start 2P". Glow cyan autour du titre. EditionBadge "BROLAB Edition" bottom-left. CyanOrb decoration bottom-left. MicroInfoModule avec stats à droite. Wavy lines visibles à droite. Constellation décorative top-right. Blob organique cyan bottom-right. Background "MUSIC" répété. _Requirements: ELECTRI-X Composition_

- [x] Task D2.1.4: Create PixelTitle component: OutlineStackTitle inline dans page.tsx avec font "Press Start 2P". 3 couches outline décalées. Glitch lines horizontales. _Requirements: ELECTRI-X Typography_

- [x] Task D2.1.5: Create EditionBadge component: Composant dans `src/platform/ui/dribbble/EditionBadge.tsx`. Badge "BROLAB Edition" avec style glass. Positionné bottom-left du hero. _Requirements: ELECTRI-X Composition_

- [x] Task D2.1.6: Create CyanOrb decoration component: Composant dans `src/platform/ui/dribbble/CyanOrb.tsx`. Cercle cyan avec gradient. Positionné près de EditionBadge. _Requirements: ELECTRI-X Composition_

- [x] Task D2.1.7: Create MicroInfoModule component: Composant dans `src/platform/ui/dribbble/MicroInfoModule.tsx`. Liste compacte avec icônes: "Best Music Platform", "1000+ creators", etc. Positionné côté droit du hero. _Requirements: ELECTRI-X Composition_

- [x] Task D2.1.8: Make WavyBackground visible on hero: WavyLinesSVG inline avec 8 courbes. Ligne pointillée verticale cyan. Constellation décorative (ConstellationDots). Radial glow top-right. _Requirements: ELECTRI-X Composition_

#### D2.2: Hub Sections ELECTRI-X Refactor

- [x] Task D2.2.1: Refactor Features section: Grid asymétrique (7/5 colonnes). DribbbleCard avec glow et hoverLift. Numbered sections ("01 WHAT WE OFFER"). _Requirements: ELECTRI-X Composition_

- [x] Task D2.2.2: Create art-directed section modules: CTASection avec 3 PillCTA (Producer, Engineer, Artist). FeaturesSection avec cards variées. FinalCTASection avec DribbbleCard glow. _Requirements: ELECTRI-X Composition_

- [x] Task D2.2.3: Update copy to ELECTRI-X style: Labels en CAPS ("SELL YOUR BEATS", "OFFER SERVICES"). Descriptions courtes. Style éditorial dense. _Requirements: ELECTRI-X Copy_

#### D2.3: Cleanup & Consolidation

- [x] Task D2.3.1: Remove unused HubIconRail component: `src/components/hub/HubIconRail.tsx` supprimé. Export retiré de `src/components/hub/index.ts`. IconRail réservé pour tenant/studio. _Requirements: Cleanup_

- [x] Task D2.3.2: Fix duplicate key warnings: Remplacé `[0,1,2...].map((i) =>` par `Array.from({ length: N }, (_, i) =>` avec clés nommées (`music-row-${i}`, `wave-${i}`, etc.). _Requirements: Code Quality_

- [x] Task D2.3.3: Add Sign In link to header: Lien "Sign In" ajouté à côté du bouton "Explore →". Visible sur desktop (hidden sm:block). _Requirements: UX_

#### D2.4: Validation

- [x] Task D2.4.1: Side-by-side comparison with frames: Screenshots pris via Playwright MCP. Comparaison avec frames extraites. Visual parity atteinte pour hero section. _Requirements: Visual QA_

- [x] CP-D2: Manual Checkpoint ELECTRI-X Visual Parity (Playwright): ✅ localhost:3000 affiche hero ELECTRI-X. ✅ Brand "BROLAB" centré. ✅ "Sign In" + "Explore →" à droite. ✅ Toggle thème à gauche. ✅ Titre "EXPLORE" avec outline stack visible. ✅ EditionBadge + CyanOrb bottom-left. ✅ MicroInfoModule à droite. ✅ Wavy lines + constellation visibles. ✅ Blob organique bottom-right. ✅ Pas d'IconRail sur landing (correct). ✅ Dark mode par défaut.

### Phase 1: Bootstrap + Design Tokens + UI Primitives + Motion

- [x] Task 1.1: Initialize Next.js project with exact pinned versions: Create `.nvmrc` with `22`. Pin exact versions: next@16.1.4, react@19.0.0, react-dom@19.0.0, typescript@5.7.2, tailwindcss@3.4.17, framer-motion@11.15.0, lucide-react@0.469.0, convex@1.17.4, @clerk/nextjs@6.10.3, stripe@17.5.0, zustand@5.0.3. Configure npm scripts: dev, build, start, lint, typecheck, build:worker, worker. worker script: `node dist/worker/index.js`. build:worker script: `tsc -p worker/tsconfig.json`. _Requirements: Technology Stack_

- [x] Task 1.2: Implement design system CSS tokens in app/globals.css: :root light and .dark color schemes with CSS custom properties. Tokens: bg, bg-2, card, card-alpha, border, border-alpha, text, muted, accent, accent-2, glow, glow-alpha. Utility classes: .bg-app, .glass, .glow, .outline-word, .pb-safe. Inter font family, 8px spacing grid. _Requirements: 23.1-23.9_

- [x] Task 1.3: Create design system UI primitives in src/platform/ui/: GlassCard component with optional glow. OutlineText component (text-[clamp(48px,12vw,140px)] heavy weight). Button component with variants (primary, secondary, ghost). PageTransition wrapper with framer-motion. _Requirements: 23.1-23.6_

- [x] Task 1.4: Implement motion utilities in src/platform/ui/motion.ts: pageEnter: opacity 0→1, y 12→0, duration 0.35s easeOut. staggerContainer: stagger children by 0.05s. heroFloat: y [-10,10,-10], duration 6-10s infinite. useReducedMotion hook respecting prefers-reduced-motion. _Requirements: 24.1-24.4_

- [x] CP-1 Manual Checkpoint: Phase 1 Complete (Playwright): Navigate to localhost:3000. Verify page loads without errors. Check dark/light theme toggle works. Verify CSS tokens applied (glass, glow effects visible). Test reduced-motion preference respected.

### Phase 2: Tenant Layout (Left Rail / Bottom Nav / Player Shell) + Responsive

- [x] Task 2.1: Create TenantLayout component with responsive structure: Desktop: fixed left icon rail (~80px). Mobile: fixed bottom nav (~64px) with safe-area padding. Content padding to avoid overlap with fixed bars. Theme toggle top-right. _Requirements: 22.4, 22.5, 22.6_

- [x] Task 2.2: Implement LeftRail component for desktop navigation: Icon-based navigation (Beats, Services, Contact). Active route highlighting. Workspace branding area. _Requirements: 22.4_

- [x] Task 2.3: Implement MobileNav component for mobile navigation: Bottom navigation bar with safe-area padding (.pb-safe). Same nav items as LeftRail. Touch targets ≥ 44px. _Requirements: 22.5, 22.3_

- [x] Task 2.4: Create PlayerBar shell component (sticky bottom): Placeholder for audio player integration. Proper z-index layering with nav. Never overlap page content. _Requirements: 12.1, 22.6_

- [x] Task 2.5: Responsive validation: Test breakpoints: 320, 360, 390, 414, 768, 820, 1024, 1280, 1440px. Verify no horizontal scroll at any breakpoint. _Requirements: 22.1, 22.2_

- [ ] CP-2 Manual Checkpoint: Phase 2 Complete (Playwright): Navigate to localhost:3000. Desktop: verify left rail visible (~80px), icons clickable. Mobile (resize to 375px): verify bottom nav visible, left rail hidden. Verify PlayerBar shell at bottom, no content overlap. Test all breakpoints: 320, 390, 768, 1024, 1440px. Verify no horizontal scroll at any size.

### Phase 3: Hub Landing + Pricing (Cinematic)

- [x] Task 3.1: Create hub layout in app/(hub)/layout.tsx: Hub-specific header/navigation. Footer component. _Requirements: 17.1_

- [x] Task 3.2: Implement landing page at app/(hub)/page.tsx: Cinematic hero section with outline typography (.outline-word). CTAs: "Start as Producer", "Start as Engineer", "I'm an Artist". Glass morphism cards (.glass) for features. Cyan glow effects (.glow). framer-motion animations (pageEnter, heroFloat). Respect prefers-reduced-motion. _Requirements: 17.1, 17.2, 17.3, 17.4_

- [x] Task 3.3: Implement pricing page at app/(hub)/(marketing)/pricing/page.tsx: BASIC and PRO plan comparison cards. Prices in USD (monthly: $9.99/$29.99, annual: $59.99/$107.99). BASIC annual = 50% OFF, PRO annual = 70% OFF. Feature comparison table. Subscribe CTA buttons (link to Clerk Billing checkout/portal). FAQ section (8-12 questions). Trust badges: "Powered by secure billing" + "One-time purchases via Stripe". _Requirements: 18.1, 18.2, 18.3, 18.4, 3.9, 3.10, 31_

#### Phase 3.5: Hub Marketing Pages Shell & Static Pages

> **Objectif**: Créer les pages marketing statiques avec layout cohérent ELECTRI-X et SEO optimisé.

- [x] Task 3.4: Create marketing route group and layout: Create `app/(hub)/(marketing)/layout.tsx` with TopMinimalBar, Footer, and consistent styling. URLs remain `/pricing`, `/about`, etc. without affecting landing page. Add active states (underline/glow) on current page link. Ensure focus-visible rings on all interactive elements. _Requirements: 19_

- [x] Task 3.4.1: Create marketing loading state: Create `app/(hub)/(marketing)/loading.tsx` with glass skeleton loader. Minimal, premium feel. Respects theme (dark/light). Improves perceived performance during navigation. _Requirements: 19_

- [x] Task 3.5: Create MarketingPageShell component: Create `src/platform/ui/dribbble/MarketingPageShell.tsx`. Features: hero word (OutlineStackTitle), real H1 SEO (sr-only), subtitle, content slots, CTA bar. Variant "long-form" for privacy/terms with TOC, "Last updated", max-width, readable typography. _Requirements: 19_

- [x] Task 3.5.1: Create MarketingSection component: Create `src/platform/ui/dribbble/MarketingSection.tsx`. Features: consistent padding (py-16 md:py-24), max-width options (default/narrow/wide), optional eyebrow label, responsive spacing. _Requirements: 19_

- [x] Task 3.5.2: Add prose styling for long-form content: Add `.prose-marketing` styles in `app/globals.css` for /privacy and /terms. Line-height 1.75, max-w-3xl, proper heading hierarchy, link styling. _Requirements: 19_

- [x] Task 3.6: Create OrganicBlob reusable component: Create `src/platform/ui/dribbble/OrganicBlob.tsx` with `useId()` for unique gradient IDs. Replace inline versions in `app/(hub)/page.tsx` and `app/tenant-demo/page.tsx`. _Requirements: Code Deduplication_

- [x] Task 3.7: Install and configure next-themes: Install `next-themes@0.4.4 --save-exact`. Add `ThemeProvider` in `app/layout.tsx` with `attribute="class"`, `defaultTheme="dark"`, `enableSystem`. Add `suppressHydrationWarning` on `<html>`. _Requirements: Code Deduplication_

- [x] Task 3.7.1: Refactor theme toggles to use next-themes: Replace manual theme logic in `src/components/hub/Header.tsx` and `src/components/tenant/TenantLayout.tsx` with `useTheme()` from next-themes. Remove localStorage manipulation and classList.toggle. _Requirements: Code Deduplication_

- [x] Task 3.8: Dedupe OutlineStackTitle and WavyLines: Replace inline `OutlineStackTitle` in `app/(hub)/page.tsx` and `app/tenant-demo/page.tsx` with import from `@/platform/ui`. Replace inline `WavyLinesSVG` with `WavyLines` from `@/platform/ui`. Create `ConstellationDots.tsx` if needed (low priority - decorative only). _Requirements: Code Deduplication_

- [x] Task 3.9: Implement About page at app/(hub)/(marketing)/about/page.tsx: Mission statement (1 phrase). Problem/solution (marketplace vs brand). What BroLab enables (beats + services + payouts). Optional roadmap "coming next". Use MarketingPageShell with heroWord="ABOUT". No unverifiable claims. _Requirements: 19_

- [x] Task 3.10: Implement Contact page at app/(hub)/(marketing)/contact/page.tsx: Simple form with role selector (Producer/Engineer/Artist/Brand). Support email + response time. Social links (optional). Use MarketingPageShell with heroWord="CONTACT". _Requirements: 19_

- [x] Task 3.11: Implement Privacy page at app/(hub)/(marketing)/privacy/page.tsx: Use MarketingPageShell variant="long-form". "Last updated" header. Table of Contents (TOC) sticky sidebar. prose-marketing styling. Legal contact email. _Requirements: 19_

- [x] Task 3.12: Implement Terms page at app/(hub)/(marketing)/terms/page.tsx: Use MarketingPageShell variant="long-form". Same structure as Privacy page. _Requirements: 19_

- [x] Task 3.13: Wire header/footer navigation links: Replace all `href="#"` in Footer.tsx and Header.tsx with real routes: `/about`, `/contact`, `/privacy`, `/terms`, `/pricing`. Add active states (underline or subtle glow on current page). Ensure focus-visible rings on all links. _Requirements: 19_

- [x] Task 3.14: SEO foundation - metadata per page: Add `export const metadata: Metadata` to each marketing page with title, description, openGraph, twitter, canonical. _Requirements: 19_

- [x] Task 3.14.1: SEO foundation - FAQPage JSON-LD schema: Add FAQPage schema to /pricing page (8-12 FAQ questions). Use `<script type="application/ld+json">` tag. _Requirements: 19_

- [x] Task 3.14.2: SEO foundation - SoftwareApplication JSON-LD schema: Add SoftwareApplication schema to landing page with pricing info (BASIC/PRO plans). Use `<script type="application/ld+json">` tag. _Requirements: 19_

- [x] Task 3.15: SEO foundation - sitemap and robots: Create `app/sitemap.ts` with all public URLs. Create `app/robots.ts` with rules (allow `/`, disallow `/studio/`, `/artist/`, `/_t/`). _Requirements: 19_

#### Phase 3.5.x: Unify Marketing Hero (Stop Hero Drift)

> **Objectif**: Verrouiller le hero ELECTRI-X canonique pour toutes les pages marketing.

- [x] Task 3.5.x.1: Update MarketingPageShell with ELECTRI-X canonical hero: Replace hero with OutlineStackTitle using "Press Start 2P" font. Add cyan glow textShadow (0 0 40px rgba(var(--accent),0.25)). Add scanlines (2 horizontal lines at 40% and 60%). Add BackgroundWordPattern (hero word repeated like "MUSIC" on home). _Requirements: 31_

- [x] Task 3.5.x.2: Update MarketingPageShell layout to asymmetric grid: Desktop: grid layout (left: hero word + subtitle + CTA, right: micro-module in DribbbleCard). Mobile: centered layout. Change from text-center to text-center lg:text-left. _Requirements: 31_

- [x] Task 3.5.x.3: Refactor marketing layout to use next-themes: Replace manual theme logic (localStorage, classList.toggle) with useTheme() from next-themes. Add mounted state to avoid hydration mismatch. Remove all document.documentElement manipulation. _Requirements: 31_

- [x] Task 3.5.x.4: Audit marketing pages for local hero components: Verify /pricing uses MarketingPageShell (no PricingHero). Verify /about uses MarketingPageShell. Verify no function *Hero() exists in app/(hub)/(marketing)/**/page.tsx. _Requirements: 31_

- [x] Task 3.5.x.5: Extract BackgroundMusicPattern as reusable component: If BackgroundMusicPattern exists separately, ensure it's exported from @/platform/ui. Otherwise, keep inline BackgroundWordPattern in MarketingPageShell. _Requirements: Code Architecture_

- [x] CP-3.5.x: Manual Checkpoint Marketing Hero Unified (Playwright): Navigate to /pricing. Verify hero uses OutlineStackTitle with "Press Start 2P" font. Verify cyan glow visible on title. Verify scanlines (2 horizontal lines). Verify background pattern with "PRICING" repeated. Verify asymmetric layout on desktop (text left, card right). Navigate to /about. Verify same visual language. Verify no PricingHero() or AboutHero() components exist. Test responsive breakpoints.

### Phase D4: Kit UI Anti-Derivation (RÈGLE D'OR)

> 🔴 **PHASE CRITIQUE**: Éliminer toutes les violations de la règle d'or du kit UI et verrouiller l'architecture pour empêcher la dérive.

**Règle d'Or (Source de Vérité):**
- ✅ **Autorisé**: Composants et helpers dans `src/platform/ui/**` (particulièrement `src/platform/ui/dribbble/**`)
- ⚠️ **Toléré**: Wrappers "feature" (ex: `src/components/hub/**`) mais SANS styles maison → juste composition des composants du kit
- ❌ **Interdit**: Créer un nouveau header, pattern, animation, ou style "à côté" du kit

**Objectif**: Un seul langage visuel (spacing, glass, blur, radius, motion, typography, layout).

**Référence**: Retour ChatGPT + Analyse code duplication + `docs/landing-improvements.md`

#### D4.1: Créer GlassSurface (Primitive Générique)

> **Principe**: Un composant générique au lieu de multiples composants spécifiques (GlassHeader, GlassFooter, GlassContainer).

- [ ] Task D4.1.1: Create GlassSurface component: Create `src/platform/ui/dribbble/GlassSurface.tsx`. Props: `as` (polymorphic element), `radius` (none/md/xl/2xl/full), `padding` (none/sm/md/lg), `bordered` (boolean), `blur` (none/sm/md), `className`. Use `cn()` utility for class merging. Support all HTML elements via `as` prop. _Requirements: 31, Code Architecture_

- [ ] Task D4.1.2: Export GlassSurface from kit: Add to `src/platform/ui/dribbble/index.ts`. Add to `src/platform/ui/index.ts`. Verify single import point works. _Requirements: Code Architecture_

#### D4.2: Créer Wrappers DX Optionnels

> **Principe**: Wrappers pour DX agréable, mais tous basés sur GlassSurface.

- [ ] Task D4.2.1: Create GlassHeader wrapper: Create `src/platform/ui/dribbble/GlassHeader.tsx`. Wrapper around `GlassSurface as="header"`. Props: `isScrolled` (boolean), `children`, `className`. Apply fixed positioning, z-index, transition. Conditional glass + backdrop-blur based on `isScrolled`. _Requirements: 31_

- [ ] Task D4.2.2: Create GlassFooter wrapper: Create `src/platform/ui/dribbble/GlassFooter.tsx`. Wrapper around `GlassSurface as="footer"`. Props: `children`, `className`. Apply border-top, glass styling. _Requirements: 31_

- [ ] Task D4.2.3: Export glass wrappers from kit: Add GlassHeader and GlassFooter to `src/platform/ui/dribbble/index.ts` and `src/platform/ui/index.ts`. _Requirements: Code Architecture_

#### D4.3: Refactoriser Header Hub pour Utiliser TopMinimalBar

> **Principe**: Pas de duplication. Header = wrapper de TopMinimalBar avec config Hub-specific.

- [ ] Task D4.3.1: Update TopMinimalBar to support slots: Add `right` slot prop to TopMinimalBar for custom actions (theme toggle, etc.). Remove `onThemeToggle` and `isDark` props (trop spécifique). Keep `brand`, `brandHref`, `navItems`, `cta`, `secondaryAction`. _Requirements: 31_

- [ ] Task D4.3.2: Create ThemeToggle component: Create `src/components/hub/ThemeToggle.tsx`. Use `useTheme()` from next-themes. Render sun/moon icon. Apply focus-visible ring. _Requirements: 31_

- [ ] Task D4.3.3: Refactor Header to use TopMinimalBar: Replace entire `src/components/hub/Header.tsx` implementation. Use TopMinimalBar with Hub-specific config. Pass `<ThemeToggle />` to `right` slot. Remove all duplicated logic (mobile menu, theme toggle, glass styling). _Requirements: 31_

#### D4.4: Éliminer Tous les Styles Glass Hors du Kit

> **Principe**: Aucun `className="glass"`, `backdrop-blur`, ou `border-[rgba(var(--border)` hors de `src/platform/ui/dribbble/**`.

- [ ] Task D4.4.1: Replace glass styles in Header.tsx: Replace `className="glass border-b border-[rgba(var(--border),0.3)]"` with `<GlassHeader isScrolled={isScrolled}>`. _Requirements: 31_

- [ ] Task D4.4.2: Replace glass styles in Footer.tsx: Replace `className="border-t border-border glass"` with `<GlassFooter>`. _Requirements: 31_

- [ ] Task D4.4.3: Replace glass styles in HubLandingPageClient.tsx: Replace `className={... backdrop-blur-sm ...}` with `<GlassHeader isScrolled={isScrolled}>`. _Requirements: 31_

- [ ] Task D4.4.4: Replace glass styles in loading.tsx: Replace `className="glass rounded-xl"` with `<GlassSurface radius="xl">`. _Requirements: 31_

- [ ] Task D4.4.5: Replace glass styles in PricingPageClient.tsx: Replace all `className="glass rounded-full"` with `<GlassSurface radius="full" padding="sm">`. Replace toggle switch glass with GlassSurface. _Requirements: 31_

- [ ] Task D4.4.6: Replace glass styles in marketing layout.tsx: Replace `className={... backdrop-blur-sm ...}` with `<GlassHeader isScrolled={isScrolled}>`. _Requirements: 31_

#### D4.5: Centraliser Motion Variants

> **Principe**: Aucun variant motion défini localement. Tous dans `src/platform/ui/dribbble/motion.ts`.

- [ ] Task D4.5.1: Add dribbblePlayerBarEnter to motion.ts: Create `dribbblePlayerBarEnter` variant in `src/platform/ui/dribbble/motion.ts`. Initial: opacity 0, y 20, filter blur(10px). Animate: opacity 1, y 0, filter blur(0px). Exit: opacity 0, y 10, filter blur(5px). _Requirements: 31_

- [ ] Task D4.5.2: Export dribbblePlayerBarEnter from kit: Add to `src/platform/ui/dribbble/index.ts` and `src/platform/ui/index.ts`. _Requirements: Code Architecture_

- [ ] Task D4.5.3: Refactor PlayerBar to use dribbblePlayerBarEnter: Replace local `playerBarVariants` definition with import from `@/platform/ui`. Use `prefersReducedMotion ? dribbbleReducedMotion : dribbblePlayerBarEnter`. _Requirements: 31_

#### D4.6: Garde-Fous Anti-Dérive

> **Principe**: Empêcher la dérive future avec des contrôles automatiques.

- [ ] Task D4.6.1: Add ESLint rule for glass styles: Add custom ESLint rule or use `no-restricted-syntax` to forbid `className="glass"`, `backdrop-blur`, `border-[rgba(var(--border)` outside `src/platform/ui/`. Document in `.eslintrc.json`. _Requirements: Code Quality_

- [ ] Task D4.6.2: Add CI check for glass styles: Create `.github/workflows/ui-lint.yml`. Add grep check: `grep -R "glass\|backdrop-blur" src app | exclude src/platform/ui`. Fail CI if violations found. _Requirements: Code Quality_

- [ ] Task D4.6.3: Document UI architecture rules: Update `docs/decisions.md` with "UI Architecture Rules" section. Document: single import point (@/platform/ui), no styles outside kit, GlassSurface as primitive, motion centralization. Add examples of violations. _Requirements: Documentation_

#### D4.7: Landing Page Improvements (ChatGPT Feedback)

> **Objectif**: Implémenter les 7 points de feedback ChatGPT pour améliorer la conversion.

**Référence**: `docs/landing-improvements.md`

##### D4.7.1: Priorité 1 - Fixes Critiques

- [ ] Task D4.7.1.1: Fix typo "subscriptioins": Replace `'Powered by Clerk Billing (subscriptioins)'` with `'Powered by Clerk Billing (subscriptions)'` in `platformInfo` constant. _Requirements: 31_

- [ ] Task D4.7.1.2: Add hero copy block: Add eyebrow ("FOR PRODUCERS & AUDIO ENGINEERS"), value prop ("Sell beats. Book sessions. Get paid directly."), dual CTAs (Get Started Free + View Demo), microcopy ("No credit card • Cancel anytime"). Desktop: left of "EXPLORE" title. Mobile: below title, centered. _Requirements: 31_

- [ ] Task D4.7.1.3: Create TrustChip component: Create `src/platform/ui/dribbble/TrustChip.tsx`. Small pill with glass background, border, muted text. Export from kit. _Requirements: 31_

- [ ] Task D4.7.1.4: Add TrustRow section: Create TrustRow section after HeroSection. 5 chips: "Stripe-ready payments", "Clerk auth & billing", "Instant license delivery", "Creator-first pricing", "No marketplace noise". Use TrustChip component. _Requirements: 31_

##### D4.7.2: Priorité 2 - Clarté & Conversion

- [ ] Task D4.7.2.1: Add "How It Works" section: Create HowItWorksSection with 3 steps: "01 Create your storefront", "02 Upload beats / services", "03 Get paid + deliver licenses". Use DribbbleCard, numbered sections, stagger animation. Insert after FeaturesSection. _Requirements: 31_

- [ ] Task D4.7.2.2: Add microcopy to role CTAs: Refactor CTASection. Add descriptions under each button: "Sell beats & packs" (Producer), "Book sessions & services" (Engineer), "Find beats & hire pros" (Artist). Create RoleCTACard component. _Requirements: 31_

- [ ] Task D4.7.2.3: Add FAQ section: Create FAQSection with 6 questions: Stripe account, license delivery, beats + services, commission, custom domain, free plan. Accordion expand/collapse with useState. Use DribbbleCard. Insert before FinalCTASection. _Requirements: 31_

##### D4.7.3: Priorité 3 - Nice-to-Have

- [ ] Task D4.7.3.1: Add Product Preview section (optional): Create ProductPreviewSection with screenshot placeholder or mock card. Link to `/tenant-demo`. Use DribbbleCard with glow. Insert after HowItWorksSection. _Requirements: 31_

#### D4.8: Validation & Documentation

- [ ] Task D4.8.1: Audit all files for glass violations: Run grep search: `grep -R "className=.*glass\|className=.*blur\|className=.*backdrop" src app --exclude-dir=src/platform/ui`. Verify zero results outside kit. _Requirements: Code Quality_

- [ ] Task D4.8.2: Audit all files for motion violations: Run grep search: `grep -R "const.*Variants.*=\|export const.*variants" src app --exclude-dir=src/platform/ui`. Verify zero results outside kit. _Requirements: Code Quality_

- [ ] Task D4.8.3: Audit all files for direct dribbble imports: Run grep search: `grep -R "import.*from.*dribbble" src app --exclude-dir=src/platform/ui`. Verify zero results (all imports via @/platform/ui). _Requirements: Code Quality_

- [ ] Task D4.8.4: Update visual-parity-check.md with anti-patterns: Add "Anti-Patterns" section with examples: glass styles outside kit, motion variants outside kit, direct dribbble imports, Header duplication. _Requirements: Documentation_

- [ ] Task D4.8.5: Create UI architecture diagram: Create `docs/ui-architecture.md` with ASCII diagram showing: @/platform/ui (single entry), dribbble/ (internal), app/ (consumers), components/ (wrappers only). _Requirements: Documentation_

- [ ] CP-D4: Manual Checkpoint Phase D4 Complete (Playwright): Navigate to localhost:3000. Verify hero has eyebrow + value prop + dual CTAs + microcopy. Verify TrustRow visible after hero. Verify "How It Works" section with 3 steps. Verify role CTAs have descriptions. Verify FAQ section with 6 questions. Verify typo "subscriptioins" fixed. Run grep checks: verify zero glass violations, zero motion violations, zero direct dribbble imports. Verify Header uses TopMinimalBar (no duplication). Verify Footer uses GlassFooter. Test responsive: 375px, 768px, 1024px, 1440px. Verify no horizontal scroll. Take screenshots for documentation. theme toggle uses next-themes (no flash, no manual classList).

- [x] CP-3 Manual Checkpoint: Phase 3 Complete (Playwright): Navigate to localhost:3000 (landing page). Verify cinematic hero with outline typography. Verify CTAs visible: "Start as Producer", "Start as Engineer", "I'm an Artist". Verify glass cards and cyan glow effects. Navigate to /pricing. Verify BASIC ($9.99/mo, $59.99/yr) and PRO ($29.99/mo, $107.99/yr) cards. Verify feature comparison table and FAQ with FAQPage JSON-LD schema. Navigate to /about, /contact, /privacy, /terms. Verify consistent ELECTRI-X styling with MarketingPageShell. Verify glass skeleton loading state on navigation. Verify TOC on privacy/terms pages with prose-marketing styling. Verify all footer/header links work (no more #) with active states. Verify focus-visible rings on all interactive elements. Test theme toggle with next-themes (no flash). Test animations (pageEnter, heroFloat). Verify sitemap.xml and robots.txt accessible. Verify JSON-LD schemas: FAQPage on /pricing, SoftwareApplication on landing page. Verify /pricing and /about have hero visually consistent with / (same patterns: OutlineStackTitle/PressStart, scanlines, background pattern, accents cyan, modules Dribbble). Verify no occurrence of function *Hero() in app/(hub)/(marketing)/**/page.tsx.

### Phase 4: Convex Schema + Platform Core Helpers

- [ ] Task 4.1: Initialize Convex project and configure environment: npx convex dev setup. Environment variables configuration. convex/http.ts for HTTP endpoints. _Requirements: Technology Stack_

- [ ] Task 4.2: Implement Convex schema in convex/schema.ts: Platform tables: users, workspaces, domains, providerSubscriptions, usage, auditLogs, events, jobs, processedEvents. Module tables: tracks, services, orders, purchaseEntitlements, bookings. All indexes as specified in design. _Requirements: 5.1, 5.2, 5.3_

- [ ] Task 4.3: Create platform core helpers in convex/platform/: users.ts: user CRUD, role management. workspaces.ts: workspace CRUD, slug validation. domains.ts: domain CRUD, hostname resolution (verified only). _Requirements: 4.1, 4.2, 4.3, 4.4_

- [ ] Task 4.4: Implement billing/plans configuration: src/platform/billing/plans.ts with PLAN_FEATURES. BASIC: max_published_tracks=25, storage_gb=1, max_custom_domains=0. PRO: max_published_tracks=-1 (unlimited), storage_gb=50, max_custom_domains=2. PREVIEW_DURATION_SEC = 30. _Requirements: 3.2, 3.3_

- [ ] Task 4.5: Implement entitlements and quotas helpers: getWorkspacePlan(workspaceId) function. assertEntitlement(workspaceId, key) function. assertQuota(workspaceId, metric) function. Server-side enforcement (never trust client). _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [ ] Task 4.6: Implement job queue in convex/platform/jobs.ts: enqueueJob mutation. Job status management (pending, processing, completed, failed). Concurrency lock helpers (lockedAt, lockedBy). Retry support with attempts tracking. _Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6_

- [ ] Task 4.7: Implement observability in convex/platform/: auditLogs.ts: log provider admin actions. events.ts: record lifecycle events. _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] CP-4 Manual Checkpoint: Phase 4 Complete (Playwright + Convex Dashboard): Open Convex Dashboard (npx convex dashboard). Verify all tables created: users, workspaces, domains, providerSubscriptions, usage, auditLogs, events, jobs, processedEvents, tracks, services, orders, purchaseEntitlements, bookings. Verify indexes visible on each table. Test a simple query in Convex dashboard to confirm schema works.

### Phase 5: Clerk Auth + Onboarding + Branded Clerk UI

- [ ] Task 5.1: Configure Clerk with Next.js App Router: ClerkProvider in app/layout.tsx. clerkMiddleware() integration (NOT authMiddleware - deprecated). Environment variables setup (NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY, CLERK_SECRET_KEY). _Requirements: 2.1_

- [ ] Task 5.2: Create branded Clerk UI components: Custom SignIn page at app/(hub)/sign-in/[[...sign-in]]/page.tsx. Custom SignUp page at app/(hub)/sign-up/[[...sign-up]]/page.tsx. Glass container styling (.glass), cyan accent, Inter font, rounded corners (2xl/3xl). Focus-visible rings on interactive elements. _Requirements: 26.1, 26.2, 26.3, 26.5, 26.6_

- [ ] Task 5.3: Implement onboarding flow at app/(hub)/onboarding/page.tsx: Role selection (producer, engineer, artist). Workspace creation for providers (slug, name, type). Subscription step (link to Clerk Billing). Stripe Connect onboarding step. Redirect logic based on role. _Requirements: 2.2, 4.1, 4.2, 27.1_

- [ ] Task 5.4: Create ConvexClientProvider with Clerk integration: ConvexProviderWithClerk setup. Use Authenticated/Unauthenticated/AuthLoading from convex/react (NOT Clerk components). useConvexAuth() for auth state. _Requirements: 2.1, 2.5_

- [ ] Task 5.5: Implement role-based routing: Redirect to /onboarding if role missing. Provider access to /studio/*. Artist access to /artist/*. Document auth-bridge flow for custom domains. _Requirements: 2.2, 2.3, 2.4, 2.6, 2.7_

- [ ] CP-5: Manual Checkpoint Phase 5 Complete (Playwright): Navigate to localhost:3000/sign-in. Verify branded Clerk UI (glass container, cyan accent, Inter font). Sign up as new user. Verify redirect to /onboarding. Complete onboarding: select "Producer" role, create workspace (slug, name). Verify redirect to /studio after completion. Sign out, sign in again → verify direct access to /studio. Test artist flow: new user → select "Artist" → verify redirect to /artist.

### Phase 6: proxy.ts + Tenancy Resolution + Tenant Route Group (Option B)

- [ ] Task 6.1: Implement proxy.ts with Node runtime routing logic: Hub domain detection (brolabentertainment.com, www.brolabentertainment.com). Hostname normalization (strip port, lowercase). Subdomain extraction (slug.brolabentertainment.com). Reserved subdomains handling (www, app, api, admin, studio, artist, pricing, sign-in, sign-up) → redirect to hub OR 404. Rewrite to /_t/[workspaceSlug]/... pattern. Custom domain resolution via Convex domains table (verified only). Unknown/unverified domains return 404. _Requirements: 1.1, 1.2, 1.4, 1.5, 1.6_

- [ ] Task 6.1.1: Document proxy runtime / deployment: proxy.ts runs as the entry server (Node) in prod. Next runs behind it (standalone output) OR proxy uses Next as handler. Ensure Host header forwarded correctly. Support websockets if needed (Convex realtime). Document deployment options: Render/Fly/VPS vs Vercel limitations. _Requirements: 1.6_

- [ ] Task 6.2: Create middleware.ts (Clerk + static exclusions only, NO tenancy logic): clerkMiddleware() for auth/redirect. Static file exclusions (_next/static, _next/image, favicon.ico). Tenancy resolution owned by proxy.ts (NOT middleware). _Requirements: 1.6, 2.1_

- [ ] Task 6.3: Create Convex HTTP endpoint for domain resolution: convex/http.ts with /api/domains/resolve endpoint. Returns slug for verified domains only. Returns null for unverified/unknown domains. _Requirements: 1.3, 1.5_

- [ ] Task 6.4: Create tenant route group app/(_t)/[workspaceSlug]/: Layout with TenantLayout component. Workspace context provider. Placeholder pages: /, /beats, /beats/[id], /services, /services/[id], /contact. _Requirements: 1.2, 1.3_

- [ ] CP-6: Manual Checkpoint Phase 6 Complete (Playwright): Navigate to localhost:3000 → verify hub landing. Navigate to {slug}.localhost:3000 (or test subdomain) → verify tenant storefront. Verify tenant layout: left rail (desktop), bottom nav (mobile). Navigate to /_t/{slug}/beats → verify placeholder page. Navigate to /_t/{slug}/services → verify placeholder page. Test reserved subdomain (www.localhost:3000) → verify redirect to hub or 404. Test unknown subdomain → verify 404.

### Phase 7: Clerk Billing Subscription Sync

- [ ] Task 7.1: Implement Clerk Billing subscription sync: Webhook handler for Clerk billing events. providerSubscriptions table updates. Subscription gating in provider mutations (server-side rejection). _Requirements: 3.1, 3.4, 3.7, 3.8_

- [ ] Task 7.2: Create billing management page at app/(hub)/studio/billing/page.tsx: Subscription status display. Clerk Billing component integration (branded). Usage vs quota display. _Requirements: 3.6, 19.1, 19.6_

- [ ] CP-7: Manual Checkpoint Phase 7 Complete (Playwright): Sign in as provider. Navigate to /studio/billing. Verify subscription status displayed (or "No subscription" if none). Click subscribe → verify Clerk Billing checkout opens. Complete test subscription (Stripe test mode). Verify subscription status updates to "active". Verify usage vs quota display (0/25 tracks, 0/1GB storage). Test subscription gating: try provider action without subscription → verify blocked.

### Phase 8: Beats Upload + Preview Jobs + Worker + Player Integration

- [ ] Task 8.1: Create track upload mutation in convex/modules/beats.ts: File format validation (wav/mp3). Convex upload URL pattern (generate URL → upload → create record). Track record creation with draft status. Usage tracking update (storageUsedBytes). _Requirements: 10.1, 10.5_

- [ ] Task 8.2: Implement preview generation job handler: Job type "preview_generation". Payload with trackId and fullStorageId. Provider-controlled: "Generate preview now" option (default ON). If OFF: previewPolicy = "manual", no job enqueued. _Requirements: 10.2, 10.3, 10.4, 11.1_

- [ ] Task 8.3: Implement external job worker (Node.js with ffmpeg): worker/index.ts job runner (TypeScript). Add build:worker script: `tsc -p worker/tsconfig.json`. Run with: `node dist/worker/index.js`. Poll Convex jobs table for pending jobs. Lock job (lockedAt, lockedBy) before processing. ffmpeg CLI execution: extract first 30s to mp3 (or full if shorter). Upload preview to Convex Storage. Update track with previewStorageId, processingStatus. Record "preview_generated" event. Handle failures: update processingStatus to "failed", record error. _Requirements: 11.2, 11.3, 11.4, 11.7_

- [ ] Task 8.4: Implement track publish mutation: assertQuota check for max_published_tracks. Status update to published. Usage tracking update (publishedTracksCount). Audit log creation (track_publish). _Requirements: 10.8, 10.9, 9.1_

- [ ] Task 8.5: Add preview generation UI controls: "Generate Preview" checkbox on upload (default ON). Processing status indicator (processing, completed, failed). Retry button for failed jobs. "Generate preview" action for tracks without preview. _Requirements: 10.6, 10.7, 11.5, 11.6_

- [ ] Task 8.6: Create track management UI in src/modules/beats/components/: TrackUpload component with drag-and-drop. TrackList component with status indicators. TrackCard component with preview play button. _Requirements: 19.2_

- [ ] Task 8.7: Implement studio tracks page at app/(hub)/studio/tracks/page.tsx: Track list with upload button. Draft/published filtering. Processing status indicators. Preview status and generate preview actions. _Requirements: 19.2_

- [ ] Task 8.8: Create EnhancedGlobalAudioPlayer component: Real HTML audio element with controls. Global audio store (zustand) for state management. Playback state persistence across navigation. _Requirements: 12.2, 12.3, 12.4_

- [ ] Task 8.9: Implement PlayerBar with full controls: Track title display. Progress bar with seek. Play/pause, volume controls. "No preview available" state. Sticky at bottom of tenant pages. _Requirements: 12.1, 12.2, 12.3, 12.5_

- [ ] Task 8.10: Connect track cards to global player: Play button triggers global player. Visual indicator for currently playing track. _Requirements: 12.2_

- [ ] CP1: Checkpoint Vertical Slice Complete: Provider can sign up, create workspace, upload track. Preview generation works via worker. Tenant storefront displays track with preview playback. Ensure all tests pass, ask the user if questions arise.

- [ ] CP-8: Manual Checkpoint Phase 8 Complete (Playwright): Sign in as provider with active subscription. Navigate to /studio/tracks. Upload a test audio file (wav or mp3). Verify "Generate Preview" checkbox (default ON). Submit upload → verify track appears in list with "processing" status. Start worker (npm run worker) → verify preview generation completes. Verify track status changes to "completed". Click publish → verify track published. Navigate to tenant storefront /{slug}/beats. Verify track visible with play button. Click play → verify audio plays in PlayerBar. Verify progress bar, play/pause, volume controls work. Test track without preview → verify "No preview available" message.

### Phase 9: Stripe Connect Onboarding + Checkout + Webhook + Entitlements + Downloads

- [ ] Task 9.1: Configure Stripe Connect in environment: Stripe API keys (platform secret key). Connect webhook endpoint secret. _Requirements: 27.1_

- [ ] Task 9.2: Implement Stripe Connect onboarding flow: Standard account type. OAuth redirect flow. stripeAccountId storage on workspace. paymentsStatus update (unconfigured → pending → active). Record "payments_connected" event. _Requirements: 27.1, 27.2, 27.3, 27.5_

- [ ] Task 9.3: Create checkout API at app/api/stripe/checkout/route.ts: Direct Charges on connected account (stripeAccount parameter). Metadata: workspaceId, itemType, itemId, buyerClerkUserId. application_fee_amount = 0 (default, platform fee = 0 for MVP). Check paymentsStatus === "active" and stripeAccountId exists. _Requirements: 13.1, 13.2, 13.3, 13.7, 13.8_

- [ ] Task 9.4: Implement Stripe webhook handler at app/api/stripe/webhook/route.ts: Signature verification. processedEvents idempotency check (provider="stripe_connect", eventId, include connected account id in meta). Skip if event already processed, return 200. checkout.session.completed handling. Order creation. Entitlement creation (for tracks) or Booking creation (for services). Record "checkout_success" event. _Requirements: 14.1, 14.2, 14.3, 14.4, 14.5, 14.6_

- [ ] Task 9.5: Implement purchase entitlement creation: Create purchaseEntitlement on successful checkout (track purchase). Link buyer to track. _Requirements: 13.5, 14.5_

- [ ] Task 9.6: Create download API with entitlement check: Verify purchaseEntitlement exists for buyer + track. Generate time-limited download URL (signed or equivalent). Deny access if no entitlement. _Requirements: 15.1, 15.2, 15.3_

- [ ] Task 9.7: Implement artist dashboard at app/(hub)/artist/page.tsx: Purchased tracks with download links. Service bookings with status. Order history. _Requirements: 20.1, 20.2, 20.3_

- [ ] Task 9.8: Handle "Payments not configured" state: Show message and disable buy button if provider not connected. _Requirements: 13.8, 27.4_

### Phase 9.X: Licensing Tiers + License PDF Job

- [ ] Task 9.9: Update tracks pricing model to license tiers (Basic/Premium/Unlimited): Update Convex schema tracks table with priceUsdByTier + optional priceEurByTier. Update studio track form UI to edit prices per tier. Add stemsStorageId field for Unlimited tier. _Requirements: 29.1, 29.9, 29.10_

- [ ] Task 9.10: Checkout: include licenseTier in metadata + UI selector on beat detail: Add license tier selector on beat detail page (Basic/Premium/Unlimited with prices). Include licenseTier in Stripe checkout metadata. Display tier features/caps comparison. _Requirements: 29.2_

- [ ] Task 9.11: Webhook: persist licenseTier in orders + create license records: Save licenseTier in orders table. Create purchaseEntitlements with licenseTier, licenseTermsVersion, licenseTermsSnapshot. Create licenses table record with full snapshot. Create licenseDocuments record (status: pending). _Requirements: 29.3, 29.4_

- [ ] Task 9.12: Enqueue job license_pdf_generation after entitlement creation: Add job type "license_pdf_generation" to job queue. Enqueue job with payload: licenseId, documentId, workspaceId. _Requirements: 29.5_

- [ ] Task 9.13: Worker: implement license_pdf_generation handler (pdf-lib): Fetch license + track + workspace data via Convex. Generate PDF using pdf-lib (A4 format). Include sections: Title, Parties, Track Info, License Tier, Rights & Caps, Stems, Publishing, Credit, Prohibited Uses. Upload PDF via Convex upload URL pattern. Update licenseDocuments with storageId + status "generated". Update purchaseEntitlements.licensePdfStorageId. _Requirements: 29.6_

- [ ] Task 9.14: Artist dashboard: show "Download license PDF" if available: Display license tier badge on purchased tracks. Add "Download License PDF" button (if licensePdfStorageId exists). Add "Download Audio" button (time-limited URL). For Unlimited tier: add "Download Stems" button. _Requirements: 29.7, 29.8_

### Phase 9.Y: Resend Transactional Emails (Idempotent)

- [ ] Task 9.15: Add Resend integration (env vars + client): Install resend package. Configure RESEND_API_KEY env var. Create src/platform/email/resend.ts client wrapper. _Requirements: 30.1_

- [ ] Task 9.16: Add email idempotency (emailEvents table): Create emailEvents table in Convex schema. Implement checkEmailEvent and recordEmailEvent helpers. Ensure same event never sends duplicate emails. _Requirements: 30.5_

- [ ] Task 9.17: Send artist purchase email on successful checkout: Trigger from Stripe webhook after order/entitlement creation. Include: track title, licenseTier, link to /artist dashboard. Use dedupeKey: "stripe:{eventId}:artist_purchase". Never include direct signed URLs (link to dashboard instead). _Requirements: 30.2, 30.6, 30.7_

- [ ] Task 9.18: Send provider subscription status email on Clerk billing webhook events: Trigger on subscription active/canceled events. Include: status change confirmation, link to /studio/billing. Use dedupeKey: "clerk:{eventId}:subscription_status". _Requirements: 30.4_

- [ ] Task 9.19: Send booking confirmation email for service purchases: Trigger from Stripe webhook after booking creation. Include: service title, booking status, link to /artist dashboard. Use dedupeKey: "stripe:{eventId}:booking_confirm". _Requirements: 30.3_

- [ ] CP-9X: Manual Checkpoint Phase 9.X+Y Complete (Licensing + Emails): Sign in as provider, create track with tier pricing (Basic $29, Premium $49, Unlimited $149). Sign in as artist, navigate to beat detail. Verify tier selector with prices and features. Purchase Premium tier → verify checkout includes licenseTier. Verify order created with licenseTier. Verify license + licenseDocuments records created. Start worker → verify license PDF generated. Navigate to /artist → verify "Download License PDF" button. Click download → verify PDF downloads with correct content. Verify purchase confirmation email received (check Resend dashboard). Test Unlimited tier → verify stems download available. Test subscription email: change provider subscription → verify email sent.

- [ ] CP2: Checkpoint Payments Flow Complete: Stripe Connect onboarding works. Checkout creates orders and entitlements. Download access properly gated by entitlement. Webhook idempotency verified. Ensure all tests pass, ask the user if questions arise.

- [ ] CP-9: Manual Checkpoint Phase 9 Complete (Playwright): Sign in as provider. Navigate to /studio → verify Stripe Connect onboarding prompt. Complete Stripe Connect onboarding (test mode). Verify paymentsStatus = "active" in workspace. Sign out, sign in as artist. Navigate to tenant storefront /{slug}/beats/{id}. Verify "Buy" button enabled (provider connected). Click Buy → complete Stripe Checkout (test card 4242...). Verify redirect to success page. Navigate to /artist → verify purchased track in list. Click download → verify file downloads. Test without entitlement: new artist → verify download blocked. Test provider not connected: verify "Payments not configured" message.

### Phase 10: Services Module + Tenant Pages

- [ ] Task 10.1: Implement service CRUD in convex/modules/services.ts: Create service mutation (title, description, priceUSD, priceEUR, turnaround, features, isActive). Update service mutation. Toggle isActive mutation. Audit log creation (service_create). _Requirements: 16.1, 16.2_

- [ ] Task 10.2: Create service management UI in src/modules/services/components/: ServiceForm component. ServiceList component. ServiceCard component. _Requirements: 19.3_

- [ ] Task 10.3: Implement studio services page at app/(hub)/studio/services/page.tsx: Service list with create button. Active/inactive filtering. _Requirements: 19.3_

- [ ] Task 10.4: Implement booking creation: Create Booking record on service purchase. Status tracking (pending, confirmed, completed, canceled). _Requirements: 13.6, 16.3, 16.4_

- [ ] Task 10.5: Implement custom domain management: Domain connection UI at app/(hub)/studio/domains/page.tsx. assertEntitlement check for custom_domain (PRO only). DNS verification instructions. Status tracking (pending, verified, failed). Audit log creation (domain_connect). _Requirements: 4.4, 19.4, 1.3_

- [ ] Task 10.6: Implement tenant storefront pages: app/(_t)/[workspaceSlug]/page.tsx: hero, latest drops, featured services, sticky player. app/(_t)/[workspaceSlug]/beats/page.tsx: published tracks grid with preview play. app/(_t)/[workspaceSlug]/beats/[id]/page.tsx: track info, preview player, purchase button. app/(_t)/[workspaceSlug]/services/page.tsx: active services grid. app/(_t)/[workspaceSlug]/services/[id]/page.tsx: service info, features, purchase/book button. app/(_t)/[workspaceSlug]/contact/page.tsx: contact info or simple form. _Requirements: 21.1, 21.2, 21.3, 21.4, 21.5, 21.6_

- [ ] Task 10.7: Implement tenant query filtering: Only return published tracks to public users. Only return active services to public users. Scope all queries by workspaceId (never mix tenants). _Requirements: 28.1, 28.5_

- [ ] CP-10: Manual Checkpoint Phase 10 Complete (Playwright): Sign in as provider. Navigate to /studio/services → create a test service. Verify service appears in list, toggle active/inactive. Navigate to /studio/domains (PRO only) → verify entitlement check. Sign in as artist. Navigate to tenant storefront /{slug}/services. Verify only active services visible. Click service → verify detail page with features, price, book button. Complete service booking → verify booking created. Navigate to /artist → verify booking in list with status. Test tenant isolation: verify no cross-tenant data leakage.

### Phase 11: i18n + Final Responsive Polish

- [ ] Task 11.1: Set up i18n infrastructure: /src/i18n/messages/en.json and fr.json. Locale detection from Accept-Language header + navigator fallback. Locale context provider. Default to EN. _Requirements: 25.1, 25.2, 25.3_

- [ ] Task 11.2: Implement currency display logic: formatPrice function with locale awareness. USD base currency. EUR only if priceEUR exists AND locale is FR. No automatic conversion. _Requirements: 25.4, 25.5, 25.6_

- [ ] Task 11.3: Translate all UI strings: Hub pages (landing, pricing, auth). Tenant pages (storefront, beats, services). Dashboard pages (studio, artist). _Requirements: 25.3_

- [ ] Task 11.4: Final responsive audit: Test all breakpoints: 320, 360, 390, 414, 768, 820, 1024, 1280, 1440px. Fix any horizontal scroll issues. Verify touch targets ≥ 44px. _Requirements: 22.1, 22.2, 22.3_

- [ ] Task 11.5: Accessibility audit: Focus-visible rings on all interactive elements. Proper ARIA labels. Keyboard navigation. _Requirements: 26.5_

- [ ] CP3: Checkpoint MVP Complete: All tenant pages functional. Services module complete. i18n working (EN/FR). All responsive breakpoints pass. All documentation complete. Ensure all tests pass, ask the user if questions arise.

- [ ] CP-11: Manual Checkpoint Phase 11 Complete - MVP (Playwright): Test i18n: set browser to French → verify FR strings displayed. Test currency: FR locale with priceEUR → verify EUR displayed. Test currency: EN locale → verify USD displayed. Final responsive audit at all breakpoints: 320, 360, 390, 414, 768, 820, 1024, 1280, 1440px. Verify no horizontal scroll at any breakpoint. Verify touch targets ≥ 44px on mobile. Accessibility: tab through all interactive elements → verify focus rings. Full E2E flow: sign up → onboarding → subscribe → upload track → publish → artist purchase → download. Verify all documentation files exist in /docs.

## Documentation Tasks

- [ ] D.1: Create docs/architecture.md: Module diagram. Platform Core vs Business Modules explanation. Request flow diagram. _Requirements: 5.4_

- [ ] D.2: Create docs/design-system.md: CSS tokens documentation. Utility classes (.glass, .glow, .outline-word, .bg-app, .pb-safe). Component primitives. _Requirements: 23_

- [ ] D.3: Create docs/motion-spec.md: pageEnter, staggerContainer, heroFloat variants. prefers-reduced-motion handling. _Requirements: 24_

- [ ] D.4: Create docs/responsive-checklist.md: Breakpoints list. Testing procedure. Common issues and fixes. _Requirements: 22_

- [ ] D.5: Create docs/tenant-routing.md: Middleware routing logic. Reserved subdomains. Custom domain setup instructions. _Requirements: 1_

- [ ] D.6: Create docs/auth-multidomain.md: Clerk configuration. Multi-domain auth approach. Auth-bridge flow for custom domains. _Requirements: 2.5, 2.6_

- [ ] D.7: Create docs/provider-subscriptions.md: Clerk Billing setup. Plan features and quotas (BASIC vs PRO). USD-only billing note (global users can still subscribe). Subscription gating behavior. _Requirements: 3_

- [ ] D.8: Create docs/clerk-ui-branding.md: Customization approach. Design tokens applied to Clerk components. _Requirements: 26_

- [ ] D.9: Create docs/marketplace-stripe-connect.md: Direct Charges model explanation. Standard account onboarding flow. Platform fee = 0 for MVP. _Requirements: 13, 27_

- [ ] D.10: Create docs/artist-payments-stripe.md: Checkout flow. Webhook handling. Idempotency implementation. _Requirements: 14_

- [ ] D.11: Create docs/audio-processing.md: Job worker setup (Node.js + ffmpeg). Preview generation flow. Provider-controlled preview option. Retry mechanism. _Requirements: 11_

- [ ] D.12: Create docs/i18n-and-currency.md: EN/FR locale detection. Currency display rules (no auto conversion). Message files structure. _Requirements: 25_

- [ ] D.13: Create docs/decisions.md: Document any deviations from spec. Architectural decisions made during implementation. _Requirements: Spec rule_

- [ ] D.14: Create docs/licensing.md: License tiers (Basic/Premium/Unlimited). License terms JSON structure. PDF generation flow. Snapshot immutability. Stems access rules. _Requirements: 29_

- [ ] D.15: Create docs/transactional-emails.md: Resend integration. Email templates (purchase, booking, subscription). Idempotency via emailEvents. No direct signed URLs rule. _Requirements: 30_

## Notes

- Use `npm ci` for installation in all documentation
- Pin exact versions (no ^ or ~) in package.json
- Job worker for ffmpeg must run in Node.js environment (not serverless)
- Worker is TypeScript: build with `npm run build:worker`, run with `npm run worker`
- Direct Charges model for Stripe Connect (application_fee = 0 default)
- Tenant storefronts remain public even if provider subscription inactive
- Clerk Billing is USD-only but global users can still subscribe
- Use Convex auth components (Authenticated/Unauthenticated) not Clerk's (SignedIn/SignedOut)
- proxy.ts runs as Node entry server in prod; Next.js runs behind it (standalone output)
- middleware.ts handles Clerk auth + static exclusions only (NO tenancy logic)
- License PDF generation uses pdf-lib (not Playwright) for simplicity and performance
- Transactional emails use Resend with idempotency via emailEvents table
- Never include direct signed download URLs in emails (they expire); link to dashboard instead
- License terms are snapshotted at purchase time to preserve rights even if tiers change later
- Stems are only available for Unlimited tier purchases
