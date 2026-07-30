import { v } from "convex/values";
import { internal } from "../_generated/api";
import { internalAction } from "../_generated/server";
import { sendTransactionalEmail } from "./email/actions";
import {
  badge,
  button,
  detailTable,
  h1,
  paragraph,
  renderEmailLayout,
  resolveBrand,
  statBlock,
  textFooter,
} from "./email/theme";

const SPRINT_START = Date.UTC(2026, 6, 25);

export const sendDailyBrief = internalAction({
  args: {},
  returns: v.object({
    sent: v.boolean(),
    reason: v.optional(v.string()),
  }),
  handler: async (ctx) => {
    const recipient = process.env.GROWTH_OPS_EMAIL || process.env.BRAND_EMAIL;
    if (!recipient) return { sent: false, reason: "growth_ops_email_missing" };

    const now = Date.now();
    const brief = await ctx.runQuery(
      internal.modules.growthProspects.getOpsBrief,
      { now, since: SPRINT_START }
    );
    const brand = resolveBrand();
    const dashboardUrl = `${brand.siteUrl}/admin/growth`;
    const dateKey = new Date(now).toISOString().slice(0, 10);
    const gapToFloor = Math.max(0, 200 - brief.committedMrrUsd);
    const proTrialsToFloor = Math.ceil(gapToFloor / 29.99);

    const body = [
      badge("Daily growth brief"),
      h1(`${brief.dueFollowUps} follow-up${brief.dueFollowUps === 1 ? "" : "s"} due`),
      paragraph(
        brief.dueFollowUps > 0
          ? "Start with existing conversations before finding new prospects. A warm follow-up is closer to revenue than another public post."
          : "No follow-up is overdue. Add qualified producers or engineers with a visible offer and a specific sales-flow signal."
      ),
      statBlock(`$${brief.committedMrrUsd.toFixed(2)}`, "Committed post-trial MRR"),
      detailTable([
        { label: "Prospects", value: String(brief.totalProspects) },
        { label: "New / uncontacted", value: String(brief.newProspects) },
        { label: "Qualified", value: String(brief.qualified) },
        { label: "Setup links sent", value: String(brief.linksSent) },
        { label: "Trials started", value: String(brief.trialsStarted) },
        { label: "First offers live", value: String(brief.activated) },
        { label: "Landing → CTA", value: `${brief.landingSessions} → ${brief.ctaSessions}` },
        { label: "Sign-up page sessions", value: String(brief.signupSessions) },
        { label: "Clerk accounts created", value: String(brief.accountsCreated) },
      ]),
      paragraph(
        proTrialsToFloor > 0
          ? `${proTrialsToFloor} additional PRO trial${proTrialsToFloor === 1 ? "" : "s"} would reach the $200 committed-MRR floor. Only count a trial after Clerk activates it.`
          : "The $200 committed-MRR floor is reached. Protect activation and first-charge retention before increasing outreach volume."
      ),
      button("Open growth pipeline", dashboardUrl),
    ].join("\n");
    const subject = `${brief.dueFollowUps} follow-ups due · $${brief.committedMrrUsd.toFixed(2)} committed MRR`;
    const text = [
      subject,
      "",
      `Prospects: ${brief.totalProspects}`,
      `New: ${brief.newProspects}`,
      `Qualified: ${brief.qualified}`,
      `Links sent: ${brief.linksSent}`,
      `Trials started: ${brief.trialsStarted}`,
      `First offers live: ${brief.activated}`,
      `Landing / CTA / sign-up page sessions: ${brief.landingSessions} / ${brief.ctaSessions} / ${brief.signupSessions}`,
      `Clerk accounts created: ${brief.accountsCreated}`,
      "",
      `Open pipeline: ${dashboardUrl}`,
      textFooter(brand),
    ].join("\n");

    const result = await sendTransactionalEmail(ctx, {
      dedupeKey: `growth_ops_daily:${dateKey}`,
      emailType: "growth_ops_daily",
      recipient,
      from: `${brand.brandName} <${process.env.BRAND_EMAIL || recipient}>`,
      subject,
      html: renderEmailLayout({
        brand,
        preheader: `${brief.dueFollowUps} follow-ups due. ${proTrialsToFloor} PRO trials to the floor.`,
        body,
        footerNote: "Internal BroLab growth operations brief.",
      }),
      text,
      category: "transactional",
      tags: [{ name: "type", value: "growth_ops_daily" }],
    });

    return {
      sent: result.sent,
      reason: result.reason,
    };
  },
});
