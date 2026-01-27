# Role-Based Routing Implementation

## Overview

This document describes the role-based routing implementation in BroLab Entertainment, which protects routes based on user roles and ensures proper access control.

## Requirements

- **Requirement 2.2**: Redirect to /onboarding if role is missing
- **Requirement 2.3**: Protect /studio/* routes (require provider role)
- **Requirement 2.4**: Protect /artist/* routes (require artist role)

## Implementation

### Middleware (`src/proxy.ts`)

The middleware implements role-based routing using Clerk's `clerkMiddleware()` and session claims.

#### Flow

1. **Public Routes**: Allow access without authentication
   - `/` (landing page)
   - `/pricing`, `/about`, `/contact`, `/privacy`, `/terms`
   - `/sign-in`, `/sign-up`
   - `/api/webhooks/*` (for Stripe webhooks)

2. **Authentication Check**: If user is not authenticated, Clerk handles redirect to sign-in

3. **Role Check**: Extract role from `sessionClaims.unsafeMetadata.role`

4. **Onboarding Redirect**: If authenticated user has no role, redirect to `/onboarding`

5. **Role-Based Protection**:
   - `/studio/*` routes: Require `producer` or `engineer` role
   - `/artist/*` routes: Require `artist` role

6. **Dashboard Redirect**: If user with role tries to access `/onboarding`, redirect to appropriate dashboard

#### Route Matchers

```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/pricing(.*)',
  '/about(.*)',
  '/contact(.*)',
  '/privacy(.*)',
  '/terms(.*)',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
])

const isOnboardingRoute = createRouteMatcher(['/onboarding(.*)'])
const isStudioRoute = createRouteMatcher(['/studio(.*)'])
const isArtistRoute = createRouteMatcher(['/artist(.*)'])
```

#### Type Assertion

Clerk's `unsafeMetadata` is typed as `Record<string, unknown>`, so we need a type assertion:

```typescript
const role = (sessionClaims?.unsafeMetadata as { role?: string })?.role
```

### Dashboard Pages

#### Studio Dashboard (`app/(hub)/studio/page.tsx`)

- Protected route for providers (producer/engineer)
- Double-checks authentication and role (defense in depth)
- Displays placeholder content (full implementation in Phase 6)

#### Artist Dashboard (`app/(hub)/artist/page.tsx`)

- Protected route for artists
- Double-checks authentication and role (defense in depth)
- Displays placeholder content (full implementation in Phase 6)

## User Flows

### New User (No Role)

1. User signs up → Clerk creates account
2. User redirected to `/onboarding` (no role in session claims)
3. User selects role → Role stored in `unsafeMetadata.role`
4. User redirected to appropriate dashboard

### Provider (Producer/Engineer)

1. User signs in → Middleware checks role
2. Role is `producer` or `engineer`
3. User can access `/studio/*` routes
4. Attempting to access `/artist/*` redirects to `/studio`

### Artist

1. User signs in → Middleware checks role
2. Role is `artist`
3. User can access `/artist/*` routes
4. Attempting to access `/studio/*` redirects to `/artist`

## Security

### Defense in Depth

1. **Middleware Protection**: Primary access control at the edge
2. **Page-Level Checks**: Secondary checks in Server Components
3. **Convex Queries**: Backend validation for data access

### Session Claims

- Roles stored in `user.unsafeMetadata.role` (Clerk)
- Synced to session claims for fast access
- No database query needed for route protection

## Testing

### Manual Testing Checklist

- [ ] Unauthenticated user can access public routes
- [ ] Unauthenticated user redirected to sign-in for protected routes
- [ ] Authenticated user without role redirected to `/onboarding`
- [ ] User with role cannot access `/onboarding` (redirected to dashboard)
- [ ] Producer can access `/studio/*` routes
- [ ] Engineer can access `/studio/*` routes
- [ ] Artist can access `/artist/*` routes
- [ ] Producer/Engineer cannot access `/artist/*` routes
- [ ] Artist cannot access `/studio/*` routes

### Test Scenarios

#### Scenario 1: New User Onboarding

```
1. Sign up → No role
2. Redirected to /onboarding
3. Select "Producer" role
4. Redirected to /studio
5. Try to access /onboarding → Redirected to /studio
```

#### Scenario 2: Role-Based Access

```
1. Sign in as Producer
2. Access /studio → Success
3. Try to access /artist → Redirected to /studio
```

#### Scenario 3: Public Access

```
1. Not signed in
2. Access / → Success
3. Access /pricing → Success
4. Try to access /studio → Redirected to /sign-in
```

## Future Enhancements

### Phase 6+

- Full studio dashboard implementation
- Full artist dashboard implementation
- Analytics and reporting
- Subscription management UI

### Potential Improvements

- Add role-based UI components (e.g., `<RequireRole role="producer">`)
- Add permission system (beyond roles)
- Add organization-based access control (multi-tenant)
- Add audit logging for access attempts

## Related Files

- `src/proxy.ts` - Middleware implementation
- `app/(hub)/studio/page.tsx` - Studio dashboard
- `app/(hub)/artist/page.tsx` - Artist dashboard
- `app/(hub)/onboarding/page.tsx` - Onboarding flow
- `src/components/hub/OnboardingClient.tsx` - Role selection UI
- `convex/platform/users.ts` - User creation with roles

## References

- [Clerk Middleware Documentation](https://clerk.com/docs/references/nextjs/clerk-middleware)
- [Clerk Session Claims](https://clerk.com/docs/backend-requests/making/custom-session-token)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
