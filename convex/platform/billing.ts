/**
 * Billing Module - Re-exports for API access
 * 
 * This file re-exports billing functions to make them accessible
 * via api.platform.billing.* pattern in the generated API.
 * 
 * Architecture:
 * - billing.ts (this file) = Public API surface
 * - billing/ folder = Modular implementation
 */

// Plans & Features
export { getPlansPublic } from "./billing/plans";
export type { PublicPlanInfo } from "./billing/plans";

// Subscription Queries
export {
    getSubscriptionByClerkUserId, getWorkspaceSubscriptionAndUsage
} from "./billing/subscriptionQueries";

// Clerk Billing Sync
export { syncSubscriptionFromClerk } from "./billing/clerkBillingSync";

// Test Utilities (for development)
export { createTestSubscription } from "./billing/testSubscription";


