/**
 * Marketplace Module - Cross-Workspace Beat Discovery
 *
 * Public, bounded queries for discovering published beats across producers.
 * Only storefront-safe fields are returned: private storage IDs never leave Convex.
 */

import { v } from "convex/values";
import type { Id } from "../_generated/dataModel";
import { query } from "../_generated/server";
import {
  paginationOptsValidator,
  paginationResultValidator,
} from "convex/server";

const MARKETPLACE_SCAN_LIMIT = 200;
const DEFAULT_RESULT_LIMIT = 60;
const MAX_RESULT_LIMIT = 100;

const priceByTierValidator = v.object({
  basic: v.number(),
  premium: v.number(),
  unlimited: v.number(),
});

const marketplaceBeatValidator = v.object({
  trackId: v.id("tracks"),
  title: v.string(),
  bpm: v.union(v.number(), v.null()),
  musicalKey: v.union(v.string(), v.null()),
  tags: v.array(v.string()),
  priceUsdByTier: priceByTierValidator,
  priceEurByTier: v.union(priceByTierValidator, v.null()),
  previewUrl: v.union(v.string(), v.null()),
  previewDurationSec: v.number(),
  createdAt: v.number(),
  workspace: v.object({
    id: v.id("workspaces"),
    slug: v.string(),
    name: v.string(),
    paymentsReady: v.boolean(),
  }),
});

const sitemapBeatValidator = v.object({
  trackId: v.id("tracks"),
  createdAt: v.number(),
  workspaceSlug: v.string(),
});

export const getMarketplaceBeats = query({
  args: {
    searchQuery: v.optional(v.string()),
    genre: v.optional(v.string()),
    sortBy: v.optional(
      v.union(
        v.literal("newest"),
        v.literal("price-low"),
        v.literal("price-high"),
      ),
    ),
    limit: v.optional(v.number()),
  },
  returns: v.array(marketplaceBeatValidator),
  handler: async (ctx, args) => {
    const resultLimit = Math.max(
      1,
      Math.min(Math.floor(args.limit ?? DEFAULT_RESULT_LIMIT), MAX_RESULT_LIMIT),
    );
    const normalizedSearch = args.searchQuery?.trim().toLocaleLowerCase() ?? "";
    const normalizedGenre = args.genre?.trim().toLocaleLowerCase() ?? "";

    const publishedTracks = await ctx.db
      .query("tracks")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .take(MARKETPLACE_SCAN_LIMIT);

    const enrichedTracks = await Promise.all(
      publishedTracks.map(async (track) => {
        const workspace = await ctx.db.get(track.workspaceId);
        if (!workspace) return null;

        const previewUrl = track.previewStorageId
          ? await ctx.storage.getUrl(track.previewStorageId)
          : null;

        return {
          trackId: track._id,
          title: track.title,
          bpm: track.bpm ?? null,
          musicalKey: track.key ?? null,
          tags: track.tags,
          priceUsdByTier: track.priceUsdByTier,
          priceEurByTier: track.priceEurByTier ?? null,
          previewUrl,
          previewDurationSec: track.previewDurationSec,
          createdAt: track.createdAt,
          workspace: {
            id: workspace._id,
            slug: workspace.slug,
            name: workspace.name,
            paymentsReady:
              workspace.paymentsStatus === "active" &&
              workspace.stripeAccountId !== undefined,
          },
        };
      }),
    );

    const visibleTracks = enrichedTracks.filter(
      (track): track is NonNullable<typeof track> => track !== null,
    );

    const filteredTracks = visibleTracks.filter((track) => {
      const matchesGenre =
        normalizedGenre.length === 0 ||
        track.tags.some((tag) => tag.toLocaleLowerCase() === normalizedGenre);

      const matchesSearch =
        normalizedSearch.length === 0 ||
        track.title.toLocaleLowerCase().includes(normalizedSearch) ||
        track.workspace.name.toLocaleLowerCase().includes(normalizedSearch) ||
        track.tags.some((tag) =>
          tag.toLocaleLowerCase().includes(normalizedSearch),
        );

      return matchesGenre && matchesSearch;
    });

    const sortBy = args.sortBy ?? "newest";
    filteredTracks.sort((left, right) => {
      if (sortBy === "price-low") {
        return left.priceUsdByTier.basic - right.priceUsdByTier.basic;
      }
      if (sortBy === "price-high") {
        return right.priceUsdByTier.basic - left.priceUsdByTier.basic;
      }
      return right.createdAt - left.createdAt;
    });

    return filteredTracks.slice(0, resultLimit);
  },
});

