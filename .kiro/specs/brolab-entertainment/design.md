# Design Document: BroLab Entertainment

## Overview

BroLab Entertainment is a micro-SaaS multi-tenant platform built with a modular architecture separating Platform Core from Business Modules. The system enables music Providers (Producers/Audio Engineers) to run storefronts selling beats and services to Artists.

### Key Architectural Decisions

1. **Micro-SaaS Modular Architecture**: Clear separation between Platform Core (auth, tenancy, billing, quotas, jobs, observability, i18n, ui) and Business Modules (beats, services)
2. **Multi-Tenant Routing**: Hub domain + subdomain tenants + custom domain support via middleware rewriting to /_t/[workspaceSlug]/...
3. **Dual Payment Systems**: Clerk Billing for provider subscriptions (platform revenue → YOUR Stripe account) + Stripe Connect for artist purchases (provider revenue → provider's Stripe account)
4. **Job-Based Processing**: Generic job queue for background tasks (preview generation, future: waveforms, loudness)
5. **Convex as Single Backend**: Database + File Storage + Real-time subscriptions

### Vertical Slice Priority (Build First)

**Complete this flow end-to-end before expanding:**
1. Onboarding provider → création workspace (slug)
2. Routing subdomain (slug.brolabentertainment.com)
3. Upload track (Convex storage)
4. Preview job (ffmpeg worker)
5. Lecture preview sur storefront

**Then expand to:** services, custom domains, i18n, property tests, etc.

## Technology Stack (EXACT Pinned Versions - Day 0)

- Node.js: 22 (via `.nvmrc` and `engines.node`)
- Next.js: **16.1.4 pinned exact** (no `^` or `~`)
- React: pinned exact
- Package manager: **npm** (`package-lock.json` committed)

**Rule (MUST):** The project SHALL pin exact versions for Next.js and core dependencies. No caret `^` or tilde `~` allowed.

```json
{
  "engines": { "node": "22" },
  "dependencies": {
    "next": "16.1.4",
    "react": "19.0.0",
    "react-dom": "19.0.0",
    "@clerk/nextjs": "6.10.3",
    "convex": "1.17.4",
    "stripe": "17.5.0",
    "zustand": "5.0.3",
    "framer-motion": "11.15.0",
    "lucide-react": "0.469.0",
    "resend": "4.1.2",
    "pdf-lib": "1.17.1"
  },
  "devDependencies": {
    "typescript": "5.7.2",
    "tailwindcss": "3.4.17",
    "@types/node": "22.10.5",
    "@types/react": "19.0.2"
  }
}
```

**Files:**
- `.nvmrc`: `22`
- Package manager: **npm** (not pnpm, not yarn), use `package-lock.json`
- Install command in docs: `npm ci`

### npm Scripts

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "build:worker": "tsc -p worker/tsconfig.json",
    "worker": "node dist/worker/index.js"
  }
}
```

## Clerk Billing - Revenue Flow Clarification

**Important: Clerk Billing = YOUR Stripe Account**

Clerk Billing integrates with YOUR Stripe account (platform owner):
- Stripe handles payment processing
- Clerk handles UI + subscription entitlement logic
- Revenue from provider subscriptions goes to YOUR Stripe account
- Payouts from Stripe go to YOUR bank account

```
Provider subscribes → Clerk Billing UI → Stripe (YOUR account) → YOUR bank
```

This is separate from Stripe Connect (artist purchases → provider's Stripe account).

### Clerk Billing Pricing (Monthly + Annual)

**Decision (MUST): Annual discount rules**
- BASIC annual price SHALL be **50% OFF** compared to (monthly * 12)
- PRO annual price SHALL be **70% OFF** compared to (monthly * 12)
- Rounding rule: annual prices MAY be rounded to end with `.99` for pricing psychology, while staying within ±$0.10 of the computed value.

#### Source of truth
- `PRICING` in code is the source of truth for display.
- Clerk Dashboard prices MUST match `PRICING`.

#### Pricing
Monthly prices:
- BASIC: $9.99 / month
- PRO: $29.99 / month

Computed annual targets:
- BASIC: 9.99 * 12 = 119.88 → 50% OFF → 59.94 → **$59.99**
- PRO: 29.99 * 12 = 359.88 → 70% OFF → 107.96 → **$107.99**

```typescript
export const PRICING = {
  basic: { monthly: 9.99, annual: 59.99 }, // 50% off vs 12 months
  pro:   { monthly: 29.99, annual: 107.99 }, // 70% off vs 12 months
} as const;

export function getAnnualSavingsPercent(plan: "basic" | "pro"): number {
  const monthly = PRICING[plan].monthly * 12;
  const annual = PRICING[plan].annual;
  return Math.round((1 - annual / monthly) * 100);
}
```

### License Tiers (Fixed v1 + Migration Path)

```typescript
// src/platform/licensing/tiers.ts
export const LICENSE_TIERS = ["basic", "premium", "unlimited"] as const;
export type LicenseTier = (typeof LICENSE_TIERS)[number];

// v1 fixed tiers - version for snapshot
export const LICENSE_TERMS_VERSION = "v1.1-2026-01";

export const LICENSE_TERMS_BY_TIER: Record<LicenseTier, {
  title: string;
  includesStems: boolean;
  rights: {
    commercialUse: boolean;
    audioStreamingCap: number; // -1 = unlimited
    musicVideosCap: number;
    livePerformanceCap: number;
    radioBroadcastCap: number;
    syncAllowed: boolean;
  };
  publishingSplit: {
    licensorWriterSharePercent: number;
    licenseeWriterSharePercent: number;
    licensorPublisherSharePercent: number;
    licenseePublisherSharePercent: number;
  };
}> = {
  basic: {
    title: "Basic License",
    includesStems: false,
    rights: {
      commercialUse: true,
      audioStreamingCap: 100000,
      musicVideosCap: 1,
      livePerformanceCap: 10,
      radioBroadcastCap: 0,
      syncAllowed: false,
    },
    publishingSplit: {
      licensorWriterSharePercent: 50,
      licenseeWriterSharePercent: 50,
      licensorPublisherSharePercent: 50,
      licenseePublisherSharePercent: 50,
    },
  },
  premium: {
    title: "Premium License",
    includesStems: false,
    rights: {
      commercialUse: true,
      audioStreamingCap: 500000,
      musicVideosCap: 2,
      livePerformanceCap: 25,
      radioBroadcastCap: 10,
      syncAllowed: false,
    },
    publishingSplit: {
      licensorWriterSharePercent: 50,
      licenseeWriterSharePercent: 50,
      licensorPublisherSharePercent: 50,
      licenseePublisherSharePercent: 50,
    },
  },
  unlimited: {
    title: "Unlimited License",
    includesStems: true,
    rights: {
      commercialUse: true,
      audioStreamingCap: -1, // unlimited
      musicVideosCap: -1,
      livePerformanceCap: -1,
      radioBroadcastCap: -1,
      syncAllowed: true,
    },
    publishingSplit: {
      licensorWriterSharePercent: 50,
      licenseeWriterSharePercent: 50,
      licensorPublisherSharePercent: 50,
      licenseePublisherSharePercent: 50,
    },
  },
};

// Migration path (later):
// - Replace fixed tiers by Convex table `licenseTemplates` per workspace
// - Keep snapshot+version in entitlements to preserve past purchases
// - Provider can customize tier names, caps, and pricing
```

#### Clerk Dashboard setup
- BASIC plan: monthly price $9.99 + annual price $59.99
- PRO plan: monthly price $29.99 + annual price $107.99

## Architecture

### Module Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              NEXT.JS APP                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         MIDDLEWARE                                   │    │
│  │  • Hostname normalization (strip port for localhost/preview)        │    │
│  │  • Hub routing (brolabentertainment.com)                            │    │
│  │  • Subdomain extraction (slug.brolabentertainment.com)              │    │
│  │  • Reserved subdomains → redirect to hub OR 404                     │    │
│  │  • Custom domain resolution (verified only)                          │    │
│  │  • Rewrite to /_t/[workspaceSlug]/...                               │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌──────────────────────────┐  ┌──────────────────────────────────────┐    │
│  │      HUB ROUTES          │  │         TENANT ROUTES                 │    │
│  │  /(hub)/                 │  │  /(_t)/[workspaceSlug]/               │    │
│  │  • / (landing)           │  │  • / (storefront home)                │    │
│  │  • /pricing              │  │  • /beats, /beats/[id]                │    │
│  │  • /sign-in, /sign-up    │  │  • /services, /services/[id]          │    │
│  │  • /onboarding           │  │  • /contact                           │    │
│  │  • /studio/*             │  └──────────────────────────────────────┘    │
│  │  • /artist/*             │                                               │
│  └──────────────────────────┘                                               │
└─────────────────────────────────────────────────────────────────────────────┘
```

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SRC MODULES                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      PLATFORM CORE                                   │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  /platform/auth        → Clerk integration, role management          │    │
│  │  /platform/tenancy     → Workspace resolution, slug validation       │    │
│  │  /platform/billing     → Clerk Billing integration, plan features    │    │
│  │  /platform/entitlements→ getWorkspacePlan, assertEntitlement         │    │
│  │  /platform/quotas      → assertQuota, usage tracking                 │    │
│  │  /platform/domains     → Custom domain management                    │    │
│  │  /platform/jobs        → Generic job queue client                    │    │
│  │  /platform/observability→ Audit logs, events client                  │    │
│  │  /platform/i18n        → EN/FR translations, currency display        │    │
│  │  /platform/ui          → Design system primitives                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                     BUSINESS MODULES                                 │    │
│  ├─────────────────────────────────────────────────────────────────────┤    │
│  │  /modules/beats                                                      │    │
│  │    • components/ (TrackCard, TrackUpload, TrackList, BeatDetail)    │    │
│  │    • server/     (upload, publish, preview job enqueue)             │    │
│  │    • types/      (Track, TrackStatus, ProcessingStatus)             │    │
│  │                                                                      │    │
│  │  /modules/services                                                   │    │
│  │    • components/ (ServiceCard, ServiceForm, ServiceList)            │    │
│  │    • server/     (create, update, purchase/booking)                 │    │
│  │    • types/      (Service, Booking, BookingStatus)                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                              CONVEX BACKEND                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    PLATFORM TABLES                                   │    │
│  │  users, workspaces, domains, providerSubscriptions                  │    │
│  │  usage, auditLogs, events, jobs, processedEvents                    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    MODULE TABLES                                     │    │
│  │  tracks, services, orders, purchaseEntitlements, bookings           │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    STORAGE                                           │    │
│  │  Full audio files (wav/mp3) + Preview files (mp3)                   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL SERVICES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────────────┐     │
│  │     CLERK       │  │     STRIPE      │  │        FFMPEG           │     │
│  │  • Auth         │  │  • YOUR account │  │  • Preview generation   │     │
│  │  • Roles        │  │    (Billing)    │  │  • 30s mp3 extraction   │     │
│  │  • Billing →────┼──┼→ Provider subs  │  │  • Job worker           │     │
│  │                 │  │  • Connect      │  │                         │     │
│  │                 │  │    (Artist pay) │  │                         │     │
│  └─────────────────┘  └─────────────────┘  └─────────────────────────┘     │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Multi-Tenant Routing (Option B - proxy.ts)

