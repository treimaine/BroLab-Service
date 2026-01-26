# Requirements Document

## Introduction

BroLab Entertainment is a **micro-SaaS** multi-tenant platform where music Providers (Producers/Audio Engineers) can run storefronts to sell beats and services to Artists. The platform is designed with a **modular architecture** separating Platform Core from Business Modules for maintainability and extensibility.

The platform uses Clerk for authentication and provider subscriptions (platform revenue), while artist purchases flow directly to provider Stripe accounts via Stripe Connect. All audio files are stored in Convex Storage with provider-controlled 30-second preview generation via a job-based pipeline.

## Glossary

- **Provider**: A Producer or Audio Engineer who subscribes to the platform to run a storefront
- **Artist**: A buyer who browses storefronts, listens to previews, and purchases beats/services
- **Workspace**: A provider's tenant/storefront identified by a unique slug
- **Hub**: The main domain (brolabentertainment.com) hosting landing, pricing, auth, and dashboards
- **Tenant**: A provider's storefront accessible via subdomain or custom domain
- **Track**: An audio file (beat) uploaded by a provider for sale
- **Preview**: A 30-second mp3 excerpt generated from the full track
- **Entitlement**: A record granting an artist access to download a purchased track
- **Clerk_Billing**: Clerk's billing system used for provider subscription management
- **Stripe_Connect**: Stripe's marketplace solution for routing artist payments to providers
- **Platform_Core**: The foundational layer handling auth, tenancy, billing, entitlements, quotas, domains, jobs, and observability
- **Business_Module**: A self-contained feature module (beats, services) that depends on Platform Core
- **Job**: A queued background task (e.g., preview generation) processed asynchronously
- **Plan_Feature**: A capability or limit granted by a subscription plan (custom domains, storage, max tracks)
- **Purchase_Entitlement**: A record granting an artist access to download a purchased track
- **Quota**: A usage limit enforced by the platform (tracks count, storage, custom domains)
- **Audit_Log**: A record of provider admin actions for observability
- **Event**: A lifecycle event record (checkout success, preview generated, payments connected)

## Requirements

### Requirement 1: Multi-Tenant Architecture

**User Story:** As a platform operator, I want to support multiple provider storefronts on subdomains and custom domains, so that each provider has their own branded presence.

#### Acceptance Criteria

1. WHEN a request arrives at the Hub domain (brolabentertainment.com), THE System SHALL route to hub pages (landing, pricing, auth, dashboards)
2. WHEN a request arrives at a subdomain (slug.brolabentertainment.com), THE System SHALL extract the workspace slug and rewrite to tenant routes (/_t/[workspaceSlug]/...)
3. WHEN a request arrives at a custom domain, THE System SHALL resolve the hostname via Convex domains table (verified only) and rewrite to tenant routes
4. THE System SHALL treat reserved subdomains (www, app, api, admin, studio, artist, pricing, sign-in, sign-up) as hub routes (redirect to hub OR return 404)
5. IF a custom domain cannot be resolved or is not verified, THEN THE System SHALL return a 404 response
6. THE Tenancy resolution SHALL be implemented via Next.js routing and Convex queries (NOT via a separate proxy.ts Node server for MVP)

#### Implementation Notes

- **Clerk Edge File**: For Next.js ≥16, the Clerk middleware file MUST be named `src/proxy.ts` (NOT `middleware.ts`)
- **Clerk Edge File Location**: Since the project uses `/src` directory, the file MUST be located at `src/proxy.ts`
- **Clerk Edge File Purpose**: Handles ONLY authentication and route protection (NOT tenancy resolution)
- **Tenancy Resolution**: Handled via Next.js Server Components using `headers()` to read hostname + Convex queries to resolve workspace

### Requirement 2: User Authentication and Roles

**User Story:** As a user, I want to authenticate and be assigned a role, so that I can access appropriate features based on my role.

#### Acceptance Criteria

