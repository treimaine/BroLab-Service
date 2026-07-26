import { v } from "convex/values";
import {
  internalMutation,
  internalQuery,
  mutation,
  query,
  type MutationCtx,
  type QueryCtx,
} from "../_generated/server";

const DAY_MS = 24 * 60 * 60 * 1000;
const MAX_PROSPECTS = 250;

const platformValidator = v.union(
  v.literal("x"),
  v.literal("instagram"),
  v.literal("email"),
  v.literal("other")
);
const segmentValidator = v.union(
  v.literal("producer"),
  v.literal("engineer")
);
const statusValidator = v.union(
  v.literal("new"),
  v.literal("contacted"),
  v.literal("replied"),
  v.literal("qualified"),
  v.literal("link_sent"),
  v.literal("trial_started"),
  v.literal("activated"),
  v.literal("won"),
  v.literal("lost")
);

type ProspectStatus =
  | "new"
  | "contacted"
  | "replied"
  | "qualified"
  | "link_sent"
  | "trial_started"
  | "activated"
  | "won"
  | "lost";

const prospectValidator = v.object({
  _id: v.id("growthProspects"),
  _creationTime: v.number(),
  ownerClerkUserId: v.string(),
  displayName: v.string(),
  handle: v.string(),
  platform: platformValidator,
  profileUrl: v.string(),
  segment: segmentValidator,
  signal: v.string(),
  currentSalesFlow: v.optional(v.string()),
  status: statusValidator,
  campaign: v.string(),
  notes: v.optional(v.string()),
  lastContactedAt: v.optional(v.number()),
  nextFollowUpAt: v.optional(v.number()),
  createdAt: v.number(),
  updatedAt: v.number(),
});

const prospectInputValidator = v.object({
  displayName: v.string(),
  handle: v.string(),
  platform: platformValidator,
  profileUrl: v.string(),
  segment: segmentValidator,
  signal: v.string(),
  currentSalesFlow: v.optional(v.string()),
});

async function requireIdentity(ctx: QueryCtx | MutationCtx): Promise<string> {
  const identity = await ctx.auth.getUserIdentity();
  if (!identity) throw new Error("You must be signed in.");
  return identity.subject;
}

function clean(value: string, maxLength: number): string {
  return value.trim().slice(0, maxLength);
}

function validateProfileUrl(value: string): string {
  const url = new URL(value);
  if (
    url.protocol !== "https:" &&
    url.protocol !== "http:" &&
    url.protocol !== "mailto:"
  ) {
    throw new Error("Prospect URLs must use http, https, or mailto.");
  }
  return url.toString().slice(0, 500);
}

function shortHash(value: string): string {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36).slice(0, 6);
}

function campaignFor(
  platform: string,
  handle: string,
  profileUrl: string
): string {
  const slug = `${platform}-${handle}`
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/(?:^-+|-+$)/g, "")
    .slice(0, 50);
  return `founder-outbound-${slug || "prospect"}-${shortHash(profileUrl)}`;
}

function nextFollowUpFor(status: ProspectStatus, now: number) {
  switch (status) {
    case "contacted":
    case "link_sent":
      return now + DAY_MS;
    case "replied":
    case "qualified":
      return now;
    case "trial_started":
      return now + 6 * 60 * 60 * 1000;
    default:
      return undefined;
  }
}

export const listMine = query({
  args: {},
  returns: v.array(prospectValidator),
  handler: async (ctx) => {
    const ownerClerkUserId = await requireIdentity(ctx);
    return await ctx.db
      .query("growthProspects")
      .withIndex("by_owner_and_updatedAt", (q) =>
        q.eq("ownerClerkUserId", ownerClerkUserId)
      )
      .order("desc")
      .take(MAX_PROSPECTS);
  },
});

