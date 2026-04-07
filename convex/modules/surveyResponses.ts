/**
 * Survey Responses Module
 * 
 * Handles post-signup survey submission and response storage.
 */

import { v } from "convex/values";
import { mutation } from "../_generated/server";

export const submitSurveyResponse = mutation({
  args: {
    clerkUserId: v.string(),
    workspaceId: v.optional(v.id("workspaces")),
    role: v.union(v.literal("producer"), v.literal("engineer"), v.literal("artist")),
    question: v.string(),
    answer: v.string(),
    customAnswer: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const id = await ctx.db.insert("surveyResponses", {
      clerkUserId: args.clerkUserId,
      workspaceId: args.workspaceId,
      role: args.role,
      question: args.question,
      answer: args.answer,
      customAnswer: args.customAnswer,
      createdAt: Date.now(),
    });
    return id;
  },
});
