# Clerk Production - Debug Guide

## 🔍 Questions de Diagnostic

Pour identifier le problème Clerk, j'ai besoin de savoir:

### 1. Quel est le symptôme exact?
- [ ] La page de sign-in ne charge pas du tout
- [ ] La page de sign-in charge mais le formulaire ne s'affiche pas
- [ ] Le formulaire s'affiche mais la connexion échoue
- [ ] Erreur spécifique dans la console (laquelle?)
- [ ] Autre (préciser)

### 2. Quelle erreur voyez-vous dans la console?
Exemples possibles:
- "Clerk: Invalid publishable key"
- "Clerk: Failed to load"
- "Clerk: Network error"
- "Clerk: JWT issuer mismatch"
- Autre

### 3. Sur quelle page le problème se produit?
- [ ] Page d'accueil (/)
- [ ] Page sign-in (/sign-in)
- [ ] Page sign-up (/sign-up)
- [ ] Après connexion (dashboard)
- [ ] Toutes les pages

---

## 🔧 Vérifications à Faire

### Vérification 1: Variables d'Environnement Vercel

Aller sur Vercel Dashboard → Settings → Environment Variables

**Variables Clerk requises:**
```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_... (ou pk_test_...)
CLERK_SECRET_KEY=sk_live_... (ou sk_test_...)
CLERK_JWT_ISSUER_DOMAIN=https://clerk.brolabentertainment.com (ou https://xxx.clerk.accounts.dev)
CLERK_WEBHOOK_SECRET=whsec_...
```

**Vérifier:**
- [ ] Toutes les variables sont définies
- [ ] Les clés correspondent (test avec test, live avec live)
- [ ] Le JWT issuer domain est correct
- [ ] Pas d'espaces ou caractères invisibles

### Vérification 2: Configuration Clerk Dashboard

Aller sur https://dashboard.clerk.com

**Vérifier:**
- [ ] L'instance Clerk est active
- [ ] Le domaine `brolabentertainment.com` est ajouté dans "Domains"
- [ ] Les URLs de redirection sont configurées:
  - Sign-in URL: `/sign-in`
  - Sign-up URL: `/sign-up`
  - After sign-in: `/onboarding` ou `/studio`
- [ ] Le JWT template "convex" existe

### Vérification 3: CSP Headers

Ouvrir https://brolabentertainment.com → F12 → Network → Sélectionner la page → Headers

**Vérifier que la CSP contient:**
```
frame-src ... https://*.clerk.accounts.dev https://clerk.brolabentertainment.com
script-src ... https://*.clerk.accounts.dev https://clerk.brolabentertainment.com
worker-src 'self' blob:
```

### Vérification 4: Network Requests

Ouvrir https://brolabentertainment.com/sign-in → F12 → Network

**Chercher des requêtes vers:**
- `clerk.accounts.dev` ou `clerk.brolabentertainment.com`
- Statut 200 = OK
- Statut 401/403 = Problème d'authentification
- Statut 404 = Mauvaise URL
- Statut 500 = Erreur serveur

---

## 🐛 Problèmes Courants et Solutions

### Problème 1: "Clerk: Invalid publishable key"

**Cause:** La clé publique Clerk est incorrecte ou manquante

**Solution:**
1. Vérifier `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` dans Vercel
2. Copier la clé depuis Clerk Dashboard → API Keys
3. Redéployer

### Problème 2: "Clerk: JWT issuer mismatch"

**Cause:** Le JWT issuer domain ne correspond pas

**Solution:**
1. Vérifier `CLERK_JWT_ISSUER_DOMAIN` dans Vercel
2. Doit correspondre au "Issuer URL" du JWT template dans Clerk Dashboard
3. Format: `https://clerk.brolabentertainment.com` (production) ou `https://xxx.clerk.accounts.dev` (dev)

### Problème 3: Clerk UI ne s'affiche pas (écran blanc)

**Cause:** CSP bloque les iframes ou scripts Clerk

**Solution:**
1. Vérifier que le middleware contient:
```ts
"frame-src 'self' ... https://*.clerk.accounts.dev https://clerk.brolabentertainment.com"
"script-src 'self' ... https://*.clerk.accounts.dev https://clerk.brolabentertainment.com"
```
2. Vérifier dans Network → Headers que la CSP est appliquée
3. Redéployer si nécessaire

