# Glass Styles Violations Report

**Date:** 2026-01-13  
**ESLint Rule:** `no-restricted-syntax` (Task D4.6.1)  
**Total Violations:** 18 errors

## Summary

The ESLint rule successfully detected 18 violations of glass styles usage outside of `src/platform/ui/`. These violations need to be fixed by extracting glass styles into reusable Dribbble components.

## Detailed Violations

### 1. `app/(hub)/(marketing)/loading.tsx` (2 violations)

**Line 75:**
```tsx
className="... bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--border),var(--border-alpha))]"
```

**Violations:**
- ❌ `backdrop-blur-sm` (line 75, col 25)
- ❌ `border-[rgba(var(--border)` (line 75, col 25)

**Context:** Skeleton loading cards in marketing pages

---

### 2. `app/(hub)/(marketing)/pricing/PricingPageClient.tsx` (8 violations)

**Line 155 - Toggle Button:**
```tsx
className="... bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--accent),0.2)] ..."
```

**Violations:**
- ❌ `backdrop-blur-sm` (line 155, col 19)

**Lines 361, 365, 369 - Trust Badges (3 badges × 2 violations each):**
```tsx
className="... bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--border),var(--border-alpha))]"
```

**Violations:**
- ❌ `backdrop-blur-sm` (line 361, col 22)
- ❌ `border-[rgba(var(--border)` (line 361, col 22)
- ❌ `backdrop-blur-sm` (line 365, col 22)
- ❌ `border-[rgba(var(--border)` (line 365, col 22)
- ❌ `backdrop-blur-sm` (line 369, col 22)
- ❌ `border-[rgba(var(--border)` (line 369, col 22)

**Context:** Annual/Monthly toggle and trust badges (Lock, CreditCard, Shield)

---

### 3. `app/(hub)/HubLandingPageClient.tsx` (1 violation)

**Line 101 - Header:**
```tsx
className={`... ${isScrolled ? 'bg-[rgb(var(--bg))]/95 backdrop-blur-sm' : 'bg-transparent'}`}
```

**Violations:**
- ❌ `backdrop-blur-sm` (line 101, col 15)

**Context:** Sticky header with scroll-based opacity

---

### 4. `src/components/audio/PlayerBar.tsx` (6 violations)

**Line 144 - Main PlayerBar Container:**
```tsx
className="... bg-[rgba(var(--bg-2),0.8)] backdrop-blur-xl border-t border-[rgba(var(--border),var(--border-alpha))]"
```

**Violations:**
- ❌ `backdrop-blur-xl` (line 144, col 21)
- ❌ `border-[rgba(var(--border)` (line 144, col 21)

**Line 210 - BPM Micro Module:**
```tsx
className="... bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--border),var(--border-alpha))]"
```

**Violations:**
- ❌ `backdrop-blur-sm` (line 210, col 33)
- ❌ `border-[rgba(var(--border)` (line 210, col 33)

**Line 234 - Key Micro Module:**
```tsx
className="... bg-[rgba(var(--bg-2),0.8)] backdrop-blur-sm border border-[rgba(var(--border),var(--border-alpha))]"
```

**Violations:**
- ❌ `backdrop-blur-sm` (line 234, col 33)
- ❌ `border-[rgba(var(--border)` (line 234, col 33)

**Context:** Audio player bar with BPM and Key info chips

---

### 5. `src/components/tenant/MobileNav.tsx` (2 violations)

**Line 82 - Mobile Navigation Bar:**
```tsx
className="... glass border-t border-[rgba(var(--border),var(--border-alpha))]"
```

**Violations:**
- ❌ `glass` (line 82, col 17)
- ❌ `border-[rgba(var(--border)` (line 82, col 17)

**Context:** Bottom mobile navigation

---

## Planned Fixes

### ✅ Already Scheduled Tasks

**Task D4.8.1** (Not Started):
> Audit all files for glass violations: Run grep search: `grep -R "className=.*glass\|className=.*blur\|className=.*backdrop" src app --exclude-dir=src/platform/ui`. Verify zero results outside kit.

**Task D4.8.5** (Not Started):
> Create UI architecture diagram: Create `docs/ui-architecture.md` with ASCII diagram showing: @/platform/ui (single entry), dribbble/ (internal), app/ (consumers), components/ (wrappers only).

**CP-D4** (Not Started):
> Manual Checkpoint Phase D4 Complete (Playwright): ... Run grep checks: verify zero glass violations, zero motion violations, zero direct dribbble imports. ...

### ⚠️ Missing Tasks

**IMPORTANT:** There are NO specific tasks scheduled to fix these 18 violations. The tasks only mention:
- ✅ Adding the ESLint rule (D4.6.1) - **DONE**
- ✅ Documenting the rule (D4.6.3) - **DONE**
- ⏳ Auditing violations (D4.8.1) - **SCHEDULED**
- ⏳ Verifying zero violations in checkpoint (CP-D4) - **SCHEDULED**