**Decision (MUST):** Multi-tenant routing SHALL be implemented using a Node runtime proxy (`proxy.ts`) rather than Edge middleware.

### Why
- Allows full Node runtime (no Edge constraints)
- Simplifies custom domain resolution (Convex/HTTP calls allowed)
- More predictable behavior on local/preview deployments

### Rules
1. `proxy.ts` SHALL normalize hostnames (strip port, lowercase).
2. Hub domain (`brolabentertainment.com` and `www.`) SHALL serve hub routes.
3. Reserved subdomains SHALL redirect to the hub OR return 404 (no silent fallthrough).
4. Tenant subdomains (`{slug}.brolabentertainment.com`) SHALL rewrite to `/_t/{slug}/...`
5. Custom domains SHALL be resolved server-side (Node runtime) against Convex `domains` table (verified only), then rewritten to `/_t/{slug}/...`
6. Unknown/unverified domains SHALL return 404.

**Note:** Middleware handles Clerk auth + static exclusions only. Tenancy resolution is owned by `proxy.ts`.

### proxy.ts Implementation

```typescript
// proxy.ts (Node runtime - NOT Edge)
import { createServer } from "http";
import httpProxy from "http-proxy";

const HUB_DOMAIN = "brolabentertainment.com";
const RESERVED_SUBDOMAINS = new Set([
  "www", "app", "api", "admin", "studio",
  "artist", "pricing", "sign-in", "sign-up"
]);

// Normalize hostname: strip port for localhost/preview deployments
function normalizeHostname(host: string): string {
  return host.split(":")[0].toLowerCase();
}

async function resolveCustomDomain(hostname: string): Promise<string | null> {
  // Full Node runtime - can use Convex SDK or HTTP calls
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  try {
    const response = await fetch(`${convexUrl}/api/domains/resolve`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hostname }),
    });
    if (response.ok) {
      const { slug } = await response.json();
      return slug || null;
    }
  } catch {
    // Resolution failed
  }
  return null;
}

export async function handleRequest(req: any, res: any, proxy: any) {
  const rawHost = req.headers.host || "";
  const hostname = normalizeHostname(rawHost);
  const url = new URL(req.url, `http://${rawHost}`);

  // Case 1: Hub domain (exact match)
  if (hostname === HUB_DOMAIN || hostname === `www.${HUB_DOMAIN}`) {
    return proxy.web(req, res); // Forward to Next.js
  }

  // Case 2: localhost development - treat as hub
  if (hostname === "localhost") {
    return proxy.web(req, res);
  }

  // Case 3: Subdomain of hub
  if (hostname.endsWith(`.${HUB_DOMAIN}`)) {
    const subdomain = hostname.replace(`.${HUB_DOMAIN}`, "");
    
    // Reserved subdomains: REDIRECT to hub
    if (RESERVED_SUBDOMAINS.has(subdomain)) {
      res.writeHead(302, { Location: `https://${HUB_DOMAIN}${url.pathname}${url.search}` });
      res.end();
      return;
    }
    
    // Tenant subdomain - rewrite to tenant routes
    req.url = `/_t/${subdomain}${url.pathname}${url.search}`;
    return proxy.web(req, res);
  }

  // Case 4: Custom domain - resolve via Node runtime (full Convex access)
  const slug = await resolveCustomDomain(hostname);
  if (slug) {
    req.url = `/_t/${slug}${url.pathname}${url.search}`;
    return proxy.web(req, res);
  }

  // Unknown domain - explicit 404
  res.writeHead(404);
  res.end("Not Found");
}
```

### middleware.ts (Clerk + static exclusions only)

```typescript
// middleware.ts - Clerk auth + static exclusions, NO tenancy logic
import { clerkMiddleware } from '@clerk/nextjs/server'

export default clerkMiddleware()

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

### Proxy Runtime / Deployment

**Architecture:**
- `proxy.ts` runs as the entry server (Node.js) in production
- Next.js runs behind it using `standalone` output mode OR proxy uses Next as handler
- Host header MUST be forwarded correctly for tenant resolution
- WebSocket support required for Convex realtime subscriptions

**Deployment Options:**

| Platform | Proxy Support | Notes |
|----------|---------------|-------|
| Render | ✅ Full | Recommended. Node server with custom entry point |
| Fly.io | ✅ Full | Docker-based, full control |
| VPS (o2switch) | ✅ Full | PM2 or systemd to run proxy |
| Vercel | ⚠️ Limited | Edge middleware only, no Node proxy. Would need different architecture |

**Production Setup (Render/Fly/VPS):**
```bash
# Build
npm run build          # Next.js standalone output
npm run build:worker   # Worker TypeScript compilation

# Run
node proxy.js          # Entry point, proxies to Next.js
# OR
node .next/standalone/server.js  # If proxy integrated
```

**next.config.js for standalone:**
```javascript
module.exports = {
  output: 'standalone',
};
```

## Project Structure (Required)

```
/app
  /(hub)
    layout.tsx
    page.tsx
    pricing/page.tsx
    onboarding/page.tsx
    artist/page.tsx
    studio/page.tsx
    studio/billing/page.tsx
    studio/tracks/page.tsx
    studio/services/page.tsx
    studio/domains/page.tsx
    sign-in/[[...sign-in]]/page.tsx
    sign-up/[[...sign-up]]/page.tsx
  /(_t)/[workspaceSlug]
    layout.tsx
    page.tsx
    beats/page.tsx
    beats/[id]/page.tsx
    services/page.tsx
    services/[id]/page.tsx
    contact/page.tsx
  /api
    /stripe/checkout/route.ts
    /stripe/webhook/route.ts
    /tenancy/resolve/route.ts

/src
  /platform
    /auth
    /tenancy
    /billing
    /entitlements
    /quotas
    /domains
    /jobs
    /observability
    /i18n
    /ui
  /modules
    /beats
    /services
  /components
    /ui
    /tenant
    /hub
    /audio
  /lib
  /stores
  /i18n/messages (en.json, fr.json)

/convex
  schema.ts
  http.ts
  /platform/*
  /modules/*

/worker
  index.ts (job runner)

/docs
  architecture.md
  design-system.md
  motion-spec.md
  responsive-checklist.md
  tenant-routing.md
  auth-multidomain.md
  provider-subscriptions.md
  clerk-ui-branding.md
  marketplace-stripe-connect.md
  artist-payments-stripe.md
  audio-processing.md
  i18n-and-currency.md
  decisions.md

/tasks.md
.nvmrc (contains "22")
package.json (exact versions, no ^ or ~)
package-lock.json
```

## Components and Interfaces

### Platform Core Components

#### 1. Tenancy Resolution (`/platform/tenancy`)

```typescript
interface TenancyContext {
  workspaceSlug: string | null;
  workspaceId: Id<"workspaces"> | null;
  isHub: boolean;
  hostname: string;
}

// Reserved subdomains - redirect to hub or 404
const RESERVED_SUBDOMAINS = [
  "www", "app", "api", "admin", "studio", 
  "artist", "pricing", "sign-in", "sign-up"
];

// Hostname normalization helper
function normalizeHostname(host: string): string {
  return host.split(":")[0].toLowerCase();
}
```

#### 2. Entitlements & Access Control (`/platform/entitlements`)

```typescript
interface PlanFeatures {
  maxPublishedTracks: number; // -1 for unlimited
  storageGb: number;
  customDomain: boolean;
  maxCustomDomains: number;
}

interface WorkspacePlan {
  planKey: "basic" | "pro" | null;
  status: "active" | "inactive" | "canceled";
  features: PlanFeatures;
}

// Core access control functions (server-side only)
async function getWorkspacePlan(workspaceId: Id<"workspaces">): Promise<WorkspacePlan>;
async function assertEntitlement(workspaceId: Id<"workspaces">, key: keyof PlanFeatures): Promise<void>;
async function assertQuota(workspaceId: Id<"workspaces">, metric: "tracks" | "storage" | "domains"): Promise<void>;
```

#### 3. Job Queue (`/platform/jobs`)

```typescript
type JobType = "preview_generation" | "license_pdf_generation" | "waveform_generation" | "loudness_analysis";
type JobStatus = "pending" | "processing" | "completed" | "failed";

interface Job {
  _id: Id<"jobs">;
  workspaceId: Id<"workspaces">;
  type: JobType;
  status: JobStatus;
  payload: Record<string, unknown>;
  attempts: number;
  error?: string;
  lockedAt?: number;
  lockedBy?: string;
  createdAt: number;
  updatedAt: number;
}

// License PDF Job Payload
interface LicensePdfJobPayload {
  licenseId: Id<"licenses">;
  documentId: Id<"licenseDocuments">;
  workspaceId: Id<"workspaces">;
}
```

### Business Module Components

#### 1. Beats Module (`/modules/beats`)

```typescript
type TrackStatus = "draft" | "published";
type ProcessingStatus = "idle" | "processing" | "completed" | "failed";
type PreviewPolicy = "none" | "manual";
type LicenseTier = "basic" | "premium" | "unlimited";

interface TierPricing {
  basic: number;
  premium: number;
  unlimited: number;
}

interface Track {
  _id: Id<"tracks">;
  workspaceId: Id<"workspaces">;
  title: string;
  bpm?: number;
  key?: string;
  tags: string[];
  priceUsdByTier: TierPricing;
  priceEurByTier?: TierPricing;
  status: TrackStatus;
  fullStorageId: Id<"_storage">;
  stemsStorageId?: Id<"_storage">; // For Unlimited tier
  previewStorageId?: Id<"_storage">;
  processingStatus: ProcessingStatus;
  previewDurationSec: number; // Fixed at 30
  previewPolicy: PreviewPolicy;
  processingError?: string;
  createdAt: number;
}
```

#### 2. Services Module (`/modules/services`)

```typescript
type BookingStatus = "pending" | "confirmed" | "completed" | "canceled";

interface Service {
  _id: Id<"services">;
  workspaceId: Id<"workspaces">;
  title: string;
  description: string;
  priceUSD: number;
  priceEUR?: number;
  turnaround: string;
  features: string[];
  isActive: boolean;
  createdAt: number;
}

interface Booking {
  _id: Id<"bookings">;
  workspaceId: Id<"workspaces">;
  buyerClerkUserId: string;
  serviceId: Id<"services">;
  status: BookingStatus;
  createdAt: number;
}
```

## Data Models

### Plan Features Configuration

