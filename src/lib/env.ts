/**
 * Environment Variables Configuration
 * 
 * Centralized environment variable access with type safety and validation.
 * All environment variables should be accessed through this module.
 */

// Clerk Configuration
export const CLERK_CONFIG = {
  publishableKey: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
  secretKey: process.env.CLERK_SECRET_KEY!,
  jwtIssuerDomain: process.env.CLERK_JWT_ISSUER_DOMAIN!,
  webhookSecret: process.env.CLERK_WEBHOOK_SECRET!,
  signInUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || '/sign-in',
  signUpUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || '/sign-up',
  signInFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL || '/',
  signUpFallbackRedirectUrl: process.env.NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL || '/onboarding',
  billingEnabled: process.env.CLERK_BILLING_ENABLED === 'true',
} as const

// Convex Configuration
export const CONVEX_CONFIG = {
  url: process.env.NEXT_PUBLIC_CONVEX_URL!,
  deployment: process.env.CONVEX_DEPLOYMENT!,
} as const

// Stripe Configuration
export const STRIPE_CONFIG = {
  // Platform account (for Clerk Billing - provider subscriptions)
  secretKey: process.env.STRIPE_SECRET_KEY!,
  publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
  
  // Stripe Connect (for artist purchases → provider accounts)
  connectClientId: process.env.STRIPE_CONNECT_CLIENT_ID!,
  
  // Webhook secrets
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
  connectWebhookSecret: process.env.STRIPE_CONNECT_WEBHOOK_SECRET!,
} as const

// Resend Configuration
export const RESEND_CONFIG = {
  apiKey: process.env.RESEND_API_KEY!,
} as const

// Site Configuration
export const SITE_CONFIG = {
  url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  brand: {
    name: process.env.BRAND_NAME || 'BroLab Entertainment',
    email: process.env.BRAND_EMAIL || 'contact@brolabentertainment.com',
    address: process.env.BRAND_ADDRESS || '',
    phone: process.env.BRAND_PHONE || '',
    website: process.env.BRAND_WEBSITE || 'https://brolabentertainment.com',
  },
} as const

// Environment Detection
export const ENV = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
} as const

/**
 * Validate required environment variables
 * Call this at app startup to fail fast if config is missing
 */
export function validateEnv() {
  const required = {
    // Clerk
    'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': CLERK_CONFIG.publishableKey,
    'CLERK_SECRET_KEY': CLERK_CONFIG.secretKey,
    'CLERK_JWT_ISSUER_DOMAIN': CLERK_CONFIG.jwtIssuerDomain,
    
    // Convex
    'NEXT_PUBLIC_CONVEX_URL': CONVEX_CONFIG.url,
    
    // Stripe
    'STRIPE_SECRET_KEY': STRIPE_CONFIG.secretKey,
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': STRIPE_CONFIG.publishableKey,
    'STRIPE_CONNECT_CLIENT_ID': STRIPE_CONFIG.connectClientId,
    'STRIPE_WEBHOOK_SECRET': STRIPE_CONFIG.webhookSecret,
    'STRIPE_CONNECT_WEBHOOK_SECRET': STRIPE_CONFIG.connectWebhookSecret,
    
    // Resend
    'RESEND_API_KEY': RESEND_CONFIG.apiKey,
  }

  const missing: string[] = []

  for (const [key, value] of Object.entries(required)) {
    if (!value || value === 'undefined') {
      missing.push(key)
    }
  }

  if (missing.length > 0) {
    const missingList = missing.map(k => `  - ${k}`).join('\n')
    const errorMessage = [
      'Missing required environment variables:',
      missingList,
      '',
      'Please check your .env.local file and ensure all required variables are set.',
      'See docs/environment-setup.md for setup instructions.'
    ].join('\n')
    
    throw new Error(errorMessage)
  }
}

/**
 * Get Stripe Connect OAuth URL
 */
export function getStripeConnectOAuthUrl(redirectUri: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: STRIPE_CONFIG.connectClientId,
    scope: 'read_write',
    redirect_uri: redirectUri,
  })

  return `https://connect.stripe.com/oauth/authorize?${params.toString()}`
}

/**
 * Check if running in server context
 */
export function isServer(): boolean {
  return globalThis.window === undefined
}

/**
 * Check if running in client context
 */
export function isClient(): boolean {
  return globalThis.window !== undefined
}
