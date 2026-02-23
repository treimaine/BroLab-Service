/**
 * Server-side locale detection utility
 *
 * Use in Server Components and Route Handlers to detect locale
 * from the incoming request's Accept-Language header.
 */

import { detectLocaleFromHeader, type Locale } from '@/i18n/config'
import { headers } from 'next/headers'

/**
 * Detect locale from the current request's Accept-Language header.
 * Safe to call in Server Components (uses next/headers).
 * Defaults to 'en' if header is absent or unrecognized.
 */
export async function getServerLocale(): Promise<Locale> {
  const headersList = await headers()
  const acceptLanguage = headersList.get('accept-language')
  return detectLocaleFromHeader(acceptLanguage)
}