```typescript
// src/platform/billing/plans.ts
export const PLAN_FEATURES: Record<string, PlanFeatures> = {
  basic: {
    maxPublishedTracks: 25,
    storageGb: 1,
    customDomain: false,
    maxCustomDomains: 0,
  },
  pro: {
    maxPublishedTracks: -1, // unlimited
    storageGb: 50,
    customDomain: true,
    maxCustomDomains: 2,
  },
};

export const PREVIEW_DURATION_SEC = 30;

// Pricing (configure in Clerk Dashboard with these amounts)
export const PRICING = {
  basic: {
    monthly: 9.99,   // USD
    annual: 59.99,   // USD (50% off vs 12 months)
  },
  pro: {
    monthly: 29.99,  // USD
    annual: 107.99,  // USD (70% off vs 12 months)
  },
};
```

### Stripe Connect Integration

**Direct Charges Model (MVP):**
- Artist purchases go to provider's connected Stripe account
- Platform fee = 0 for MVP
- Use `stripeAccount` parameter for Direct Charges

```typescript
async function createCheckoutSession(input: CheckoutInput): Promise<string> {
  const workspace = await getWorkspace(input.workspaceId);
  
  if (workspace.paymentsStatus !== "active" || !workspace.stripeAccountId) {
    throw new Error("Payments not configured");
  }

  const session = await stripe.checkout.sessions.create(
    {
      mode: "payment",
      line_items: [/* item details */],
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        workspaceId: input.workspaceId,
        itemType: input.itemType,
        itemId: input.itemId,
        buyerClerkUserId: input.buyerClerkUserId,
      },
    },
    {
      stripeAccount: workspace.stripeAccountId, // Direct charge
    }
  );

  return session.url!;
}
```

### Convex Schema

```typescript
// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // ============ PLATFORM TABLES ============
  
  users: defineTable({
    clerkUserId: v.string(),
    role: v.union(v.literal("producer"), v.literal("engineer"), v.literal("artist")),
    createdAt: v.number(),
  }).index("by_clerk_id", ["clerkUserId"]),

  workspaces: defineTable({
    slug: v.string(),
    name: v.string(),
    type: v.union(v.literal("producer"), v.literal("engineer")),
    ownerClerkUserId: v.string(),
    stripeAccountId: v.optional(v.string()),
    paymentsStatus: v.union(
      v.literal("unconfigured"),
      v.literal("pending"),
      v.literal("active")
    ),
    createdAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_owner", ["ownerClerkUserId"]),

  domains: defineTable({
    workspaceId: v.id("workspaces"),
    hostname: v.string(), // Stored normalized (lowercase, no port)
    status: v.union(v.literal("pending"), v.literal("verified"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_hostname", ["hostname"]),

  providerSubscriptions: defineTable({
    workspaceId: v.id("workspaces"),
    clerkUserId: v.string(),
    planKey: v.union(v.literal("basic"), v.literal("pro")),
    status: v.union(v.literal("active"), v.literal("inactive"), v.literal("canceled")),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_clerk_user", ["clerkUserId"]),

  usage: defineTable({
    workspaceId: v.id("workspaces"),
    storageUsedBytes: v.number(),
    publishedTracksCount: v.number(),
    updatedAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  auditLogs: defineTable({
    workspaceId: v.id("workspaces"),
    actorClerkUserId: v.string(),
    action: v.string(),
    entityType: v.string(),
    entityId: v.string(),
    meta: v.any(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  events: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(),
    meta: v.any(),
    createdAt: v.number(),
  }).index("by_workspace", ["workspaceId"]),

  jobs: defineTable({
    workspaceId: v.id("workspaces"),
    type: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    payload: v.any(),
    attempts: v.number(),
    error: v.optional(v.string()),
    lockedAt: v.optional(v.number()),
    lockedBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_status", ["status"])
    .index("by_status_createdAt", ["status", "createdAt"]),

  processedEvents: defineTable({
    provider: v.string(),
    eventId: v.string(),
    createdAt: v.number(),
  }).index("by_event", ["provider", "eventId"]),

  // ============ MODULE TABLES ============

  tracks: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    bpm: v.optional(v.number()),
    key: v.optional(v.string()),
    tags: v.array(v.string()),
    // License tier pricing (replaces single priceUSD)
    priceUsdByTier: v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    }),
    priceEurByTier: v.optional(v.object({
      basic: v.number(),
      premium: v.number(),
      unlimited: v.number(),
    })),
    status: v.union(v.literal("draft"), v.literal("published")),
    fullStorageId: v.id("_storage"),
    stemsStorageId: v.optional(v.id("_storage")), // For Unlimited tier
    previewStorageId: v.optional(v.id("_storage")),
    processingStatus: v.union(
      v.literal("idle"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    previewDurationSec: v.number(),
    previewPolicy: v.union(v.literal("none"), v.literal("manual")),
    processingError: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_status", ["workspaceId", "status"]),

  services: defineTable({
    workspaceId: v.id("workspaces"),
    title: v.string(),
    description: v.string(),
    priceUSD: v.number(),
    priceEUR: v.optional(v.number()),
    turnaround: v.string(),
    features: v.array(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_workspace_active", ["workspaceId", "isActive"]),

  orders: defineTable({
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    buyerEmail: v.optional(v.string()), // Stored from Stripe session for email sending
    stripeSessionId: v.string(),
    itemType: v.union(v.literal("track"), v.literal("service")),
    itemId: v.string(),
    currency: v.string(),
    amountCents: v.number(),
    licenseTier: v.optional(v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited"))), // For track orders
    status: v.union(v.literal("pending"), v.literal("completed"), v.literal("failed")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"])
    .index("by_stripe_session", ["stripeSessionId"]),

  purchaseEntitlements: defineTable({
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    trackId: v.id("tracks"),
    // License information
    licenseTier: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
    licenseTermsVersion: v.string(), // e.g. "v1.1-2026-01"
    licenseTermsSnapshot: v.any(), // Immutable snapshot of terms at purchase time
    licensePdfStorageId: v.optional(v.id("_storage")), // Generated PDF
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"])
    .index("by_buyer_track", ["buyerClerkUserId", "trackId"]),

  bookings: defineTable({
    workspaceId: v.id("workspaces"),
    buyerClerkUserId: v.string(),
    serviceId: v.id("services"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("completed"),
      v.literal("canceled")
    ),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"]),

  // ============ LICENSING TABLES ============

  licenses: defineTable({
    workspaceId: v.id("workspaces"),
    orderId: v.id("orders"),
    buyerClerkUserId: v.string(),
    buyerEmail: v.optional(v.string()),
    trackId: v.id("tracks"),
    entitlementId: v.id("purchaseEntitlements"),
    // Terms snapshot (immutable)
    termsVersion: v.string(), // "v1.1-2026-01"
    tierKey: v.union(v.literal("basic"), v.literal("premium"), v.literal("unlimited")),
    includesStems: v.boolean(),
    rightsSnapshot: v.any(), // Snapshot of tier rights at purchase
    prohibitedUsesSnapshot: v.array(v.string()),
    creditLineSnapshot: v.string(),
    // Publishing split
    publishingEnabled: v.boolean(),
    licensorWriterSharePercent: v.optional(v.number()),
    licenseeWriterSharePercent: v.optional(v.number()),
    licensorPublisherSharePercent: v.optional(v.number()),
    licenseePublisherSharePercent: v.optional(v.number()),
    // Status
    status: v.union(v.literal("pending"), v.literal("active"), v.literal("revoked")),
    createdAt: v.number(),
  })
    .index("by_workspace", ["workspaceId"])
    .index("by_buyer", ["buyerClerkUserId"])
    .index("by_entitlement", ["entitlementId"])
    .index("by_order", ["orderId"])
    .index("by_track", ["trackId"]),

  licenseDocuments: defineTable({
    workspaceId: v.id("workspaces"),
    licenseId: v.id("licenses"),
    kind: v.union(v.literal("license_pdf")),
    storageId: v.optional(v.id("_storage")),
    status: v.union(v.literal("pending"), v.literal("generated"), v.literal("failed")),
    error: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_license", ["licenseId"])
    .index("by_workspace", ["workspaceId"]),

  // ============ EMAIL EVENTS (Idempotency) ============

  emailEvents: defineTable({
    provider: v.string(), // "resend"
    dedupeKey: v.string(), // Unique business key e.g. "stripe:evt_123:artist_purchase"
    createdAt: v.number(),
  }).index("by_dedupe", ["provider", "dedupeKey"]),
});
```

### Audio Processing Pipeline

**Job Worker Architecture:**
- Runs in Node.js environment with ffmpeg binary (Render/Fly/VM)
- NOT serverless (ffmpeg requires binary + can timeout)
- Worker polls Convex jobs table for pending jobs
- Implements concurrency lock via `lockedAt`, `lockedBy`

```typescript
// worker/index.ts
async function processPreviewJob(job: Job): Promise<void> {
  const payload = job.payload as PreviewJobPayload;
  
  // 1. Download full audio from Convex storage
  const fullAudioUrl = await storage.getUrl(payload.fullStorageId);
  const audioBuffer = await fetch(fullAudioUrl).then(r => r.arrayBuffer());
  
  // 2. Write to temp file, run ffmpeg CLI
  const tempInputPath = `/tmp/${job._id}_input`;
  const tempOutputPath = `/tmp/${job._id}_output.mp3`;
  
  await fs.writeFile(tempInputPath, Buffer.from(audioBuffer));
  
  // Extract first 30s (or full if shorter)
  await execAsync(
    `ffmpeg -i ${tempInputPath} -ss 0 -t 30 -codec:a libmp3lame -q:a 2 ${tempOutputPath}`
  );
  
  const previewBuffer = await fs.readFile(tempOutputPath);
  
  // 3. Upload preview to Convex storage
  const previewStorageId = await storage.store(previewBuffer);
  
  // 4. Update track
  await updateTrack(payload.trackId, {
    previewStorageId,
    processingStatus: "completed",
  });
  
  // 5. Cleanup
  await fs.unlink(tempInputPath);
  await fs.unlink(tempOutputPath);
}
```

### License PDF Generation Pipeline

**Job Worker Handler (pdf-lib):**
- Runs in same Node.js worker as preview generation
- Uses pdf-lib for PDF generation (no browser/Playwright needed)
- Worker fetches license + track + workspace data via Convex
- Generates PDF from license terms snapshot
- Uploads PDF via Convex upload URL pattern
- Updates licenseDocuments with storageId