export const getMySummary = query({
  args: { now: v.number() },
  returns: v.object({
    total: v.number(),
    due: v.number(),
    new: v.number(),
    contacted: v.number(),
    replied: v.number(),
    qualified: v.number(),
    linksSent: v.number(),
    trials: v.number(),
    activated: v.number(),
    won: v.number(),
    lost: v.number(),
  }),
  handler: async (ctx, args) => {
    const ownerClerkUserId = await requireIdentity(ctx);
    const prospects = await ctx.db
      .query("growthProspects")
      .withIndex("by_owner_and_updatedAt", (q) =>
        q.eq("ownerClerkUserId", ownerClerkUserId)
      )
      .take(MAX_PROSPECTS);
    const count = (status: ProspectStatus) =>
      prospects.filter((prospect) => prospect.status === status).length;

    return {
      total: prospects.length,
      due: prospects.filter(
        (prospect) =>
          prospect.nextFollowUpAt !== undefined &&
          prospect.nextFollowUpAt <= args.now &&
          prospect.status !== "won" &&
          prospect.status !== "lost"
      ).length,
      new: count("new"),
      contacted: count("contacted"),
      replied: count("replied"),
      qualified: count("qualified"),
      linksSent: count("link_sent"),
      trials:
        count("trial_started") + count("activated") + count("won"),
      activated: count("activated") + count("won"),
      won: count("won"),
      lost: count("lost"),
    };
  },
});

export const bulkUpsert = mutation({
  args: { prospects: v.array(prospectInputValidator) },
  returns: v.object({ created: v.number(), skipped: v.number() }),
  handler: async (ctx, args) => {
    const ownerClerkUserId = await requireIdentity(ctx);
    if (args.prospects.length === 0 || args.prospects.length > 50) {
      throw new Error("Import between 1 and 50 prospects at a time.");
    }

    let created = 0;
    let skipped = 0;
    for (const input of args.prospects) {
      const profileUrl = validateProfileUrl(input.profileUrl);
      const existing = await ctx.db
        .query("growthProspects")
        .withIndex("by_owner_and_profile_url", (q) =>
          q
            .eq("ownerClerkUserId", ownerClerkUserId)
            .eq("profileUrl", profileUrl)
        )
        .unique();
      if (existing) {
        skipped += 1;
        continue;
      }

      const handle = clean(input.handle.replace(/^@/, ""), 80);
      const now = Date.now();
      await ctx.db.insert("growthProspects", {
        ownerClerkUserId,
        displayName: clean(input.displayName, 120) || handle,
        handle,
        platform: input.platform,
        profileUrl,
        segment: input.segment,
        signal: clean(input.signal, 500),
        currentSalesFlow: input.currentSalesFlow
          ? clean(input.currentSalesFlow, 300)
          : undefined,
        status: "new",
        campaign: campaignFor(input.platform, handle, profileUrl),
        createdAt: now,
        updatedAt: now,
      });
      created += 1;
    }
    return { created, skipped };
  },
});

export const updateStatus = mutation({
  args: {
    prospectId: v.id("growthProspects"),
    status: statusValidator,
    notes: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerClerkUserId = await requireIdentity(ctx);
    const prospect = await ctx.db.get(args.prospectId);
    if (!prospect || prospect.ownerClerkUserId !== ownerClerkUserId) {
      throw new Error("Prospect not found.");
    }

    const now = Date.now();
    await ctx.db.patch(args.prospectId, {
      status: args.status,
      notes: args.notes ? clean(args.notes, 1000) : prospect.notes,
      lastContactedAt:
        args.status === "contacted" || args.status === "link_sent"
          ? now
          : prospect.lastContactedAt,
      nextFollowUpAt: nextFollowUpFor(args.status, now),
      updatedAt: now,
    });
    return null;
  },
});

export const reschedule = mutation({
  args: {
    prospectId: v.id("growthProspects"),
    nextFollowUpAt: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerClerkUserId = await requireIdentity(ctx);
    const prospect = await ctx.db.get(args.prospectId);
    if (!prospect || prospect.ownerClerkUserId !== ownerClerkUserId) {
      throw new Error("Prospect not found.");
    }
    await ctx.db.patch(args.prospectId, {
      nextFollowUpAt: args.nextFollowUpAt,
      updatedAt: Date.now(),
    });
    return null;
  },
});

export const remove = mutation({
  args: { prospectId: v.id("growthProspects") },
  returns: v.null(),
  handler: async (ctx, args) => {
    const ownerClerkUserId = await requireIdentity(ctx);
    const prospect = await ctx.db.get(args.prospectId);
    if (!prospect || prospect.ownerClerkUserId !== ownerClerkUserId) {
      throw new Error("Prospect not found.");
    }
    await ctx.db.delete(args.prospectId);
    return null;
  },
});

