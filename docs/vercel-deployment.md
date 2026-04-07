# Vercel Deployment Guide

## Environment Variables Configuration

Sur Vercel, les variables d'environnement ne sont PAS lues depuis `.env.local`. Elles doivent être configurées dans le Vercel Dashboard.

### Configuration des Variables

1. Aller dans **Vercel Dashboard** → **Project Settings** → **Environment Variables**

2. Ajouter toutes les variables requises :

#### Build-Time Variables (Required)
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_SECRET_KEY=sk_live_...
CLERK_JWT_ISSUER_DOMAIN=https://clerk.your-domain.com
NEXT_PUBLIC_CONVEX_URL=https://your-project.convex.cloud
STRIPE_SECRET_KEY=sk_live_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
RESEND_API_KEY=re_...
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

#### Runtime Variables (Required)
```
CONVEX_DEPLOYMENT=prod:your-deployment
CLERK_WEBHOOK_SECRET=whsec_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...
STRIPE_CONNECT_CLIENT_ID=ca_...
```

#### Optional Variables
```
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL=/
NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL=/onboarding
CLERK_BILLING_ENABLED=true
BRAND_NAME=BroLab Entertainment
BRAND_EMAIL=support@brolabentertainment.com
BRAND_ADDRESS=Your Address
BRAND_PHONE=Your Phone
BRAND_WEBSITE=https://brolabentertainment.com
```

3. Pour chaque variable, sélectionner les environnements :
   - ✅ Production
   - ✅ Preview (optionnel)
   - ✅ Development (optionnel)

### Vérification

Le script `check-env.mjs` détecte automatiquement l'environnement Vercel et skip les vérifications strictes pendant le build. Les variables sont validées au runtime.

### Redéploiement

Après avoir ajouté/modifié des variables :
1. Aller dans **Deployments**
2. Cliquer sur **Redeploy** sur le dernier déploiement
3. Ou faire un nouveau commit pour déclencher un build

### Troubleshooting

**Erreur : "Environment check FAILED"**
- Vérifier que toutes les variables requises sont configurées dans Vercel Dashboard
- Vérifier qu'il n'y a pas de typos dans les noms de variables
- Vérifier que les valeurs ne contiennent pas de placeholders (`...`, `your-`, `example.com`)

**Erreur : "Missing NEXT_PUBLIC_CONVEX_URL"**
- Cette variable doit être configurée dans Vercel Dashboard
- Elle doit pointer vers votre déploiement Convex production

**Variables non prises en compte**
- Redéployer après avoir modifié les variables
- Les variables `NEXT_PUBLIC_*` nécessitent un rebuild complet
