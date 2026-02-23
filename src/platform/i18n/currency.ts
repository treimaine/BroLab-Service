/**
 * Currency display utilities
 *
 * Rules (Requirements 25.4, 25.5, 25.6):
 * - USD is always the base currency
 * - EUR is shown ONLY if priceEUR exists AND locale is 'fr'
 * - NO automatic currency conversion
 */

import type { Locale } from '@/i18n/config'

export interface PriceInput {
  /** Price in USD (always required) */
  priceUSD: number
  /** Price in EUR — optional, provider-set, no conversion */
  priceEUR?: number | null
}

export interface FormattedPrice {
  /** Formatted string ready for display, e.g. "$29.99" or "29,99 €" */
  display: string
  /** ISO 4217 currency code used */
  currency: 'USD' | 'EUR'
  /** Raw numeric value */
  amount: number
}

/**
 * Format a price for display based on locale.
 *
 * Logic:
 * - If locale is 'fr' AND priceEUR is provided (non-null, non-zero) → show EUR
 * - Otherwise → show USD
 * - Uses Intl.NumberFormat for locale-aware formatting
 * - No automatic conversion is ever performed
 */
export function formatPrice(price: PriceInput, locale: Locale): FormattedPrice {
  const useEUR =
    locale === 'fr' &&
    price.priceEUR != null &&
    price.priceEUR > 0

  if (useEUR) {
    return {
      display: new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(price.priceEUR!),
      currency: 'EUR',
      amount: price.priceEUR!,
    }
  }

  return {
    display: new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(price.priceUSD),
    currency: 'USD',
    amount: price.priceUSD,
  }
}

/**
 * Convenience hook-friendly helper: returns just the display string.
 */
export function formatPriceDisplay(
  priceUSD: number,
  locale: Locale,
  priceEUR?: number | null
): string {
  return formatPrice({ priceUSD, priceEUR }, locale).display
}