```typescript
// worker/handlers/licensePdf.ts
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

interface LicensePdfVars {
  licenseNumber: string;           // e.g. LIC-2026-000012
  generatedAtISO: string;
  providerDisplayName: string;
  providerLegalName?: string;
  providerEmail?: string;
  buyerName?: string;
  buyerEmail?: string;
  trackTitle: string;
  trackBpm?: number;
  trackKey?: string;
  tierName: "Basic" | "Premium" | "Unlimited";
  includesStems: boolean;
  rights: any;                     // Snapshot, rendered as table
  prohibitedUses: string[];
  creditLine: string;
  publishingEnabled: boolean;
  licensorWriterSharePercent?: number;
  licenseeWriterSharePercent?: number;
  licensorPublisherSharePercent?: number;
  licenseePublisherSharePercent?: number;
  orderId: string;
  workspaceSlug: string;
}

async function processLicensePdfJob(job: Job): Promise<void> {
  const payload = job.payload as LicensePdfJobPayload;
  
  // 1. Fetch license + track + workspace data from Convex
  const licenseData = await fetchLicenseData(payload.licenseId);
  
  // 2. Build PDF variables from license snapshot
  const vars = buildPdfVars(licenseData);
  
  // 3. Generate PDF using pdf-lib
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  
  // Render sections: Title, Parties, Beat Details, License Tier, Rights, etc.
  // ... (detailed rendering logic)
  
  const pdfBytes = await pdfDoc.save();
  
  // 4. Get upload URL from Convex
  const uploadUrl = await getConvexUploadUrl();
  
  // 5. Upload PDF
  const response = await fetch(uploadUrl, {
    method: "POST",
    headers: { "Content-Type": "application/pdf" },
    body: pdfBytes,
  });
  const { storageId } = await response.json();
  
  // 6. Update licenseDocuments with storageId
  await updateLicenseDocument(payload.documentId, {
    storageId,
    status: "generated",
    updatedAt: Date.now(),
  });
  
  // 7. Also update purchaseEntitlements.licensePdfStorageId
  await updateEntitlementPdf(licenseData.entitlementId, storageId);
}
```

**PDF Sections (A4 layout):**
1. Header (BroLab + Provider branding)
2. License Certificate (License ID, Order ID, Date)
3. Parties (Provider / Buyer)
4. Track Information (title, BPM, key)
5. License Grant (tier summary)
6. Rights & Caps (streaming, videos, live, radio, sync)
7. Stems Clause (only for Unlimited)
8. Publishing & Writer Shares (if enabled)
9. Credit Requirement
10. Prohibited Uses
11. Content ID Policy
12. Ownership Statement
13. Refund & Termination
14. Electronic Acceptance (timestamp)

### Transactional Emails (Resend)

**Architecture:**
- Emails sent from Next.js API routes (Node runtime)
- Triggered by Stripe webhook (checkout.session.completed) and Clerk billing webhooks
- Idempotency via emailEvents table (provider="resend", dedupeKey)

```typescript
// src/platform/email/resend.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
  dedupeKey: string; // e.g. "stripe:evt_123:artist_purchase"
}

async function sendTransactionalEmail(params: SendEmailParams): Promise<boolean> {
  // 1. Check idempotency
  const existing = await checkEmailEvent("resend", params.dedupeKey);
  if (existing) {
    console.log(`Email already sent for ${params.dedupeKey}, skipping`);
    return true;
  }
  
  // 2. Send email
  const { error } = await resend.emails.send({
    from: "BroLab <noreply@brolabentertainment.com>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });
  
  if (error) {
    console.error("Resend error:", error);
    return false;
  }
  
  // 3. Record email event for idempotency
  await recordEmailEvent("resend", params.dedupeKey);
  return true;
}
```

**Email Templates:**

1. **Artist Purchase Confirmation**
   - Subject: `Your Beat License (PDF) — {trackTitle}`
   - Content: Thank you, recap (track + tier), button "View in Dashboard", credit line reminder, support email
   - Link to /artist (NOT direct signed URL - they expire)

2. **Service Booking Confirmation**
   - Subject: `Booking Confirmed — {serviceTitle}`
   - Content: Booking details, status, link to /artist

3. **Provider Subscription Status**
   - Subject: `Subscription {Active|Canceled} — BroLab`
   - Content: Status change confirmation, link to /studio/billing

**Important:** Never include direct signed download URLs in emails (they expire). Always link to dashboard where time-limited URLs are generated on demand.
```

### i18n and Currency Display

```typescript
// src/platform/i18n/config.ts
export const SUPPORTED_LOCALES = ["en", "fr"] as const;
export type Locale = typeof SUPPORTED_LOCALES[number];
export const DEFAULT_LOCALE: Locale = "en";

// Currency display (NO auto conversion)
export function formatPrice(
  priceUSD: number,
  priceEUR: number | undefined,
  locale: Locale
): string {
  if (locale === "fr" && priceEUR !== undefined) {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(priceEUR);
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceUSD);
}
```

### Design System CSS

```css
/* app/globals.css */
:root {
  color-scheme: light;
  --bg: 247 250 255;
  --bg-2: 236 245 255;
  --card: 255 255 255;
  --card-alpha: 0.70;
  --border: 15 23 42;
  --border-alpha: 0.12;
  --text: 7 16 34;
  --muted: 71 85 105;
  --accent: 8 145 178;
  --accent-2: 6 182 212;
  --glow: 8 145 178;
  --glow-alpha: 0.22;
}

.dark {
  color-scheme: dark;
  --bg: 7 10 15;
  --bg-2: 10 16 32;
  --card: 255 255 255;
  --card-alpha: 0.04;
  --border: 255 255 255;
  --border-alpha: 0.10;
  --text: 234 242 255;
  --muted: 155 168 199;
  --accent: 34 211 238;
  --accent-2: 6 182 212;
  --glow: 34 211 238;
  --glow-alpha: 0.35;
}

body {
  font-family: Inter, system-ui, -apple-system, sans-serif;
  background: rgb(var(--bg));
  color: rgb(var(--text));
  transition: background-color 0.3s ease, color 0.3s ease;
}

.bg-app {
  background:
    radial-gradient(1200px 600px at 60% 20%, rgba(var(--accent), 0.16), transparent 60%),
    radial-gradient(900px 500px at 20% 80%, rgba(var(--accent), 0.08), transparent 60%),
    linear-gradient(180deg, rgb(var(--bg)), rgb(var(--bg-2)));
  min-height: 100vh;
}

.glass {
  background: rgba(var(--card), var(--card-alpha));
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  border: 1px solid rgba(var(--border), var(--border-alpha));
}

.glow {
  box-shadow:
    0 0 0 1px rgba(var(--accent), 0.20),
    0 0 30px rgba(var(--glow), var(--glow-alpha));
}

.outline-word {
  color: transparent;
  -webkit-text-stroke: 1px rgba(var(--text), 0.40);
}

.pb-safe {
  padding-bottom: env(safe-area-inset-bottom, 20px);
}
```

### Motion Specifications

```typescript
// src/platform/ui/motion.ts
import { Variants } from "framer-motion";

export const pageEnter: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export const pageTransition = {
  duration: 0.35,
  ease: "easeOut",
};

export const staggerContainer: Variants = {
  animate: {
    transition: { staggerChildren: 0.05 },
  },
};

export const heroFloat: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: "easeInOut",
    },
  },
};

// Respect prefers-reduced-motion
export function useReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}
```

### Responsive Breakpoints

All layouts must pass without horizontal scroll:
- 320px, 360px, 390px, 414px (mobile)
- 768px, 820px (tablet)
- 1024px, 1280px, 1440px (desktop)

### Tenant Layout Pattern

- Desktop: fixed left icon rail (~80px)
- Mobile: bottom nav (~64px) with `.pb-safe`
- Theme toggle top-right
- Sticky PlayerBar at bottom (zustand store + real `<audio>` element)

## UI Components Interfaces

### Design System Primitives (`/platform/ui`)

```typescript
// Glass container with backdrop blur
interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
}

// Outline typography for hero sections
interface OutlineTextProps {
  children: string;
  className?: string;
}

// Motion wrapper with page enter animation
interface PageTransitionProps {
  children: React.ReactNode;
  stagger?: boolean;
}

// Button variants
type ButtonVariant = "primary" | "secondary" | "ghost";
interface ButtonProps {
  variant?: ButtonVariant;
  size?: "sm" | "md" | "lg";
  glow?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}
```

### Tenant Layout Components (`/components/tenant`)

```typescript
// Desktop left rail navigation (~80px)
interface LeftRailProps {
  workspaceSlug: string;
  activeRoute: string;
}

// Mobile bottom navigation (~64px with safe-area)
interface MobileNavProps {
  workspaceSlug: string;
  activeRoute: string;
}

// Sticky audio player bar
interface PlayerBarProps {
  // Controlled by global audio store (zustand)
}

// Global audio player with real HTML audio element
interface EnhancedGlobalAudioPlayerProps {
  // Manages playback state across navigation
}
```

### Audio Store (zustand)

```typescript
interface AudioState {
  currentTrack: {
    id: string;
    title: string;
    previewUrl: string;
  } | null;
  isPlaying: boolean;
  progress: number;
  volume: number;
  play: (track: { id: string; title: string; previewUrl: string }) => void;
  pause: () => void;
  setProgress: (progress: number) => void;
  setVolume: (volume: number) => void;
}
```

## Observability Interfaces

```typescript
// Audit actions
type AuditAction = 
  | "track_upload" 
  | "track_publish" 
  | "service_create" 
  | "domain_connect" 
  | "preview_retry";

// Event types
type EventType = 
  | "checkout_success" 
  | "preview_generated" 
  | "payments_connected" 
  | "domain_verified";

// Audit log helper
async function logAudit(
  workspaceId: Id<"workspaces">,
  actorClerkUserId: string,
  action: AuditAction,
  entityType: string,
  entityId: string,
  meta?: Record<string, unknown>
): Promise<void>;

