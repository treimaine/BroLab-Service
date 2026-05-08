'use client'

/**
 * useTranslation hook
 *
 * Client-side translation hook that detects locale from navigator.language
 * and returns a bound `t()` helper for the detected locale.
 *
 * Uses DEFAULT_LOCALE on first render (SSR-safe), then switches to the
 * browser locale after hydration to avoid hydration mismatches.
 *
 * Requirements: 25.3
 */

import { useEffect, useState } from 'react'
import { DEFAULT_LOCALE, detectLocaleFromNavigator } from './config'
import { getMessages } from './index'
export type { Messages } from './index'

export function useTranslation() {
  // Always start with the default locale so SSR and first client render match
  const [locale, setLocale] = useState(DEFAULT_LOCALE)

  useEffect(() => {
    setLocale(detectLocaleFromNavigator())
  }, [])

  const messages = getMessages(locale)

  function t(key: string, params?: Record<string, string | number>): string {
    const parts = key.split('.')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let value: any = messages
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
    // Fallback: return the key so missing translations are visible
    return key
  }

  return { t, locale, messages }
}
