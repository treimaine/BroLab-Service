/**
 * Server-side locale detection utility
 *
 * Use in Server Components and Route Handlers to detect locale
 * from the incoming request's Accept-Language header.
 */

import { headers } from 'next/headers'
import { detectLocaleFromHeader, type Locale } from './config'

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
