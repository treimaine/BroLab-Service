/**
 * i18n public API
 *
 * Lightweight translation utility — no external library.
 * Loads message files statically (bundled at build time).
 *
 * Requirements: 25.1, 25.2, 25.3
 */

import type { Locale } from './config'
import en from './messages/en.json'
import fr from './messages/fr.json'

export type Messages = typeof en

const messages: Record<Locale, Messages> = { en, fr }

/**
 * Get the messages object for a given locale.
 */
export function getMessages(locale: Locale): Messages {
  return messages[locale] ?? messages.en
}

/**
 * Simple translation helper with optional interpolation.
 *
 * Usage:
 *   t(messages, 'common.loading')
 *   t(messages, 'pricing.savePercent', { percent: '50' })
 */
export function t(
  msgs: Messages,
  key: string,
  params?: Record<string, string | number>
): string {
  const parts = key.split('.')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = msgs
  for (const part of parts) {
    value = value?.[part]
    if (value === undefined) break
  }

  if (typeof value === 'string') {
    if (params === undefined) return value
    return value.replaceAll(/\{(\w+)\}/g, (_, k: string) => {
      const replacement = params[k]
      if (replacement !== undefined) return String(replacement)
      return `{${k}}`
    })
  }

  // Fallback: return the key itself so missing translations are visible
  return key
}

export {
    DEFAULT_LOCALE,
    SUPPORTED_LOCALES,
    detectLocaleFromHeader,
    detectLocaleFromNavigator,
    normalizeLocale
} from './config'
export type { Locale } from './config'

