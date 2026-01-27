# Clerk JWT Template Setup for Convex Integration

## Overview

This document provides step-by-step instructions for creating a JWT template in Clerk Dashboard to enable Convex authentication integration.

## Prerequisites

- Clerk account with access to the Dashboard
- Convex project initialized
- Environment variables configured

## Step-by-Step Instructions

### 1. Access Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application (BroLab Entertainment)
3. Navigate to **JWT Templates** in the sidebar

### 2. Create New JWT Template

1. Click **New template** button
2. Select **Convex** from the template options
3. **CRITICAL**: The template name MUST be `convex` (do NOT rename it)
   - Convex expects the JWT token to be named exactly `convex`
   - Renaming will break the integration

### 3. Copy the Issuer URL

1. In the JWT template configuration, locate the **Issuer URL** (also called Frontend API URL)
2. It will look like: `https://[your-clerk-instance].clerk.accounts.dev`
3. Copy this URL

**Example:**
```
https://natural-rattler-88.clerk.accounts.dev
```

### 4. Add to Environment Variables

Add the Issuer URL to your `.env.local` file:

```env
CLERK_JWT_ISSUER_DOMAIN=https://natural-rattler-88.clerk.accounts.dev
```

**Note:** Replace with your actual Issuer URL from step 3.

### 5. Verify Configuration

The following files should already be configured:

#### `convex/auth.config.ts`
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

#### `.env.example`
```env
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-domain.clerk.accounts.dev
```

### 6. Sync Configuration with Convex

After adding the environment variable, sync the configuration:

```bash
npx convex dev
```

This will:
- Read the `CLERK_JWT_ISSUER_DOMAIN` from your environment
- Configure Convex to validate JWT tokens from Clerk
- Enable authenticated queries/mutations

## Verification

### Test Authentication Flow

1. Start the development server:
```bash
npm run dev
```

2. Start Convex dev mode:
```bash
npx convex dev
```

3. Navigate to `http://localhost:3000`
4. Sign in with Clerk
5. Verify that authenticated Convex queries work

### Check Convex Dashboard

1. Go to [Convex Dashboard](https://dashboard.convex.dev)
2. Select your project
3. Navigate to **Settings** > **Authentication**
4. Verify that Clerk is listed as a configured provider

## Troubleshooting

### Issue: `useConvexAuth()` returns `isAuthenticated: false`

**Possible causes:**
1. JWT template not named `convex`
2. `CLERK_JWT_ISSUER_DOMAIN` not set correctly
3. `auth.config.ts` not synced with Convex

**Solutions:**
1. Verify JWT template name in Clerk Dashboard
2. Check `.env.local` for correct Issuer URL
3. Run `npx convex dev` to sync configuration
4. Clear browser cache and cookies
5. Check Convex logs for authentication errors

### Issue: "Invalid JWT token" errors

**Possible causes:**
1. Issuer URL mismatch between Clerk and Convex
2. JWT template not properly configured

**Solutions:**
1. Verify Issuer URL matches exactly (including https://)
2. Recreate JWT template if necessary
3. Restart both dev servers

## Development vs Production

### Development
```env
CLERK_JWT_ISSUER_DOMAIN=https://[dev-instance].clerk.accounts.dev
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
```

### Production
```env
CLERK_JWT_ISSUER_DOMAIN=https://clerk.[your-domain].com
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_...
```

**Important:** Update both Clerk and Convex configurations when deploying to production.

## References

- [Clerk JWT Templates Documentation](https://clerk.com/docs/backend-requests/making/jwt-templates)
- [Convex + Clerk Integration Guide](https://docs.convex.dev/auth/clerk)
- [Convex Auth Configuration](https://docs.convex.dev/auth/config)

## Status

✅ **Completed:**
- JWT template configuration documented
- Environment variables configured
- `convex/auth.config.ts` created
- `.env.example` updated

⚠️ **Manual Step Required:**
- Create JWT template in Clerk Dashboard (if not already done)
- Verify template name is exactly `convex`
- Confirm Issuer URL matches environment variable

## Next Steps

After completing this setup:
1. Proceed to Task 5.8: Configure Convex Providers in Next.js
2. Test authentication flow end-to-end
3. Verify Convex queries work with authenticated users
