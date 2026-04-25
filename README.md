# 🎵 BroLab Entertainment

> **Plateforme SaaS B2B multi-tenant pour producteurs de musique et ingénieurs audio**

BroLab Entertainment permet aux créateurs musicaux de lancer leur propre storefront pour vendre des beats et offrir des services directement aux artistes, avec **0% de commission**.

[![Next.js](https://img.shields.io/badge/Next.js-15.5-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
[![Convex](https://img.shields.io/badge/Convex-1.31-orange)](https://convex.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?logo=tailwind-css)](https://tailwindcss.com/)

---

## 📋 Table des Matières

- [Vision](#-vision)
- [Fonctionnalités](#-fonctionnalités)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Développement](#-développement)
- [Déploiement](#-déploiement)
- [Structure du Projet](#-structure-du-projet)
- [Roadmap](#-roadmap)
- [Contribution](#-contribution)
- [License](#-license)

---

## 🎯 Vision

BroLab Entertainment révolutionne la vente de beats et services audio en éliminant les intermédiaires. Contrairement aux marketplaces traditionnelles (Beatstars, Airbit) qui prennent 10-30% de commission, nous offrons une plateforme SaaS où les créateurs gardent 100% de leurs revenus.

### Proposition de Valeur

#### Pour les Créateurs (Producteurs & Ingénieurs)
- ✅ **0% de commission** sur les ventes
- ✅ **Storefront personnalisé** avec sous-domaine ou domaine custom
- ✅ **Paiements directs** via Stripe Connect
- ✅ **Licences automatiques** générées en PDF
- ✅ **Multi-produits** : beats ET services (mixing, mastering)
- ✅ **Audio player premium** avec preview 30 secondes

#### Pour les Artistes (Clients)
- ✅ **Découverte directe** des créateurs
- ✅ **Preview avant achat** avec player audio intégré
- ✅ **Licences claires** avec 3 tiers (Basic, Premium, Unlimited)
- ✅ **Paiement sécurisé** via Stripe
- ✅ **Téléchargement immédiat** des fichiers + licence PDF

---

## ✨ Fonctionnalités

### 🎵 Beat Store
- Upload audio (MP3, WAV, stems)
- Preview automatique 30 secondes
- Tiered licensing (Basic, Premium, Unlimited)
- Génération automatique de licences PDF
- Audio player premium avec waveform

### 🎚️ Services Marketplace
- Listings de services (mixing, mastering, vocal tuning)
- Tarification flexible
- Système de booking
- Communication client-créateur

### 💳 Payments & Billing
- **Stripe Connect** pour paiements directs aux créateurs
- **Clerk Billing** pour abonnements SaaS
- Pas de commission sur les ventes
- Facturation automatique

### 🏪 Storefront Customization
- Sous-domaine gratuit (BASIC plan)
- Domaines custom (PRO plan)
- Personnalisation du branding
- Slug unique (`yourname.brolabentertainment.com`)

### 📄 License Management
- 3 tiers de licences (Basic, Premium, Unlimited)
- Génération automatique PDF avec pdf-lib
- Envoi par email via Resend
- Téléchargement depuis dashboard

### 📊 Analytics (PRO)
- Vues de storefront
- Plays de beats
- Conversions
- Revenus

---

## 🛠 Tech Stack

### Frontend
- **Framework:** [Next.js 15.5](https://nextjs.org/) (App Router)
- **UI Library:** [React 19.0](https://react.dev/)
- **Styling:** [Tailwind CSS 3.4](https://tailwindcss.com/)
- **Animations:** [Framer Motion 11.15](https://www.framer.com/motion/)
- **Icons:** [Lucide React 0.469](https://lucide.dev/)
- **State Management:** [Zustand 5.0](https://zustand-demo.pmnd.rs/)
- **Theme:** [next-themes 0.4](https://github.com/pacocoursey/next-themes)

### Backend
- **Database & Backend:** [Convex 1.31](https://convex.dev/)
  - Serverless backend
  - Real-time subscriptions
  - File storage intégré
  - TypeScript-first

### Authentication & Payments
- **Auth:** [Clerk 6.36](https://clerk.com/)
  - Social login (Google, GitHub)
  - Organizations (multi-tenant)
  - Roles & Permissions
- **Payments:** [Stripe 17.5](https://stripe.com/)
  - Stripe Connect pour paiements directs
  - Clerk Billing pour abonnements

### Infrastructure
- **Email:** [Resend 4.1](https://resend.com/)
- **PDF Generation:** [pdf-lib 1.17](https://pdf-lib.js.org/)
- **Deployment:** Vercel + Convex Cloud + Cloudflare Workers

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Hub        │  │   Tenant     │  │   Dashboard  │  │
│  │  (Landing)   │  │ (Storefront) │  │   (Admin)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND (Convex)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Queries    │  │  Mutations   │  │   Actions    │  │
│  │  (Read DB)   │  │  (Write DB)  │  │ (External)   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────┐
│                  EXTERNAL SERVICES                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │    Clerk     │  │    Stripe    │  │   Resend     │  │
│  │    (Auth)    │  │  (Payments)  │  │   (Email)    │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Patterns Architecturaux

#### Frontend
- **Server Components first** - Utilisation par défaut des Server Components
- **Client Components** pour interactivité uniquement
- **Route Groups** pour organisation (`(hub)`, `(_t)`)
- **Composition over inheritance**

#### Backend (Convex)
- **Queries** - Lecture DB (real-time subscriptions)
- **Mutations** - Écriture DB (transactionnelles)
- **Actions** - Appels externes (Stripe, Resend)

#### Multi-tenancy
- **Organization-based isolation** via Clerk Organizations
- **Slug-based routing** (`/orgs/:slug`)
- **Role-based access control** (RBAC)

### 🤖 Agent Architecture & Governance

This project uses the **[PaperClip AI Architecture Guide](.paperclip/PAPERCLIPAI-ARCHITECTURE.md)** for all agent-based work including CRO analysis, social media monitoring, site audits, and other automated tasks.

**Key Components:**
- **MCP Tools**: Vercel, Firecrawl, Playwright, Fetch APIs for external integrations
- **Security Model**: Enforced boundaries (no direct DB access, secrets protected, PII restricted)
- **Workflows**: Standardized patterns for common agent tasks
- **Governance**: Training, technical enforcement, code review integration, auditing

See `.paperclip/PAPERCLIPAI-ARCHITECTURE.md` for complete documentation.

---

## 🚀 Installation

### Prérequis

- **Node.js** 22+ (voir `.nvmrc`)
- **npm** (package manager)
- **Git**

### Cloner le Repository

```bash
git clone https://github.com/your-org/brolab-entertainment.git
cd brolab-entertainment
```

### Installer les Dépendances

```bash
npm install
```

---

## ⚙️ Configuration

### 1. Variables d'Environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# Clerk Auth
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://your-app.clerk.accounts.dev

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=prod:your-deployment

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Resend
RESEND_API_KEY=re_...
```

### 2. Configurer Clerk

1. Créer un compte sur [Clerk](https://clerk.com/)
2. Créer une application
3. Activer **Organizations** dans les paramètres
4. Créer un **JWT Template** nommé `convex` :
   - Aller dans **JWT Templates** → **New template** → **Convex**
   - Copier l'**Issuer URL** dans `CLERK_JWT_ISSUER_DOMAIN`

### 3. Configurer Convex

```bash
# Initialiser Convex
npx convex dev

# Login avec GitHub et créer un projet
```

Ajouter la configuration auth dans `convex/auth.config.ts` :

```typescript
import { AuthConfig } from "convex/server";

export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
} satisfies AuthConfig;
```

### 4. Configurer Stripe

1. Créer un compte sur [Stripe](https://stripe.com/)
2. Activer **Stripe Connect** pour les paiements directs
3. Configurer les webhooks :
   - URL: `https://your-domain.com/api/stripe/webhook`
   - Events: `checkout.session.completed`, `account.updated`

---

## 💻 Développement

### Démarrer le Serveur de Développement

```bash
# Terminal 1 - Next.js
npm run dev

# Terminal 2 - Convex (dans un terminal séparé)
npx convex dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

### Scripts Disponibles

```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build pour production
npm start            # Démarrer le serveur de production
npm run lint         # Linter le code
npm run typecheck    # Vérifier les types TypeScript
npm run test:security # Tests de sécurité (Playwright)
```

### Linting Custom

```bash
npm run lint:chrome    # Vérifier les violations ChromeSurface
npm run lint:surfaces  # Vérifier les surfaces glass
```

---

## 📦 Déploiement

### Frontend (Vercel)

```bash
# Installer Vercel CLI
npm i -g vercel

# Déployer
vercel --prod
```

### Backend (Convex)

```bash
# Déployer en production
npx convex deploy
```

### Variables d'Environnement Production

Configurer les variables dans :
- **Vercel Dashboard** pour Next.js
- **Convex Dashboard** pour Convex
- **Clerk Dashboard** pour les URLs de production

---

## 📁 Structure du Projet

```
brolab-entertainment/
├── app/                    # Next.js App Router (Routes uniquement)
│   ├── (hub)/              # Landing page publique
│   ├── (_t)/               # Tenant storefronts
│   ├── api/                # API routes
│   └── tenant-demo/        # Demo storefront
│
├── src/                    # Code source réutilisable
│   ├── components/         # Composants React
│   │   ├── hub/            # Composants landing page
│   │   ├── tenant/         # Composants storefront
│   │   └── audio/          # Composants audio player
│   ├── modules/            # Logique métier
│   │   ├── beats/          # Module beats
│   │   └── services/       # Module services
│   ├── platform/           # Infrastructure
│   │   ├── auth/           # Authentification
│   │   ├── billing/        # Facturation
│   │   ├── ui/             # Design system
│   │   └── tenancy/        # Multi-tenant
│   ├── lib/                # Utilitaires
│   ├── shared/             # Types & constantes
│   └── stores/             # State management (Zustand)
│
├── convex/                 # Backend Convex
│   ├── schema.ts           # Schéma base de données
│   ├── modules/            # Modules métier backend
│   │   ├── beats/          # Queries/Mutations beats
│   │   └── services/       # Queries/Mutations services
│   └── platform/           # Infrastructure backend
│       ├── auth/           # Auth helpers
│       ├── billing/        # Stripe webhooks
│       └── storage/        # File storage
│
├── worker/                 # Cloudflare Workers
├── scripts/                # Scripts utilitaires
├── .kiro/                  # Configuration Kiro
│   └── steering/           # Documentation projet
└── [config files]          # Configuration
```

### Règles de Structure

**IMPORTANT:** Respecter la séparation `app/` vs `src/`

- `app/` = Routes Next.js (pages, layouts) uniquement
- `src/` = Tout le reste (composants, logique, utils)
- Toujours utiliser les alias TypeScript (`@/`)

---

## 🗺 Roadmap

### Phase 1 - Core (Actuel)
- ✅ Landing page (Hub)
- ✅ Auth (Clerk)
- ✅ Multi-tenancy (Organizations)
- ✅ Storefront demo
- ✅ Audio player
- 🚧 Beat upload & management
- 🚧 License generation (PDF)
- 🚧 Stripe Connect integration

### Phase 2 - Services
- Services listings
- Booking system
- Client communication

### Phase 3 - Advanced
- Analytics dashboard
- Custom domains (PRO)
- Advanced licensing options
- Email marketing integration

---

## 🤝 Contribution

Les contributions sont les bienvenues ! Veuillez suivre ces étapes :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Guidelines

- Suivre les conventions de nommage du projet
- Respecter la structure `app/` vs `src/`
- Ajouter des tests si applicable
- Mettre à jour la documentation

---

## 📄 License

Ce projet est sous licence propriétaire. Tous droits réservés.

---

## 🤖 PaperClip AI Integration

BroLab Entertainment est configuré pour l'accès automatique des agents PaperClip AI :

- **Quick Start:** [`docs/PAPERCLIPAI-QUICK-START.md`](docs/PAPERCLIPAI-QUICK-START.md)
- **Setup Guide:** [`docs/PAPERCLIPAI-SETUP.md`](docs/PAPERCLIPAI-SETUP.md)
- **Full Documentation:** [`docs/AGENT-PRODUCTION-ACCESS.md`](docs/AGENT-PRODUCTION-ACCESS.md)
- **Auto-loaded Config:** [`.kiro/steering/paperclipai-agent-access.md`](.kiro/steering/paperclipai-agent-access.md)

Les agents ont accès à :
- ✅ Production URLs (site, Convex, Clerk)
- ✅ MCP Tools (Vercel, Firecrawl, Playwright, Fetch)
- ✅ X API (@brolabent, @brolabapp)
- ✅ CRO Skills (page-cro, paywall-upgrade-cro, marketing-ideas)

## 📞 Contact & Support

- **Website:** [brolabentertainment.com](https://brolabentertainment.com)
- **Email:** support@brolabentertainment.com
- **Documentation:** Voir `.kiro/steering/` pour la documentation détaillée

---

## 🙏 Remerciements

- [Next.js](https://nextjs.org/) - Framework React
- [Convex](https://convex.dev/) - Backend serverless
- [Clerk](https://clerk.com/) - Authentification
- [Stripe](https://stripe.com/) - Paiements
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Framer Motion](https://www.framer.com/motion/) - Animations

---

**Made with ❤️ by BroLab Entertainment Team**
