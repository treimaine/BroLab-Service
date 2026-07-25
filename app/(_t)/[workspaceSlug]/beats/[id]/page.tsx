import { BeatDetailClient } from '@/components/tenant'
import { api } from 'convex/_generated/api'
import type { Id } from 'convex/_generated/dataModel'
import { ConvexHttpClient } from 'convex/browser'
import type { Metadata } from 'next'

/**
 * Beat detail route.
 *
 * This file is a server component purely so the page can be indexed: the
 * interactive UI still lives in BeatDetailClient. Previously the whole route
 * was `'use client'`, so a crawler received an empty shell with a spinner —
 * every published beat was invisible to search, which is the main organic
 * acquisition surface for a beat marketplace.
 *
 * Revalidated hourly; track metadata changes rarely and this keeps Convex reads
 * off the critical path for repeat crawls.
 */
export const revalidate = 3600

const BASE_URL = 'https://brolabentertainment.com'

interface BeatPageProps {
  params: Promise<{ workspaceSlug: string; id: string }>
}

type MarketplaceBeat = Awaited<
  ReturnType<typeof fetchBeat>
>

async function fetchBeat(trackId: string) {
  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL
  if (!convexUrl) return null

  try {
    const convex = new ConvexHttpClient(convexUrl)
    return await convex.query(api.modules.marketplace.getMarketplaceBeat, {
      trackId: trackId as Id<'tracks'>,
    })
  } catch (error) {
    // Never fail the render on a metadata lookup — the client component fetches
    // its own data and can still display the page.
    console.error('Beat page: metadata lookup failed', error)
    return null
  }
}

/** "Dark Trap Beat — 140 BPM, F Minor" reads better in SERPs than a bare title. */
function buildDescription(beat: NonNullable<MarketplaceBeat>): string {
  const specs = [
    beat.bpm ? `${beat.bpm} BPM` : null,
    beat.musicalKey ? `Key of ${beat.musicalKey}` : null,
  ].filter(Boolean)

  const specText = specs.length > 0 ? ` ${specs.join(', ')}.` : ''
  const price = beat.priceUsdByTier.basic

  return `Stream and license ${beat.title} by ${beat.workspace.name}.${specText} Licenses from $${price} with instant download and a signed PDF license.`
}

export async function generateMetadata({
  params,
}: Readonly<BeatPageProps>): Promise<Metadata> {
  const { workspaceSlug, id } = await params
  const beat = await fetchBeat(id)

  if (!beat) {
    return {
      title: 'Beat not found',
      robots: { index: false, follow: true },
    }
  }

  const title = `${beat.title} — ${beat.workspace.name}`
  const description = buildDescription(beat)
  const canonical = `${BASE_URL}/${workspaceSlug}/beats/${id}`

  return {
    title,
    description,
    keywords: [
      ...beat.tags,
      beat.bpm ? `${beat.bpm} bpm beat` : '',
      'buy beats online',
      'instrumental licensing',
    ].filter(Boolean),
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      siteName: beat.workspace.name,
      type: 'music.song',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    robots: { index: true, follow: true },
  }
}

/**
 * Product schema.
 *
 * Offers are listed per license tier so Google can surface a price range in
 * rich results, which is the main differentiator in a beat SERP.
 */
function buildProductSchema(
  beat: NonNullable<MarketplaceBeat>,
  canonical: string
) {
  const tiers = [
    { name: 'Basic License', price: beat.priceUsdByTier.basic },
    { name: 'Premium License', price: beat.priceUsdByTier.premium },
    { name: 'Unlimited License', price: beat.priceUsdByTier.unlimited },
  ]

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: beat.title,
    description: buildDescription(beat),
    url: canonical,
    category: 'Music Instrumental',
    brand: { '@type': 'Brand', name: beat.workspace.name },
    ...(beat.tags.length > 0 ? { keywords: beat.tags.join(', ') } : {}),
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: Math.min(...tiers.map((t) => t.price)),
      highPrice: Math.max(...tiers.map((t) => t.price)),
      offerCount: tiers.length,
      availability: beat.workspace.paymentsReady
        ? 'https://schema.org/InStock'
        : 'https://schema.org/PreOrder',
      offers: tiers.map((tier) => ({
        '@type': 'Offer',
        name: tier.name,
        price: tier.price.toFixed(2),
        priceCurrency: 'USD',
        url: canonical,
      })),
    },
  }
}

export default async function BeatDetailPage({
  params,
}: Readonly<BeatPageProps>) {
  const { workspaceSlug, id } = await params
  const beat = await fetchBeat(id)
  const canonical = `${BASE_URL}/${workspaceSlug}/beats/${id}`

  return (
    <>
      {beat ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(buildProductSchema(beat, canonical)),
          }}
        />
      ) : null}

      {/*
        Server-rendered summary. The client component below renders the same
        information interactively once hydrated; this block guarantees a crawler
        (and a user on a slow connection) sees real content instead of a spinner.
      */}
      {beat ? (
        <div className="sr-only">
          <h1>{`${beat.title} by ${beat.workspace.name}`}</h1>
          <p>{buildDescription(beat)}</p>
          {beat.tags.length > 0 ? <p>{`Tags: ${beat.tags.join(', ')}`}</p> : null}
        </div>
      ) : null}

      <BeatDetailClient />
    </>
  )
}