// Event recording helper
async function recordEvent(
  workspaceId: Id<"workspaces">,
  type: EventType,
  meta?: Record<string, unknown>
): Promise<void>;
```

## Clerk UI Branding

```typescript
// Clerk appearance configuration
const clerkAppearance = {
  baseTheme: undefined, // Use custom
  variables: {
    colorPrimary: "rgb(8 145 178)", // --accent
    colorText: "rgb(7 16 34)",       // --text
    colorBackground: "rgb(247 250 255)", // --bg
    fontFamily: "Inter, system-ui, sans-serif",
    borderRadius: "0.75rem", // rounded-xl
  },
  elements: {
    card: "glass", // Apply glass class
    formButtonPrimary: "glow", // Apply glow class
    footerActionLink: "text-cyan-500 hover:text-cyan-400",
  },
};
```

## Requirements Coverage Summary

| Requirement | Design Coverage |
|-------------|-----------------|
| 1. Multi-Tenant Architecture | ✅ Middleware routing, hostname normalization, reserved subdomains |
| 2. User Auth and Roles | ✅ Clerk integration, role in publicMetadata |
| 3. Provider Subscriptions | ✅ Clerk Billing, PLAN_FEATURES, pricing config |
| 4. Workspace Creation | ✅ Convex schema, onboarding flow |
| 5. Modular Architecture | ✅ Platform Core + Business Modules structure |
| 6. Centralized Access Control | ✅ getWorkspacePlan, assertEntitlement, assertQuota |
| 7. Quota Tracking | ✅ usage table, assertQuota |
| 8. Job Queue | ✅ jobs table, worker architecture |
| 9. Observability | ✅ auditLogs, events tables |
| 10. Track Upload | ✅ tracks table, Convex Storage |
| 11. Preview Generation | ✅ ffmpeg worker, job pipeline |
| 12. Audio Playback | ✅ PlayerBar, zustand store, HTML audio |
| 13. Stripe Connect | ✅ Direct Charges, stripeAccount param |
| 14. Webhook Processing | ✅ processedEvents idempotency |
| 15. Entitlements | ✅ purchaseEntitlements table |
| 16. Services | ✅ services, bookings tables |
| 17. Landing Page | ✅ Design system, motion specs |
| 18. Pricing Page | ✅ PRICING config, Clerk Billing link |
| 19. Studio Dashboard | ✅ Project structure, routes |
| 20. Artist Dashboard | ✅ Project structure, routes |
| 21. Tenant Storefront | ✅ Tenant routes structure |
| 22. Responsive Design | ✅ Breakpoints, layout pattern |
| 23. Design System | ✅ CSS tokens, utility classes |
| 24. Motion | ✅ framer-motion variants |
| 25. i18n | ✅ formatPrice, locale detection |
| 26. Branded Clerk UI | ✅ clerkAppearance config |
| 27. Stripe Connect Onboarding | ✅ Standard account, paymentsStatus |
| 28. Data Security | ✅ Server-side checks, workspace scoping |
| 29. License PDF Generation | ✅ pdf-lib, job worker, snapshot immutability |
| 30. Transactional Emails | ✅ Resend, idempotency, templates |

| 19. Hub Static Pages | ✅ Marketing shell, SEO foundation, long-form variants |

---

## Requirement 19: Hub Static Pages (About, Contact, Privacy, Terms)

### Overview

Pages publiques marketing séparées du landing page, avec layout cohérent et SEO optimisé.

### Routes

```
app/(hub)/(marketing)/layout.tsx     → Layout commun pages marketing
app/(hub)/(marketing)/pricing/page.tsx
app/(hub)/(marketing)/about/page.tsx
app/(hub)/(marketing)/contact/page.tsx
app/(hub)/(marketing)/privacy/page.tsx
app/(hub)/(marketing)/terms/page.tsx
```

**Avantage**: URLs restent `/pricing`, `/about`, `/contact`... mais layout "canon" sans toucher au landing.

### MarketingPageShell Component

Composant canonique réutilisable pour toutes les pages marketing:

```typescript
// src/platform/ui/dribbble/MarketingPageShell.tsx
interface MarketingPageShellProps {
  /** Hero word for OutlineStackTitle (e.g., "ABOUT", "CONTACT") */
  heroWord: string
  /** Real H1 for SEO (hidden visually but accessible) */
  seoTitle: string
  /** Short subtitle under hero */
  subtitle?: string
  /** Main content sections */
  children: ReactNode
  /** Optional CTA bar at bottom */
  ctaBar?: ReactNode
  /** Variant for long-form content (privacy/terms) */
  variant?: 'default' | 'long-form'
}
```

**Features**:
- Hero art (OutlineStackTitle avec gros mot)
- Vrai H1 SEO (sr-only mais accessible)
- Subtitle court
- Slots sections
- CTA bar en bas
- Variante "long-form" pour /privacy & /terms

### MarketingSection Component

Composant pour sections cohérentes dans les pages marketing:

```typescript
// src/platform/ui/dribbble/MarketingSection.tsx
interface MarketingSectionProps {
  /** Optional eyebrow label (e.g., "01 ABOUT US") */
  eyebrow?: string
  /** Section title */
  title?: string
  /** Section content */
  children: ReactNode
  /** Max width variant */
  maxWidth?: 'default' | 'narrow' | 'wide'
  /** Additional classes */
  className?: string
}
```

**Features**:
- Padding cohérent (py-16 md:py-24)
- Max-width options (default: max-w-6xl, narrow: max-w-3xl, wide: max-w-7xl)
- Optional eyebrow label (numbered sections style)
- Responsive spacing

### Prose Styling (Long-Form Content)

Pour /privacy et /terms, utiliser Tailwind Typography ou styles custom:

```css
/* app/globals.css - Prose styles for long-form */
.prose-marketing {
  @apply max-w-3xl mx-auto;
  @apply text-base leading-relaxed text-[rgb(var(--text))];
}

.prose-marketing h2 {
  @apply text-2xl font-bold mt-12 mb-4 text-[rgb(var(--text))];
}

.prose-marketing h3 {
  @apply text-xl font-semibold mt-8 mb-3 text-[rgb(var(--text))];
}

.prose-marketing p {
  @apply mb-4 leading-[1.75];
}

.prose-marketing ul, .prose-marketing ol {
  @apply mb-4 pl-6 space-y-2;
}

.prose-marketing a {
  @apply text-[rgb(var(--accent))] hover:underline;
}
```

### Long-Form Variant (Privacy/Terms)

Pour les pages légales:
- Table of Contents (TOC) sticky sidebar
- "Last updated: {date}" header
- Largeur max (max-w-3xl) pour lisibilité
- Typographie optimisée (line-height 1.75, prose styling)
- Contact legal email visible

```typescript
interface LongFormPageProps {
  lastUpdated: string // ISO date
  sections: Array<{
    id: string
    title: string
    content: ReactNode
  }>
  legalEmail?: string
}
```

### Page-Specific UX/Copy Guidelines

#### /pricing
**Objectif**: Convertir
- 3 plans max (Free trial, Basic, Pro)
- "Most popular" badge sur Pro
- FAQ (8–12 questions) avec JSON-LD FAQPage schema
- Trust badges: "Powered by Clerk Billing" + "One-time purchases via Stripe" (pas de claims non prouvés)
- CTA: "Start free" / "Upgrade"
- JSON-LD: SoftwareApplication + FAQPage schemas

**Trust Rule**: Pas de "Top platform / award / #1" tant que non prouvé. Utiliser des faits vérifiables: "Powered by Clerk Billing", "Stripe payments", "Licenses generated automatically".

#### /about
**Objectif**: Crédibilité + vision
- Mission en 1 phrase
- Pourquoi (problème marketplace vs brand)
- Ce que tu permets (beats + services + payouts)
- Roadmap "coming next" (optionnel)
- Pas de claims marketing non vérifiables

#### /contact
**Objectif**: Lever frictions
- Formulaire simple avec rôle (Producer/Engineer/Artist/Brand)
- Support email + délai de réponse
- Socials (optionnel)

#### /privacy + /terms
**Objectif**: Confiance + conformité
- "Last updated" visible
- TOC navigable (sticky sidebar)
- Typographie lisible (prose-marketing class, line-height 1.75)
- Contact legal email

### SEO Foundation

Chaque page marketing doit avoir:

```typescript
// app/(hub)/(marketing)/about/page.tsx
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'About | BroLab Entertainment',
  description: 'Your beats. Your brand. Your business. Learn about BroLab.',
  openGraph: {
    title: 'About | BroLab Entertainment',
    description: 'Your beats. Your brand. Your business.',
    url: 'https://brolabentertainment.com/about',
    siteName: 'BroLab Entertainment',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About | BroLab Entertainment',
    description: 'Your beats. Your brand. Your business.',
  },
  alternates: {
    canonical: 'https://brolabentertainment.com/about',
  },
}
```

#### JSON-LD Schemas

**FAQPage Schema** (for /pricing):
```typescript
// app/(hub)/(marketing)/pricing/page.tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's included in the Basic plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Basic plan includes 25 published tracks, 1GB storage, and standard features."
      }
    },
    // ... 8-12 questions total
  ]
}

// In component:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
/>
```

**SoftwareApplication Schema** (for landing page):
```typescript
// app/(hub)/page.tsx
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BroLab Entertainment",
  "applicationCategory": "BusinessApplication",
  "offers": [
    {
      "@type": "Offer",
      "name": "Basic Plan",
      "price": "9.99",
      "priceCurrency": "USD",
      "priceValidUntil": "2026-12-31"
    },
    {
      "@type": "Offer",
      "name": "Pro Plan",
      "price": "29.99",
      "priceCurrency": "USD",
      "priceValidUntil": "2026-12-31"
    }
  ]
}
```

#### Sitemap & Robots

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://brolabentertainment.com',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: 'https://brolabentertainment.com/pricing',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: 'https://brolabentertainment.com/about',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // ... other pages
  ]
}

// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/studio/', '/artist/', '/_t/'],
      },
    ],
    sitemap: 'https://brolabentertainment.com/sitemap.xml',
  }
}
```

### Loading State (Premium Polish)

Pour améliorer la perception de performance pendant la navigation entre pages marketing:

```typescript
// app/(hub)/(marketing)/loading.tsx
export default function MarketingLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="glass max-w-md w-full p-8 rounded-3xl">
        {/* Hero skeleton */}
        <div className="h-20 bg-[rgb(var(--border))] rounded-xl mb-4 animate-pulse" />
        
        {/* Content skeletons */}
        <div className="space-y-3">
          <div className="h-4 bg-[rgb(var(--border))] rounded animate-pulse" />
          <div className="h-4 bg-[rgb(var(--border))] rounded w-3/4 animate-pulse" />
        </div>
      </div>
    </div>
  )
}
```

**Benefits**:
- Premium feel during navigation
- Respects theme (dark/light via CSS tokens)
- Minimal, non-intrusive
- Improves perceived performance
  alternates: {
    canonical: 'https://brolabentertainment.com/about',
  },
}
```

### JSON-LD Structured Data

Pour améliorer le SEO et obtenir des rich results:

```typescript
// app/(hub)/(marketing)/pricing/page.tsx - FAQPage schema
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What's included in the Basic plan?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "The Basic plan includes..."
      }
    }
    // ... more questions
  ]
}

// app/(hub)/page.tsx - SoftwareApplication schema
const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "BroLab Entertainment",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "9.99",
    "priceCurrency": "USD"
  }
}

// Usage in page
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
/>
```

### Additional SEO Files

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://brolabentertainment.com', lastModified: new Date() },
    { url: 'https://brolabentertainment.com/pricing', lastModified: new Date() },
    { url: 'https://brolabentertainment.com/about', lastModified: new Date() },
    { url: 'https://brolabentertainment.com/contact', lastModified: new Date() },
    { url: 'https://brolabentertainment.com/privacy', lastModified: new Date() },
    { url: 'https://brolabentertainment.com/terms', lastModified: new Date() },
  ]
}

// app/robots.ts
import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/studio/', '/artist/', '/_t/'],
    },
    sitemap: 'https://brolabentertainment.com/sitemap.xml',
  }
}
```

### Marketing Layout Structure

