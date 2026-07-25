import { api } from 'convex/_generated/api'
import { ConvexHttpClient } from 'convex/browser'
import { MetadataRoute } from 'next'

const BASE_URL = 'https://brolabentertainment.com'

interface SitemapBeat {
  trackId: string
  createdAt: number
  workspaceSlug: string
}

interface SitemapBeatPage {
  page: SitemapBeat[]
  continueCursor: string
  isDone: boolean
}

/**
 * Revalidate hourly.
 *
 * The catalog is the SEO surface: every published beat is a long-tail landing
 * page ("dark trap beat 140 bpm"). A static sitemap listed only the six
 * marketing pages, so no beat and no storefront was ever submitted to search
 * engines.
 */
export const revalidate = 3600

const MARKETING_PAGES: MetadataRoute.Sitemap = (
  [
    { url: BASE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/pricing`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${BASE_URL}/marketplace`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/privacy`, changeFrequency: 'yearly', priority: 0.4 },
    { url: `${BASE_URL}/terms`, changeFrequency: 'yearly', priority: 0.4 },
  ] satisfies MetadataRoute.Sitemap
).map((page) => ({ ...page, lastModified: new Date() }))

/**
 * Catalog entries: one URL per published beat, plus one per storefront that has
 * at least one beat. Storefronts are derived from the beat list rather than
 * queried separately, which keeps empty storefronts — with nothing to rank for —
 * out of the sitemap.
 */
async function getCatalogEntries(): Promise<MetadataRoute.Sitemap> {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return []

  try {
    const convex = new ConvexHttpClient(convexUrl)
    const beats: SitemapBeat[] = []
    let cursor: string | null = null
    let isDone = false

    while (!isDone) {
      const result: SitemapBeatPage = await convex.query(
        api.modules.marketplace.getSitemapBeats,
        { paginationOpts: { cursor, numItems: 100 } }
      )
      beats.push(...result.page)
      cursor = result.continueCursor
      isDone = result.isDone
    }

    const beatEntries: MetadataRoute.Sitemap = beats.map((beat) => ({
      url: `${BASE_URL}/${beat.workspaceSlug}/beats/${beat.trackId}`,
      lastModified: new Date(beat.createdAt),
      changeFrequency: 'weekly',
      priority: 0.7,
    }))

    const storefrontEntries: MetadataRoute.Sitemap = Array.from(
      new Map(
        beats.map((beat) => [
          beat.workspaceSlug,
          {
            url: `${BASE_URL}/${beat.workspaceSlug}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: 0.8,
          },
        ])
      ).values()
    )

    return [...storefrontEntries, ...beatEntries]
  } catch (error) {
    // A sitemap that 500s is worse than one missing catalog entries: search
    // engines drop the whole file. Degrade to marketing pages instead.
    console.error('Sitemap: failed to load catalog entries', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const catalogEntries = await getCatalogEntries()
  return [...MARKETING_PAGES, ...catalogEntries]
}