1. THE Auth_System SHALL store user roles (producer, engineer, artist) in Clerk unsafeMetadata.role
2. WHEN a user signs in without a role, THE Auth_System SHALL redirect to /onboarding
3. WHEN a provider signs in, THE Auth_System SHALL grant access to /studio/* dashboard
4. WHEN an artist signs in, THE Auth_System SHALL grant access to /artist/* dashboard
5. THE Auth_System SHALL work across hub domain and all tenant subdomains (*.brolabentertainment.com)
6. IF authentication on a custom domain fails due to cookie restrictions, THEN THE Auth_System SHALL use a documented auth-bridge redirect flow
7. THE Artist accounts SHALL be global and usable across hub and any tenant domain

#### Implementation Notes

- **Clerk Provider**: `<ClerkProvider>` MUST wrap the entire app in `app/layout.tsx`
- **Clerk Middleware**: `src/proxy.ts` MUST use `clerkMiddleware()` (NOT deprecated `authMiddleware()`)
- **Convex Integration**: Frontend MUST use `ConvexProviderWithClerk` with `useAuth` from Clerk
- **Auth State Components**: Use Convex components (`<Authenticated>`, `<Unauthenticated>`, `<AuthLoading>`) NOT Clerk components (`<SignedIn>`, `<SignedOut>`)
- **Role Storage**: Roles stored in `user.unsafeMetadata.role` AND synced to Convex `users` table

### Requirement 3: Provider Subscription Management

**User Story:** As a provider, I want to subscribe to a plan via Clerk Billing, so that I can run my storefront and access platform features.

#### Acceptance Criteria

1. THE Subscription_System SHALL offer BASIC and PRO plans via Clerk Billing (USD currency)
2. WHEN a provider subscribes to BASIC, THE Subscription_System SHALL enforce limits: max 25 published tracks, 1GB storage, 0 custom domains
3. WHEN a provider subscribes to PRO, THE Subscription_System SHALL allow: unlimited tracks (-1 convention), 50GB storage, 2 custom domains
4. WHILE a provider subscription is inactive, THE Subscription_System SHALL block provider admin actions in UI
5. WHILE a provider subscription is inactive, THE Tenant_Storefront SHALL remain publicly accessible to artists
6. THE Subscription_System SHALL display subscription status and management UI in /studio/billing
7. WHILE subscription is inactive, THE Provider_Mutations SHALL be rejected server-side (upload, publish, service create, domain connect, preview generation, retry) even if UI is bypassed
8. THE Subscription status SHALL be stored/synced to Convex providerSubscriptions table
9. WHEN pricing is displayed, THEN BASIC annual price SHALL be 50% lower than (monthly * 12), allowing rounding to end with .99 within ±$0.10
10. WHEN pricing is displayed, THEN PRO annual price SHALL be 70% lower than (monthly * 12), allowing rounding to end with .99 within ±$0.10

### Requirement 4: Workspace and Storefront Creation

**User Story:** As a provider, I want to create a workspace during onboarding, so that I have a storefront to sell my beats and services.

#### Acceptance Criteria

1. WHEN a provider completes onboarding, THE Onboarding_System SHALL create a workspace with a unique slug
2. THE Workspace SHALL store: slug, name, type (producer/engineer), ownerClerkUserId, stripeAccountId (optional), paymentsStatus (unconfigured/pending/active), createdAt
3. WHEN a workspace is created, THE System SHALL generate a subdomain (slug.brolabentertainment.com)
4. WHERE a provider has PRO subscription, THE System SHALL allow connecting up to 2 custom domains

### Requirement 5: Micro-SaaS Modular Architecture

**User Story:** As a platform operator, I want a modular architecture separating core platform concerns from business modules, so that the codebase is maintainable and extensible.

#### Acceptance Criteria

1. THE Codebase SHALL separate Platform_Core from Business_Modules
2. THE Platform_Core SHALL include: auth/roles, tenancy, billing/plan features, entitlements, quotas, domains, jobs, observability, i18n, design primitives (ui)
3. THE Business_Modules SHALL include: beats module (tracks, preview, purchase) and services module (catalog, purchase/booking)
4. THE Architecture SHALL be documented in docs/architecture.md with a module diagram

#### Cross-Runtime Import Rules (CRITICAL)

1. **Convex MUST NOT import from src/**: Convex runs in a separate runtime and cannot access frontend code
2. **Frontend MUST NOT import Convex files directly**: Frontend should consume Convex via queries/mutations/actions only
3. **Plans/Entitlements Source of Truth**: `convex/platform/billing/plans.ts` is the CANONICAL source
4. **Frontend Pricing Display**: Frontend MUST use `convex/platform/billing/getPlansPublic.ts` query (NOT direct import)
5. **Duplicate Files**: `src/platform/billing/plans.ts` MUST be removed or converted to a thin API consumer wrapper

#### Forbidden Patterns

❌ `import { PLAN_FEATURES } from "../../src/platform/billing/plans"` in Convex files
❌ `import { createWorkspace } from "../../../convex/platform/workspaces"` in frontend files
❌ Maintaining duplicate plan definitions in both `src/` and `convex/`
❌ Frontend components directly importing Convex constants instead of using queries

### Requirement 6: Centralized Access Control

**User Story:** As a platform operator, I want centralized access control helpers, so that authorization logic is consistent and not scattered across the codebase.

#### Acceptance Criteria

1. THE Platform_Core SHALL implement getWorkspacePlan(workspaceId) returning entitlements snapshot
2. THE Platform_Core SHALL implement assertEntitlement(workspaceId, key) for feature gating
3. THE Platform_Core SHALL implement assertQuota(workspaceId, metric) for usage limits
4. ALL provider mutations and actions SHALL call these checks server-side
5. THE System SHALL never trust client-side state for authorization decisions

### Requirement 7: Quota and Usage Tracking

**User Story:** As a platform operator, I want to track and enforce usage quotas, so that providers stay within their plan limits.

#### Acceptance Criteria

1. THE Usage_System SHALL track: storageUsedBytes, publishedTracksCount per workspace
2. WHEN a provider attempts to publish a track, THE System SHALL check assertQuota for max_published_tracks
3. WHEN a provider attempts to upload, THE System SHALL check assertQuota for storage_gb
4. WHEN a provider attempts to connect a domain, THE System SHALL check assertQuota for max_custom_domains
5. IF a quota is exceeded, THEN THE System SHALL reject the action with a clear error message

### Requirement 8: Job-Based Background Processing

**User Story:** As a platform operator, I want a generic job queue for background tasks, so that heavy operations don't block user requests and the system is extensible.

#### Acceptance Criteria

1. THE Job_System SHALL store jobs with: workspaceId, type, status, payload, attempts, error, createdAt, updatedAt, lockedAt, lockedBy
2. THE Job_System SHALL support statuses: pending, processing, completed, failed
3. WHEN a job is enqueued, THE System SHALL create a job record with status "pending"
4. THE Job_Worker SHALL process pending jobs and update status accordingly
5. IF a job fails, THEN THE System SHALL record the error, increment attempts, and allow retry
6. THE Job_System SHALL be extensible for future job types (waveforms, loudness analysis)

### Requirement 9: Observability (Audit Logs and Events)

**User Story:** As a platform operator, I want minimal observability, so that I can understand system behavior and debug issues.

#### Acceptance Criteria

1. THE Audit_System SHALL log provider admin actions: publish, upload, domain connect, service create, preview retry
2. THE Audit_Log SHALL store: workspaceId, actorClerkUserId, action, entityType, entityId, meta, createdAt
3. THE Event_System SHALL record lifecycle events: checkout success, preview generated, domain verified, payments connected
4. THE Event SHALL store: workspaceId, type, meta, createdAt

### Requirement 10: Track Upload and Management

**User Story:** As a provider, I want to upload beats and manage their visibility, so that artists can discover and purchase my music.

#### Acceptance Criteria

1. WHEN a provider uploads a track, THE Upload_System SHALL accept wav or mp3 formats and store the full audio file in Convex Storage
2. WHEN uploading, THE Provider SHALL choose whether to generate a 30-second preview (default: ON via "Generate preview now" option)
3. IF preview generation is selected (ON), THEN THE System SHALL enqueue a preview job
4. IF preview generation is not selected (OFF), THEN no preview until provider triggers "Generate preview" later
5. THE Track SHALL store: title, bpm, key, tags, status (draft/published), fullStorageId, previewStorageId, processingStatus, previewPolicy, previewDurationSec=30, processingError, createdAt
6. WHILE processingStatus is "processing", THE UI SHALL display a processing indicator
7. IF processingStatus is "failed", THEN THE UI SHALL display an error and retry option
8. WHEN a track is published, THE Track SHALL appear on the tenant storefront
9. WHEN publishing, THE System SHALL call assertQuota for max_published_tracks

### Requirement 11: Audio Preview Generation (Job-Based)

**User Story:** As a provider, I want the system to generate 30-second previews from my full tracks, so that artists can sample my music before purchasing.

#### Acceptance Criteria

1. WHEN preview generation is requested, THE System SHALL enqueue a job of type "preview_generation"
2. THE Preview_Job SHALL extract a 30-second mp3 from the full audio using ffmpeg (or full length if track shorter than 30s)
3. WHEN the job completes, THE System SHALL store the preview in Convex Storage and update the track
4. IF the job fails, THEN THE System SHALL update processingStatus to "failed" and record the error
5. THE Provider SHALL be able to retry failed preview jobs
6. THE Provider SHALL be able to generate previews for tracks uploaded without preview
7. THE Preview generation SHALL use ffmpeg in a Node worker (not serverless)

### Requirement 12: Audio Preview Playback

**User Story:** As an artist, I want to listen to 30-second previews of beats, so that I can evaluate them before purchasing.

#### Acceptance Criteria

1. THE Player_Bar SHALL be sticky at the bottom of tenant pages
2. WHEN an artist clicks play on a track, THE Audio_Player SHALL stream the preview audio via real HTML audio element
3. THE Audio_Player SHALL display: track title, progress bar, play/pause, volume controls
4. WHEN navigating between pages, THE Audio_Player SHALL maintain playback state via global audio store
5. IF no preview exists for a track, THEN THE UI SHALL display "No preview available"

### Requirement 13: Artist Purchases via Stripe Connect

**User Story:** As an artist, I want to purchase beats directly from providers, so that I can download and use them.

#### Acceptance Criteria

1. THE Checkout_System SHALL create Stripe Checkout Sessions as Direct Charges on the provider's connected Stripe account (using stripeAccount parameter)
2. WHEN an artist completes checkout, THE Payment SHALL go directly to the provider's Stripe account
3. THE Checkout_Session SHALL include metadata: workspaceId, itemType, itemId, buyerClerkUserId
4. WHEN checkout succeeds, THE System SHALL create an Order record
5. WHEN a track is purchased, THE System SHALL create a Purchase_Entitlement record for the buyer
6. WHEN a service is purchased, THE System SHALL create a Booking record for the buyer
7. THE System SHALL support application_fee_amount defaulting to 0 for MVP (platform fee = 0)
8. IF provider not connected (no stripeAccountId or paymentsStatus not active), THEN show "Payments not configured" and disable buy button

### Requirement 14: Stripe Webhook Processing

**User Story:** As a platform operator, I want to process Stripe webhooks reliably, so that purchases are recorded accurately without duplicates.

#### Acceptance Criteria

1. THE Webhook_Handler SHALL verify Stripe webhook signatures
2. THE Webhook_Handler SHALL check processedEvents table before processing any event (keyed by provider="stripe_connect", eventId, and include connected account id in meta)
3. IF an event ID exists in processedEvents, THEN THE Webhook_Handler SHALL skip processing and return 200
4. WHEN processing a new event, THE Webhook_Handler SHALL record the event ID in processedEvents
5. THE Webhook_Handler SHALL handle checkout.session.completed events to create orders and entitlements/bookings
6. THE Webhook_Handler SHALL record an event in the events table on successful purchase

### Requirement 15: Entitlement and Download Access

**User Story:** As an artist who purchased a track, I want to download the full audio file, so that I can use it in my projects.

#### Acceptance Criteria

1. WHEN an artist has a Purchase_Entitlement for a track, THE System SHALL allow access to the full audio file
2. THE Download_System SHALL provide time-limited download URLs (signed or equivalent) for entitled users
3. IF an artist does not have a Purchase_Entitlement, THEN THE System SHALL deny access to the full audio file
4. THE Artist_Dashboard SHALL display all purchased tracks with download links

### Requirement 16: Service Listings and Booking

**User Story:** As a provider, I want to list my services (mixing, mastering, etc.), so that artists can book them.

#### Acceptance Criteria

1. THE Provider SHALL create services with: title, description, priceUSD, priceEUR (optional), turnaround, features, isActive
2. WHEN a service is active, THE Service SHALL appear on the tenant storefront
3. WHEN an artist purchases a service, THE System SHALL create a Booking record
4. THE Booking SHALL track: workspaceId, buyerClerkUserId, serviceId, status (pending/confirmed/completed/canceled), createdAt

### Requirement 17: Hub Landing Page

**User Story:** As a visitor, I want to see a compelling landing page with clear value proposition, so that I understand what the platform offers and can make an informed decision.

#### Acceptance Criteria

1. THE Landing_Page SHALL display a cinematic hero section with outline typography (text-[clamp(48px,12vw,140px)] heavy weight)
2. THE Hero_Section SHALL include an eyebrow label ("FOR PRODUCERS & AUDIO ENGINEERS")
3. THE Hero_Section SHALL display a clear value proposition ("Sell beats. Book sessions. Get paid directly.")
4. THE Hero_Section SHALL include dual CTAs (primary: "Get Started Free", secondary: "View Demo")
5. THE Hero_Section SHALL display trust microcopy ("No credit card • Cancel anytime")
6. THE Landing_Page SHALL include a trust row with 5 trust signals immediately after the hero
7. THE Landing_Page SHALL include CTAs: "Start as Producer", "Start as Engineer", "I'm an Artist" with explanatory microcopy
8. THE Landing_Page SHALL include a "How It Works" section with 3 clear steps
9. THE Landing_Page SHALL include a FAQ section with 6 common questions before the final CTA
10. THE Landing_Page SHALL apply glass morphism and cyan glow design tokens
11. THE Landing_Page SHALL use framer-motion animations respecting prefers-reduced-motion
12. THE Landing_Page MAY include a product preview section with screenshot or demo link (optional for MVP)

### Requirement 18: Pricing Page

**User Story:** As a potential provider, I want to see pricing plans, so that I can choose the right subscription.

#### Acceptance Criteria

1. THE Pricing_Page SHALL display BASIC and PRO plans with feature comparison
2. THE Pricing_Page SHALL show prices in USD
3. THE Pricing_Page SHALL link to Clerk Billing checkout/portal
4. WHEN a visitor clicks subscribe, THE System SHALL redirect to Clerk Billing checkout

### Requirement 19: Provider Dashboard (Studio)

**User Story:** As a provider, I want a dashboard to manage my storefront, so that I can upload tracks, create services, and view analytics.

#### Acceptance Criteria

1. THE Studio_Dashboard SHALL display subscription status and management link (/studio/billing)
2. THE Studio_Dashboard SHALL provide track upload and management UI (/studio/tracks) with preview status and generate preview actions
3. THE Studio_Dashboard SHALL provide service creation and management UI (/studio/services)
4. THE Studio_Dashboard SHALL provide domain connection UI (/studio/domains) (PRO only, gated by assertEntitlement)
5. WHILE subscription is inactive, THE Studio_Dashboard SHALL display limited functionality with upgrade prompt
6. THE Studio_Dashboard SHALL display current usage vs quota limits

### Requirement 20: Artist Dashboard

**User Story:** As an artist, I want a dashboard to view my purchases and bookings, so that I can access my content and track orders.

#### Acceptance Criteria

1. THE Artist_Dashboard SHALL display all purchased tracks with download links
2. THE Artist_Dashboard SHALL display all service bookings with status
3. THE Artist_Dashboard SHALL display order history

### Requirement 21: Tenant Storefront Pages

**User Story:** As an artist, I want to browse a provider's storefront, so that I can discover and purchase their beats and services.

#### Acceptance Criteria

1. THE Storefront_Home (/) SHALL display: hero section, latest drops, featured services, sticky player
2. THE Beats_List_Page (/beats) SHALL display all published tracks with preview play buttons
3. THE Beat_Detail_Page (/beats/[id]) SHALL display: track info, preview player, purchase button
4. THE Services_List_Page (/services) SHALL display all active services
5. THE Service_Detail_Page (/services/[id]) SHALL display: service info, features, purchase/book button
6. THE Contact_Page (/contact) SHALL display provider contact information or simple form

### Requirement 22: Responsive Design

**User Story:** As a user on any device, I want the interface to be fully responsive, so that I can use the platform comfortably.

#### Acceptance Criteria

1. THE Layout SHALL pass all breakpoints: 320, 360, 390, 414, 768, 820, 1024, 1280, 1440px
2. THE Layout SHALL have no horizontal scroll at any breakpoint
3. THE Touch_Targets SHALL be at least 44px
4. ON desktop, THE Tenant_Layout SHALL display a fixed left icon rail (~80px)
5. ON mobile, THE Tenant_Layout SHALL display a fixed bottom nav (~64px) with safe-area padding
6. THE Player_Bar and Bottom_Nav SHALL never overlap page content

### Requirement 23: Design System Implementation

**User Story:** As a user, I want a consistent cinematic visual experience, so that the platform feels premium and professional.

#### Acceptance Criteria

1. THE Design_System SHALL implement light and dark color schemes with CSS custom properties (:root and .dark)
2. THE Design_System SHALL implement tokens: bg, bg-2, card, card-alpha, border, border-alpha, text, muted, accent, accent-2, glow, glow-alpha
3. THE Design_System SHALL implement glass morphism utility class (.glass)
4. THE Design_System SHALL implement glow effect utility class (.glow)
5. THE Design_System SHALL implement outline text utility class (.outline-word)
6. THE Design_System SHALL implement radial gradient background (.bg-app)
7. THE Design_System SHALL implement safe-area padding (.pb-safe)
8. THE Typography SHALL use Inter font family with 8px spacing grid
9. THE Signature outline hero word SHALL use text-[clamp(48px,12vw,140px)] heavy weight

### Requirement 24: Motion and Animation

**User Story:** As a user, I want subtle animations, so that the interface feels polished and responsive.

#### Acceptance Criteria

1. THE Page_Transitions (pageEnter) SHALL animate: opacity 0→1, y 12→0, duration 0.35s easeOut
2. THE Stagger_Animation SHALL delay children by 0.05s
3. THE Hero_Float_Animation (heroFloat) SHALL animate y between -10 and 10 over 6-10s infinitely
4. WHEN prefers-reduced-motion is set, THE Animations SHALL be disabled or minimized

### Requirement 25: Internationalization (EN/FR)

**User Story:** As a user, I want the interface in my language, so that I can understand and use the platform easily.

#### Acceptance Criteria

1. THE i18n_System SHALL default to English (EN)
2. WHEN Accept-Language header indicates French (or navigator fallback), THE i18n_System SHALL display French (FR)
3. THE i18n_System SHALL load strings from /src/i18n/messages (en.json and fr.json)
4. THE Currency_Display SHALL show USD as base currency
5. WHERE priceEUR exists AND locale is FR, THE Currency_Display SHALL show EUR price
6. THE Currency_Display SHALL NOT perform automatic currency conversion

### Requirement 26: Branded Clerk UI

**User Story:** As a user, I want authentication screens that match the platform design, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Clerk_SignIn_Component SHALL use glass container styling
2. THE Clerk_SignUp_Component SHALL use cyan accent colors
3. THE Clerk_Components SHALL use Inter font and rounded corners (2xl/3xl)
4. THE Clerk_Billing_Component SHALL match the platform design system
5. THE Clerk_Components SHALL display focus-visible rings on interactive elements
6. ALL Clerk UI must be branded to match the design system (no default look)

### Requirement 27: Stripe Connect Onboarding

**User Story:** As a provider, I want to connect my Stripe account, so that I can receive payments from artists.

#### Acceptance Criteria

1. WHEN a provider creates a workspace, THE System SHALL prompt Stripe Connect onboarding as part of onboarding flow
2. THE Stripe_Connect_Onboarding SHALL use Standard account type
3. WHEN onboarding completes, THE System SHALL store stripeAccountId on the workspace and set paymentsStatus to "active"
4. IF stripeAccountId is missing or paymentsStatus is not "active", THEN THE Checkout_System SHALL display "Payments not configured" message and disable buy button
5. THE System SHALL record a payments_connected event in the events table

### Requirement 28: Data Security and Access Control

**User Story:** As a platform operator, I want proper access controls, so that data is protected and users can only access authorized content.

#### Acceptance Criteria

1. THE Tenant_Queries SHALL only return published tracks and active services to public users
2. THE Full_Audio_Access SHALL require a valid entitlement record
3. THE Provider_Mutations SHALL verify role and workspace ownership server-side using Platform_Core helpers
4. THE System SHALL never trust client-side state for authorization decisions
5. EVERY business record SHALL be scoped to workspaceId; THE System SHALL never mix tenants

### Requirement 29: Beat Licensing (Fixed Tiers) + License PDF

**User Story:** As an artist, I want to purchase a specific license tier (Basic/Premium/Unlimited) and receive a PDF license, so that I have proof of the rights granted.

#### Acceptance Criteria

1. THE System SHALL support 3 fixed license tiers: basic, premium, unlimited
2. WHEN an artist purchases a track, THE Checkout SHALL include licenseTier in metadata (alongside workspaceId, itemType, itemId, buyerClerkUserId)
3. WHEN checkout succeeds, THE System SHALL create a Purchase_Entitlement containing: trackId, buyerClerkUserId, licenseTier, licenseTermsSnapshot, licenseTermsVersion
4. THE license terms snapshot SHALL be immutable (stored at purchase time) and used as source for the PDF
5. THE System SHALL enqueue a job license_pdf_generation after entitlement creation
6. WHEN the license PDF job completes, THE System SHALL store the PDF in Convex Storage and update entitlement with licensePdfStorageId
7. THE Artist Dashboard SHALL allow the user to download/view the license PDF (if generated) and download the entitled audio
8. THE entitlement check SHALL verify both buyerClerkUserId and trackId (and enforce tier correctness if needed)
9. THE tracks table SHALL store prices per license tier (priceUsdByTier) instead of a single price
10. THE Unlimited tier SHALL include stems access; Basic and Premium SHALL NOT include stems

### Requirement 30: Transactional Emails (Resend)

**User Story:** As a user, I want to receive transactional emails (purchase, subscription...), so that I have confirmation and can find my access.

#### Acceptance Criteria

1. THE System SHALL use Resend for transactional emails
2. WHEN a track purchase is completed, THE System SHALL send an email to the artist containing: purchase confirmation (track + licenseTier), link to Artist Dashboard (download + license PDF)
3. WHEN a service is purchased, THE System SHALL send an email confirming booking creation + link to Artist Dashboard
4. WHEN a provider subscription becomes active/canceled, THE System SHALL send an email to the provider confirming the status change + link to /studio/billing
5. Email sending SHALL be idempotent: the same event must not send duplicates (tracked server-side via emailEvents table or processedEvents)
6. Emails SHALL be sent server-side only (never from client)
7. THE System SHALL NOT include direct signed download URLs in emails (they expire); instead link to dashboard where time-limited URLs are generated on demand

### Requirement 31: Marketing Visual Consistency (Non-Negotiable)

**User Story:** As a visitor, I want all marketing pages to have a consistent premium visual identity, so that the platform feels cohesive and professional.

#### Acceptance Criteria

1. ALL Hub marketing pages (/pricing, /about, /contact, /privacy, /terms) SHALL use the same hero system as the landing page (ELECTRI-X design language)
2. THE Marketing_Hero SHALL use MarketingPageShell component with canonical ELECTRI-X styling
3. THE Marketing_Hero SHALL include:
   - OutlineStackTitle with "Press Start 2P" pixel font
   - Cyan glow text shadow (textShadow: '0 0 40px rgba(var(--accent),0.25)')
   - Scanlines (2 horizontal lines at 40% and 60% opacity)
   - Background pattern with hero word repeated (like "MUSIC" on home)
4. THE Marketing_Layout SHALL use asymmetric grid on desktop:
   - Left: hero word + subtitle + CTA (text-left)
   - Right: micro-module facts in DribbbleCard
5. THE Marketing_Layout SHALL use centered layout on mobile
6. NO marketing page SHALL define a local *Hero() component - all heroes MUST come through MarketingPageShell
7. THE long-form content pages (/privacy, /terms) MAY use variant="long-form" with reduced decoration intensity
8. THE Marketing_Layout SHALL use next-themes for theme management (no manual localStorage/classList manipulation)

#### Anti-Patterns (Forbidden)

- ❌ `function PricingHero()` or any local hero component in marketing pages
- ❌ `<h1 className="text-6xl font-black">PRICING</h1>` without OutlineStackTitle
- ❌ Generic SaaS hero (centered block, no pixel/outline/glow/dribbble motifs)
- ❌ Manual theme toggle with `document.documentElement.classList.toggle('dark')`
- ❌ Unverifiable claims ("Top platform", "Best in class") without data source
- ❌ Typos in platform info (e.g., "subscriptioins" instead of "subscriptions")

### Requirement 32: Landing Page Conversion Optimization

**User Story:** As a visitor, I want clear information about the platform's value and how it works, so that I can make an informed decision to sign up.

#### Acceptance Criteria

1. THE Hero_Section SHALL display business value above-the-fold (eyebrow + value prop + CTAs + microcopy)
2. THE Landing_Page SHALL include trust signals immediately after the hero (trust row with 5 chips)
3. THE Landing_Page SHALL explain the process in 3 simple steps ("How It Works" section)
4. THE Role_CTAs SHALL include explanatory microcopy for each role (Producer, Engineer, Artist)
5. THE Landing_Page SHALL answer common objections via FAQ section (6 questions minimum)
6. THE Landing_Page MAY include a product preview section (screenshot + demo link) for better understanding
7. ALL new sections SHALL use Dribbble primitives (DribbbleCard, PillCTA, SectionHeader, etc.)
8. ALL new sections SHALL respect the ELECTRI-X design language
9. ALL new sections SHALL be responsive (375px, 768px, 1024px, 1440px)
10. ALL new sections SHALL respect prefers-reduced-motion

#### Implementation Priority

**Priority 1 (Critical - Impact Conversion):**
1. Fix typo "subscriptioins" → "subscriptions"
2. Add hero copy block (eyebrow + value prop + dual CTAs + microcopy)
3. Add trust row (5 chips)

**Priority 2 (Important - Clarity & Conversion):**
4. Add "How It Works" section (3 steps)
5. Add microcopy under role CTAs
6. Add FAQ section (6 questions)

**Priority 3 (Nice-to-Have):**
7. Add product preview section (screenshot + demo link)


### Requirement 33: Theme-Coherent Chrome Surfaces (Non-Negotiable)

**User Story:** As a user, I want header and footer to always match the current theme (light/dark), so that the interface feels cohesive and professional without visual inconsistencies.

#### Acceptance Criteria

1. THE Header and Footer SHALL ALWAYS be coherent with the current theme (light/dark)
2. THE Header and Footer SHALL NEVER use card tokens (--card, bg-card/*) which create light grey overlays
3. THE Header SHALL be transparent at top (unscrolled) AND theme-coherent tinted glass on scroll using BACKGROUND tokens only
4. THE Footer SHALL have theme-coherent background at all times using BACKGROUND tokens only
5. THE System SHALL provide ChromeSurface primitive for chrome elements (header/footer/nav bars)
6. THE System SHALL provide CardSurface primitive for card elements (cards/modules/overlays)
7. THE ChromeSurface SHALL use ONLY bg tokens (rgb(var(--bg)), rgb(var(--bg-2)))
8. THE CardSurface SHALL use ONLY card tokens (bg-card/*, bg-card-alpha)
9. THE System SHALL prevent bg-card/* usage in header/footer via dev-time warnings
10. THE System SHALL enforce chrome surface rules via lint script (npm run lint:chrome)

#### Surface Taxonomy

**Chrome Surfaces (use ChromeSurface):**
- Header / Top bars
- Footer
- Navigation bars
- App chrome elements

**Card Surfaces (use CardSurface):**
- Cards
- Modules
- Overlays
- Floating panels

#### Forbidden Patterns

❌ Using bg-card/* in header/footer components
❌ Using GlassSurface default for header/footer (applies card tokens)
❌ Hardcoded light greys (bg-white, bg-slate-50) in chrome surfaces
❌ Manual theme toggle with document.documentElement.classList

#### Implementation

1. ChromeSurface component with modes: transparent, base, elevated
2. CardSurface component for card-style elements
3. Dev-time runtime warning in ChromeSurface for forbidden patterns
4. Lint script (lint:chrome) to catch violations in CI
5. Updated documentation in requirements.md and design.md

#### Verification

1. Visual checks: Header transparent at top, tinted on scroll (both themes)
2. Visual checks: Footer theme-coherent background (both themes)
3. Lint checks: npm run lint:chrome passes
4. Build: TypeScript compilation passes
5. No bg-card usage in chrome components


---

## Changelog

### 2026-01-26 - Architecture Clarifications

**Changes:**
1. **Req 1**: Clarified Clerk Edge file naming (`src/proxy.ts` for Next.js ≥16) and location (in `/src` directory)
2. **Req 1**: Removed reference to separate Node proxy server - tenancy handled via Next.js + Convex queries
3. **Req 2**: Corrected role storage location (`unsafeMetadata.role` not `publicMetadata.role`)
4. **Req 2**: Added implementation notes for Clerk/Convex integration patterns
5. **Req 5**: Added critical cross-runtime import rules to prevent Convex ↔ src/ imports
6. **Req 5**: Documented forbidden patterns and source of truth for plans/entitlements

**Rationale:**
- Align with actual Clerk documentation (Next.js ≥16 uses `proxy.ts`)
- Prevent cross-runtime import errors that break builds
- Establish single source of truth for billing plans (Convex canonical)
- Clarify that frontend must consume Convex via queries, not direct imports
