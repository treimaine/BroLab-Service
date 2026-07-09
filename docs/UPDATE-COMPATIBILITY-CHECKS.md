# 🔍 Vérifications de Compatibilité - Mises à Jour Packages

**Date:** 9 Juillet 2026  
**Objectif:** Checklist détaillée pour vérifier la compatibilité après mises à jour

---

## 📋 Checklist Pré-Update

### 1. Backup Critique

```bash
# Créer un backup complet
cp package.json package.json.backup-$(date +%Y%m%d)
cp package-lock.json package-lock.json.backup-$(date +%Y%m%d)
cp -r node_modules node_modules.backup

# Git commit avant update
git add -A
git commit -m "chore: backup before package updates"
git tag backup-before-update-$(date +%Y%m%d)
```

### 2. Documentation des Versions Actuelles

```bash
# Sauvegarder les versions actuelles
npm list --depth=0 > docs/package-versions-before-update.txt
```

---

## 🔧 Convex 1.34.1 → 1.42.1 - Vérifications Détaillées

### Fichiers Critiques à Analyser

#### 1. Authentication (`convex/auth.config.ts`)

**Vérifier:**
```typescript
// S'assurer que la config auth est toujours valide
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex", // DOIT être "convex"
    },
  ],
} satisfies AuthConfig;
```

**Tests:**
```bash
# Dans les queries/mutations utilisant auth
# Vérifier que ctx.auth.getUserIdentity() fonctionne
```

**Fichiers à tester:**
- [ ] `convex/auth.config.ts`
- [ ] `convex/modules/beats/queries.ts`
- [ ] `convex/modules/beats/mutations.ts`
- [ ] `convex/modules/services/queries.ts`
- [ ] `convex/modules/services/mutations.ts`

---

#### 2. Validators et Types (`convex/schema.ts`)

**Vérifier les patterns suivants:**

```typescript
// Array validators
v.array(v.union(v.string(), v.number()))

// Discriminated unions
v.union(
  v.object({
    kind: v.literal("error"),
    errorMessage: v.string(),
  }),
  v.object({
    kind: v.literal("success"),
    value: v.number(),
  })
)

// ID validators
v.id(tableName)

// Record validators
v.record(v.id('users'), v.string())
```

**Tests:**
- [ ] Schema validation fonctionne
- [ ] Aucun warning sur les validators
- [ ] Types générés sont corrects

---

#### 3. Queries Pattern

**Pattern à vérifier:**

```typescript
// ✅ CORRECT - Bounded queries
export const getBeats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("beats")
      .order("desc")
      .take(100); // Toujours limité
  },
});

// ❌ INCORRECT - Unbounded
export const getAllBeats = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("beats").collect(); // Dangereux si table large
  },
});
```

**Fichiers à auditer:**
- [ ] `convex/modules/beats/queries.ts`
- [ ] `convex/modules/services/queries.ts`
- [ ] Remplacer `.collect()` par `.take(n)` si nécessaire

---

#### 4. File Storage

**Vérifier le pattern:**

```typescript
// ✅ CORRECT - New way
const metadata = await ctx.db.system.get("_storage", fileId);

// ❌ DEPRECATED - Old way
const metadata = await ctx.storage.getMetadata(fileId); // Ne plus utiliser

// URLs
const url = await ctx.storage.getUrl(fileId); // Retourne null si file n'existe pas
```

**Tests:**
- [ ] Upload de fichiers audio fonctionne
- [ ] `ctx.storage.getUrl()` retourne URLs correctes
- [ ] Metadata via `ctx.db.system.get("_storage", fileId)` fonctionne

**Fichiers à vérifier:**
- [ ] `convex/platform/storage/upload.ts`
- [ ] `convex/platform/storage/processing.ts`

---

#### 5. Pagination

**Pattern correct:**

```typescript
import { paginationOptsValidator } from "convex/server";

export const listBeats = query({
  args: { 
    paginationOpts: paginationOptsValidator,
    filter: v.optional(v.string())
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("beats")
      .order("desc")
      .paginate(args.paginationOpts);
  },
});

// Retourne: { page: Doc[], isDone: boolean, continueCursor: string }
```

**Tests:**
- [ ] Pagination fonctionne avec `numItems` et `cursor`
- [ ] `isDone` et `continueCursor` corrects

---

#### 6. HTTP Endpoints

**Pattern correct:**

```typescript
// convex/http.ts
import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";

const http = httpRouter();

http.route({
  path: "/webhooks/stripe",
  method: "POST",
  handler: httpAction(async (ctx, req) => {
    const body = await req.bytes();
    // Traitement
    return new Response("OK", { status: 200 });
  }),
});

export default http;
```

