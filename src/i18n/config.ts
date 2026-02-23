/**
 * i18n Configuration
 *
 * Supported locales: EN (default) and FR
 * Detection: Accept-Language header (server) + navigator.language (client)
 */

export const SUPPORTED_LOCALES = ['en', 'fr'] as const
export type Locale = (typeof SUPPORTED_LOCALES)[number]

export const DEFAULT_LOCALE: Locale = 'en'

/**
 * Detect locale from Accept-Language header string (server-side).
 * Returns the best matching supported locale, defaulting to EN.
 */
export function detectLocaleFromHeader(acceptLanguage: string | null): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE

  // Parse Accept-Language header: "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7"
  const languages = acceptLanguage
    .split(',')
    .map((lang) => {
      const [tag, q] = lang.trim().split(';q=')
      return { tag: tag.trim().toLowerCase(), q: q ? Number.parseFloat(q) : 1 }
    })
    .sort((a, b) => b.q - a.q)

  for (const { tag } of languages) {
    // Exact match first (e.g. "fr")
    if ((SUPPORTED_LOCALES as readonly string[]).includes(tag)) {
      return tag as Locale
    }
    // Language prefix match (e.g. "fr-FR" → "fr")
    const prefix = tag.split('-')[0]
    if ((SUPPORTED_LOCALES as readonly string[]).includes(prefix)) {
      return prefix as Locale
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Detect locale from navigator.language (client-side).
 * Returns the best matching supported locale, defaulting to EN.
 */
export function detectLocaleFromNavigator(): Locale {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE

  const languages = navigator.languages?.length
    ? navigator.languages
    : [navigator.language]

  for (const lang of languages) {
    const tag = lang.toLowerCase()
    if ((SUPPORTED_LOCALES as readonly string[]).includes(tag)) {
      return tag as Locale
    }
    const prefix = tag.split('-')[0]
    if ((SUPPORTED_LOCALES as readonly string[]).includes(prefix)) {
      return prefix as Locale
    }
  }

  return DEFAULT_LOCALE
}

/**
 * Validate and normalize a locale string.
 * Returns the locale if supported, otherwise the default.
 */
export function normalizeLocale(locale: string | null | undefined): Locale {
  if (!locale) return DEFAULT_LOCALE
  const lower = locale.toLowerCase()
  if ((SUPPORTED_LOCALES as readonly string[]).includes(lower)) return lower as Locale
  const prefix = lower.split('-')[0]
  if ((SUPPORTED_LOCALES as readonly string[]).includes(prefix)) return prefix as Locale
  return DEFAULT_LOCALE
}