const STAGE_RANK: Record<ProspectStatus, number> = {
  new: 0,
  contacted: 1,
  replied: 2,
  qualified: 3,
  link_sent: 4,
  trial_started: 5,
  activated: 6,
  won: 7,
  lost: 8,
};

export const syncAttributedStages = internalMutation({
  args: {},
  returns: v.object({ checked: v.number(), advanced: v.number() }),
  handler: async (ctx) => {
    const prospects = await ctx.db.query("growthProspects").take(MAX_PROSPECTS);
    let advanced = 0;

    for (const prospect of prospects) {
      if (prospect.status === "won" || prospect.status === "lost") continue;
      const events = await ctx.db
        .query("growthEvents")
        .withIndex("by_campaign_and_createdAt", (q) =>
          q.eq("campaign", prospect.campaign)
        )
        .order("desc")
        .take(20);

      let attributedStatus: ProspectStatus | null = null;
      if (events.some((event) => event.event === "first_offer_published")) {
        attributedStatus = "activated";
      } else if (
        events.some((event) => event.event === "subscription_activated")
      ) {
        attributedStatus = "trial_started";
      } else if (events.some((event) => event.event === "workspace_created")) {
        attributedStatus = "link_sent";
      }

      if (
        attributedStatus &&
        STAGE_RANK[attributedStatus] > STAGE_RANK[prospect.status]
      ) {
        const now = Date.now();
        await ctx.db.patch(prospect._id, {
          status: attributedStatus,
          nextFollowUpAt: nextFollowUpFor(attributedStatus, now),
          updatedAt: now,
        });
        advanced += 1;
      }
    }

    return { checked: prospects.length, advanced };
  },
});

export const getOpsBrief = internalQuery({
  args: { now: v.number(), since: v.number() },
  returns: v.object({
    totalProspects: v.number(),
    dueFollowUps: v.number(),
    newProspects: v.number(),
    qualified: v.number(),
    linksSent: v.number(),
    trialsStarted: v.number(),
    activated: v.number(),
    proTrials: v.number(),
    basicTrials: v.number(),
    committedMrrUsd: v.number(),
    landingSessions: v.number(),
    ctaSessions: v.number(),
    signupSessions: v.number(),
  }),
  handler: async (ctx, args) => {
    const prospects = await ctx.db.query("growthProspects").take(MAX_PROSPECTS);
    const recentEvents = await ctx.db
      .query("growthEvents")
      .withIndex("by_createdAt", (q) => q.gte("createdAt", args.since))
      .take(10_000);
    const countStatus = (status: ProspectStatus) =>
      prospects.filter((prospect) => prospect.status === status).length;
    const sessionCount = (eventName: string) =>
      new Set(
        recentEvents
          .filter((event) => event.event === eventName)
          .map((event) => event.sessionId)
          .filter((session): session is string => Boolean(session))
      ).size;
    const activationEvents = recentEvents.filter(
      (event) => event.event === "subscription_activated"
    );
    const latestActivationByProspect = new Map<string, (typeof activationEvents)[number]>();
    for (const event of activationEvents) {
      latestActivationByProspect.set(
        event.clerkUserId ?? event.campaign ?? event._id,
        event
      );
    }
    const uniqueActivations = Array.from(latestActivationByProspect.values());
    const proTrials = uniqueActivations.filter(
      (event) => event.plan === "pro"
    ).length;
    const basicTrials = uniqueActivations.filter(
      (event) => event.plan === "basic"
    ).length;

    return {
      totalProspects: prospects.length,
      dueFollowUps: prospects.filter(
        (prospect) =>
          prospect.nextFollowUpAt !== undefined &&
          prospect.nextFollowUpAt <= args.now &&
          prospect.status !== "won" &&
          prospect.status !== "lost"
      ).length,
      newProspects: countStatus("new"),
      qualified: countStatus("qualified"),
      linksSent: countStatus("link_sent"),
      trialsStarted:
        countStatus("trial_started") +
        countStatus("activated") +
        countStatus("won"),
      activated: countStatus("activated") + countStatus("won"),
      proTrials,
      basicTrials,
      committedMrrUsd: proTrials * 29.99 + basicTrials * 9.99,
      landingSessions: sessionCount("landing_view"),
      ctaSessions: sessionCount("cta_clicked"),
      signupSessions: sessionCount("signup_view"),
    };
  },
});