export const getMarketplaceGenres = query({
  args: {},
  returns: v.array(v.string()),
  handler: async (ctx) => {
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(MARKETPLACE_SCAN_LIMIT);

    const genres = new Set<string>();
    for (const track of tracks) {
      for (const tag of track.tags) {
        const normalizedTag = tag.trim();
        if (normalizedTag) genres.add(normalizedTag);
      }
    }

    return Array.from(genres).sort((left, right) =>
      left.localeCompare(right),
    );
  },
});

/**
 * Lightweight paginated catalog feed for sitemap generation.
 *
 * Unlike getMarketplaceBeats, this does not resolve preview storage URLs and
 * does not silently cap the sitemap at the first 100 tracks.
 */
export const getSitemapBeats = query({
  args: { paginationOpts: paginationOptsValidator },
  returns: paginationResultValidator(sitemapBeatValidator),
  handler: async (ctx, args) => {
    const page = await ctx.db
      .query("tracks")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .order("desc")
      .paginate(args.paginationOpts);

    const sitemapRows = await Promise.all(
      page.page.map(async (track) => {
        const workspace = await ctx.db.get(track.workspaceId);
        if (!workspace) return null;
        return {
          trackId: track._id,
          createdAt: track.createdAt,
          workspaceSlug: workspace.slug,
        };
      }),
    );

    return {
      ...page,
      page: sitemapRows.filter(
        (row): row is NonNullable<typeof row> => row !== null,
      ),
    };
  },
});

export const getFeaturedProducers = query({
  args: {
    limit: v.optional(v.number()),
  },
  returns: v.array(
    v.object({
      id: v.id("workspaces"),
      slug: v.string(),
      name: v.string(),
      trackCount: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const resultLimit = Math.max(1, Math.min(Math.floor(args.limit ?? 3), 12));
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .take(MARKETPLACE_SCAN_LIMIT);

    const workspaceCounts = new Map<Id<"workspaces">, number>();
    for (const track of tracks) {
      workspaceCounts.set(
        track.workspaceId,
        (workspaceCounts.get(track.workspaceId) ?? 0) + 1,
      );
    }

    const rankedWorkspaces = Array.from(workspaceCounts.entries())
      .sort((left, right) => right[1] - left[1])
      .slice(0, resultLimit);

    const producers = await Promise.all(
      rankedWorkspaces.map(async ([workspaceId, trackCount]) => {
        const workspace = await ctx.db.get(workspaceId);
        if (!workspace) return null;

        return {
          id: workspace._id,
          slug: workspace.slug,
          name: workspace.name,
          trackCount,
        };
      }),
    );

    return producers.filter(
      (producer): producer is NonNullable<typeof producer> => producer !== null,
    );
  },
});

export const getMarketplaceBeat = query({
  args: {
    trackId: v.id("tracks"),
  },
  returns: v.union(marketplaceBeatValidator, v.null()),
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);
    if (!track || track.status !== "published") return null;

    const workspace = await ctx.db.get(track.workspaceId);
    if (!workspace) return null;

    const previewUrl = track.previewStorageId
      ? await ctx.storage.getUrl(track.previewStorageId)
      : null;

    return {
      trackId: track._id,
      title: track.title,
      bpm: track.bpm ?? null,
      musicalKey: track.key ?? null,
      tags: track.tags,
      priceUsdByTier: track.priceUsdByTier,
      priceEurByTier: track.priceEurByTier ?? null,
      previewUrl,
      previewDurationSec: track.previewDurationSec,
      createdAt: track.createdAt,
      workspace: {
        id: workspace._id,
        slug: workspace.slug,
        name: workspace.name,
        paymentsReady:
          workspace.paymentsStatus === "active" &&
          workspace.stripeAccountId !== undefined,
      },
    };
  },
});
