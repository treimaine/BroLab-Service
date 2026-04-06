/**
 * Marketplace Module - Cross-Workspace Beat Discovery
 *
 * Handles marketplace queries for discovering beats across ALL producers.
 * Provides search, filtering, and sorting capabilities.
 *
 * Requirements: BRO-84 (Beat Marketplace UI/UX)
 */

import { v } from "convex/values";
import { query } from "../_generated/server";

// ============================================================================
// QUERIES
// ============================================================================

/**
 * Get marketplace beats with search, filter, and sort
 *
 * Returns published beats from ALL workspaces for global discovery.
 * Supports text search, genre filtering, and multiple sort options.
 *
 * @param searchQuery - Optional text search across title and tags
 * @param genre - Optional genre filter
 * @param sortBy - Sort order: newest (default), price-low, price-high
 * @param limit - Maximum number of results (default: 50, max: 100)
 *
 * @returns Array of beat records with workspace info
 */
export const getMarketplaceBeats = query({
  args: {
    searchQuery: v.optional(v.string()),
    genre: v.optional(v.string()),
    sortBy: v.optional(v.union(
      v.literal("newest"),
      v.literal("price-low"),
      v.literal("price-high")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = Math.min(args.limit ?? 50, 100);
    const sortBy = args.sortBy ?? "newest";

    // Query all published tracks
    let tracksQuery = ctx.db
      .query("tracks")
      .withIndex("by_status", (q) => q.eq("status", "published"));

    // Collect all tracks (we'll filter and sort in memory)
    let tracks = await tracksQuery.collect();

    // Filter by genre if provided
    if (args.genre) {
      tracks = tracks.filter((track) =>
        track.tags?.some((tag) =>
          tag.toLowerCase() === args.genre!.toLowerCase()
        )
      );
    }

    // Filter by search query if provided
    if (args.searchQuery) {
      const query = args.searchQuery.toLowerCase();
      tracks = tracks.filter((track) =>
        track.title.toLowerCase().includes(query) ||
        track.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Sort tracks
    tracks.sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return b.createdAt - a.createdAt;
        case "price-low":
          // Get the minimum license price for each track
          const priceA = Math.min(...a.licenseTiers.map(l => l.priceUSD));
          const priceB = Math.min(...b.licenseTiers.map(l => l.priceUSD));
          return priceA - priceB;
        case "price-high":
          const maxPriceA = Math.max(...a.licenseTiers.map(l => l.priceUSD));
          const maxPriceB = Math.max(...b.licenseTiers.map(l => l.priceUSD));
          return maxPriceB - maxPriceA;
        default:
          return 0;
      }
    });

    // Limit results
    tracks = tracks.slice(0, limit);

    // Enrich with workspace info
    const enrichedTracks = await Promise.all(
      tracks.map(async (track) => {
        const workspace = await ctx.db.get(track.workspaceId);
        return {
          ...track,
          workspace: workspace ? {
            id: workspace._id,
            slug: workspace.slug,
            name: workspace.name,
          } : null,
        };
      })
    );

    return enrichedTracks;
  },
});

/**
 * Get unique genres from all marketplace beats
 *
 * Extracts and returns unique genre tags from all published tracks
 * for use in genre filter pills.
 *
 * @returns Array of unique genre strings
 */
export const getMarketplaceGenres = query({
  args: {},
  handler: async (ctx) => {
    // Query all published tracks
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Extract unique genres from tags
    const genresSet = new Set<string>();

    tracks.forEach((track) => {
      track.tags?.forEach((tag) => {
        genresSet.add(tag);
      });
    });

    // Convert to sorted array
    return Array.from(genresSet).sort();
  },
});

/**
 * Get featured producers for marketplace
 *
 * Returns top producers based on number of published beats
 * and recent activity.
 *
 * @param limit - Maximum number of producers (default: 6)
 * @returns Array of workspace info with track count
 */
export const getFeaturedProducers = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 6;

    // Get all published tracks
    const tracks = await ctx.db
      .query("tracks")
      .withIndex("by_status", (q) => q.eq("status", "published"))
      .collect();

    // Count tracks by workspace
    const workspaceCounts = new Map<string, number>();

    tracks.forEach((track) => {
      const workspaceId = track.workspaceId;
      workspaceCounts.set(
        workspaceId,
        (workspaceCounts.get(workspaceId) ?? 0) + 1
      );
    });

    // Sort workspaces by track count
    const sortedWorkspaces = Array.from(workspaceCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit);

    // Fetch workspace details
    const producers = await Promise.all(
      sortedWorkspaces.map(async ([workspaceId, trackCount]) => {
        const workspace = await ctx.db.get(workspaceId as any);
        return workspace ? {
          id: workspace._id,
          slug: workspace.slug,
          name: workspace.name,
          trackCount,
        } : null;
      })
    );

    return producers.filter((p) => p !== null);
  },
});

/**
 * Get marketplace beat by ID
 *
 * Returns a single beat with full details and workspace info.
 * Only returns published beats.
 *
 * @param trackId - Track ID
 * @returns Beat record with workspace info or null
 */
export const getMarketplaceBeat = query({
  args: {
    trackId: v.id("tracks"),
  },
  handler: async (ctx, args) => {
    const track = await ctx.db.get(args.trackId);

    if (!track || track.status !== "published") {
      return null;
    }

    // Enrich with workspace info
    const workspace = await ctx.db.get(track.workspaceId);

    return {
      ...track,
      workspace: workspace ? {
        id: workspace._id,
        slug: workspace.slug,
        name: workspace.name,
      } : null,
    };
  },
});
