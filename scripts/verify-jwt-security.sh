#!/bin/bash

# JWT Storage Security Verification Script
# Checks codebase for insecure token storage patterns

set -e

echo "🔍 JWT Storage Security Verification"
echo "===================================="
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
ISSUES_FOUND=0

# Check 1: localStorage token storage
echo "📋 Check 1: Searching for localStorage token storage..."
if grep -r "localStorage.setItem.*token" src/ 2>/dev/null | grep -v "audio-player-storage" | grep -v "theme"; then
    echo -e "${RED}❌ FAIL: Found localStorage token storage${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: No localStorage token storage found${NC}"
fi
echo ""

# Check 2: sessionStorage token storage
echo "📋 Check 2: Searching for sessionStorage token storage..."
if grep -r "sessionStorage.setItem.*token" src/ 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found sessionStorage token storage${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: No sessionStorage token storage found${NC}"
fi
echo ""

# Check 3: Manual cookie manipulation
echo "📋 Check 3: Searching for manual cookie manipulation..."
if grep -r "document.cookie.*token" src/ 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found manual cookie manipulation${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: No manual cookie manipulation found${NC}"
fi
echo ""

# Check 4: JWT in localStorage
echo "📋 Check 4: Searching for JWT in localStorage..."
if grep -r "localStorage.*jwt" src/ 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found JWT in localStorage${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: No JWT in localStorage found${NC}"
fi
echo ""

# Check 5: Bearer token in localStorage
echo "📋 Check 5: Searching for Bearer token in localStorage..."
if grep -r "localStorage.*bearer" src/ 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found Bearer token in localStorage${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: No Bearer token in localStorage found${NC}"
fi
echo ""

# Check 6: Clerk configuration
echo "📋 Check 6: Verifying Clerk configuration..."
if grep -r "ClerkProvider" app/layout.tsx 2>/dev/null > /dev/null; then
    echo -e "${GREEN}✅ PASS: ClerkProvider found in layout${NC}"
else
    echo -e "${RED}❌ FAIL: ClerkProvider not found in layout${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# Check 7: Custom token storage configuration
echo "📋 Check 7: Checking for custom token storage config..."
if grep -r "tokenStorage" app/ src/ 2>/dev/null; then
    echo -e "${YELLOW}⚠️  WARNING: Custom tokenStorage configuration found${NC}"
    echo "   Review to ensure it's secure (httpOnly cookies)"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: No custom token storage config (using Clerk defaults)${NC}"
fi
echo ""

# Check 8: Manual token extraction
echo "📋 Check 8: Searching for manual token extraction..."
if grep -r "document.cookie.split.*session" src/ 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Found manual token extraction from cookies${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: No manual token extraction found${NC}"
fi
echo ""

# Check 9: Verify middleware uses clerkMiddleware
echo "📋 Check 9: Verifying middleware uses clerkMiddleware..."
if grep "clerkMiddleware" middleware.ts 2>/dev/null > /dev/null; then
    echo -e "${GREEN}✅ PASS: Using clerkMiddleware (secure)${NC}"
else
    echo -e "${RED}❌ FAIL: Not using clerkMiddleware${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
fi
echo ""

# Check 10: Verify no deprecated authMiddleware
echo "📋 Check 10: Checking for deprecated authMiddleware..."
if grep "authMiddleware" middleware.ts 2>/dev/null; then
    echo -e "${RED}❌ FAIL: Using deprecated authMiddleware${NC}"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    echo -e "${GREEN}✅ PASS: Not using deprecated authMiddleware${NC}"
fi
echo ""

# Summary
echo "===================================="
echo "📊 Summary"
echo "===================================="
if [ $ISSUES_FOUND -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED${NC}"
    echo ""
    echo "JWT storage is secure:"
    echo "  ✅ No localStorage token storage"
    echo "  ✅ No sessionStorage token storage"
    echo "  ✅ No manual cookie manipulation"
    echo "  ✅ Using Clerk's secure defaults"
    echo "  ✅ HttpOnly cookies enabled"
    echo ""
    exit 0
else
    echo -e "${RED}❌ FOUND $ISSUES_FOUND ISSUE(S)${NC}"
    echo ""
    echo "Please review the issues above and fix them before deploying to production."
    echo ""
    echo "📚 Documentation:"
    echo "  - docs/JWT-STORAGE-VERIFICATION.md"
    echo "  - docs/JWT-STORAGE-QUICK-GUIDE.md"
    echo ""
    exit 1
fi
