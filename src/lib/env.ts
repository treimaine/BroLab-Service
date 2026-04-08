/**
 * Environment Variables Configuration
 *
 * Centralized environment variable access with explicit runtime validation.
 * All environment variables should be accessed through this module.
 */

type NodeEnv = 'development' | 'production' | 'test'

interface RuntimeEnv {
  nodeEnv: NodeEnv
  clerkPublishableKey: string
  clerkSecretKey: string
  clerkJwtIssuerDomain: string
  clerkWebhookSecret: string
  clerkSignInUrl: string
  clerkSignUpUrl: string
  clerkSignInFallbackRedirectUrl: string
  clerkSignUpFallbackRedirectUrl: string
  clerkBillingEnabled: boolean
  convexUrl: string
  convexDeployment: string
  stripeSecretKey: string
  stripePublishableKey: string
  stripeConnectClientId: string
  stripeWebhookSecret: string
  stripeConnectWebhookSecret: string
  resendApiKey: string
  siteUrl: string
  brandName: string
  brandEmail: string
  brandAddress: string
  brandPhone: string
  brandWebsite: string
}

function getNodeEnv(): NodeEnv {
  if (process.env.NODE_ENV === 'production') return 'production'
  if (process.env.NODE_ENV === 'test') return 'test'
  return 'development'
}

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value && value !== 'undefined' ? value : undefined
}

function isPlaceholderValue(value: string): boolean {
  return (
    value.includes('...') ||
    value.includes('%USERNAME%') ||
    value.startsWith('your-') ||
    value.includes('your-domain') ||
    value.includes('example.com')
  )
}

function validateUrl(
  name: string,
  value: string,
  errors: string[],
  options?: { requireHttpsInProduction?: boolean }
) {
  try {
    const url = new URL(value)

    if (!['http:', 'https:'].includes(url.protocol)) {
      errors.push(`${name} must be an http(s) URL.`)
      return
    }

    if (
      options?.requireHttpsInProduction &&
      getNodeEnv() === 'production' &&
      url.protocol !== 'https:'
    ) {
      errors.push(`${name} must use https in production.`)
    }

    if (
      getNodeEnv() === 'production' &&
      ['localhost', '127.0.0.1'].includes(url.hostname)
    ) {
      errors.push(`${name} cannot point to localhost in production.`)
    }
  } catch {
    errors.push(`${name} must be a valid URL.`)
  }
}

function validateRequiredPrefixedValue(
  name: string,
  prefix: string,
  errors: string[]
): string | undefined {
  const value = readEnv(name)
  if (!value) {
    errors.push(`${name} is required.`)
    return undefined
  }

  if (isPlaceholderValue(value)) {
    errors.push(`${name} still contains a placeholder value.`)
    return undefined
  }

  if (!value.startsWith(prefix)) {
    errors.push(`${name} must start with ${prefix}.`)
    return undefined
  }

  return value
}