**Tests:**
- [ ] Webhooks Stripe reçus correctement
- [ ] Webhooks Clerk fonctionnent

---

## 🔐 Clerk 7.0.12 → 7.5.15 - Vérifications Détaillées

### 1. Middleware Configuration

**Vérifier le pattern:**

```typescript
// middleware.ts
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware(
  (auth, req) => {
    // Logique middleware
  },
  {
    organizationSyncOptions: {
      organizationPatterns: [
        '/orgs/:slug',
        '/orgs/:slug/(.*)',
      ],
    },
  },
)

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    '/(api|trpc)(.*)',
  ],
}
```

**Tests:**
- [ ] Middleware active l'org par slug
- [ ] Routes protégées fonctionnent
- [ ] Public routes accessibles

---

### 2. ClerkProvider Configuration

**Vérifier les props:**

```tsx
// app/layout.tsx
<ClerkProvider
  publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
  signInFallbackRedirectUrl="/"
  signUpFallbackRedirectUrl="/onboarding"
  afterSignOutUrl="/"
  appearance={{
    // Customization
  }}
>
  <ConvexClientProvider>
    {children}
  </ConvexClientProvider>
</ClerkProvider>
```

**Props dépréciées à remplacer:**
- ❌ `afterSignInUrl` → ✅ `signInFallbackRedirectUrl`
- ❌ `afterSignUpUrl` → ✅ `signUpFallbackRedirectUrl`

**Tests:**
- [ ] Sign-in redirige correctement
- [ ] Sign-up redirige vers onboarding
- [ ] Sign-out redirige vers home

---

### 3. Composants Organizations

**Vérifier:**

```tsx
// OrganizationSwitcher
<OrganizationSwitcher
  hideSlug={false}
  afterCreateOrganizationUrl="/orgs/:slug"
  afterSelectOrganizationUrl="/orgs/:slug"
/>

// OrganizationProfile
<OrganizationProfile
  routing="path"
  path="/organization-profile"
/>

// CreateOrganization
<CreateOrganization
  afterCreateOrganizationUrl="/orgs/:slug"
/>
```

**Tests:**
- [ ] Création d'Organization fonctionne
- [ ] Slug customization fonctionne
- [ ] Switch entre Organizations fonctionne
- [ ] URL `/orgs/:slug` active l'org automatiquement

---

### 4. Composants Billing (Beta)

**⚠️ APIs Expérimentales - Attention aux changements**

```tsx
// PricingTable
<PricingTable
  for="organization"
  collapseFeatures={false}
  ctaPosition="bottom"
  newSubscriptionRedirectUrl="/dashboard"
/>

// CheckoutButton
<CheckoutButton
  planId="cplan_xxx"
  planPeriod="month"
  for="organization"
  onSubscriptionComplete={(subscription) => {
    console.log('Subscription created:', subscription);
  }}
/>

// SubscriptionDetailsButton
<SubscriptionDetailsButton
  for="organization"
  onSubscriptionCancel={(subscription) => {
    console.log('Subscription cancelled:', subscription);
  }}
/>
```

**Tests:**
- [ ] `<PricingTable />` affiche les plans
- [ ] `<CheckoutButton />` ouvre le drawer
- [ ] Souscription fonctionne
- [ ] Callbacks executés correctement

---

### 5. Authentication State Components

**⚠️ CRITIQUE:** Utiliser composants Convex, PAS Clerk

```tsx
// ✅ CORRECT - Convex components
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'
import { useConvexAuth } from 'convex/react'

// ❌ INCORRECT - Clerk components (ne PAS utiliser)
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { useAuth } from '@clerk/nextjs'
```

**Raison:** `useConvexAuth()` vérifie que le backend Convex a validé le token, pas juste le frontend.

**Fichiers à auditer:**
- [ ] Remplacer `<SignedIn>` par `<Authenticated>`
- [ ] Remplacer `<SignedOut>` par `<Unauthenticated>`
- [ ] Ajouter `<AuthLoading>` si nécessaire
- [ ] Utiliser `useConvexAuth()` pour checks auth

---

### 6. JWT Token Validation

**Vérifier:**

```env
# .env.local
CLERK_JWT_ISSUER_DOMAIN=https://natural-rattler-88.clerk.accounts.dev
```

**Dans Clerk Dashboard:**
- [ ] JWT Template nommé `convex` (NE PAS renommer)
- [ ] Issuer URL correspond à `CLERK_JWT_ISSUER_DOMAIN`

