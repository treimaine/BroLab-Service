/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as crons from "../crons.js";
import type * as http from "../http.js";
import type * as lib_webhookSignatures from "../lib/webhookSignatures.js";
import type * as lib_workerAuth from "../lib/workerAuth.js";
import type * as modules_analytics from "../modules/analytics.js";
import type * as modules_artist from "../modules/artist.js";
import type * as modules_beats from "../modules/beats.js";
import type * as modules_checkoutAbandonment from "../modules/checkoutAbandonment.js";
import type * as modules_earnings from "../modules/earnings.js";
import type * as modules_failedTransactions from "../modules/failedTransactions.js";
import type * as modules_growth from "../modules/growth.js";
import type * as modules_interviewRequests from "../modules/interviewRequests.js";
import type * as modules_licenses from "../modules/licenses.js";
import type * as modules_marketplace from "../modules/marketplace.js";
import type * as modules_onboardingEvents from "../modules/onboardingEvents.js";
import type * as modules_orders from "../modules/orders.js";
import type * as modules_providerAnalytics from "../modules/providerAnalytics.js";
import type * as modules_retryScheduler from "../modules/retryScheduler.js";
import type * as modules_services from "../modules/services.js";
import type * as modules_surveyResponses from "../modules/surveyResponses.js";
import type * as platform_activationNudges from "../platform/activationNudges.js";
import type * as platform_auditLogs from "../platform/auditLogs.js";
import type * as platform_billing from "../platform/billing.js";
import type * as platform_billing_clerkBillingSync from "../platform/billing/clerkBillingSync.js";
import type * as platform_billing_plans from "../platform/billing/plans.js";
import type * as platform_billing_subscriptionQueries from "../platform/billing/subscriptionQueries.js";
import type * as platform_billing_testSubscription from "../platform/billing/testSubscription.js";
import type * as platform_billing_webhooks from "../platform/billing/webhooks.js";
import type * as platform_domainVerification from "../platform/domainVerification.js";
import type * as platform_domains from "../platform/domains.js";
import type * as platform_email_actions from "../platform/email/actions.js";
import type * as platform_email_dunning from "../platform/email/dunning.js";
import type * as platform_email_i18n from "../platform/email/i18n.js";
import type * as platform_email_lifecycle from "../platform/email/lifecycle.js";
import type * as platform_email_retentionTemplates from "../platform/email/retentionTemplates.js";
import type * as platform_email_sellerNotifications from "../platform/email/sellerNotifications.js";
import type * as platform_email_suppression from "../platform/email/suppression.js";
import type * as platform_email_templates from "../platform/email/templates.js";
import type * as platform_email_theme from "../platform/email/theme.js";
import type * as platform_email_unsubscribeActions from "../platform/email/unsubscribeActions.js";
import type * as platform_email_winback from "../platform/email/winback.js";
import type * as platform_emailEvents from "../platform/emailEvents.js";
import type * as platform_entitlements from "../platform/entitlements.js";
import type * as platform_events from "../platform/events.js";
import type * as platform_jobs from "../platform/jobs.js";
import type * as platform_monitoring from "../platform/monitoring.js";
import type * as platform_onboarding from "../platform/onboarding.js";
import type * as platform_storage from "../platform/storage.js";
import type * as platform_users from "../platform/users.js";
import type * as platform_workspaces from "../platform/workspaces.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  crons: typeof crons;
  http: typeof http;
  "lib/webhookSignatures": typeof lib_webhookSignatures;
  "lib/workerAuth": typeof lib_workerAuth;
  "modules/analytics": typeof modules_analytics;
  "modules/artist": typeof modules_artist;
  "modules/beats": typeof modules_beats;
  "modules/checkoutAbandonment": typeof modules_checkoutAbandonment;
  "modules/earnings": typeof modules_earnings;
  "modules/failedTransactions": typeof modules_failedTransactions;
  "modules/growth": typeof modules_growth;
  "modules/interviewRequests": typeof modules_interviewRequests;
  "modules/licenses": typeof modules_licenses;
  "modules/marketplace": typeof modules_marketplace;
  "modules/onboardingEvents": typeof modules_onboardingEvents;
  "modules/orders": typeof modules_orders;
  "modules/providerAnalytics": typeof modules_providerAnalytics;
  "modules/retryScheduler": typeof modules_retryScheduler;
  "modules/services": typeof modules_services;
  "modules/surveyResponses": typeof modules_surveyResponses;
  "platform/activationNudges": typeof platform_activationNudges;
  "platform/auditLogs": typeof platform_auditLogs;
  "platform/billing": typeof platform_billing;
  "platform/billing/clerkBillingSync": typeof platform_billing_clerkBillingSync;
  "platform/billing/plans": typeof platform_billing_plans;
  "platform/billing/subscriptionQueries": typeof platform_billing_subscriptionQueries;
  "platform/billing/testSubscription": typeof platform_billing_testSubscription;
  "platform/billing/webhooks": typeof platform_billing_webhooks;
  "platform/domainVerification": typeof platform_domainVerification;
  "platform/domains": typeof platform_domains;
  "platform/email/actions": typeof platform_email_actions;
  "platform/email/dunning": typeof platform_email_dunning;
  "platform/email/i18n": typeof platform_email_i18n;
  "platform/email/lifecycle": typeof platform_email_lifecycle;
  "platform/email/retentionTemplates": typeof platform_email_retentionTemplates;
  "platform/email/sellerNotifications": typeof platform_email_sellerNotifications;
  "platform/email/suppression": typeof platform_email_suppression;
  "platform/email/templates": typeof platform_email_templates;
  "platform/email/theme": typeof platform_email_theme;
  "platform/email/unsubscribeActions": typeof platform_email_unsubscribeActions;
  "platform/email/winback": typeof platform_email_winback;
  "platform/emailEvents": typeof platform_emailEvents;
  "platform/entitlements": typeof platform_entitlements;
  "platform/events": typeof platform_events;
  "platform/jobs": typeof platform_jobs;
  "platform/monitoring": typeof platform_monitoring;
  "platform/onboarding": typeof platform_onboarding;
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
