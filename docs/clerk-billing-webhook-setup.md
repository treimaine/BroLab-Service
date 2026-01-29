# Clerk Webhook Setup (Unified Handler)

## ⚠️ CRITIQUE : Différence .convex.cloud vs .convex.site

**Les HTTP routes Convex utilisent `.convex.site`, PAS `.convex.cloud` !**

| Type | URL | Usage |
|------|-----|-------|
| **Queries/Mutations** | `https://your-deployment.convex.cloud` | Appels Convex depuis le client |
| **HTTP Routes/Webhooks** | `https://your-deployment.convex.site` | Webhooks externes (Clerk, Stripe) |

**Exemple pour le déploiement `famous-starling-265` :**
- ❌ `https://famous-starling-265.convex.cloud/api/clerk/webhook` → **404 Not Found**
- ✅ `https://famous-starling-265.convex.site/api/clerk/webhook` → **200 OK**

**Source :** [Convex HTTP Actions Documentation](https://docs.convex.dev/functions/http-actions)

## Overview

Le webhook handler unifié dans `convex/http.ts` gère **deux types d'événements Clerk** :

1. **Événements Clerk Standard** : `user.*`, `session.*`, `organization.*`
2. **Événements Clerk Billing** : `subscription.*`

## Webhook Endpoints

Deux URLs sont disponibles (identiques) :
- `/api/clerk/webhook` (recommandé)
- `/api/clerk/billing/webhook` (alias pour compatibilité)

**Format complet de l'URL :**
```
https://<deployment-name>.convex.site/api/clerk/webhook
```

## Types d'Événements Supportés

### ✅ Événements Clerk Standard (Fonctionnent Maintenant)

Ces événements sont **envoyés automatiquement** par Clerk :

| Événement | Description | Status |
|-----------|-------------|--------|
| `user.created` | Nouvel utilisateur créé | ✅ Supporté |
| `user.updated` | Utilisateur mis à jour | ✅ Supporté |
| `user.deleted` | Utilisateur supprimé | ✅ Supporté |
| `session.created` | Nouvelle session créée | ✅ Supporté |
| `session.ended` | Session terminée | ✅ Supporté |
| `session.removed` | Session supprimée | ✅ Supporté |
| `session.revoked` | Session révoquée | ✅ Supporté |
| `organization.created` | Organisation créée | ✅ Supporté |
| `organization.updated` | Organisation mise à jour | ✅ Supporté |
| `organization.deleted` | Organisation supprimée | ✅ Supporté |

**Payload Standard** :
```json
{
  "type": "user.created",
  "object": "event",
  "data": {
    "id": "user_2xxx",
    "email_addresses": [...],
    "first_name": "John",
    "last_name": "Doe",
    ...
  }
}
```

### ⚠️ Événements Clerk Billing (Beta - Webhooks Non Disponibles)

Ces événements ne sont **PAS encore envoyés automatiquement** par Clerk Billing Beta :

| Événement | Description | Status |
|-----------|-------------|--------|
| `subscription.created` | Souscription créée | ⚠️ Beta - Pas de webhook |
| `subscription.updated` | Souscription mise à jour | ⚠️ Beta - Pas de webhook |
| `subscription.deleted` | Souscription supprimée | ⚠️ Beta - Pas de webhook |
| `subscription.canceled` | Souscription annulée | ⚠️ Beta - Pas de webhook |

**Payload Billing (Attendu)** :
```json
{
  "type": "subscription.created",
  "data": {
    "id": "sub_xxx",
    "user_id": "user_2xxx",
    "plan": "basic",
    "status": "active"
  }
}
```

## Configuration dans Clerk Dashboard

### 1. Créer un Webhook Endpoint

1. Aller dans **Clerk Dashboard** → **Webhooks**
2. Cliquer sur **Add Endpoint**
3. **URL** : `https://<deployment-name>.convex.site/api/clerk/webhook`
   
   **⚠️ IMPORTANT : Utiliser `.convex.site`, PAS `.convex.cloud` !**
   
   **Exemples :**
   - Dev : `https://famous-starling-265.convex.site/api/clerk/webhook`
   - Prod : `https://cautious-retriever-22.convex.site/api/clerk/webhook`
   
4. Sélectionner les événements :
   - ✅ `user.*` (tous les événements utilisateur)
   - ✅ `session.*` (tous les événements session)
   - ✅ `organization.*` (tous les événements organisation)
   - ⚠️ `subscription.*` (ne fonctionnera pas en Beta)

### 2. Trouver l'URL de ton Déploiement Convex

**Option A : Depuis le Dashboard Convex**
1. Va sur https://dashboard.convex.dev
2. Sélectionne ton déploiement (dev ou prod)
3. Va dans **Settings** → **URL & Deploy Key**
4. Copie l'URL qui se termine par `.convex.site`

**Option B : Depuis ton .env.local**
```bash
# Si tu as NEXT_PUBLIC_CONVEX_URL=https://famous-starling-265.convex.cloud
# Alors l'URL webhook est: https://famous-starling-265.convex.site
```

**Règle simple :** Remplace `.convex.cloud` par `.convex.site` pour les webhooks.

### 2. Tester les Webhooks

#### Test Événements Standard (✅ Fonctionne)

1. Dans Clerk Dashboard → Webhooks → Votre endpoint
2. Onglet **Testing**
3. Sélectionner un événement : `user.created`, `session.created`, etc.
4. Cliquer **Send Test Event**
5. ✅ Devrait retourner `200 OK` avec :
   ```json
   {
     "received": true,
     "eventType": "standard",
     "type": "user.created",
     "message": "Event logged successfully"
   }
   ```

**Si tu obtiens 404 Not Found :**
- ❌ Vérifie que l'URL se termine par `.convex.site` (PAS `.convex.cloud`)
- ✅ Vérifie que `npx convex dev` tourne (pour dev) ou que tu as déployé (pour prod)
- ✅ Vérifie dans Convex Dashboard → Functions qu'il y a une entrée "http"

#### Test Événements Billing (❌ Ne Fonctionne Pas)

1. Sélectionner `subscription.created`
2. Cliquer **Send Test Event**
3. ❌ Erreur : `"A string \"A\" property must be a valid JSON object"`
4. **Raison** : Clerk Billing Beta ne supporte pas les webhooks

## ⚠️ Important: Clerk Billing Beta Limitations

**Clerk Billing est actuellement en Beta et ne supporte PAS encore les webhooks automatiques pour les événements de souscription.**

Cela signifie que:
- ❌ Les webhooks `subscription.created`, `subscription.updated`, etc. ne sont **PAS envoyés automatiquement**
- ❌ Vous ne pouvez pas tester les événements Billing dans le dashboard
- ✅ Les événements Clerk standard (`user.*`, `session.*`, etc.) **fonctionnent normalement**
- ✅ Vous devez utiliser l'API Clerk pour synchroniser manuellement les souscriptions

## Routing des Événements

Le webhook handler unifié route automatiquement les événements :

```typescript
// Dans convex/http.ts
if (type.startsWith("subscription.")) {
  // Route vers handleBillingEvent()
  // Sync vers providerSubscriptions table
} else {
  // Route vers handleStandardEvent()
  // Log l'événement (extensible)
}
```

### Événements Standard → `handleStandardEvent()`

- Log l'événement pour audit
- Peut être étendu pour :
  - Créer des profils utilisateur
  - Tracker les sessions
  - Gérer les organisations
  - Envoyer des emails de bienvenue

### Événements Billing → `handleBillingEvent()`

- Récupère le workspace de l'utilisateur
- Valide le plan (`basic` ou `pro`)
- Mappe le status Clerk vers le status système
- Sync vers la table `providerSubscriptions`
- Crée/met à jour l'enregistrement `usage`

## Problem

The Usage/Quota section on `/studio/billing` is not visible even when a subscription is configured in Clerk Dashboard. This is because **Clerk Billing subscriptions are not automatically synced to Convex** - Clerk Billing Beta doesn't support webhooks yet.

## Root Cause

The `BillingManagement` component displays the Usage/Quota section only when:
1. `data.subscription` exists (subscription record in Convex)
2. `data.planFeatures` exists (plan features from PLAN_FEATURES)

Even if you create a subscription in Clerk Dashboard, it won't appear in Convex because:
1. Clerk Billing Beta doesn't send webhooks
2. We need to manually sync subscriptions using the Clerk API

## Solution 1: Manual Sync via Convex Action (Recommended for Beta)

Since Clerk Billing webhooks aren't available, use the Convex action to sync subscriptions:

### Step 1: Get your Clerk User ID

1. Sign in to your app
2. Open browser console
3. Run: `window.Clerk.user.id`
4. Copy the user ID (e.g., `user_2xxx...`)

### Step 2: Sync Subscription in Convex Dashboard

1. Go to **Convex Dashboard** → **Functions**
2. Find `platform/billing/clerkBillingSync:syncSubscriptionFromClerk`
3. Run with arguments:
   ```json
   {
     "clerkUserId": "user_2xxx..."
   }
   ```
4. This will fetch the subscription from Clerk API and sync to Convex
5. Reload `/studio/billing` - Usage/Quota section should now be visible

### Step 3: Verify Sync

1. Go to **Convex Dashboard** → **Data**
2. Open `providerSubscriptions` table
3. Verify the subscription record exists with correct `planKey` and `status`

## Solution 2: Manual Test Subscription (Development Only)

## Solution 2: Manual Test Subscription (Development Only)

For quick testing without API sync, create a test subscription directly in Convex:

For quick testing without webhooks, create a test subscription directly in Convex:

### Step 1: Get your Clerk User ID

1. Sign in to your app
2. Open browser console
3. Run: `window.Clerk.user.id`
4. Copy the user ID (e.g., `user_2xxx...`)

### Step 2: Create Test Subscription in Convex Dashboard

1. Go to **Convex Dashboard** → **Functions**
2. Find `platform/billing/testSubscription:createTestSubscription`
3. Run with arguments:
   ```json
   {
     "clerkUserId": "user_2xxx...",
     "planKey": "basic"
   }
   ```
4. Reload `/studio/billing` - Usage/Quota section should now be visible

### Step 3: Clean Up

To remove the test subscription:

1. Go to **Convex Dashboard** → **Data**
2. Open `providerSubscriptions` table
3. Delete the test record

## Why Webhooks Don't Work (Clerk Billing Beta)

**Clerk Billing is in Beta and doesn't support webhooks yet.** Here's what happens when you try:

1. You configure a webhook endpoint in Clerk Dashboard
2. You try to send a test event (like `session.created`)
3. Clerk tries to validate the payload but fails because:
   - `session.created` is NOT a Clerk Billing event
   - Clerk Billing events (`subscription.created`, etc.) are not available in Beta
   - The webhook system doesn't know how to handle Billing events yet

**Error you see:**
```
"message": "A string \"A\" property must be a valid JSON object"
```

This means Clerk is trying to validate the webhook payload but failing because the event type doesn't match any known schema.

## When Will Webhooks Work?

Clerk Billing webhooks will work when:
1. Clerk Billing exits Beta and becomes Generally Available (GA)
2. Clerk adds webhook support for `subscription.*` events
3. The webhook payload structure is documented

Until then, you must use **manual sync via API** or **direct database insertion** for testing.

## Webhook Endpoint (Ready for Future)

The Clerk Billing webhook sends events in this format:

```json
{
  "type": "subscription.created",
  "data": {
    "id": "sub_xxx",
    "user_id": "user_2xxx",
    "plan": "basic",
    "status": "active"
  }
}
```

Our webhook handler (`convex/http.ts`) processes these events and syncs to the `providerSubscriptions` table.

## Extending the Webhook Handler

### Adding Logic for Standard Events

Le handler `handleStandardEvent()` dans `convex/http.ts` peut être étendu pour ajouter de la logique métier :

```typescript
// Example: Create user profile on user.created
case "user.created":
  console.log("User created:", data.id);
  
  // Create user profile in Convex
  await ctx.runMutation(internal.platform.users.createProfile, {
    clerkUserId: data.id,
    email: data.email_addresses[0]?.email_address,
    firstName: data.first_name,
    lastName: data.last_name,
  });
  break;

// Example: Track sessions
case "session.created":
  console.log("Session created:", data.id);
  
  // Log session for analytics
  await ctx.runMutation(internal.platform.analytics.logSession, {
    sessionId: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
  });
  break;

// Example: Sync organizations
case "organization.created":
  console.log("Organization created:", data.id);
  
  // Create workspace from organization
  await ctx.runMutation(internal.platform.workspaces.createFromOrg, {
    clerkOrgId: data.id,
    name: data.name,
    slug: data.slug,
  });
  break;
```

### Adding Logic for Billing Events

Le handler `handleBillingEvent()` sync déjà les subscriptions. Vous pouvez ajouter :

```typescript
// After syncing subscription
console.log("Subscription synced successfully");

// Send welcome email for new subscriptions
if (type === "subscription.created") {
  await ctx.runAction(internal.platform.emails.sendWelcome, {
    clerkUserId,
    planKey: plan,
  });
}

// Send cancellation email
if (type === "subscription.deleted") {
  await ctx.runAction(internal.platform.emails.sendCancellation, {
    clerkUserId,
  });
}
```

## Testing

### Local Testing

1. **Start Convex dev server**:
   ```bash
   npx convex dev
   ```

2. **Run test script**:
   ```bash
   node scripts/test-clerk-webhooks.mjs
   ```

3. **Check Convex logs** for webhook processing

### Production Testing

1. **Configure webhook in Clerk Dashboard**
2. **Use Clerk's test event feature**
3. **Monitor Convex logs** in dashboard

## Troubleshooting

### Webhook not receiving events

1. Check Clerk Dashboard → Webhooks → Logs
2. Verify webhook URL is correct and accessible
3. Check Convex logs for errors
4. Ensure webhook is enabled in Clerk

### Subscription not syncing

1. Check `providerSubscriptions` table in Convex Dashboard
2. Verify `workspaces` table has a record for the user
3. Check `events` table for `subscription_synced` events
4. Review Convex function logs for errors

### Usage/Quota still not visible

1. Verify `data.subscription` is not null (check browser console logs)
2. Verify `data.planFeatures` is not null
3. Check that `planKey` is either "basic" or "pro"
4. Ensure `usage` table has a record for the workspace

## Status Mapping

Clerk subscription statuses are mapped to system statuses:

| Clerk Status | System Status |
|--------------|---------------|
| `active` | `active` |
| `trialing` | `active` |
| `canceled` | `canceled` |
| `incomplete` | `inactive` |
| `incomplete_expired` | `inactive` |
| `past_due` | `inactive` |
| `unpaid` | `inactive` |

## Next Steps

1. Configure Clerk Billing webhooks in production
2. Test subscription creation flow end-to-end
3. Verify Usage/Quota section displays correctly
4. Test subscription upgrades/downgrades
5. Test subscription cancellation

## Related Files

- `convex/http.ts` - Webhook handler
- `convex/platform/billing/webhooks.ts` - Subscription sync logic
- `convex/platform/billing/subscriptionQueries.ts` - Data fetching
- `src/components/hub/BillingManagement.tsx` - UI component
- `convex/platform/billing/testSubscription.ts` - Test helper (dev only)