**Tests:**
- [ ] `ctx.auth.getUserIdentity()` retourne user
- [ ] `identity.tokenIdentifier` disponible (canonical ID)

---

## 🎨 UI/UX - Vérifications

### 1. Framer Motion 12.38.0 → 12.42.2

**Patterns à tester:**

```tsx
// Page transitions
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  exit={{ opacity: 0, y: -20 }}
  transition={{ duration: 0.3 }}
>
  {children}
</motion.div>

// Scroll animations
<motion.div
  initial={{ opacity: 0 }}
  whileInView={{ opacity: 1 }}
  viewport={{ once: true }}
>
  {content}
</motion.div>
```

**Tests:**
- [ ] Animations smooth (pas de saccades)
- [ ] Pas de warnings de performance
- [ ] `AnimatePresence` fonctionne

---

### 2. Lucide React 1.7.0 → 1.24.0

**Vérifier que les icônes utilisés existent toujours:**

```bash
# Lister tous les imports Lucide
grep -r "from 'lucide-react'" src/ --include="*.tsx" --include="*.ts"
```

**Icônes critiques à vérifier:**
- [ ] Play, Pause (audio player)
- [ ] Upload, Download (file management)
- [ ] Settings, User (navigation)
- [ ] Check, X (forms)

---

### 3. Tailwind CSS 4.2.2 → 4.3.2

**Vérifier les classes custom:**

```bash
# Dans tailwind.config.ts
# S'assurer que les custom colors fonctionnent
```

**Classes critiques à tester:**
- [ ] Glass morphism effects (`bg-white/80`, `backdrop-blur`)
- [ ] Border colors (`border-gray-200` en light mode)
- [ ] Custom animations
- [ ] Responsive breakpoints

**Design System à vérifier:**
- [ ] `ChromeSurface` component
- [ ] `DribbbleCard` styles
- [ ] `PillCTA` buttons
- [ ] Dark mode colors

---

## 🧪 Scripts de Test Automatisés

### Script 1: Vérifier les imports Clerk

```bash
#!/bin/bash
# check-clerk-components.sh

echo "🔍 Checking for deprecated Clerk components..."

# Chercher SignedIn/SignedOut (doit venir de convex/react)
echo "Checking <SignedIn> usage..."
grep -r "<SignedIn" src/ app/ --include="*.tsx" | grep "@clerk/nextjs" && echo "❌ Found Clerk SignedIn - should use Convex Authenticated" || echo "✅ No Clerk SignedIn found"

echo "Checking <SignedOut> usage..."
grep -r "<SignedOut" src/ app/ --include="*.tsx" | grep "@clerk/nextjs" && echo "❌ Found Clerk SignedOut - should use Convex Unauthenticated" || echo "✅ No Clerk SignedOut found"

echo "Checking useAuth() usage..."
grep -r "useAuth()" src/ app/ --include="*.tsx" | grep "@clerk/nextjs" && echo "⚠️  Found Clerk useAuth - verify it's not for auth state (use useConvexAuth instead)" || echo "✅ No Clerk useAuth found"
```

### Script 2: Vérifier les patterns Convex

```bash
#!/bin/bash
# check-convex-patterns.sh

echo "🔍 Checking Convex patterns..."

# Chercher .collect() sans limites
echo "Checking for unbounded .collect()..."
grep -r "\.collect()" convex/ --include="*.ts" && echo "⚠️  Found .collect() - verify these are bounded queries" || echo "✅ No .collect() found"

# Chercher deprecated storage methods
echo "Checking for deprecated storage.getMetadata()..."
grep -r "storage\.getMetadata" convex/ --include="*.ts" && echo "❌ Found deprecated storage.getMetadata() - use ctx.db.system.get('_storage', id)" || echo "✅ No deprecated storage methods"

# Vérifier les validators
echo "Checking validators..."
grep -r "args: {}" convex/ --include="*.ts" && echo "⚠️  Found empty args - should have validators" || echo "✅ All functions have validators"
```

### Script 3: Test de build complet

```bash
#!/bin/bash
# full-build-test.sh

echo "🏗️  Running full build test..."

# Clean
echo "1. Cleaning..."
rm -rf .next node_modules/.cache

# TypeCheck
echo "2. Type checking..."
npm run typecheck || exit 1

# Lint
echo "3. Linting..."
npm run lint || exit 1

# Build
echo "4. Building..."
npm run build || exit 1

# Tests
echo "5. Running tests..."
npm run test:unit || exit 1

echo "✅ Full build test passed!"
```

---

## 📊 Métriques de Performance

