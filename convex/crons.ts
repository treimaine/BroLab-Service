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
crons.weekly(
  "weekly seller digest",
  { dayOfWeek: "monday", hourUTC: 15, minuteUTC: 0 },
  internal.platform.email.sellerNotifications.dispatchWeeklyDigests,
  {}
);

export default crons;
