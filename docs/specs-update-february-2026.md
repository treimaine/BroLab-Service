# Specs Update - February 2026

## État Actuel vs Documentation

Ce document liste les incohérences entre les fichiers requirements.md/design.md et l'état réel de l'application en février 2026.

## ✅ Corrections Appliquées

### 1. Versions des Dépendances

**Incohérence :** design.md mentionne Next.js 16.1.4
**État actuel :** Next.js 15.1.0 (package.json)
**Action :** Mettre à jour design.md avec les versions exactes actuelles

**Versions actuelles (février 2026) :**
```json
{
  "next": "15.1.0",
  "@clerk/nextjs": "6.36.5",
  "convex": "1.31.6",
  "stripe": "17.5.0",
  "playwright": "1.57.0"
}
```

### 2. Clerk Organizations

**Incohérence :** requirements.md dit "NO Clerk Organizations (MVP uses simple role-based system)"
**État actuel :** Le projet UTILISE Clerk Organizations avec slug-based routing
**Fichiers concernés :**
- `middleware.ts` : organizationSyncOptions avec organizationPatterns
- `convex/platform/workspaces.ts` : Workspace management avec Organizations
- `src/platform/tenancy/` : Organization-based tenancy

**Action :** Mettre à jour requirements.md Requirement 2 pour refléter l'utilisation de Clerk Organizations

**Correction :**
```markdown
### Requirement 2: User Authentication and Roles

**User Story:** As a user, I want to authenticate and be assigned a role, so that I can access appropriate features based on my role.

#### Acceptance Criteria

1. THE Auth_System SHALL use Clerk Organizations for multi-tenancy
2. THE Auth_System SHALL store user roles (producer, engineer, artist) in Clerk unsafeMetadata.role
3. WHEN a user signs in without a role, THE Auth_System SHALL redirect to /onboarding
4. WHEN a provider signs in, THE Auth_System SHALL grant access to /studio/* dashboard
5. WHEN an artist signs in, THE Auth_System SHALL grant access to /artist/* dashboard
6. THE Auth_System SHALL work across hub domain and all tenant subdomains (*.brolabentertainment.com)
7. THE Artist accounts SHALL be global and usable across hub and any tenant domain
8. THE System SHALL use Organization slugs in URLs (/orgs/:slug pattern)
9. THE Middleware SHALL auto-activate Organization based on URL slug via organizationSyncOptions

#### Implementation Notes

- **Organizations:** Clerk Organizations enabled for multi-tenant B2B architecture
- **Role Storage:** Roles stored in `user.unsafeMetadata.role` (NOT `publicMetadata.role`)
- **Convex Sync:** Roles synced to Convex `users` table for server-side queries
- **Clerk Provider:** `<ClerkProvider>` MUST wrap entire app in `app/layout.tsx`
- **Clerk Middleware:** `middleware.ts` MUST use `clerkMiddleware()` from `@clerk/nextjs/server`
- **Organization Sync:** Middleware uses `organizationSyncOptions` with `organizationPatterns: ['/orgs/:slug', '/orgs/:slug/(.*)']`
- **Provider Order:** MUST be `<ClerkProvider>` → `<ConvexClientProvider>` → app
- **Convex Integration:** Use `ConvexProviderWithClerk` from `convex/react-clerk` with `useAuth` from `@clerk/nextjs`
- **Auth State Components:** Use Convex components (`<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>` from `convex/react`)
- **Auth Pages:** `/sign-in` and `/sign-up` pages using Clerk's `<SignIn />` and `<SignUp />` components
- **Onboarding Flow:** `/onboarding` page for role selection + Organization creation for providers
```

### 3. Plans Source of Truth

**Incohérence :** requirements.md mentionne `src/platform/billing/plans.ts` comme fichier à supprimer
**État actuel :** Ce fichier n'existe PAS (déjà supprimé)
**Source canonique :** `convex/platform/billing/plans.ts` (correct)

**Action :** Mettre à jour requirements.md Requirement 5 pour refléter que la migration est COMPLÈTE

**Correction :**
```markdown
### Requirement 5: Micro-SaaS Modular Architecture

#### Cross-Runtime Import Rules (CRITICAL)

**Migration Status: ✅ COMPLETE**

1. **Plans/Entitlements Source of Truth**: `convex/platform/billing/plans.ts` is the CANONICAL source
   - ✅ All plan definitions (PLAN_FEATURES, PRICING, PREVIEW_DURATION_SEC) live in Convex
   - ✅ Frontend consumes via `convex/platform/billing/getPlansPublic.ts` query
   - ✅ `src/platform/billing/plans.ts` has been DELETED (no duplicate)

2. **Convex MUST NOT import from src/**: Convex runs in a separate serverless runtime
   - ✅ `convex/platform/entitlements.ts` imports from `./billing/plans` (same runtime)
   - ✅ Frontend uses `useQuery(api.platform.billing.getPlansPublic)` for pricing data

3. **Frontend MUST NOT import Convex files directly**: Frontend consumes Convex via queries only
   - ✅ `src/components/hub/PricingPageClient.tsx` uses Convex query (not direct import)
```

