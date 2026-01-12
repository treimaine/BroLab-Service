# UI Migration Plan: Dribbble Only

> Ce document liste les fichiers à migrer, déprécier ou supprimer pour consolider le système UI.

## État Actuel ✅ MIGRATION COMPLÈTE

Un seul système UI:
- `src/platform/ui/dribbble/*` - Toutes les primitives Dribbble
- `src/platform/ui/index.ts` - Point d'entrée unique
- `src/components/ui-dribbble/` - **SUPPRIMÉ** (migration terminée le 2026-01-08)

---

## Fichiers Migrés ✅

### De `src/components/ui-dribbble/` vers `src/platform/ui/dribbble/`

| Fichier Source | Fichier Cible | Status |
|----------------|---------------|--------|
| `src/components/ui-dribbble/WavyBackground.tsx` | `src/platform/ui/dribbble/WavyBackground.tsx` | ✅ DONE |
| `src/components/ui-dribbble/OutlineStackTitle.tsx` | `src/platform/ui/dribbble/OutlineStackTitle.tsx` | ✅ DONE |
| `src/components/ui-dribbble/IconRail.tsx` | `src/platform/ui/dribbble/IconRail.tsx` | ✅ DONE |
| `src/components/ui-dribbble/PillCTA.tsx` | `src/platform/ui/dribbble/PillCTA.tsx` | ✅ DONE |
| `src/components/ui-dribbble/DribbbleCard.tsx` | `src/platform/ui/dribbble/DribbbleCard.tsx` | ✅ DONE |
| `src/components/ui-dribbble/MicroModule.tsx` | `src/platform/ui/dribbble/MicroModule.tsx` | ✅ DONE |
| `src/components/ui-dribbble/SectionHeader.tsx` | `src/platform/ui/dribbble/SectionHeader.tsx` | ✅ DONE |
| `src/components/ui-dribbble/TopMinimalBar.tsx` | `src/platform/ui/dribbble/TopMinimalBar.tsx` | ✅ DONE |
| `src/components/ui-dribbble/DribbbleSectionEnter.tsx` | `src/platform/ui/dribbble/DribbbleSectionEnter.tsx` | ✅ DONE |
| `src/components/ui-dribbble/motion.ts` | `src/platform/ui/dribbble/motion.ts` | ✅ DONE |
| `src/components/ui-dribbble/index.ts` | `src/platform/ui/dribbble/index.ts` | ✅ DONE |

---

## Wrappers Legacy ✅ CONVERTIS

### Dans `src/platform/ui/`

| Fichier | Action | Wrapper Vers | Status |
|---------|--------|--------------|--------|
| `src/platform/ui/Button.tsx` | Wrapper | `PillCTA` | ✅ DONE |
| `src/platform/ui/GlassCard.tsx` | Wrapper | `DribbbleCard` | ✅ DONE |
| `src/platform/ui/OutlineText.tsx` | Wrapper | `OutlineStackTitle` | ✅ DONE |

### Exemple de Wrapper

```typescript
// src/platform/ui/Button.tsx
/**
 * @deprecated Use PillCTA from @/platform/ui instead
 * This wrapper will be removed in a future version.
 */
export { PillCTA as Button } from './dribbble'
```

---

## Fichiers à Conserver (Compatibles)

| Fichier | Raison |
|---------|--------|
| `src/platform/ui/PageTransition.tsx` | Compatible avec Dribbble motion |
| `src/platform/ui/motion.ts` | Base motion, étendu par dribbble/motion.ts |
| `src/platform/ui/index.ts` | Point d'entrée unique (à mettre à jour) |

---

## Fichiers Supprimés ✅

| Fichier/Dossier | Status |
|-----------------|--------|
| `src/components/ui-dribbble/` | ✅ SUPPRIMÉ (2026-01-08) |

---

## Imports à Mettre à Jour

### Fichiers Utilisant les Anciens Imports

| Fichier | Import Actuel | Import Cible |
|---------|---------------|--------------|
| `app/(hub)/page.tsx` | `@/platform/ui` | `@/platform/ui` (OK si index.ts mis à jour) |
| `app/(hub)/layout.tsx` | `@/platform/ui` | `@/platform/ui` |
| `src/components/hub/Header.tsx` | `@/platform/ui` | `@/platform/ui` |
| `src/components/hub/Footer.tsx` | - | - |

### Recherche d'Imports à Migrer

```bash
# Trouver tous les imports de l'ancien kit
grep -r "from '@/components/ui-dribbble" src/ app/
grep -r "from '@/platform/ui/Button'" src/ app/
grep -r "from '@/platform/ui/GlassCard'" src/ app/
grep -r "from '@/platform/ui/OutlineText'" src/ app/
```

---

## Ordre d'Exécution

1. **Phase 1**: Créer `src/platform/ui/dribbble/` et copier les fichiers
2. **Phase 2**: Mettre à jour `src/platform/ui/index.ts` pour exporter dribbble/*
3. **Phase 3**: Convertir Button/GlassCard/OutlineText en wrappers
4. **Phase 4**: Vérifier que le build passe
5. **Phase 5**: Supprimer `src/components/ui-dribbble/`
6. **Phase 6**: Mettre à jour les imports dans l'app (si nécessaire)

---

## Validation ✅ COMPLÈTE

- [x] `npm run build` passe sans erreur
- [x] `npm run typecheck` passe sans erreur
- [x] Aucun import de `@/components/ui-dribbble` dans le code
- [x] Tous les composants accessibles via `@/platform/ui`
- [x] Wrappers legacy marqués `@deprecated`
- [x] `src/components/ui-dribbble/` supprimé
