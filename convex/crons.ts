/**
 * Scheduled jobs.
 *
 * Point-in-time sends (trial reminders, activation nudges, abandonment
 * recovery) are scheduled per-user with `ctx.scheduler.runAfter` at the moment
 * their trigger fires. Only genuinely recurring work belongs here.
 */

import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

/**
 * Weekly earnings digest.
 *
 * Monday 15:00 UTC — mid-morning in the Americas, late afternoon in Europe,
 * which covers both halves of the seller base at a time inboxes are being read
 * rather than triaged.
 */
crons.cron(
  "weekly seller digest",
  "0 15 * * 1",
  internal.platform.email.sellerNotifications.dispatchWeeklyDigests,
  {}
);

// Keep CRM stages aligned with attributed product events without automating
// unsolicited outreach. Human approval remains required for every X/DM send.
crons.cron(
  "sync attributed prospect stages",
  "15 * * * *",
  internal.modules.growthProspects.syncAttributedStages,
  {}
);

// 08:00 UTC = 10:00 Paris in July, before the daily outreach block.
crons.cron(
  "daily growth operator brief",
  "0 8 * * *",
  internal.platform.growthOps.sendDailyBrief,
  {}
);

export default crons;