```typescript
// app/(hub)/(marketing)/layout.tsx
import { ThemeProvider } from 'next-themes'

export default function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-app">
      {/* TopMinimalBar - consistent header with active states */}
      <TopMinimalBar
        brand={<span className="text-sm font-medium text-muted uppercase tracking-[0.3em]">BROLAB</span>}
        brandHref="/"
        cta={{ label: 'Get Started', href: '/sign-up' }}
        secondaryAction={{ label: 'Sign In', href: '/sign-in' }}
        // Active state: underline or subtle glow on current page
      />
      
      {/* Main content with proper spacing */}
      <main className="pt-16 pb-safe">
        {children}
      </main>
      
      {/* Footer - consistent across all marketing pages */}
      <Footer />
    </div>
  )
}
```

**Navigation Active States**:
- Active link: subtle underline or glow effect
- Focus-visible: `.focus-ring` class on all interactive elements
- Keyboard navigation: proper tab order

**Accessibility Requirements**:
- All interactive elements have `focus-visible:ring-2 ring-accent`
- Touch targets ≥ 44px on mobile
- Proper ARIA labels on navigation

---

## Design Source of Truth (CRITICAL)

> ⚠️ **NON-NÉGOCIABLE**: Le template Dribbble (vidéo `/Dribbble reference.mov`) est la **SEULE** source de référence pour:
> - Layout & composition
> - Typography (outline stack, display fonts)
> - Motion & micro-interactions
> - Navigation patterns (icon rail, bottom nav, top bar)
> - Button shapes (pills, not rectangles)
> - Spacing rhythm
> - Visual effects (glass, glow, noise, waves)

### Documentation de Référence

| Document | Rôle |
|----------|------|
| `/docs/dribbble-style-guide.md` | **SOURCE UNIQUE** - Langage visuel Dribbble complet |
| `/docs/visual-parity-check.md` | Checklist QA par page/phase |

### Rôle des Tokens CSS (Support Technique)

Les tokens CSS dans `app/globals.css` servent **UNIQUEMENT** comme support technique d'implémentation:
- Variables CSS (--bg, --accent, --glow, etc.)
- Classes utilitaires (.glass, .glow, .bg-app)
- Base Tailwind config

**Les tokens CSS NE définissent PAS la direction artistique:**
- ❌ Layout/composition → Dribbble
- ❌ Typographie display → Dribbble
- ❌ Patterns de navigation → Dribbble
- ❌ Motion design → Dribbble
- ❌ Composants UI → Dribbble

### Règle Absolue

```
Aucune page ne doit être créée en style "SaaS générique".
Utiliser EXCLUSIVEMENT les primitives Dribbble via @/platform/ui.
Référence unique: /docs/dribbble-style-guide.md
```

---

## Dribbble Design Language — Rules

### Invariants Visuels (OBLIGATOIRES)

#### 1. Layout Asymétrique
- Compositions déséquilibrées intentionnellement
- Hero: texte gauche (60%), modules/visuel droite (40%)
- Grilles variées (pas de colonnes uniformes)
- Modules latéraux (stats, listes, charts)

#### 2. TopMinimalBar
- Brand centré
- CTA pill à droite
- Navigation inline (desktop) ou hamburger (mobile)
- Glass background

#### 3. IconRail Vertical (Desktop ≥1024px)
- Fixé à gauche, 80px de large
- Icônes 24px centrées
- État actif: glow + accent background + indicator bar
- Tooltip au hover
- Caché sur mobile (remplacé par BottomNav)

#### 4. Cards "Art-Directed"
- Glass morphism (backdrop-blur)
- Gradient border au hover (mask technique)
- Hover lift (-4px)
- Densité visuelle (pas de grands espaces vides)
- Micro-shapes optionnelles

#### 5. Boutons = Pill CTA
- Forme pill (border-radius: 9999px)
- Gradient pour primary
- Hover lift (-2px) + shadow enhanced
- **PAS de boutons rectangulaires shadcn classiques**

#### 6. Sections: Entrée au Scroll
- Animation: opacity 0→1, y 30→0, blur 8px→0
- Stagger children: 0.08s delay
- viewport: { once: true, margin: '-50px' }

#### 7. Hero: Outline Stack Title
- Titre principal + 3-6 copies outline décalées derrière
- Offsets: 2px par layer
- Opacités décroissantes: 0.35, 0.25, 0.18, 0.12, 0.08, 0.05

#### 8. Background Art-Directed
- Glow blobs (accent color, blur 80-120px, 8-15% opacity)
- Noise overlay (2-4% opacity, mix-blend-mode: overlay)
- Wavy lines pattern (SVG, 3-5% opacity)
- **CSS only, pas d'images externes**

#### 9. Motion Premium
- Page enter: blur + y + opacity
- Hover: lift + glow
- Scroll reveal: stagger
- Hero float: y oscillation 6-8s
- **TOUJOURS respecter prefers-reduced-motion**

---

## Dribbble Design System Architecture

### Emplacement Unique (DÉCISION FINALE)

```
src/platform/ui/dribbble/    ← TOUTES les primitives Dribbble vivent ICI
```

**Interdiction formelle** de créer un second kit ailleurs:
- ❌ `src/components/ui-dribbble/` → À SUPPRIMER
- ❌ `src/components/ui/*` → Sauf wrappers d'assemblage stricts
- ❌ Tout autre emplacement

### Structure Complète

```
src/platform/ui/
├── dribbble/                     ← Primitives + patterns + motion (SOURCE UNIQUE)
│   ├── index.ts                  ← Exports publics
│   │
│   ├── foundations/              ← Fondations du design system
│   │   ├── tokens.md             ← Documentation tokens (optionnel)
│   │   ├── typography.ts         ← Classes utilitaires typo
│   │   ├── motion.ts             ← Variants + helpers motion
│   │   └── surfaces.ts           ← Glass/glow wrappers
│   │
│   ├── primitives/               ← Composants de base
│   │   ├── PillButton.tsx        ← Bouton pill générique
│   │   ├── PillCTA.tsx           ← CTA pill avec gradient
│   │   ├── Card.tsx              ← DribbbleCard
│   │   ├── SectionHeader.tsx     ← Header dense uppercase
│   │   ├── OutlineStackTitle.tsx ← Titre avec layers outline
│   │   ├── IconRail.tsx          ← Navigation verticale desktop
│   │   ├── TopMinimalBar.tsx     ← Header minimal
│   │   ├── WavyBackground.tsx    ← Background art-directed
│   │   ├── MicroModule.tsx       ← Cards compactes stats/listes
│   │   └── SectionEnter.tsx      ← Scroll reveal wrapper
│   │
│   ├── audio/                    ← Composants audio Dribbble
│   │   ├── PlayerPillButton.tsx  ← Play/pause pill
│   │   ├── ProgressRail.tsx      ← Barre de progression stylée
│   │   ├── VolumePill.tsx        ← Contrôle volume pill
│   │   ├── NowPlayingChip.tsx    ← Chip "Now Playing"
│   │   └── WaveformPlaceholder.tsx ← Waveform visuel (SVG/CSS)
│   │
│   └── motion.ts                 ← Motion utilities Dribbble
│
├── index.ts                      ← Point d'entrée unique (ré-exporte dribbble/*)
├── Button.tsx                    ← LEGACY → wrapper vers PillCTA
├── GlassCard.tsx                 ← LEGACY → wrapper vers DribbbleCard
├── OutlineText.tsx               ← LEGACY → wrapper vers OutlineStackTitle
├── PageTransition.tsx            ← Conservé (compatible)
└── motion.ts                     ← Conservé (base, étendu par dribbble/motion.ts)
```

### Folder Rules

| Dossier | Règle |
|---------|-------|
| `src/platform/ui/dribbble/*` | **SEUL** emplacement pour primitives visuelles de base |
| `src/components/*` | Composants d'assemblage/composition UNIQUEMENT, sans style de base propriétaire |
| `src/components/audio/PlayerBar.tsx` | Conserve la logique audio, mais UI = 100% Dribbble kit |
| `src/components/tenant/*` | Consomme `@/platform/ui` pour tout le visuel |
| `src/components/hub/*` | Consomme `@/platform/ui` pour tout le visuel |

### Règles d'Import

```typescript
// ✅ CORRECT - Import via point d'entrée unique
import { PillCTA, DribbbleCard, IconRail } from '@/platform/ui'

// ✅ CORRECT - Import motion utilities
import { dribbblePageEnter, dribbbleHoverLift } from '@/platform/ui'

// ❌ INTERDIT - Import direct depuis dribbble/
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'

// ❌ INTERDIT - Import depuis src/components/ui-dribbble (supprimé)
import { PillCTA } from '@/components/ui-dribbble'
```

---

## Surface Taxonomy (Theme-Coherent)

### CRITICAL: Chrome vs Card Surfaces

**Problem:** Using card tokens (--card, bg-card/*) for chrome surfaces (header/footer) creates light grey overlays that break theme coherence in dark mode.

**Solution:** Strict separation between Chrome and Card surfaces with dedicated primitives.

### Chrome Surfaces

**Definition:** Top-level UI chrome elements (header, footer, navigation bars)

**Component:** `ChromeSurface`

**Tokens:** ONLY background tokens
- `rgb(var(--bg))` - Base background
- `rgb(var(--bg-2))` - Secondary background
- `border-border` - Border colors

**Modes:**
- `transparent` - No background (header at top)
- `base` - Solid background (footer, always visible)
- `elevated` - Semi-transparent with blur (header on scroll)

**Usage:**
```tsx
// Header (transparent → elevated on scroll)
<ChromeSurface 
  as="header" 
  mode={isScrolled ? "elevated" : "transparent"}
  blur={isScrolled ? "sm" : "none"}
>
  Header content
</ChromeSurface>

// Footer (always base)
<ChromeSurface as="footer" mode="base" bordered>
  Footer content
</ChromeSurface>
```

### Card Surfaces

**Definition:** Content cards, modules, overlays, floating panels

**Component:** `CardSurface`

**Tokens:** ONLY card tokens
- `bg-card/80` - Glass card background
- `bg-card-alpha` - Card with alpha
- `border-border/50` - Card borders

**Usage:**
```tsx
<CardSurface as="div" padding="md" radius="xl" bordered blur="md">
  Card content
</CardSurface>
```

### Forbidden Patterns

| Pattern | Why Forbidden | Use Instead |
|---------|---------------|-------------|
| `bg-card/*` in header/footer | Creates light grey overlay in dark mode | `ChromeSurface` with bg tokens |
| `GlassSurface` for header/footer | Applies card tokens by default | `ChromeSurface` |
| `bg-white` in chrome | Hardcoded light color | `bg-[rgb(var(--bg))]` |
| `bg-slate-50` in chrome | Hardcoded light color | `bg-[rgb(var(--bg))]` |

### Guardrails

**1. Dev-time Runtime Warning:**
```tsx
// ChromeSurface checks className for violations
if (className?.includes('bg-card')) {
  console.warn('[ChromeSurface] FORBIDDEN: card tokens in chrome surface')
}
```

**2. Lint Script:**
```bash
npm run lint:chrome
```

Checks chrome surface files for:
- `bg-card` usage
- `bg-white` usage
- `bg-slate-50` usage

**3. CI Integration:**
Add to CI pipeline to prevent regressions.

### Migration Guide

**Before (broken - light grey in dark mode):**
```tsx
<header className="bg-card/80 backdrop-blur-sm">
  {/* Light grey overlay even in dark mode */}