### Baseline Avant Update

```bash
# Mesurer les métriques actuelles
echo "📊 Baseline Metrics Before Update"

# Build time
time npm run build > build-time-before.txt 2>&1

# Type check time
time npm run typecheck > typecheck-time-before.txt 2>&1

# Bundle size
du -sh .next/static > bundle-size-before.txt

# Test execution time
time npm run test > test-time-before.txt 2>&1
```

### Mesures Après Update

```bash
echo "📊 Metrics After Update"

# Build time
time npm run build > build-time-after.txt 2>&1

# Type check time
time npm run typecheck > typecheck-time-after.txt 2>&1

# Bundle size
du -sh .next/static > bundle-size-after.txt

# Test execution time
time npm run test > test-time-after.txt 2>&1

# Compare
echo "Build time change:"
diff build-time-before.txt build-time-after.txt

echo "Bundle size change:"
diff bundle-size-before.txt bundle-size-after.txt
```

---

## 🚨 Rollback Plan

### En cas de problème critique

```bash
#!/bin/bash
# rollback.sh

echo "🔄 Rolling back to previous version..."

# Restore package files
cp package.json.backup package.json
cp package-lock.json.backup package-lock.json

# Reinstall
rm -rf node_modules
npm install

# Rebuild
npm run build

# Verify
npm run typecheck
npm run lint
npm run test

echo "✅ Rollback completed"
```

---

## ✅ Checklist Finale Post-Update

### Functionality Tests

#### Authentication
- [ ] Login avec email/password fonctionne
- [ ] Signup nouveau compte fonctionne
- [ ] Social login fonctionne
- [ ] Logout fonctionne
- [ ] Session persiste après refresh

#### Organizations
- [ ] Création d'Organization fonctionne
- [ ] Slug customization fonctionne
- [ ] Switch entre Organizations fonctionne
- [ ] URL `/orgs/:slug` active l'org
- [ ] Middleware gère correctement les slugs
- [ ] Roles et permissions fonctionnent

#### Backend
- [ ] Queries Convex retournent données
- [ ] Mutations Convex écrivent données
- [ ] Actions Convex executent (fetch, etc.)
- [ ] File upload fonctionne
- [ ] Authentication dans Convex fonctionne
- [ ] `ctx.auth.getUserIdentity()` retourne user

#### Payments
- [ ] Webhooks Stripe reçus
- [ ] Stripe Connect fonctionne
- [ ] Checkout fonctionne
- [ ] Subscriptions via Clerk Billing fonctionnent

#### UI/UX
- [ ] Animations smooth
- [ ] Icônes affichés
- [ ] Styles appliqués
- [ ] Dark mode fonctionne
- [ ] Responsive fonctionne

#### Build & Deploy
- [ ] Build production réussit
- [ ] TypeCheck passe sans erreurs
- [ ] Lint passe sans erreurs
- [ ] Tests passent
- [ ] Déploiement Vercel réussit
- [ ] App fonctionne en production

### Performance Tests

- [ ] Build time ≤ baseline +10%
- [ ] Bundle size ≤ baseline +5%
- [ ] Type check time ≤ baseline +10%
- [ ] Test execution time ≤ baseline +10%
- [ ] Page load time ≤ baseline

### Security Tests

- [ ] JWT validation fonctionne
- [ ] Webhook signatures vérifiées
- [ ] CSRF protection active
- [ ] Rate limiting fonctionne
- [ ] Pas de secrets exposés

---

## 📝 Rapport Final

```markdown
# Update Report - [DATE]

## Packages Updated

### Production Dependencies
- next: 16.2.3 → 16.2.10 ✅
- react: 19.2.5 → 19.2.7 ✅
- @clerk/nextjs: 7.0.12 → 7.5.15 ✅
- convex: 1.34.1 → 1.42.1 ✅
- [etc.]

### Dev Dependencies
- typescript: 6.0.2 → 6.0.2 (NOT UPDATED - waiting TS 7 validation)
- [etc.]

## Issues Found

### Critical Issues
- None ✅

### Warnings
- [List any warnings]

### Fixed Issues
- [List any issues fixed during update]

## Performance Impact

- Build time: [before] → [after] ([+/-X%])
- Bundle size: [before] → [after] ([+/-X%])
- Type check: [before] → [after] ([+/-X%])

## Recommendations

1. [Recommendation 1]
2. [Recommendation 2]

## Next Steps

1. Monitor production for 24h
2. [Other steps]
```

---

**Dernière mise à jour:** 9 Juillet 2026  
**Auteur:** Kiro Agent Analysis
