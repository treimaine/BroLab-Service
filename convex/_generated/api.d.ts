/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as http from "../http.js";
import type * as modules_artist from "../modules/artist.js";
import type * as modules_beats from "../modules/beats.js";
import type * as modules_orders from "../modules/orders.js";
import type * as modules_services from "../modules/services.js";
import type * as platform_auditLogs from "../platform/auditLogs.js";
import type * as platform_billing from "../platform/billing.js";
import type * as platform_billing_clerkBillingSync from "../platform/billing/clerkBillingSync.js";
import type * as platform_billing_plans from "../platform/billing/plans.js";
import type * as platform_billing_subscriptionQueries from "../platform/billing/subscriptionQueries.js";
import type * as platform_billing_testSubscription from "../platform/billing/testSubscription.js";
import type * as platform_billing_webhooks from "../platform/billing/webhooks.js";
import type * as platform_domains from "../platform/domains.js";
import type * as platform_entitlements from "../platform/entitlements.js";
import type * as platform_events from "../platform/events.js";
import type * as platform_jobs from "../platform/jobs.js";
import type * as platform_storage from "../platform/storage.js";
import type * as platform_users from "../platform/users.js";
import type * as platform_workspaces from "../platform/workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  "modules/artist": typeof modules_artist;
  "modules/beats": typeof modules_beats;
  "modules/orders": typeof modules_orders;
  "modules/services": typeof modules_services;
  "platform/auditLogs": typeof platform_auditLogs;
  "platform/billing": typeof platform_billing;
  "platform/billing/clerkBillingSync": typeof platform_billing_clerkBillingSync;
  "platform/billing/plans": typeof platform_billing_plans;
  "platform/billing/subscriptionQueries": typeof platform_billing_subscriptionQueries;
  "platform/billing/testSubscription": typeof platform_billing_testSubscription;
  "platform/billing/webhooks": typeof platform_billing_webhooks;
  "platform/domains": typeof platform_domains;
  "platform/entitlements": typeof platform_entitlements;
  "platform/events": typeof platform_events;
  "platform/jobs": typeof platform_jobs;
  "platform/storage": typeof platform_storage;
  "platform/users": typeof platform_users;
  "platform/workspaces": typeof platform_workspaces;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