### Problème 4: "Failed to load" ou erreurs réseau

**Cause:** Problème de connectivité ou domaine bloqué

**Solution:**
1. Vérifier que `clerk.accounts.dev` ou `clerk.brolabentertainment.com` est accessible
2. Vérifier qu'il n'y a pas de bloqueur de publicités
3. Vérifier les CORS headers dans le middleware

### Problème 5: Connexion réussit mais redirection échoue

**Cause:** URLs de redirection mal configurées

**Solution:**
1. Vérifier dans Clerk Dashboard → Paths:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/onboarding` ou `/studio`
2. Vérifier dans Vercel:
```env
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/onboarding
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
```

---

## 🧪 Tests à Effectuer

### Test 1: Page Sign-In Charge
```bash
# Ouvrir
open https://brolabentertainment.com/sign-in

# Vérifier:
# ✅ La page charge sans erreur 500
# ✅ Le formulaire Clerk s'affiche
# ✅ Pas d'erreurs dans la console
```

### Test 2: Connexion Fonctionne
```bash
# Sur /sign-in:
# 1. Entrer email + mot de passe
# 2. Cliquer "Sign in"
# 3. Vérifier:
#    ✅ Pas d'erreur
#    ✅ Redirection vers /onboarding ou /studio
#    ✅ UserButton s'affiche (si applicable)
```

### Test 3: Session Persiste
```bash
# Après connexion:
# 1. Rafraîchir la page (F5)
# 2. Vérifier:
#    ✅ Toujours connecté
#    ✅ Pas de redirection vers /sign-in
```

---

## 📊 Checklist de Debug

### Étape 1: Collecter les Informations
- [ ] Copier l'erreur exacte de la console
- [ ] Noter sur quelle page le problème se produit
- [ ] Vérifier le statut des requêtes réseau (200, 401, 500?)
- [ ] Vérifier les headers CSP

### Étape 2: Vérifier la Configuration
- [ ] Variables Vercel correctes
- [ ] Clerk Dashboard configuré
- [ ] Domaines ajoutés
- [ ] JWT template existe

### Étape 3: Vérifier le Code
- [ ] `ClerkProvider` dans `app/layout.tsx`
- [ ] `clerkMiddleware` dans `middleware.ts`
- [ ] CSP contient les domaines Clerk
- [ ] `ConvexProviderWithClerk` utilise `useAuth`

### Étape 4: Tester
- [ ] Page sign-in charge
- [ ] Formulaire s'affiche
- [ ] Connexion fonctionne
- [ ] Redirection fonctionne
- [ ] Session persiste

---

## 🆘 Si Rien ne Fonctionne

### Option 1: Rollback
```bash
# Aller sur Vercel Dashboard
# → Deployments
# → Trouver un déploiement qui fonctionnait
# → "..." → "Promote to Production"
```

### Option 2: Logs Vercel
```bash
# Aller sur Vercel Dashboard
# → Deployments → Latest → Logs
# Chercher des erreurs liées à Clerk
```

### Option 3: Support Clerk
- Email: support@clerk.com
- Dashboard: https://dashboard.clerk.com → Support
- Docs: https://clerk.com/docs/troubleshooting

---

## 📝 Template de Rapport de Bug

Si vous contactez le support, utilisez ce template:

```
**Environnement:**
- URL: https://brolabentertainment.com
- Page: /sign-in (ou autre)
- Navigateur: Chrome/Firefox/Safari + version

**Symptôme:**
[Décrire ce qui ne fonctionne pas]

**Erreur Console:**
[Copier l'erreur exacte]

**Requêtes Réseau:**
[Statut des requêtes vers clerk.accounts.dev]

**Configuration:**
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: pk_live_xxx (masquer les derniers caractères)
- CLERK_JWT_ISSUER_DOMAIN: https://clerk.brolabentertainment.com
- Clerk Dashboard: Instance active, domaine ajouté

**Ce qui a été testé:**
- [ ] Variables Vercel vérifiées
- [ ] CSP vérifiée
- [ ] Clerk Dashboard vérifié
- [ ] Cache navigateur vidé
```

---

**Prochaine étape:** Fournir les informations de diagnostic pour identifier le problème exact.
