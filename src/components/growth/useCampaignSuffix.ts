'use client'

import { useEffect, useState } from 'react'

/**
 * Preserve the inbound `?campaign=` tag across landing/pricing CTA clicks.
 *
 * A visitor who arrives from an outbound link such as
 * `…/?campaign=july-mrr-sprint` would otherwise lose that tag the moment they
 * click a hard-coded `/sign-up?...` CTA, because the CTA href does not carry it.
 * The sign-up page reads `campaign` from its own URL, so it is enough to append
 * the inbound value to every CTA target.
 *
 * Returned as a query-string fragment ready to concatenate onto an existing
 * href that already has a `?` (e.g. `` `${href}${suffix}` ``). The value is
 * sanitised to the same slug shape the server accepts, and read on the client
 * after mount to stay SSR-safe (no `useSearchParams`, so no Suspense
 * requirement is forced on the whole route).
 */
export function useCampaignSuffix(): string {
  const [suffix, setSuffix] = useState('')

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('campaign')
    if (!raw) return
    const slug = raw.toLowerCase().replace(/[^a-z0-9_-]/g, '').slice(0, 80)
    if (slug) setSuffix(`&campaign=${slug}`)
  }, [])

  return suffix
}
