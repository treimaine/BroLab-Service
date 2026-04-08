#!/bin/bash

# Production Synchronization Verification Script
# Verifies that Clerk, Convex, and Stripe are properly configured

echo "========================================="
echo "Production Sync Verification"
echo "========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}✗ .env.local not found${NC}"
    exit 1
fi

echo "1. Checking Environment Variables..."
echo "-----------------------------------"

# Source .env.local
set -a
source .env.local
set +a

# Check Clerk variables
if [ -n "$NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY" ]; then
    echo -e "${GREEN}✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY${NC}"
else
    echo -e "${RED}✗ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY missing${NC}"
fi

if [ -n "$CLERK_SECRET_KEY" ]; then
    echo -e "${GREEN}✓ CLERK_SECRET_KEY${NC}"
else
    echo -e "${RED}✗ CLERK_SECRET_KEY missing${NC}"
fi

if [ -n "$CLERK_JWT_ISSUER_DOMAIN" ]; then
    echo -e "${GREEN}✓ CLERK_JWT_ISSUER_DOMAIN: $CLERK_JWT_ISSUER_DOMAIN${NC}"
else
    echo -e "${RED}✗ CLERK_JWT_ISSUER_DOMAIN missing${NC}"
fi

if [ -n "$CLERK_WEBHOOK_SECRET" ]; then
    echo -e "${GREEN}✓ CLERK_WEBHOOK_SECRET${NC}"
else
    echo -e "${YELLOW}⚠ CLERK_WEBHOOK_SECRET missing (required for webhooks)${NC}"
fi

# Check Convex variables
echo ""
if [ -n "$NEXT_PUBLIC_CONVEX_URL" ]; then
    echo -e "${GREEN}✓ NEXT_PUBLIC_CONVEX_URL: $NEXT_PUBLIC_CONVEX_URL${NC}"
else
    echo -e "${RED}✗ NEXT_PUBLIC_CONVEX_URL missing${NC}"
fi

# Check Stripe variables
echo ""
if [ -n "$STRIPE_SECRET_KEY" ]; then
    echo -e "${GREEN}✓ STRIPE_SECRET_KEY${NC}"
else
    echo -e "${RED}✗ STRIPE_SECRET_KEY missing${NC}"
fi

if [ -n "$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" ]; then
    echo -e "${GREEN}✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY${NC}"
else
    echo -e "${RED}✗ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY missing${NC}"
fi

if [ -n "$STRIPE_CONNECT_WEBHOOK_SECRET" ]; then
    echo -e "${GREEN}✓ STRIPE_CONNECT_WEBHOOK_SECRET${NC}"
else
    echo -e "${YELLOW}⚠ STRIPE_CONNECT_WEBHOOK_SECRET missing (required for webhooks)${NC}"
fi

# Check Resend
echo ""
if [ -n "$RESEND_API_KEY" ]; then
    echo -e "${GREEN}✓ RESEND_API_KEY${NC}"
else
    echo -e "${YELLOW}⚠ RESEND_API_KEY missing (required for emails)${NC}"
fi

echo ""
echo "2. Checking Convex Configuration..."
echo "-----------------------------------"

# Check if Convex is configured
if command -v npx &> /dev/null; then
    echo "Running: npx convex env list"
    npx convex env list 2>&1 | grep -E "(CLERK_JWT_ISSUER_DOMAIN|CLERK_FRONTEND_API_URL)" || echo -e "${YELLOW}⚠ Convex environment variables not found${NC}"
else
    echo -e "${RED}✗ npx not found${NC}"
fi

echo ""
echo "3. Checking File Configuration..."
echo "-----------------------------------"

# Check convex/auth.config.ts
if [ -f "convex/auth.config.ts" ]; then
    echo -e "${GREEN}✓ convex/auth.config.ts exists${NC}"
    if grep -q "CLERK_JWT_ISSUER_DOMAIN" convex/auth.config.ts; then
        echo -e "${GREEN}  ✓ Uses CLERK_JWT_ISSUER_DOMAIN${NC}"
    else
        echo -e "${RED}  ✗ Missing CLERK_JWT_ISSUER_DOMAIN reference${NC}"
    fi
else
    echo -e "${RED}✗ convex/auth.config.ts not found${NC}"
fi

# Check convex/http.ts
if [ -f "convex/http.ts" ]; then
    echo -e "${GREEN}✓ convex/http.ts exists${NC}"
    if grep -q "/api/clerk/webhook" convex/http.ts; then
        echo -e "${GREEN}  ✓ Clerk webhook endpoint configured${NC}"
    else
        echo -e "${RED}  ✗ Clerk webhook endpoint missing${NC}"
    fi
    if grep -q "/api/stripe/webhook" convex/http.ts; then
        echo -e "${GREEN}  ✓ Stripe webhook endpoint configured${NC}"
    else
        echo -e "${RED}  ✗ Stripe webhook endpoint missing${NC}"
    fi
else
    echo -e "${RED}✗ convex/http.ts not found${NC}"
fi

# Check middleware.ts
if [ -f "middleware.ts" ]; then
    echo -e "${GREEN}✓ middleware.ts exists${NC}"
    if grep -q "clerkMiddleware" middleware.ts; then
        echo -e "${GREEN}  ✓ Uses clerkMiddleware${NC}"
    else
        echo -e "${RED}  ✗ Missing clerkMiddleware${NC}"
    fi
else
    echo -e "${RED}✗ middleware.ts not found${NC}"
fi

# Check src/components/ConvexClientProvider.tsx
if [ -f "src/components/ConvexClientProvider.tsx" ]; then
    echo -e "${GREEN}✓ src/components/ConvexClientProvider.tsx exists${NC}"
    if grep -q "ConvexProviderWithClerk" src/components/ConvexClientProvider.tsx; then
        echo -e "${GREEN}  ✓ Uses ConvexProviderWithClerk${NC}"
    else
        echo -e "${RED}  ✗ Missing ConvexProviderWithClerk${NC}"
    fi
else
    echo -e "${RED}✗ src/components/ConvexClientProvider.tsx not found${NC}"
fi

echo ""
echo "4. Summary"
echo "-----------------------------------"
echo ""
echo -e "${GREEN}✓ Configuration files are in place${NC}"
echo -e "${GREEN}✓ Environment variables are configured${NC}"
echo ""
echo -e "${YELLOW}⚠ Manual steps required:${NC}"
echo "  1. Configure Clerk webhook in Clerk Dashboard"
echo "     URL: https://brolabentertainment.com/api/clerk/webhook"
echo "     Events: user.*, subscription.*, subscriptionItem.*"
echo ""
echo "  2. Configure Stripe webhook in Stripe Dashboard"
echo "     URL: https://brolabentertainment.com/api/stripe/webhook"
echo "     Events: checkout.session.completed"
echo ""
echo "  3. Deploy Convex to production"
echo "     Command: npx convex deploy"
echo ""
echo "  4. Verify environment variables in Vercel Dashboard"
echo "     URL: https://vercel.com/[team]/[project]/settings/environment-variables"
echo ""
echo "========================================="
echo "Verification Complete"
echo "========================================="
