#!/bin/bash

# 📊 BroLab Entertainment - Metrics Comparison Script
# Compare before/after metrics for package updates

set -e

echo "📊 BroLab Entertainment - Metrics Comparison"
echo "==========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if baseline files exist
if [ ! -f "docs/build-time-baseline.txt" ]; then
    error "Baseline metrics not found. Run check-updates.sh first."
    exit 1
fi

echo "📋 Collecting current metrics..."
echo ""

# Build time
info "Measuring build time..."
START_TIME=$(date +%s)
npm run build > /dev/null 2>&1 || true
END_TIME=$(date +%s)
CURRENT_BUILD_TIME=$((END_TIME - START_TIME))

# Bundle size
info "Measuring bundle size..."
if [ -d ".next/static" ]; then
    CURRENT_BUNDLE_SIZE=$(du -sh .next/static | cut -f1)
else
    CURRENT_BUNDLE_SIZE="N/A"
fi

# Type check time
info "Measuring type check time..."
START_TIME=$(date +%s)
npm run typecheck > /dev/null 2>&1 || true
END_TIME=$(date +%s)
CURRENT_TYPECHECK_TIME=$((END_TIME - START_TIME))

echo ""
echo "📊 Comparison Results"
echo "===================="
echo ""

# Build time comparison
BASELINE_BUILD_TIME=$(cat docs/build-time-baseline.txt)
BASELINE_BUNDLE_SIZE=$(cat docs/bundle-size-baseline.txt 2>/dev/null || echo "N/A")

echo "🏗️  Build Time:"
echo "  Baseline: ${BASELINE_BUILD_TIME}s"
echo "  Current:  ${CURRENT_BUILD_TIME}s"

if [ "$CURRENT_BUILD_TIME" -le "$BASELINE_BUILD_TIME" ]; then
    DIFF=$((BASELINE_BUILD_TIME - CURRENT_BUILD_TIME))
    success "Improved by ${DIFF}s"
elif [ "$CURRENT_BUILD_TIME" -le $((BASELINE_BUILD_TIME + BASELINE_BUILD_TIME / 10)) ]; then
    DIFF=$((CURRENT_BUILD_TIME - BASELINE_BUILD_TIME))
    warning "Increased by ${DIFF}s (within 10% tolerance)"
else
    DIFF=$((CURRENT_BUILD_TIME - BASELINE_BUILD_TIME))
    error "Increased by ${DIFF}s (exceeds 10% tolerance)"
fi
echo ""

# Bundle size comparison
echo "📦 Bundle Size:"
echo "  Baseline: ${BASELINE_BUNDLE_SIZE}"
echo "  Current:  ${CURRENT_BUNDLE_SIZE}"

if [ "$CURRENT_BUNDLE_SIZE" != "N/A" ] && [ "$BASELINE_BUNDLE_SIZE" != "N/A" ]; then
    # Convert to KB for comparison (rough)
    BASELINE_KB=$(echo $BASELINE_BUNDLE_SIZE | sed 's/[^0-9]//g')
    CURRENT_KB=$(echo $CURRENT_BUNDLE_SIZE | sed 's/[^0-9]//g')
    
    if [ "$CURRENT_KB" -le "$BASELINE_KB" ]; then
        success "Bundle size maintained or reduced"
    elif [ "$CURRENT_KB" -le $((BASELINE_KB + BASELINE_KB / 20)) ]; then
        warning "Bundle size increased slightly (within 5% tolerance)"
    else
        error "Bundle size increased significantly (exceeds 5% tolerance)"
    fi
else
    info "Bundle size comparison not available"
fi
echo ""

# Type check time
echo "🔍 Type Check Time:"
echo "  Current: ${CURRENT_TYPECHECK_TIME}s"
if [ ${CURRENT_TYPECHECK_TIME} -le 30 ]; then
    success "Type check is fast"
elif [ ${CURRENT_TYPECHECK_TIME} -le 60 ]; then
    warning "Type check is acceptable"
else
    error "Type check is slow (>60s)"
fi
echo ""

# Package count
echo "📦 Package Count:"
TOTAL_DEPS=$(npm list --depth=0 2>/dev/null | grep -c "├─\|└─" || echo "N/A")
PROD_DEPS=$(cat package.json | grep -A 100 '"dependencies"' | grep -c '"' || echo "N/A")
DEV_DEPS=$(cat package.json | grep -A 100 '"devDependencies"' | grep -c '"' || echo "N/A")

echo "  Total installed: ${TOTAL_DEPS}"
echo "  Production: ${PROD_DEPS}"
echo "  Development: ${DEV_DEPS}"
echo ""

# Security check
echo "🔒 Security Check:"
info "Running npm audit..."
AUDIT_OUTPUT=$(npm audit --json 2>/dev/null || echo '{"vulnerabilities":{}}')
CRITICAL=$(echo $AUDIT_OUTPUT | grep -o '"critical":[0-9]*' | grep -o '[0-9]*' || echo "0")
HIGH=$(echo $AUDIT_OUTPUT | grep -o '"high":[0-9]*' | grep -o '[0-9]*' || echo "0")
MODERATE=$(echo $AUDIT_OUTPUT | grep -o '"moderate":[0-9]*' | grep -o '[0-9]*' || echo "0")

if [ "$CRITICAL" -eq 0 ] && [ "$HIGH" -eq 0 ]; then
    success "No critical or high vulnerabilities"
elif [ "$CRITICAL" -eq 0 ]; then
    warning "Found $HIGH high vulnerabilities (run 'npm audit' for details)"
else
    error "Found $CRITICAL critical vulnerabilities (run 'npm audit fix')"
fi
echo ""

# Save current as new baseline
echo "💾 Saving current metrics as new baseline..."
echo "$CURRENT_BUILD_TIME" > docs/build-time-baseline.txt
echo "$CURRENT_BUNDLE_SIZE" > docs/bundle-size-baseline.txt
success "Metrics saved"
echo ""

# Generate report
REPORT_FILE="docs/metrics-comparison-$(date +%Y%m%d-%H%M%S).txt"
cat > "$REPORT_FILE" << EOF
BroLab Entertainment - Metrics Comparison Report
Generated: $(date)

BUILD TIME
----------
Baseline: ${BASELINE_BUILD_TIME}s
Current:  ${CURRENT_BUILD_TIME}s
Change:   $((CURRENT_BUILD_TIME - BASELINE_BUILD_TIME))s

BUNDLE SIZE
-----------
Baseline: ${BASELINE_BUNDLE_SIZE}
Current:  ${CURRENT_BUNDLE_SIZE}

TYPE CHECK
----------
Time: ${CURRENT_TYPECHECK_TIME}s

PACKAGES
--------
Total:       ${TOTAL_DEPS}
Production:  ${PROD_DEPS}
Development: ${DEV_DEPS}

SECURITY
--------
Critical:  ${CRITICAL}
High:      ${HIGH}
Moderate:  ${MODERATE}
EOF

success "Report saved to: $REPORT_FILE"
echo ""

echo "✅ Comparison Complete!"
echo ""
echo "Summary:"
echo "- Build time: $((CURRENT_BUILD_TIME - BASELINE_BUILD_TIME))s difference"
echo "- Full report: $REPORT_FILE"
echo ""

if [ "$CRITICAL" -gt 0 ] || [ $((CURRENT_BUILD_TIME - BASELINE_BUILD_TIME)) -gt $((BASELINE_BUILD_TIME / 10)) ]; then
    warning "Review recommended - some metrics need attention"
else
    success "All metrics are within acceptable ranges"
fi