</header>
```

**After (correct - theme-coherent):**
```tsx
<ChromeSurface 
  as="header" 
  mode="elevated" 
  blur="sm"
>
  {/* Matches theme background */}
</ChromeSurface>
```

### Component Reference

| Component | Purpose | Tokens | When to Use |
|-----------|---------|--------|-------------|
| `ChromeSurface` | Header/Footer/Nav | bg tokens | Top-level chrome |
| `CardSurface` | Cards/Modules | card tokens | Content containers |
| `GlassSurface` | Legacy | card tokens | Deprecated, use above |

---

## Motion Language (Dribbble)

### Entrée/Sortie Standard

```typescript
// Page enter - opacity + y + blur
const dribbblePageEnter = {
  initial: { opacity: 0, y: 20, filter: 'blur(8px)' },
  animate: { 
    opacity: 1, 
    y: 0, 
    filter: 'blur(0px)',
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: { opacity: 0, y: -10, filter: 'blur(4px)' }
}
```

### Hover Effects

```typescript
// Hover lift - cards, buttons
const dribbbleHoverLift = {
  whileHover: { y: -4, transition: { duration: 0.2 } }
}

// Glow pulse - attention, active states
const dribbbleGlowPulse = {
  animate: {
    boxShadow: [
      '0 0 20px rgba(var(--accent), 0.2)',
      '0 0 40px rgba(var(--accent), 0.4)',
      '0 0 20px rgba(var(--accent), 0.2)'
    ],
    transition: { duration: 2, repeat: Infinity }
  }
}
```

### Scroll Reveal Stagger

```typescript
// Container with stagger
const dribbbleStaggerContainer = {
  animate: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
}

// Child item
const dribbbleStaggerChild = {
  initial: { opacity: 0, y: 16 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' }
  }
}

// Scroll reveal viewport
const scrollRevealViewport = { once: true, margin: '-50px' }
```

### Reduced Motion Rules

```typescript
// TOUJOURS vérifier prefers-reduced-motion
const prefersReducedMotion = useReducedMotion()

// Fallback: simple opacity fade, no transforms
const dribbbleReducedMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.2 } }
}

// Usage pattern
const motionProps = prefersReducedMotion 
  ? dribbbleReducedMotion 
  : dribbblePageEnter
```

### Spring vs Smooth Transitions

```typescript
// Spring - interactive elements (buttons, toggles)
const springTransition = { type: 'spring', stiffness: 400, damping: 30 }

