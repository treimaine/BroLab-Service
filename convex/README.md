# Convex Backend

This directory contains the Convex backend for BroLab Entertainment.

## Structure

```
convex/
├── _generated/          # Auto-generated Convex types (DO NOT EDIT)
├── auth.config.ts       # Clerk authentication configuration
├── http.ts              # HTTP endpoints for external integrations
├── schema.ts            # Database schema (to be implemented in Phase 4)
├── modules/             # Business logic modules (beats, services)
└── platform/            # Platform core (auth, billing, jobs, etc.)
```

## Development

### Start Convex Dev Server

```bash
npx convex dev
```

This will:
- Watch for changes in the convex/ directory
- Sync schema and functions to the cloud
- Generate TypeScript types in _generated/

### Environment Variables

Required environment variables (see `.env.local`):

- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL
- `CLERK_JWT_ISSUER_DOMAIN` - Clerk JWT issuer for auth
- `CONVEX_DEPLOYMENT` - Convex deployment identifier

### HTTP Endpoints

HTTP endpoints are defined in `http.ts` and accessible at:

```
https://your-deployment.convex.cloud/api/endpoint-path
```

Current endpoints:
- `GET /health` - Health check
- `POST /api/domains/resolve` - Domain resolution (Phase 6)
- `POST /api/stripe/webhook` - Stripe webhooks (Phase 9)

## Authentication

Convex is configured to validate Clerk JWT tokens via `auth.config.ts`.

The JWT template in Clerk Dashboard MUST be named `convex` (do not rename).

## Next Steps

- **Phase 4 (Task 4.2)**: Implement full database schema
- **Phase 4 (Task 4.3-4.7)**: Implement platform core helpers
- **Phase 6 (Task 6.3)**: Implement domain resolution endpoint
- **Phase 9 (Task 9.4)**: Implement Stripe webhook handler