function resolveRuntimeEnv(): RuntimeEnv {
  const errors: string[] = []
  const nodeEnv = getNodeEnv()
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

  const clerkPublishableKey = validateRequiredPrefixedValue('NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', 'pk_', errors)
  const clerkSecretKey = validateRequiredPrefixedValue('CLERK_SECRET_KEY', 'sk_', errors)
  
  // Webhook secrets are only needed at runtime, not build time
  const clerkWebhookSecret = isBuildTime 
    ? 'whsec_build_placeholder' 
    : validateRequiredPrefixedValue('CLERK_WEBHOOK_SECRET', 'whsec_', errors)
  
  const clerkJwtIssuerDomain = readEnv('CLERK_JWT_ISSUER_DOMAIN')
  if (!clerkJwtIssuerDomain) {
    errors.push('CLERK_JWT_ISSUER_DOMAIN is required.')
  } else {
    validateUrl('CLERK_JWT_ISSUER_DOMAIN', clerkJwtIssuerDomain, errors, { requireHttpsInProduction: true })
  }

  const convexUrl = readEnv('NEXT_PUBLIC_CONVEX_URL')
  if (!convexUrl) {
    errors.push('NEXT_PUBLIC_CONVEX_URL is required.')
  } else {
    validateUrl('NEXT_PUBLIC_CONVEX_URL', convexUrl, errors, { requireHttpsInProduction: true })
  }

  // CONVEX_DEPLOYMENT is only needed at runtime, not build time
  const convexDeployment = isBuildTime
    ? 'build_placeholder'
    : readEnv('CONVEX_DEPLOYMENT')
  
  if (!isBuildTime && !convexDeployment) {
    errors.push('CONVEX_DEPLOYMENT is required.')
  } else if (!isBuildTime && convexDeployment && isPlaceholderValue(convexDeployment)) {
    errors.push('CONVEX_DEPLOYMENT still contains a placeholder value.')
  }

  const stripeSecretKey = validateRequiredPrefixedValue('STRIPE_SECRET_KEY', 'sk_', errors)
  const stripePublishableKey = validateRequiredPrefixedValue('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', 'pk_', errors)
  
  // Connect Client ID is only needed at runtime for OAuth flow
  const stripeConnectClientId = isBuildTime
    ? 'ca_build_placeholder'
    : validateRequiredPrefixedValue('STRIPE_CONNECT_CLIENT_ID', 'ca_', errors)
  
  // Webhook secrets are only needed at runtime
  const stripeWebhookSecret = isBuildTime
    ? 'whsec_build_placeholder_1'
    : validateRequiredPrefixedValue('STRIPE_WEBHOOK_SECRET', 'whsec_', errors)
  const stripeConnectWebhookSecret = isBuildTime
    ? 'whsec_build_placeholder_2'
    : validateRequiredPrefixedValue('STRIPE_CONNECT_WEBHOOK_SECRET', 'whsec_', errors)
  
  if (
    !isBuildTime &&
    stripeWebhookSecret &&
    stripeConnectWebhookSecret &&
    stripeWebhookSecret === stripeConnectWebhookSecret
  ) {
    errors.push('STRIPE_WEBHOOK_SECRET and STRIPE_CONNECT_WEBHOOK_SECRET must be different secrets.')
  }

  const resendApiKey = validateRequiredPrefixedValue('RESEND_API_KEY', 're_', errors)

  const siteUrl = readEnv('NEXT_PUBLIC_SITE_URL') ?? 'http://localhost:3000'
  validateUrl('NEXT_PUBLIC_SITE_URL', siteUrl, errors, { requireHttpsInProduction: true })

  // Allow test credentials in production if explicitly enabled (for local builds)
  const allowTestInProduction = readEnv('ALLOW_TEST_CREDENTIALS_IN_PRODUCTION') === 'true'
  
  if (nodeEnv === 'production' && !allowTestInProduction) {
    const productionOnlyChecks: Array<[string, string | undefined]> = [
      ['NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY', clerkPublishableKey],
      ['CLERK_SECRET_KEY', clerkSecretKey],
      ['STRIPE_SECRET_KEY', stripeSecretKey],
      ['NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', stripePublishableKey],
    ]

    for (const [name, value] of productionOnlyChecks) {
      if (value?.includes('_test_')) {
        errors.push(`${name} cannot use test credentials in production.`)
      }
    }
  }

  if (errors.length > 0) {
    const details = errors.map((error) => `  - ${error}`).join('\n')
    throw new Error(
      [
        'Invalid environment configuration:',
        details,
        '',
        'Review docs/environment-setup.md and docs/security-secret-rotation.md before restarting the app.',
      ].join('\n')
    )
  }

  return {
    nodeEnv,
    clerkPublishableKey: clerkPublishableKey!,
    clerkSecretKey: clerkSecretKey!,
    clerkJwtIssuerDomain: clerkJwtIssuerDomain!,
    clerkWebhookSecret: clerkWebhookSecret!,
    clerkSignInUrl: readEnv('NEXT_PUBLIC_CLERK_SIGN_IN_URL') ?? '/sign-in',
    clerkSignUpUrl: readEnv('NEXT_PUBLIC_CLERK_SIGN_UP_URL') ?? '/sign-up',
    clerkSignInFallbackRedirectUrl: readEnv('NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL') ?? '/',
    clerkSignUpFallbackRedirectUrl: readEnv('NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL') ?? '/onboarding',
    clerkBillingEnabled: readEnv('CLERK_BILLING_ENABLED') === 'true',
    convexUrl: convexUrl!,
    convexDeployment: convexDeployment!,
    stripeSecretKey: stripeSecretKey!,
    stripePublishableKey: stripePublishableKey!,
    stripeConnectClientId: stripeConnectClientId!,
    stripeWebhookSecret: stripeWebhookSecret!,
    stripeConnectWebhookSecret: stripeConnectWebhookSecret!,
    resendApiKey: resendApiKey!,
    siteUrl,
    brandName: readEnv('BRAND_NAME') ?? 'BroLab Entertainment',
    brandEmail: readEnv('BRAND_EMAIL') ?? 'contact@brolabentertainment.com',
    brandAddress: readEnv('BRAND_ADDRESS') ?? '',
    brandPhone: readEnv('BRAND_PHONE') ?? '',
    brandWebsite: readEnv('BRAND_WEBSITE') ?? 'https://brolabentertainment.com',
  }
}

