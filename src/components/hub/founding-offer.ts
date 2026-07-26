/**
 * Founding-creators conversion lever — single source of truth.
 *
 * At 0 customers the only honest scarcity is a real, owner-backed commitment,
 * not invented "N spots left" counters or fake testimonials. The lever here is
 * a price-lock: existing Clerk subscriptions keep their price if the public
 * list price rises later, for as long as the subscription stays continuous.
 *
 * OWNER CONTROLS
 * - Set `enabled: false` to remove the banner everywhere in one edit.
 * - `priceLock` copy must stay literally true and must not imply that a canceled
 *   subscriber can later reactivate at an old price.
 * - There is deliberately no fake deadline or seat counter. If you later want
 *   real, enforced scarcity (e.g. the first 50 paid workspaces), wire it to the
 *   actual `providerSubscriptions` count before advertising a number.
 */
export const FOUNDING_OFFER = {
  enabled: true,
  /** Short chip shown above the hero headline. */
  badge: 'Founding creators',
  /** The honest scarcity: a price-lock, not a fake countdown. */
  priceLock: 'Keep your launch price while subscribed',
  /**
   * Consolidated, individually-true risk reversal shown under the CTAs.
   *
   * No money-back claim: subscription fees are billed through Clerk Billing and
   * are non-refundable per the Terms. The free month is the real risk reversal
   * (evaluate before any charge), and data-ownership counters the fear of being
   * locked in — both are honoured in product.
   */
  riskReversal: '1 month free • Cancel anytime • Your data stays yours',
} as const