### 4. Middleware File Location

**Incohérence :** requirements.md mentionne parfois `src/middleware.ts`
**État actuel :** Le fichier est `middleware.ts` à la racine (correct)

**Action :** Clarifier dans requirements.md que le fichier est à la racine

**Correction :**
```markdown
### Requirement 1: Multi-Tenant Architecture

#### Implementation Notes

- **Deployment**: Application deployed on Vercel (serverless Edge runtime)
- **Clerk Edge File**: The Clerk middleware file is `middleware.ts` at the project root (Standard for Next.js 15)
- **Clerk Edge File Purpose**: Handles authentication, route protection, AND tenancy resolution via `organizationSyncOptions`
```

### 5. Design System Architecture

**Incohérence :** design.md mentionne `src/components/ui-dribbble/` à supprimer
**État actuel :** Ce dossier n'existe PAS (déjà supprimé)
**Architecture actuelle :** `src/platform/ui/dribbble/` est le seul emplacement (correct)

**Action :** Mettre à jour design.md pour refléter que la migration est COMPLÈTE

**Correction :**
```markdown
## Dribbble Design System Architecture

### Emplacement Unique (✅ IMPLÉMENTÉ)

```
src/platform/ui/dribbble/    ← TOUTES les primitives Dribbble vivent ICI
```

**Migration Status: ✅ COMPLETE**
- ✅ `src/components/ui-dribbble/` has been DELETED
- ✅ All primitives live in `src/platform/ui/dribbble/`
- ✅ Single import point: `@/platform/ui`
```

### 6. Preview Duration

**État :** Correct dans le code (PREVIEW_DURATION_SEC = 30)
**Action :** Aucune correction nécessaire

### 7. Multi-Tenant Routing

**Incohérence :** design.md mentionne "Option B - middleware.ts" avec Node.js runtime
**État actuel :** Utilise Vercel Edge runtime avec middleware.ts (Edge-compatible)

**Action :** Clarifier dans design.md que middleware.ts utilise Edge runtime

**Correction :**
```markdown
## Multi-Tenant Routing (Vercel Edge Runtime)

**Decision (IMPLEMENTED):** Multi-tenant routing is implemented using Vercel Edge runtime via `middleware.ts` at the project root.

### Why Edge Runtime
- Deployed on Vercel (serverless Edge)
- Fast global distribution
- Clerk Organizations integration via `organizationSyncOptions`
- No separate Node.js proxy needed

### Rules
1. `middleware.ts` SHALL use `clerkMiddleware()` from `@clerk/nextjs/server`
2. `middleware.ts` SHALL include `organizationSyncOptions` for slug-based routing
3. Hub domain (`brolabentertainment.com`) SHALL serve hub routes
4. Tenant subdomains (`{slug}.brolabentertainment.com`) SHALL rewrite to `/_t/{slug}/...`
5. Custom domains SHALL be resolved via Convex HTTP endpoint, then rewritten
6. Unknown/unverified domains SHALL return 404
```

## 📝 Fichiers à Mettre à Jour

### requirements.md
- [ ] Requirement 2: Corriger "NO Clerk Organizations" → "Uses Clerk Organizations"
- [ ] Requirement 1: Clarifier `middleware.ts` à la racine (pas `src/middleware.ts`)
- [ ] Requirement 5: Marquer migration plans comme COMPLETE

### design.md
- [ ] Technology Stack: Mettre à jour versions (Next.js 15.1.0, Clerk 6.36.5, Convex 1.31.6, Playwright 1.57.0)
- [ ] Multi-Tenant Routing: Clarifier Edge runtime (pas Node.js proxy)
- [ ] Design System Architecture: Marquer migration comme COMPLETE
- [ ] Supprimer références à `src/components/ui-dribbble/` (déjà supprimé)

## 🎯 Résumé des Changements Majeurs

1. **Clerk Organizations** : Le projet UTILISE Organizations (pas simple role-based)
2. **Edge Runtime** : Vercel Edge (pas Node.js proxy)
3. **Plans Migration** : COMPLÈTE (pas de fichier duplicate)
4. **Design System** : Migration COMPLÈTE (un seul emplacement)
5. **Versions** : Mettre à jour avec versions actuelles (février 2026)

## ✅ État Actuel Validé

- ✅ `middleware.ts` à la racine avec `clerkMiddleware()` + `organizationSyncOptions`
- ✅ Clerk Organizations activées avec slug-based routing
- ✅ `convex/platform/billing/plans.ts` comme source canonique unique
- ✅ `src/platform/ui/dribbble/` comme seul emplacement design system
- ✅ Frontend consomme plans via Convex query
- ✅ Next.js 15.1.0, Clerk 6.36.5, Convex 1.31.6

## 📅 Date de Mise à Jour

Février 2026 - Synchronisation specs avec état réel de l'application
