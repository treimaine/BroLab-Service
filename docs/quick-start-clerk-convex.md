# Quick Start: Clerk + Convex Authentication

## TL;DR

1. **Clerk Dashboard**: Create JWT template named `convex`
2. **Copy Issuer URL**: `https://[your-instance].clerk.accounts.dev`
3. **Add to `.env.local`**: `CLERK_JWT_ISSUER_DOMAIN=<issuer-url>`
4. **Sync**: Run `npx convex dev`
5. **Done**: Authentication works!

## Current Configuration

### Environment Variables (`.env.local`)

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bmF0dXJhbC1yYXR0bGVyLTg4LmNsZXJrLmFjY291bnRzLmRldiQ
CLERK_SECRET_KEY=sk_test_...
CLERK_JWT_ISSUER_DOMAIN=https://natural-rattler-88.clerk.accounts.dev

# Convex
NEXT_PUBLIC_CONVEX_URL=https://famous-starling-265.convex.cloud
```

### Convex Auth Config (`convex/auth.config.ts`)

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

### Provider Setup (`app/layout.tsx`)

```typescript
<ClerkProvider>
  <ConvexClientProvider>
    {children}
  </ConvexClientProvider>
</ClerkProvider>
```

## Usage in Components

### Check Authentication Status

```typescript
'use client'
import { useConvexAuth } from 'convex/react'

export function MyComponent() {
  const { isAuthenticated, isLoading } = useConvexAuth()
  
  if (isLoading) return <div>Loading...</div>
  if (!isAuthenticated) return <div>Please sign in</div>
  
  return <div>Authenticated content</div>
}
```

### Conditional Rendering

```typescript
import { Authenticated, Unauthenticated, AuthLoading } from 'convex/react'

export function MyPage() {
  return (
    <>
      <Authenticated>
        <AuthenticatedContent />
      </Authenticated>
      <Unauthenticated>
        <SignInButton />
      </Unauthenticated>
      <AuthLoading>
        <Spinner />
      </AuthLoading>
    </>
  )
}
```

### Access User in Convex Functions

```typescript
// convex/myFunction.ts
import { query } from './_generated/server'

export const getMyData = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity()
    if (!identity) throw new Error('Not authenticated')
    
    // Use identity.email, identity.name, etc.
    return await ctx.db
      .query('myTable')
      .filter((q) => q.eq(q.field('userId'), identity.subject))
      .collect()
  },
})
```

## Important Rules

### ✅ DO

- Use `<Authenticated>` from `convex/react` (not `<SignedIn>` from Clerk)
- Use `useConvexAuth()` to check auth state
- Name JWT template exactly `convex`
- Restart dev servers after env changes

### ❌ DON'T

- Don't use `<SignedIn>` from Clerk for Convex-authenticated content
- Don't rename the JWT template
- Don't forget to sync with `npx convex dev`
- Don't call authenticated queries outside `<Authenticated>`

## Common Issues

### Issue: `isAuthenticated` is always `false`

**Fix:**
1. Check JWT template name is `convex`
2. Verify `CLERK_JWT_ISSUER_DOMAIN` matches Clerk Dashboard
3. Run `npx convex dev` to sync
4. Clear browser cache

### Issue: "Not authenticated" errors in Convex

**Fix:**
1. Wrap component in `<Authenticated>` from `convex/react`
2. Check `useConvexAuth()` returns `isAuthenticated: true`
3. Verify user is signed in with Clerk

### Issue: Environment variable not found

**Fix:**
1. Check `.env.local` exists and has `CLERK_JWT_ISSUER_DOMAIN`
2. Restart Next.js dev server (`npm run dev`)
3. Restart Convex dev server (`npx convex dev`)

## Testing Checklist

- [ ] Sign in with Clerk works
- [ ] `useConvexAuth()` returns `isAuthenticated: true` after sign-in
- [ ] Authenticated Convex queries return data
- [ ] Unauthenticated queries are rejected
- [ ] Sign out works and `isAuthenticated` becomes `false`

## Next Steps

1. ✅ JWT template created (Task 5.7)
2. ⏭️ Configure Convex Providers (Task 5.8)
3. ⏭️ Test authentication flow
4. ⏭️ Implement protected routes

## Resources

- Full Setup Guide: `docs/clerk-jwt-convex-setup.md`
- Verification Checklist: `docs/clerk-jwt-verification-checklist.md`
- Clerk Docs: https://clerk.com/docs
- Convex Docs: https://docs.convex.dev/auth/clerk
