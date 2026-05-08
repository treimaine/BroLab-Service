'use client'

/**
 * LocaleProvider — React context for locale state
 *
 * - Server components pass the detected locale as a prop
 * - Client-side fallback uses navigator.language
 * - Locale is stable for the session (no runtime switching needed for MVP)
 */

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import {
  DEFAULT_LOCALE,
  detectLocaleFromNavigator,
  normalizeLocale,
  type Locale,
} from './config'
import { getMessages, t as translate, type Messages } from './messages'

interface LocaleContextValue {
  locale: Locale
  messages: Messages
  /** Translate a key with optional interpolation params */
  t: (key: string, params?: Record<string, string | number>) => string
}

const LocaleContext = createContext<LocaleContextValue | null>(null)

interface LocaleProviderProps {
  /**
   * Locale detected server-side (from Accept-Language header).
   * If not provided, falls back to navigator.language on the client.
   */
  readonly locale?: Locale | null
  readonly children: ReactNode
}

export function LocaleProvider({ locale: localeProp, children }: LocaleProviderProps) {
  const locale: Locale = useMemo(() => {
    if (localeProp) return normalizeLocale(localeProp)
    return detectLocaleFromNavigator()
  }, [localeProp])

  const messages = useMemo(() => getMessages(locale), [locale])

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      messages,
      t: (key, params) => translate(messages, key, params),
    }),
    [locale, messages]
  )

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
}

/**
 * Hook to access locale context.
 * Must be used inside <LocaleProvider>.
 * Provides a graceful fallback to EN outside the provider.
 */
export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext)
  if (!ctx) {
    const msgs = getMessages(DEFAULT_LOCALE)
    return {
      locale: DEFAULT_LOCALE,
      messages: msgs,
      t: (key, params) => translate(msgs, key, params),
    }
  }
  return ctx
}
