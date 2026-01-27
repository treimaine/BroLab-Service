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
import type * as platform_auditLogs from "../platform/auditLogs.js";
import type * as platform_billing from "../platform/billing.js";
import type * as platform_billing_plans from "../platform/billing/plans.js";
import type * as platform_domains from "../platform/domains.js";
import type * as platform_entitlements from "../platform/entitlements.js";
import type * as platform_events from "../platform/events.js";
import type * as platform_jobs from "../platform/jobs.js";
import type * as platform_users from "../platform/users.js";
import type * as platform_workspaces from "../platform/workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  http: typeof http;
  "platform/auditLogs": typeof platform_auditLogs;
  "platform/billing": typeof platform_billing;
  "platform/billing/plans": typeof platform_billing_plans;
  "platform/domains": typeof platform_domains;
  "platform/entitlements": typeof platform_entitlements;
  "platform/events": typeof platform_events;
  "platform/jobs": typeof platform_jobs;
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
