/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as http from "../http.js";
import type * as platform_billing_getPlansPublic from "../platform/billing/getPlansPublic.js";
import type * as platform_billing_plans from "../platform/billing/plans.js";
import type * as platform_billing from "../platform/billing.js";
import type * as platform_domains from "../platform/domains.js";
import type * as platform_entitlements from "../platform/entitlements.js";
import type * as platform_users from "../platform/users.js";
import type * as platform_workspaces from "../platform/workspaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  http: typeof http;
  "platform/billing/getPlansPublic": typeof platform_billing_getPlansPublic;
  "platform/billing/plans": typeof platform_billing_plans;
  "platform/billing": typeof platform_billing;
  "platform/domains": typeof platform_domains;
  "platform/entitlements": typeof platform_entitlements;
  "platform/users": typeof platform_users;
  "platform/workspaces": typeof platform_workspaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