// Lazy initialization - only validate when first accessed
let runtimeEnv: RuntimeEnv | null = null

function getRuntimeEnv(): RuntimeEnv {
  if (!runtimeEnv) {
    runtimeEnv = resolveRuntimeEnv()
  }
  return runtimeEnv
}

export const CLERK_CONFIG = {
  get publishableKey() { return getRuntimeEnv().clerkPublishableKey },
  get secretKey() { return getRuntimeEnv().clerkSecretKey },
  get jwtIssuerDomain() { return getRuntimeEnv().clerkJwtIssuerDomain },
  get webhookSecret() { return getRuntimeEnv().clerkWebhookSecret },
  get signInUrl() { return getRuntimeEnv().clerkSignInUrl },
  get signUpUrl() { return getRuntimeEnv().clerkSignUpUrl },
  get signInFallbackRedirectUrl() { return getRuntimeEnv().clerkSignInFallbackRedirectUrl },
  get signUpFallbackRedirectUrl() { return getRuntimeEnv().clerkSignUpFallbackRedirectUrl },
  get billingEnabled() { return getRuntimeEnv().clerkBillingEnabled },
} as const

export const CONVEX_CONFIG = {
  get url() { return getRuntimeEnv().convexUrl },
  get deployment() { return getRuntimeEnv().convexDeployment },
} as const

export const STRIPE_CONFIG = {
  get secretKey() { return getRuntimeEnv().stripeSecretKey },
  get publishableKey() { return getRuntimeEnv().stripePublishableKey },
  get connectClientId() { return getRuntimeEnv().stripeConnectClientId },
  get webhookSecret() { return getRuntimeEnv().stripeWebhookSecret },
  get connectWebhookSecret() { return getRuntimeEnv().stripeConnectWebhookSecret },
} as const

export const RESEND_CONFIG = {
  get apiKey() { return getRuntimeEnv().resendApiKey },
} as const

export const SITE_CONFIG = {
  get url() { return getRuntimeEnv().siteUrl },
  brand: {
    get name() { return getRuntimeEnv().brandName },
    get email() { return getRuntimeEnv().brandEmail },
    get address() { return getRuntimeEnv().brandAddress },
    get phone() { return getRuntimeEnv().brandPhone },
    get website() { return getRuntimeEnv().brandWebsite },
  },
} as const

export const ENV = {
  get isDevelopment() { return getRuntimeEnv().nodeEnv === 'development' },
  get isProduction() { return getRuntimeEnv().nodeEnv === 'production' },
  get isTest() { return getRuntimeEnv().nodeEnv === 'test' },
} as const

export function validateEnv() {
  return getRuntimeEnv()
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
