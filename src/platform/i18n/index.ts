// Locale & Translation
export {
  DEFAULT_LOCALE, detectLocaleFromHeader,
  detectLocaleFromNavigator,
  normalizeLocale, SUPPORTED_LOCALES, type Locale
} from './config';
export { LocaleProvider, useLocale } from './LocaleProvider';
export { useTranslation } from './useTranslation';

// Currency
export { formatPrice, formatPriceDisplay } from './currency';
export type { FormattedPrice, PriceInput } from './currency';

// Messages
export { getMessages, t, type Messages } from './messages';

