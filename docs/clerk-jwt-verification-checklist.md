# Clerk JWT Template Verification Checklist

## Pre-Setup Verification

- [ ] Clerk account is active and accessible
- [ ] Convex project is initialized (`npx convex dev` runs successfully)
- [ ] `.env.local` file exists with Clerk credentials

## JWT Template Creation (Manual Steps in Clerk Dashboard)

### Step 1: Access JWT Templates
- [ ] Logged into [Clerk Dashboard](https://dashboard.clerk.com)
- [ ] Selected correct application (BroLab Entertainment)
- [ ] Navigated to **JWT Templates** section

### Step 2: Create Template
- [ ] Clicked **New template** button
- [ ] Selected **Convex** from template options
- [ ] **VERIFIED**: Template name is exactly `convex` (not renamed)

### Step 3: Copy Issuer URL
- [ ] Located **Issuer URL** (Frontend API URL) in template settings
- [ ] Copied full URL (format: `https://[instance].clerk.accounts.dev`)
- [ ] Issuer URL: `_______________________________________`

### Step 4: Configure Environment
- [ ] Added `CLERK_JWT_ISSUER_DOMAIN` to `.env.local`
- [ ] Value matches Issuer URL from Clerk Dashboard exactly
- [ ] No trailing slash in URL
- [ ] Includes `https://` protocol

## Code Verification

### File: `convex/auth.config.ts`
- [ ] File exists
- [ ] Contains `AuthConfig` import from `convex/server`
- [ ] `domain` references `process.env.CLERK_JWT_ISSUER_DOMAIN`
- [ ] `applicationID` is set to `"convex"` (string literal)

### File: `.env.local`
- [ ] Contains `CLERK_JWT_ISSUER_DOMAIN=https://...`
- [ ] Contains `NEXT_PUBLIC_CONVEX_URL=https://...`
- [ ] Contains `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...`
- [ ] Contains `CLERK_SECRET_KEY=sk_test_...`

### File: `.env.example`
- [ ] Documents `CLERK_JWT_ISSUER_DOMAIN` with placeholder
- [ ] Includes helpful comment about Clerk integration

### File: `src/components/ConvexClientProvider.tsx`
- [ ] Uses `ConvexProviderWithClerk` from `convex/react-clerk`
- [ ] Passes `useAuth` from `@clerk/nextjs`
- [ ] Wrapped by `<ClerkProvider>` in `app/layout.tsx`

### File: `app/layout.tsx`
- [ ] `<ClerkProvider>` wraps entire app
- [ ] `<ConvexClientProvider>` is nested inside `<ClerkProvider>`
- [ ] Order is correct: ClerkProvider → ConvexClientProvider → children

## Sync and Test

### Sync Configuration
- [ ] Ran `npx convex dev` after adding environment variable
- [ ] No errors in Convex sync output
- [ ] Convex dashboard shows Clerk as configured provider

### Development Server
- [ ] Ran `npm run dev` successfully
- [ ] No console errors related to Clerk or Convex
- [ ] Application loads at `http://localhost:3000`

### Authentication Test
- [ ] Can navigate to sign-in page
- [ ] Can sign in with Clerk
- [ ] After sign-in, `useConvexAuth()` returns `isAuthenticated: true`
- [ ] Authenticated Convex queries work (no "Not authenticated" errors)

## Troubleshooting Checks

If authentication fails, verify:

- [ ] JWT template name is exactly `convex` (case-sensitive)
- [ ] Issuer URL has no typos or extra characters
- [ ] Environment variable is loaded (check `process.env.CLERK_JWT_ISSUER_DOMAIN` in Node)
- [ ] Both dev servers restarted after environment changes
- [ ] Browser cache cleared
- [ ] No conflicting authentication providers in Convex

## Production Readiness

- [ ] Production Issuer URL obtained from Clerk Dashboard
- [ ] Production environment variables configured
- [ ] Convex production deployment configured with Clerk
- [ ] End-to-end authentication tested in production

## Sign-Off

**Setup completed by:** _______________________

**Date:** _______________________

**Verified by:** _______________________

**Notes:**
```
[Add any issues encountered or special configurations]
```

## References

- Documentation: `docs/clerk-jwt-convex-setup.md`
- Clerk Docs: https://clerk.com/docs/backend-requests/making/jwt-templates
- Convex Docs: https://docs.convex.dev/auth/clerk
