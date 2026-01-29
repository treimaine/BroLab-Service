# Decision: Next.js Version Strategy

**Date:** January 27, 2026  
**Status:** ACTIVE  
**Decision Makers:** Development Team

## Context

We encountered a critical build bug in Next.js 16.1.1 that blocks production deployment:
- Error: "Invalid segment configuration export detected"
- Dev mode works, but production build fails
- Root cause: Bug in Next.js 16.1.1 (confirmed by successful build with 15.1.0)

See: `docs/nextjs-16-build-bug-solution.md`

## Decision

**Use Next.js 15.1.0 until Next.js 16.1.2+ is released with a fix.**

## Rationale

### Why downgrade to 15.1.0?

1. **Production deployment is blocked** - Cannot ship with broken build
2. **No workaround exists** - The error is a false positive, no code changes can fix it
3. **15.1.0 is stable** - Build works perfectly, all features we use are supported
4. **Temporary solution** - Will upgrade to 16.x when bug is fixed

### Why not stay on 16.1.1?

1. **Build fails** - Cannot deploy to production
2. **No verbose logging** - Impossible to debug further
3. **Confirmed bug** - Not our code, it's Next.js

### Why not use 16.0.0 or other 16.x versions?

1. **16.0.0 may have other bugs** - 16.1.1 was supposed to be more stable
2. **15.1.0 is proven** - We know it works with our codebase
3. **Simpler rollback** - One version to test and verify

## Consequences

### Positive

- ✅ Production builds work
- ✅ Can deploy to production
- ✅ Stable, tested version
- ✅ No code changes needed

### Negative

- ⚠️ Security vulnerability (CVE-2025-66478) in 15.1.0
  - **Mitigation:** Monitor for 16.1.2+ release, upgrade ASAP
- ⚠️ Missing Next.js 16 features
  - **Impact:** Minimal - we're not using 16-specific features yet
- ⚠️ Temporary solution
  - **Plan:** Upgrade to 16.1.2+ when available

## Implementation

```bash
# Downgrade to 15.1.0
npm install next@15.1.0 --save-exact

# Verify build works
rm -rf .next
npm run build

# Commit package.json and package-lock.json
git add package.json package-lock.json
git commit -m "fix: downgrade Next.js to 15.1.0 due to build bug in 16.1.1"
```

## Monitoring

### Watch for Next.js releases:

1. **GitHub Releases:** https://github.com/vercel/next.js/releases
2. **Next.js Blog:** https://nextjs.org/blog
3. **npm:** `npm view next versions`

### Upgrade criteria:

Upgrade to Next.js 16.x when:
- ✅ Version 16.1.2 or later is released
- ✅ Release notes mention build fixes or Turbopack improvements
- ✅ No reports of similar build errors in GitHub issues
- ✅ Test build succeeds with new version

## Review Schedule

- **Weekly:** Check for new Next.js releases
- **Monthly:** Re-evaluate if still on 15.1.0
- **On release:** Test 16.1.2+ immediately when available

## Alternatives Considered

### 1. Disable Turbopack

```json
"build": "next build --no-turbopack"
```

**Rejected because:**
- Turbopack is the future of Next.js
- Slower build times
- May have different behavior
- Still on 16.1.1 with potential other bugs

### 2. Stay on 16.1.1 and wait

**Rejected because:**
- Blocks production deployment
- No timeline for fix
- Cannot ship broken builds

### 3. Use Next.js 14.x

**Rejected because:**
- Too old, missing features
- 15.1.0 is more recent and stable
- Larger downgrade = more risk

## Related Documents

- `docs/nextjs-16-build-bug-solution.md` - Detailed bug analysis
- `docs/build-blocker-investigation.md` - Initial investigation
- `docs/task-5.5-refactoring-summary.md` - When issue was first encountered

## Approval

- [x] Development Team
- [x] Technical Lead
- [ ] Product Owner (FYI)

---

**Next Review:** February 3, 2026 (1 week)
