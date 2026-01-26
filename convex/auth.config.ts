// Convex Auth Configuration for Clerk Integration
// See: https://docs.convex.dev/auth/clerk

// Auth configuration for Clerk JWT validation
export default {
  providers: [
    {
      domain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
      applicationID: "convex",
    },
  ],
};
