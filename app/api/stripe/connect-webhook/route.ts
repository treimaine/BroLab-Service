/**
 * Stripe Connect webhook compatibility endpoint.
 *
 * Stripe's configured Connect endpoint targets this URL. Reuse the canonical
 * webhook proxy so the original request body and Stripe signature are forwarded
 * unchanged to Convex for verification and business processing.
 */
export { POST } from '../webhook/route'
