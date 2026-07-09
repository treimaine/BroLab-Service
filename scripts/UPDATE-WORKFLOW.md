# 🚀 Workflow de Mise à Jour - Guide d'Utilisation

**Date:** 9 Juillet 2026

---

## 📋 Scripts Disponibles

| Script | Usage | Description |
|--------|-------|-------------|
| `update-phase1.bat` | Phase 1 updates | Met à jour 13 packages production |
| `update-phase2.bat` | Phase 2 updates | Met à jour 12 packages dev |
| `test-after-update.bat` | Tests | Exécute tous les tests critiques |
| `rollback.bat` | Rollback | Restaure les versions précédentes |

---

## ⚡ Quick Start

### Option 1: Workflow Complet Automatisé

```cmd
REM 1. Exécuter Phase 1
cd scripts
update-phase1.bat

REM 2. Tester Phase 1
test-after-update.bat

REM 3. Si tests OK, Phase 2
update-phase2.bat

REM 4. Tester Phase 2
test-after-update.bat

REM 5. Si tout OK, commit
cd ..
git add package.json package-lock.json
git commit -m "chore: update packages Phase 1 & 2"
```

### Option 2: Workflow Manuel

```cmd
REM Phase 1 - Production Dependencies
npm install next@16.2.10 react@19.2.7 react-dom@19.2.7
npm install @clerk/nextjs@7.5.15 convex@1.42.1
npm install stripe@22.3.0 resend@6.17.2
npm install framer-motion@12.42.2 lucide-react@1.24.0
npm install tailwindcss@4.3.2 @tailwindcss/postcss@4.3.2
npm install zustand@5.0.14 dotenv@17.4.2

REM Tests
npm run build
npm run typecheck
npm run lint
```

---

## 🧪 Tests Manuels Après Phase 1

### 1. Authentication (Clerk)
- [ ] Ouvrir http://localhost:3000/sign-in
- [ ] Se connecter avec un compte test
- [ ] Vérifier que la connexion fonctionne
- [ ] Tester `<OrganizationSwitcher />`
- [ ] Tester la navigation `/orgs/:slug`

### 2. Backend (Convex)
- [ ] Ouvrir le dashboard Convex
- [ ] Vérifier que les queries retournent des données
- [ ] Tester une mutation (upload, update)
- [ ] Vérifier `ctx.auth.getUserIdentity()`
- [ ] Tester le File Storage

### 3. UI
- [ ] Vérifier les animations (smooth, pas de saccades)
- [ ] Vérifier les icônes Lucide (tous affichés)
- [ ] Vérifier les styles Tailwind (pas de casse)
- [ ] Tester le dark mode (toggle fonctionne)
- [ ] Tester le responsive (mobile, tablet, desktop)

### 4. Payments
- [ ] Tester les webhooks Stripe (voir logs Stripe Dashboard)
- [ ] Si possible, faire un test de paiement

---

## 🔄 Si Problème Détecté

### Problème Mineur (warnings, etc.)
- Documenter dans `CHANGELOG-UPDATES.md`
- Continuer avec Phase 2

### Problème Critique (build fail, auth broken, etc.)
```cmd
REM ROLLBACK IMMÉDIAT
cd scripts
rollback.bat

REM Vérifier que le rollback a fonctionné
cd ..
npm run build
npm run typecheck
```

---

## 📊 Checklist Complète

### Avant de Commencer
- [x] Backups créés (package.json.backup-20260709, package-lock.json.backup-20260709)
- [x] Git commit effectué (documentation)
- [x] Versions actuelles sauvegardées (docs/package-versions-before-update.txt)

### Phase 1
- [ ] Script `update-phase1.bat` exécuté
- [ ] Build réussit (`npm run build`)
- [ ] Type check OK (`npm run typecheck`)
- [ ] Lint OK (`npm run lint`)
- [ ] Tests auth manuels OK
- [ ] Tests backend manuels OK
- [ ] Tests UI manuels OK

