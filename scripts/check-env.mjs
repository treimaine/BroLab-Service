#!/usr/bin/env node

/**
 * Environment Variables Checker
 * 
 * Validates that all required environment variables are set.
 * Run before deploying to production.
 */

const REQUIRED_BUILD_VARS = [
  'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY',
  'CLERK_SECRET_KEY',
  'CLERK_JWT_ISSUER_DOMAIN',
  'NEXT_PUBLIC_CONVEX_URL',
  'STRIPE_SECRET_KEY',
  'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
  'RESEND_API_KEY',
  'NEXT_PUBLIC_SITE_URL',
]

const RUNTIME_VARS = [
  'CONVEX_DEPLOYMENT',
  'CLERK_WEBHOOK_SECRET',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_CONNECT_WEBHOOK_SECRET',
  'STRIPE_CONNECT_CLIENT_ID',
]

const OPTIONAL_VARS = [
  'NEXT_PUBLIC_CLERK_SIGN_IN_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_URL',
  'NEXT_PUBLIC_CLERK_SIGN_IN_FALLBACK_REDIRECT_URL',
  'NEXT_PUBLIC_CLERK_SIGN_UP_FALLBACK_REDIRECT_URL',
  'CLERK_BILLING_ENABLED',
  'BRAND_NAME',
  'BRAND_EMAIL',
  'BRAND_ADDRESS',
  'BRAND_PHONE',
  'BRAND_WEBSITE',
  'ALLOW_TEST_CREDENTIALS_IN_PRODUCTION',
]

function checkVar(name, value) {
  if (!value || value.trim() === '') {
    return { status: 'missing', message: `❌ ${name} is not set` }
  }

  if (value.includes('...') || value.includes('your-') || value.includes('example.com')) {
    return { status: 'placeholder', message: `⚠️  ${name} contains placeholder value` }
  }

  if (process.env.NODE_ENV === 'production' && value.includes('_test_')) {
    return { status: 'test', message: `⚠️  ${name} uses test credentials in production` }
  }

  return { status: 'ok', message: `✅ ${name}` }
}

function main() {
  console.log('🔍 Checking environment variables...\n')

  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'
  const isProduction = process.env.NODE_ENV === 'production'
  const isVercel = process.env.VERCEL === '1'

  // Skip strict checks on Vercel build - variables are injected by platform
  if (isVercel && isBuildTime) {
    console.log('ℹ️  Running on Vercel - skipping strict environment checks')
    console.log('✅ Environment variables will be validated at runtime\n')
    return
  }

  let hasErrors = false
  let hasWarnings = false

  // Check build-time variables
  console.log('📦 Build-Time Variables (Required for build):')
  for (const varName of REQUIRED_BUILD_VARS) {
    const result = checkVar(varName, process.env[varName])
    console.log(result.message)
    if (result.status === 'missing') hasErrors = true
    if (result.status === 'placeholder' || result.status === 'test') hasWarnings = true
  }

  console.log('\n⏱️  Runtime-Only Variables (Can be added after build):')
  for (const varName of RUNTIME_VARS) {
    const result = checkVar(varName, process.env[varName])
    
    // Runtime vars are only required at runtime, not build time
    if (isBuildTime) {
      console.log(`ℹ️  ${varName} (not required for build)`)
    } else {
      console.log(result.message)
      if (result.status === 'missing') hasErrors = true
      if (result.status === 'placeholder' || result.status === 'test') hasWarnings = true
    }
  }

  console.log('\n🔧 Optional Variables:')
  for (const varName of OPTIONAL_VARS) {
    const value = process.env[varName]
    if (value && value.trim() !== '') {
      console.log(`✅ ${varName}`)
    } else {
      console.log(`ℹ️  ${varName} (using default)`)
    }
  }

  console.log('\n' + '='.repeat(60))

  if (hasErrors) {
    console.log('\n❌ Environment check FAILED')
    console.log('\nMissing required variables. Please:')
    console.log('1. Copy .env.example to .env.local')
    console.log('2. Fill in all required values')
    console.log('3. See docs/environment-setup.md for details')
    process.exit(1)
  }

  if (hasWarnings) {
    console.log('\n⚠️  Environment check passed with WARNINGS')
    console.log('\nPlease review warnings above before deploying to production.')
    if (isProduction) {
      process.exit(1)
    }
  } else {
    console.log('\n✅ Environment check PASSED')
    console.log('\nAll required variables are configured correctly.')
  }
}

main()