But there are **NO tasks to actually fix the violations**.

---

## Recommended Action Plan

### Phase 0: Base Anti-Dérive (CRITIQUE - NOUVEAU)

**Créer `ChromeSurface` pour les éléments UI fixes:**

✅ **DONE** - `ChromeSurface` créé dans `src/platform/ui/dribbble/ChromeSurface.tsx`

**Caractéristiques:**
- Background: `rgb(var(--bg))` + alpha (95% par défaut)
- Bordure: token-based `border-[rgba(var(--border),var(--border-alpha))]`
- **JAMAIS** `bg-card` (a un tint gris visible sur éléments fixes)

**Règle Chrome vs Surface documentée dans `design.md`:**
- ✅ Chrome (UI fixe): Header, Footer, Nav, Player → `<ChromeSurface>`
- ✅ Surface (contenu): Cards, Chips, Badges → `<GlassSurface>` ou `<DribbbleCard>`

---

### Phase 1: Create Reusable Components (NEW TASKS NEEDED)

1. ✅ **`ChromeSurface`** - DONE (Phase 0)
2. **`GlassChip`** - Pour badges et chips de contenu
   - Props: `icon`, `label`, `sublabel`, `size`
   - Usage: Trust badges, BPM/Key chips
3. **`GlassToggle`** - Pour toggle annuel/mensuel
   - Props: `checked`, `onChange`, `leftLabel`, `rightLabel`
4. **`GlassSkeletonCard`** - Pour loading states
   - Props: `rows`, `hasImage`

---

### Phase 2: Replace Violations (MAPPING CORRIGÉ)

#### Chrome Elements (utiliser `<ChromeSurface>`)

| Fichier | Ligne | Élément | Composant | Type |
|---------|-------|---------|-----------|------|
| `HubLandingPageClient.tsx` | 101 | Header sticky | `<ChromeSurface as="header">` | **Chrome** ✅ |
| `PlayerBar.tsx` | 144 | PlayerBar container | `<ChromeSurface as="section">` | **Chrome** ✅ |
| `MobileNav.tsx` | 82 | Bottom nav | `<ChromeSurface as="nav">` | **Chrome** ✅ |

**Pourquoi Chrome?** Ces éléments sont **fixes/sticky** et font partie de l'interface permanente. Ils doivent utiliser `rgb(var(--bg))` pour se fondre dans le fond, pas `bg-card` qui a un tint gris visible.

#### Surface Elements (utiliser `<GlassSurface>` ou composants dédiés)

| Fichier | Ligne | Élément | Composant | Type |
|---------|-------|---------|-----------|------|
| `loading.tsx` | 75 | Skeleton cards | `<GlassSkeletonCard>` | **Surface** ✅ |
| `PricingPageClient.tsx` | 155 | Toggle annuel/mensuel | `<GlassToggle>` | **Surface** ✅ |
| `PricingPageClient.tsx` | 361, 365, 369 | Trust badges (3×) | `<GlassChip>` | **Surface** ✅ |
| `PlayerBar.tsx` | 210, 234 | BPM/Key chips (2×) | `<GlassChip>` | **Surface** ✅ |

**Pourquoi Surface?** Ces éléments sont du **contenu** qui scroll avec la page. Ils peuvent utiliser `bg-card` ou `bg-[rgba(var(--bg-2))]` pour créer une hiérarchie visuelle.

---

### Phase 3: Verification

- Run `npm run lint` → expect 0 errors
- Run Task D4.8.1 audit → expect zero results
- Complete CP-D4 checkpoint

---

## Impact Analysis

### Current State
- ✅ ESLint rule is active and detecting violations
- ✅ Rule is documented in `docs/decisions.md`
- ❌ 18 violations blocking clean lint
- ❌ No tasks scheduled to fix violations

### Risk
- **Medium:** Violations will block CI/CD if Task D4.6.2 (CI check) is implemented
- **Low:** Violations don't affect runtime functionality
- **High:** Violations indicate design system is not being followed consistently

### Recommendation
**Add new tasks to fix these violations BEFORE implementing Task D4.6.2 (CI check)**, otherwise CI will fail immediately.

---

## Next Steps

1. **Immediate:** Review this report with the team
2. **Short-term:** Add tasks to fix the 18 violations
3. **Medium-term:** Implement Task D4.6.2 (CI check) AFTER violations are fixed
4. **Long-term:** Enforce rule in code review process

---

## References

- ESLint Config: `eslint.config.mjs`
- Documentation: `docs/decisions.md` (ESLint Rules section)
- Task List: `.kiro/specs/brolab-entertainment/tasks.md`
- Related Tasks: D4.6.1 (done), D4.6.2 (pending), D4.6.3 (done), D4.8.1 (pending), CP-D4 (pending)
