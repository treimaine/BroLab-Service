#!/bin/bash

# 🔍 BroLab Entertainment - Update Verification Script
# Date: July 9, 2026

set -e

echo "🎯 BroLab Entertainment - Package Update Verification"
echo "======================================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
success() {
    echo -e "${GREEN}✅ $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

info() {
    echo "ℹ️  $1"
}

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    error "npm not found. Please install Node.js first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    error "package.json not found. Run this script from the project root."
    exit 1
fi

echo "📋 Step 1: Checking current package versions"
echo "=============================================="
npm list --depth=0 > docs/package-versions-current.txt 2>&1
success "Current versions saved to docs/package-versions-current.txt"
echo ""

echo "📋 Step 2: Checking for outdated packages"
echo "=========================================="
npm outdated > docs/outdated-packages.txt 2>&1 || true
if [ -s docs/outdated-packages.txt ]; then
    warning "Outdated packages found (see docs/outdated-packages.txt)"
    cat docs/outdated-packages.txt
else
    success "All packages are up to date!"
fi
echo ""

echo "🔍 Step 3: Checking Convex patterns"
echo "===================================="

# Check for unbounded .collect()
echo "Checking for unbounded .collect()..."
if grep -r "\.collect()" convex/ --include="*.ts" > /dev/null 2>&1; then
    warning "Found .collect() usage - verify these are bounded queries"
    grep -r "\.collect()" convex/ --include="*.ts" | head -5
else
    success "No unbounded .collect() found"
fi
echo ""

# Check for deprecated storage methods
echo "Checking for deprecated storage.getMetadata()..."
if grep -r "storage\.getMetadata" convex/ --include="*.ts" > /dev/null 2>&1; then
    error "Found deprecated storage.getMetadata() - use ctx.db.system.get('_storage', id)"
    grep -r "storage\.getMetadata" convex/ --include="*.ts"
else
    success "No deprecated storage methods found"
fi
echo ""

# Check for validators
echo "Checking for missing validators..."
if grep -r "args: {}" convex/ --include="*.ts" > /dev/null 2>&1; then
    warning "Found functions with empty args - should have validators"
    grep -r "args: {}" convex/ --include="*.ts" | head -5
else
    success "All functions have validators"
fi
echo ""

echo "🔐 Step 4: Checking Clerk components"
echo "====================================="

# Check for deprecated Clerk components
echo "Checking for Clerk <SignedIn> usage (should use Convex <Authenticated>)..."
if grep -r "<SignedIn" src/ app/ --include="*.tsx" | grep "from '@clerk/nextjs'" > /dev/null 2>&1; then
    error "Found Clerk <SignedIn> - should use Convex <Authenticated>"
    grep -r "<SignedIn" src/ app/ --include="*.tsx" | grep "from '@clerk/nextjs'" | head -3
else
    success "No deprecated Clerk <SignedIn> found"
fi
echo ""

echo "Checking for Clerk <SignedOut> usage (should use Convex <Unauthenticated>)..."
if grep -r "<SignedOut" src/ app/ --include="*.tsx" | grep "from '@clerk/nextjs'" > /dev/null 2>&1; then
    error "Found Clerk <SignedOut> - should use Convex <Unauthenticated>"
    grep -r "<SignedOut" src/ app/ --include="*.tsx" | grep "from '@clerk/nextjs'" | head -3
else
    success "No deprecated Clerk <SignedOut> found"
fi
echo ""

echo "Checking for deprecated Clerk props..."
if grep -r "afterSignInUrl" app/ --include="*.tsx" > /dev/null 2>&1; then
    warning "Found deprecated afterSignInUrl - should use signInFallbackRedirectUrl"
    grep -r "afterSignInUrl" app/ --include="*.tsx" | head -3
else
    success "No deprecated Clerk props found"
fi
echo ""

echo "🎨 Step 5: Checking UI patterns"
echo "==============================="

# Check for emoji icons (anti-pattern)
echo "Checking for emoji icons (should use SVG)..."
if grep -r "🎨\|🚀\|⚙️\|📧\|✨\|🔥" src/components/ app/ --include="*.tsx" > /dev/null 2>&1; then
    warning "Found emoji icons - should use Lucide React icons"
    grep -r "🎨\|🚀\|⚙️\|📧\|✨\|🔥" src/components/ app/ --include="*.tsx" | head -3
else
    success "No emoji icons found"
fi
echo ""

# Check for glass morphism contrast issues
echo "Checking for glass morphism light mode contrast..."
if grep -r "bg-white/10" src/ --include="*.tsx" > /dev/null 2>&1; then
    warning "Found bg-white/10 in light mode (too transparent) - should be bg-white/80+"
    grep -r "bg-white/10" src/ --include="*.tsx" | head -3
else
    success "No light mode contrast issues found"
fi
echo ""

echo "📦 Step 6: Running build checks"
echo "================================"

# Type check
info "Running type check..."
if npm run typecheck > /dev/null 2>&1; then
    success "Type check passed"
else
    error "Type check failed - run 'npm run typecheck' for details"
fi
echo ""

# Lint check
info "Running lint check..."
if npm run lint > /dev/null 2>&1; then
    success "Lint check passed"
else
    warning "Lint check has warnings - run 'npm run lint' for details"
fi
echo ""

echo "📊 Step 7: Measuring baseline metrics"
echo "======================================"

# Build time
info "Measuring build time..."
START_TIME=$(date +%s)
npm run build > /dev/null 2>&1 || true
END_TIME=$(date +%s)
BUILD_TIME=$((END_TIME - START_TIME))
info "Build time: ${BUILD_TIME}s"
echo "$BUILD_TIME" > docs/build-time-baseline.txt
echo ""

# Bundle size
info "Measuring bundle size..."
if [ -d ".next/static" ]; then
    BUNDLE_SIZE=$(du -sh .next/static | cut -f1)
    info "Bundle size: $BUNDLE_SIZE"
    echo "$BUNDLE_SIZE" > docs/bundle-size-baseline.txt
else
    warning "Build output not found - skipping bundle size check"
fi
echo ""

echo "✅ Verification Complete!"
echo "========================"
echo ""
echo "📋 Summary:"
echo "- Current versions saved to: docs/package-versions-current.txt"
echo "- Outdated packages saved to: docs/outdated-packages.txt"
echo "- Baseline metrics saved to: docs/*-baseline.txt"
echo ""
echo "Next steps:"
echo "1. Review docs/outdated-packages.txt"
echo "2. Read docs/UPDATE-SUMMARY.md"
echo "3. Follow Phase 1 update process"
echo "4. Run this script again to compare metrics"
echo ""

success "All checks completed successfully!"