### Phase 2
- [ ] Script `update-phase2.bat` exécuté
- [ ] Lint OK (`npm run lint`)
- [ ] Tests unitaires OK (`npm run test:unit`)
- [ ] Tests E2E OK (`npm run test:e2e`)

### Validation Finale
- [ ] Application fonctionne en local
- [ ] Aucun breaking change détecté
- [ ] Métriques dans les tolérances
- [ ] Git commit effectué
- [ ] `CHANGELOG-UPDATES.md` mis à jour

---

## 📝 Template pour CHANGELOG-UPDATES.md

Après Phase 1 et 2, mettre à jour le changelog :

```markdown
## [Phase 1 & 2 Completed] - 2026-07-09

### 🎉 Packages Mis à Jour

**Production Dependencies (Phase 1):**
- next: 16.2.3 → 16.2.10
- react: 19.2.5 → 19.2.7
- react-dom: 19.2.5 → 19.2.7
- @clerk/nextjs: 7.0.12 → 7.5.15
- convex: 1.34.1 → 1.42.1
- stripe: 22.0.1 → 22.3.0
- resend: 6.10.0 → 6.17.2
- framer-motion: 12.38.0 → 12.42.2
- lucide-react: 1.7.0 → 1.24.0
- tailwindcss: 4.2.2 → 4.3.2
- @tailwindcss/postcss: 4.2.2 → 4.3.2
- zustand: 5.0.12 → 5.0.14
- dotenv: 17.4.1 → 17.4.2

**Dev Dependencies (Phase 2):**
- vitest: 4.1.3 → 4.1.10
- @vitest/coverage-v8: 4.1.3 → 4.1.10
- jsdom: 29.0.2 → 29.1.1
- @playwright/test: 1.59.1 → 1.61.1
- eslint: 10.2.0 → 10.6.0
- typescript-eslint: 8.58.1 → 8.63.0
- eslint-plugin-react-hooks: 7.0.1 → 7.1.1
- eslint-config-next: 16.2.3 → 16.2.10
- @next/eslint-plugin-next: 16.2.3 → 16.2.10
- @types/node: 25.5.2 → 25.9.5
- @types/react: 19.2.14 → 19.2.17
- @vitejs/plugin-react: 6.0.1 → 6.0.3

### ✅ Tests Effectués

- [x] Build production
- [x] Type check
- [x] Linting
- [x] Tests unitaires
- [x] Tests E2E
- [x] Tests manuels auth
- [x] Tests manuels backend
- [x] Tests manuels UI

### 📊 Impact Mesuré

**Métriques:**
- Build time: [AVANT]s → [APRÈS]s ([±X%])
- Bundle size: [AVANT] → [APRÈS] ([±X%])
- Type check: [AVANT]s → [APRÈS]s ([±X%])

**Changements notables:**
- Convex 1.42.1: Amélioration des performances auth
- Clerk 7.5.15: Corrections Organizations
- Lucide 1.24.0: +17 versions, nouveaux icônes

### 🐛 Issues Rencontrés

**Issues corrigés:**
- Aucun issue critique rencontré

**Issues non bloquants:**
- [Si warnings, les documenter ici]

### 🔗 Références

- Commit: [hash]
- Documentation: docs/UPDATE-README.md
- Analyse: docs/UPDATE-ANALYSIS-2026-07-09.md

### 👤 Effectué par

**Date:** 9 Juillet 2026  
**Durée:** [X heures]  
**Status:** ✅ Succès
```

---

## 💡 Tips

1. **Exécuter les scripts depuis le dossier `scripts/`**
   ```cmd
   cd scripts
   update-phase1.bat
   ```

2. **Vérifier les logs npm** pour voir si des warnings apparaissent

3. **Tester en local** avant de commit et push

4. **Si incertitude**, tester Phase 1 d'abord, puis décider pour Phase 2

5. **Garder les backups** jusqu'à validation complète en production

---

**Créé par:** Kiro Agent Analysis  
**Date:** 9 Juillet 2026  
**Version:** 1.0