// Smooth - page transitions, reveals
const smoothTransition = { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }
```

---

## Deprecation Plan

### Fichiers Legacy à Migrer/Supprimer

| Fichier | Status | Action |
|---------|--------|--------|
| `src/platform/ui/Button.tsx` | LEGACY | Wrapper → PillCTA, puis supprimer |
| `src/platform/ui/GlassCard.tsx` | LEGACY | Wrapper → DribbbleCard, puis supprimer |
| `src/platform/ui/OutlineText.tsx` | LEGACY | Wrapper → OutlineStackTitle, puis supprimer |
| `src/platform/ui/PageTransition.tsx` | CONSERVÉ | Compatible, pas de remplacement |
| `src/platform/ui/motion.ts` | CONSERVÉ | Base, étendu par dribbble/motion.ts |
| `src/components/ui-dribbble/*` | SUPPRIMÉ | Migré vers src/platform/ui/dribbble/ |

### Plan de Migration (6 Phases)

| Phase | Action | Status |
|-------|--------|--------|
| 1 | Créer `src/platform/ui/dribbble/*` avec toutes primitives | ✅ DONE |
| 2 | Convertir `Button.tsx`, `GlassCard.tsx`, `OutlineText.tsx` en wrappers | ✅ DONE |
| 3 | Mettre à jour `src/platform/ui/index.ts` pour ré-exporter dribbble/* | ✅ DONE |
| 4 | Migrer tous les imports dans l'app vers `@/platform/ui` | ✅ DONE |
| 5 | Supprimer `src/components/ui-dribbble/` | ✅ DONE |
| 6 | Supprimer les wrappers legacy après migration complète | TODO |

### Interdiction de Nouveaux Usages

```typescript
// ❌ INTERDIT - Ne plus utiliser les composants legacy
import { Button } from '@/platform/ui/Button'
import { GlassCard } from '@/platform/ui/GlassCard'
import { OutlineText } from '@/platform/ui/OutlineText'

// ✅ OBLIGATOIRE - Utiliser les équivalents Dribbble
import { PillCTA, DribbbleCard, OutlineStackTitle } from '@/platform/ui'
```

---

## Docs à Maintenir

### Documents UI (Source of Truth)

1. **`/docs/dribbble-style-guide.md`**
   - Langage visuel complet
   - Layout primitives
   - Typography system
   - Visual effects
   - Motion language
   - Component patterns
   - Responsive rules

2. **`/docs/visual-parity-check.md`**
   - Checklist globale
   - Checklist par page (Hub, Studio, Tenant, Artist)
   - Anti-patterns détectés
   - Validation finale

### Mise à Jour Obligatoire

Lors de l'ajout d'un nouveau composant ou pattern:
1. Documenter dans `dribbble-style-guide.md`
2. Ajouter à la checklist dans `visual-parity-check.md`
3. Implémenter dans `src/platform/ui/dribbble/`
4. Exporter via `src/platform/ui/index.ts`

---

---

## ELECTRI-X Composition Canonique (CRITIQUE)

> ⚠️ **Cette section décrit la composition EXACTE du template Dribbble "ELECTRI-X".**
> L'app actuelle a les composants mais PAS l'assemblage correct.

### Référence Visuelle

```
Frames de référence: /docs/dribbble/frames/frame_*.png
Vidéo source: /Dribbble reference.mov
```

### Layout Hero ELECTRI-X (à reproduire)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          ELECTRI-X (label discret)              [Explore →] │
├────┬────────────────────────────────────────────────────────────────────────┤
│    │                                                                        │
│ 🏠 │                                                                        │
│    │                    ███████╗██╗  ██╗██████╗ ██╗      ██████╗ ██████╗ ███████╗  │
│ ⭐ │                    ██╔════╝╚██╗██╔╝██╔══██╗██║     ██╔═══██╗██╔══██╗██╔════╝  │
│    │                    █████╗   ╚███╔╝ ██████╔╝██║     ██║   ██║██████╔╝█████╗    │
│ 🎵 │                    ██╔══╝   ██╔██╗ ██╔═══╝ ██║     ██║   ██║██╔══██╗██╔══╝    │
│    │                    ███████╗██╔╝ ██╗██║     ███████╗╚██████╔╝██║  ██║███████╗  │
│ 💿 │                    ╚══════╝╚═╝  ╚═╝╚═╝     ╚══════╝ ╚═════╝ ╚═╝  ╚═╝╚══════╝  │
│    │                                                                        │
│    │                    [ILLUSTRATION PERSONNAGE CENTRE]                    │
│    │                                                                        │
│    │  ┌──────────────┐                              ┌─────────────────────┐ │
│    │  │ ELECTRI-X    │                              │ Best Music Platform │ │
│    │  │ Edition      │     ●                        │ 1000+ creators      │ │
│    │  └──────────────┘   (cyan orb)                 │ Top 20 product 2024 │ │
│    │                                                │ Award winning       │ │
│    │                                                └─────────────────────┘ │
│    │                                                      ~~~~ (wavy lines) │
└────┴────────────────────────────────────────────────────────────────────────┘
```

### Éléments Clés à Implémenter

#### 1. Navigation (TopMinimalBar + IconRail)
- **Top centre**: Label brand discret (pas logo, juste texte)
- **Top droite**: Gros bouton pill "Explore →" (glassy, très présent)
- **Left rail**: 4 icônes verticales (home, star, music, disc)
  - Spacing large entre icônes
  - Look "dock" minimal
  - États hover avec glow

#### 2. Hero Central
- **Titre PIXEL**: Mot géant "EXPLORE" (ou "BROLAB") en style pixel/rétro-tech
- **Outline Stack**: 3-6 répétitions décalées derrière (très visibles, pas subtiles)
- **Illustration**: Personnage/artwork au centre (placeholder SVG pour MVP)

#### 3. Décor
- **Bas gauche**: Badge pill "Edition" + gros cercle cyan
- **Droite**: Mini module "best platform..." avec bullet list
- **Droite background**: Wavy lines + dotted vertical line
- **Bas droite**: Blobs/shapes organiques

#### 4. Background Global
- Fond noir (#0a0a0a)
- Noise overlay (2-4% opacity)
- Gradients subtils
- Blobs accent color (cyan #00d4ff)

### Différences Actuelles vs Template

| Élément | Template ELECTRI-X | App Actuelle | Status |
|---------|-------------------|--------------|--------|
| Header | Label centré + pill CTA droite | ✅ BROLAB centré + Sign In + Explore → | ✅ DONE |
| IconRail | Sur Hub (gauche) | ❌ Retiré (décision: pas sur landing public) | ✅ DÉCISION |
| Hero Title | PIXEL géant centré | ✅ "EXPLORE" avec Press Start 2P + outline stack | ✅ DONE |
| Illustration | Personnage centre | ⏳ Placeholder à ajouter | TODO |
| Badge Edition | Bas gauche | ✅ EditionBadge "BROLAB Edition" | ✅ DONE |
| Cyan Orb | Bas gauche | ✅ CyanOrb component | ✅ DONE |
| Micro Module | Droite | ✅ MicroInfoModule avec stats | ✅ DONE |
| Wavy Lines | Visible droite | ✅ WavyLinesSVG visible | ✅ DONE |
| Constellation | Top droite | ✅ ConstellationDots | ✅ DONE |
| Organic Blob | Bas droite | ✅ OrganicBlob SVG | ✅ DONE |
| Theme Toggle | N/A | ✅ ☀️/🌙 en haut à gauche | ✅ DONE |
| Sections | Art-directed modules | ✅ Asymétrique 7/5 colonnes | ✅ DONE |
| Background | MUSIC répété | ✅ Pattern MUSIC avec opacity 0.025 | ✅ DONE |

### Copy Rules (ELECTRI-X Style)

- **CAPS** pour labels et micro-textes
- **Très peu de phrases longues** (pas de paragraphes marketing)
- **Bullet points courts** (Best Music Platform, 1000+ creators, etc.)
- **Pas de "Your beats. Your brand. Your business."** → trop SaaS

### Typo Pixel/Rétro-Tech

Le titre principal doit avoir un style **pixel/rétro-tech**, pas juste outline:
- Font: Space Grotesk Heavy ou custom pixel font
- Effet: Légèrement pixelisé/glitchy
- Outline stack très visible (pas opacity 0.05, plutôt 0.3-0.5)

---

## Requirements Coverage (UI Section)

| Requirement | Design Coverage |
|-------------|-----------------|
| UI Source of Truth | ✅ Dribbble video = single reference |
| Design Language Rules | ✅ 9 invariants documentés |
| Component Architecture | ✅ src/platform/ui/dribbble/* |
| Import Rules | ✅ Point d'entrée unique @/platform/ui |
| Legacy Migration | ✅ Plan 6 phases documenté |
| Documentation | ✅ dribbble-style-guide.md + visual-parity-check.md |
| ELECTRI-X Composition | ✅ Layout canonique implémenté |
| Frames Reference | ✅ 21 frames extraites dans /docs/dribbble/frames/ |

---

## État Actuel de l'Application (Janvier 2026)

### Hub Landing Page (`app/(hub)/page.tsx`)

**Status**: ✅ ELECTRI-X Visual Parity Atteinte

**Composants implémentés**:
- `OutlineStackTitle` (inline) - Titre "EXPLORE" avec 3 couches outline décalées
- `WavyLinesSVG` (inline) - 8 courbes ondulées côté droit
- `OrganicBlob` (inline) - Forme organique cyan bottom-right
- `ConstellationDots` (inline) - Étoiles connectées top-right
- `EditionBadge` - Badge "BROLAB Edition" bottom-left
- `CyanOrb` - Cercle cyan décoratif
- `MicroInfoModule` - Stats "Best Music Platform", etc.
- `PillCTA` - Boutons "Explore →", "Start as Producer", etc.
- `DribbbleCard` - Cards features avec glow et hoverLift

**Header**:
- Toggle thème (☀️/🌙) à gauche
- "BROLAB" centré
- "Sign In" + "Explore →" à droite

**Sections**:
- HeroSection - Composition ELECTRI-X complète
- MobileInfoSection - MicroInfoModule pour mobile
- CTASection - 3 PillCTA (Producer, Engineer, Artist)
- FeaturesSection - Grid asymétrique 7/5 avec DribbbleCards
- FinalCTASection - CTA final avec glow

### Composants Dribbble (`src/platform/ui/dribbble/`)

**Exportés et utilisés**:
- `EditionBadge` - ✅ Utilisé dans landing
- `CyanOrb` - ✅ Utilisé dans landing
- `MicroInfoModule` - ✅ Utilisé dans landing
- `PillCTA` - ✅ Utilisé partout
- `DribbbleCard` - ✅ Utilisé dans features
- `DribbbleSectionEnter` - ✅ Utilisé pour scroll reveal
- `DribbbleStaggerItem` - ✅ Utilisé pour stagger
- `IconRail` - ✅ Utilisé dans tenant (pas landing)

**Créés mais inline dans page.tsx**:
- `OutlineStackTitle` - Version inline avec Press Start 2P
- `WavyLinesSVG` - Version inline
- `OrganicBlob` - Version inline
- `ConstellationDots` - Version inline

### Fichiers Supprimés

- `src/components/hub/HubIconRail.tsx` - Supprimé (IconRail pas sur landing public)

### Décisions Architecturales

1. **IconRail pas sur landing page**: L'IconRail est réservé pour l'interface utilisateur connecté (tenant/studio). Le landing page est une page marketing sans navigation app.

2. **Composants inline vs exportés**: Certains composants (OutlineStackTitle, WavyLinesSVG, etc.) sont inline dans page.tsx car ils sont spécifiques au hero et légèrement différents des versions génériques exportées.

3. **Dark mode par défaut**: Le landing page force le dark mode pour respecter l'esthétique ELECTRI-X.

### Prochaines Étapes

1. [ ] Ajouter illustration/personnage au centre du hero (placeholder SVG)
2. [ ] Implémenter page /pricing avec style ELECTRI-X
3. ✅ ~~Refactorer tenant-demo pour utiliser le même langage visuel~~ - **DONE**
4. [ ] Ajouter pages Studio et Artist avec style ELECTRI-X

### Tenant Demo Page (`app/tenant-demo/page.tsx`)

**Status**: ✅ ELECTRI-X Storefront Refactored

**Composants utilisés**:
- `TenantLayout` - Layout avec IconRail (desktop) / MobileNav (mobile)
- `DribbbleCard` - Cards pour beats et services
- `DribbbleSectionEnter` - Scroll reveal animations
- `DribbbleStaggerItem` - Stagger animations pour grids
- `EditionBadge` - Badge "DEMO Studio"
- `CyanOrb` - Décoration cyan
- `MicroInfoModule` - Stats producer (50+ Beats, 1000+ Sales, etc.)
- `PillCTA` - Boutons "Browse Beats", "Book Service", etc.

**Sections implémentées**:
- Hero Section - Info producer avec stats et CTAs
- Featured Beats Section - Grid 3 colonnes avec waveform placeholders
- Services Preview Section - Grid 2 colonnes (Mixing & Mastering, Custom Production)
- CTA Section - Final call-to-action avec glow

**PlayerBar**:
- Intégré via `TenantLayout` avec props
- Track: "MIDNIGHT DRIVE - Preview"
- Contrôles: play/pause, progress, volume, mute

**Navigation**:
- Desktop: IconRail avec icônes Beats, Services, Contact
- Mobile: Bottom nav avec safe-area padding
- Workspace name: "DEMO STUDIO"



---

## MarketingPageShell — Source of Truth (Requirement 31)

### Overview

`MarketingPageShell` est le composant canonique pour tous les heroes des pages marketing. Il garantit la cohérence visuelle ELECTRI-X sur /pricing, /about, /contact, /privacy, /terms.

**RÈGLE**: Aucune page marketing ne doit définir un composant `*Hero()` local. Tous les heroes doivent passer par `MarketingPageShell`.

### Location

```
src/platform/ui/dribbble/MarketingPageShell.tsx
```

### Props

```typescript
interface MarketingPageShellProps {
  /** Hero word displayed large with OutlineStackTitle (e.g., "ABOUT", "PRICING") */
  heroWord: string
  /** SEO-friendly H1 text (rendered sr-only) */
  seoTitle: string
  /** Subtitle below hero */
  subtitle?: string
  /** Eyebrow text above hero */
  eyebrow?: string
  /** Main content */
  children: ReactNode
  /** CTA buttons in hero section */
  ctaButtons?: CTAButton[]
  /** Micro items for the info module (right side on desktop) */
  microItems?: MicroItem[]
  /** Variant: default, hero-lite (less decoration), or long-form (for privacy/terms) */
  variant?: 'default' | 'hero-lite' | 'long-form'
  /** Last updated date (for long-form variant) */
  lastUpdated?: string
  /** Table of contents items (for long-form variant) */
  tocItems?: TOCItem[]
}
```

### ELECTRI-X Features (Mandatory)

Le hero canonique DOIT inclure:

1. **OutlineStackTitle** avec police "Press Start 2P"
   ```tsx
   <OutlineStackTitle 
     style={{
       fontFamily: '"Press Start 2P", system-ui, sans-serif',
       textShadow: '0 0 40px rgba(var(--accent),0.25), 0 0 80px rgba(var(--accent),0.15)',
     }}
   >
     {heroWord}
   </OutlineStackTitle>
   ```

2. **Scanlines** (2 lignes horizontales)
   ```tsx
   <div className="absolute w-full h-[2px] bg-[rgb(var(--accent))] opacity-15" style={{ top: '40%' }} />
   <div className="absolute w-full h-[1px] bg-white opacity-8" style={{ top: '60%' }} />
   ```

3. **Background Pattern** (hero word répété)
   ```tsx
   <BackgroundWordPattern word={heroWord} rows={5} opacity={0.025} />
   ```

4. **Décorations** (variant="default" uniquement)
   - WavyLines (côté droit)
   - ConstellationDots (top-right)
   - OrganicBlob (bottom-right)
   - Dotted vertical line

### Layout Rules

**Desktop (lg:)**
- Grid asymétrique: `grid-cols-12`
- Gauche (col-span-7): hero word + subtitle + CTA
- Droite (col-span-5): micro-module dans DribbbleCard
- Alignement: `text-left`

**Mobile**
- Layout centré: `text-center`
- Micro-module masqué (affiché dans section séparée si nécessaire)

### Variants

| Variant | Décorations | Background Pattern | Micro-module |
|---------|-------------|-------------------|--------------|
| `default` | ✅ Full | ✅ 5 rows | ✅ In card |
| `hero-lite` | ❌ None | ✅ 4 rows (lighter) | ❌ Hidden |
| `long-form` | ❌ None | ✅ 4 rows (lighter) | ❌ Hidden |

### Anti-Patterns (Forbidden)

```tsx
// ❌ INTERDIT - Hero local dans une page marketing
function PricingHero() {
  return <h1 className="text-6xl font-black">PRICING</h1>
}

// ❌ INTERDIT - H1 sans OutlineStackTitle
<h1 className="text-6xl font-black text-center">ABOUT US</h1>

// ❌ INTERDIT - Manipulation manuelle du thème
document.documentElement.classList.toggle('dark')
localStorage.setItem('theme', 'dark')

// ✅ CORRECT - Utiliser MarketingPageShell
<MarketingPageShell
  heroWord="PRICING"
  seoTitle="BroLab Entertainment Pricing Plans"
  eyebrow="Simple Pricing"
  subtitle="Choose the plan that fits your needs."
>
  {/* Content sections */}
</MarketingPageShell>
```

### Theme Management

Le layout marketing DOIT utiliser `next-themes`:

```tsx
// ✅ CORRECT
import { useTheme } from 'next-themes'

const { setTheme, resolvedTheme } = useTheme()
const toggleTheme = () => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')

// ❌ INTERDIT
document.documentElement.classList.toggle('dark')
globalThis.localStorage?.setItem('theme', newIsDark ? 'dark' : 'light')
```

### Usage Example

```tsx
// app/(hub)/(marketing)/pricing/page.tsx
export default function PricingPage() {
  return (
    <MarketingPageShell
      heroWord="PRICING"
      seoTitle="BroLab Entertainment Pricing Plans"
      eyebrow="Simple Pricing"
      subtitle="Choose the plan that fits your needs. No hidden fees."
      microItems={[
        { text: 'Zero platform fees' },
        { text: 'Direct Stripe payments' },
        { text: 'Cancel anytime' },
      ]}
    >
      <PricingCardsSection />
      <FeatureComparisonSection />
      <FAQSection />
      <FinalCTASection />
    </MarketingPageShell>
  )
}
```
