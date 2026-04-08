#!/bin/bash

# Production Readiness Check Script
# Verifies that production environment is properly configured

set -e

echo "🔍 BroLab Entertainment - Production Readiness Check"
echo "=================================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check if variable is set and not a test key
check_env_var() {
  local var_name=$1
  local var_value=${!var_name}
  local should_not_contain=$2
  
  if [ -z "$var_value" ]; then
    echo -e "${RED}❌ $var_name is not set${NC}"
    ((ERRORS++))
    return 1
  fi
  
  if [ -n "$should_not_contain" ] && [[ "$var_value" == *"$should_not_contain"* ]]; then
    echo -e "${RED}❌ $var_name contains '$should_not_contain' (test key in production!)${NC}"
    ((ERRORS++))
    return 1
  fi
  
  echo -e "${GREEN}✅ $var_name is set${NC}"
  return 0
}

# Function to check if variable is NOT set (should be removed)
check_var_not_set() {
  local var_name=$1
  local var_value=${!var_name}
  
  if [ -n "$var_value" ]; then
    echo -e "${RED}❌ $var_name should NOT be set in production${NC}"
    ((ERRORS++))
    return 1
  fi
  
  echo -e "${GREEN}✅ $var_name is not set (correct)${NC}"
  return 0
}

echo "📋 Checking Environment Variables..."
echo ""

# Load .env.local if exists (for local testing)
if [ -f .env.local ]; then
  export $(cat .env.local | grep -v '^#' | xargs)
fi

echo "1️⃣ Clerk Configuration"
echo "----------------------"
check_env_var "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" "pk_test_"
check_env_var "CLERK_SECRET_KEY" "sk_test_"
check_env_var "CLERK_JWT_ISSUER_DOMAIN" "clerk.accounts.dev"
check_env_var "CLERK_WEBHOOK_SECRET" ""
echo ""

echo "2️⃣ Stripe Configuration"
echo "----------------------"
check_env_var "STRIPE_SECRET_KEY" "sk_test_"
check_env_var "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" "pk_test_"
check_env_var "STRIPE_CONNECT_CLIENT_ID" ""
check_env_var "STRIPE_WEBHOOK_SECRET" ""
check_env_var "STRIPE_CONNECT_WEBHOOK_SECRET" ""
echo ""

echo "3️⃣ Convex Configuration"
echo "----------------------"
check_env_var "NEXT_PUBLIC_CONVEX_URL" ""
check_env_var "CONVEX_DEPLOYMENT" ""
echo ""

echo "4️⃣ Other Services"
echo "----------------------"
check_env_var "RESEND_API_KEY" ""
check_env_var "UPSTASH_REDIS_REST_URL" ""
check_env_var "UPSTASH_REDIS_REST_TOKEN" ""
echo ""

echo "5️⃣ Site Configuration"
echo "----------------------"
check_env_var "NEXT_PUBLIC_SITE_URL" "localhost"
check_env_var "BRAND_NAME" ""
check_env_var "BRAND_EMAIL" ""
echo ""

echo "6️⃣ Security Checks"
echo "----------------------"
check_var_not_set "ALLOW_TEST_CREDENTIALS_IN_PRODUCTION"
echo ""

# Check if favicon exists
echo "7️⃣ Assets Check"
echo "----------------------"
if [ -f "app/icon.tsx" ]; then
  echo -e "${GREEN}✅ Favicon (app/icon.tsx) exists${NC}"
else
  echo -e "${YELLOW}⚠️  Favicon (app/icon.tsx) not found${NC}"
  ((WARNINGS++))
fi

if [ -f "app/apple-icon.tsx" ]; then
  echo -e "${GREEN}✅ Apple icon (app/apple-icon.tsx) exists${NC}"
else
  echo -e "${YELLOW}⚠️  Apple icon (app/apple-icon.tsx) not found${NC}"
  ((WARNINGS++))
fi
echo ""

# Check middleware CSP
echo "8️⃣ Security Headers Check"
echo "----------------------"
if grep -q "worker-src 'self' blob:" middleware.ts; then
  echo -e "${GREEN}✅ CSP allows Web Workers (worker-src)${NC}"
else
  echo -e "${RED}❌ CSP missing worker-src directive${NC}"
  ((ERRORS++))
fi

if grep -q "https://vercel.live" middleware.ts; then
  echo -e "${GREEN}✅ CSP allows Vercel Live${NC}"
else
  echo -e "${YELLOW}⚠️  CSP doesn't allow Vercel Live (optional)${NC}"
  ((WARNINGS++))
fi
echo ""

# Summary
echo "=================================================="
echo "📊 Summary"
echo "=================================================="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
  echo -e "${GREEN}🎉 All checks passed! Production ready.${NC}"
  exit 0
elif [ $ERRORS -eq 0 ]; then
  echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found. Review recommended.${NC}"
  exit 0
else
  echo -e "${RED}❌ $ERRORS error(s) found. NOT production ready.${NC}"
  if [ $WARNINGS -gt 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) also found.${NC}"
  fi
  echo ""
  echo "📖 See docs/PRODUCTION-MIGRATION-GUIDE.md for migration steps"
  exit 1
fi
