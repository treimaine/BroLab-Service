# Security Verification Guide

Quick guide for developers to verify security before deploying to production.

---

## Quick Verification Commands

### JWT Storage Security

```bash
# Run automated verification script
npm run security:jwt

# Expected output: ✅ ALL CHECKS PASSED
```

### Security Tests (Playwright)

```bash
# Run all security tests
npm run test:security

# Run specific JWT storage tests
npx playwright test tests/security/jwt-storage.spec.ts

# Run with UI mode (interactive)
npx playwright test tests/security/jwt-storage.spec.ts --ui
```

---

## Manual Verification Steps

### 1. Browser DevTools Check

1. Open your app in the browser
2. Open DevTools (F12)
3. Go to **Application** → **Cookies**
4. Check `.clerk.accounts.dev` domain
5. Verify `__client_uat` has **HttpOnly** flag ✅

### 2. Console Check

Open browser console and run:

```javascript
// Check localStorage (should NOT contain auth tokens)
console.log(localStorage)
// Expected: Only UI preferences (audio-player-storage, theme)

// Check accessible cookies
console.log(document.cookie)
// Expected: __session (short-lived, OK)
// NOT expected: __client_uat (httpOnly, secure)
```

### 3. Network Tab Check

1. Open DevTools → **Network** tab
2. Sign in to the app
3. Check the sign-in request
4. Look at **Response Headers**
5. Verify `Set-Cookie` headers have:
   - `HttpOnly` flag ✅
   - `SameSite=Lax` ✅
   - `Secure` flag (in production) ✅

---

## Pre-Deployment Checklist

Before deploying to production, verify:

### JWT Storage Security
- [ ] Run `npm run security:jwt` → All checks pass ✅
- [ ] Run `npm run test:security` → All tests pass ✅
- [ ] Verify httpOnly cookies in browser DevTools ✅
- [ ] No JWT tokens in localStorage ✅
- [ ] No JWT tokens in sessionStorage ✅

### Clerk Configuration
- [ ] `ClerkProvider` in `app/layout.tsx` ✅
- [ ] Using `clerkMiddleware()` (not deprecated `authMiddleware`) ✅
- [ ] No custom `tokenStorage` configuration ✅
- [ ] HTTPS enforced in production ✅

### Environment Variables
- [ ] All development secrets rotated ✅
- [ ] Production secrets configured ✅
- [ ] `.env.local` not committed to git ✅
- [ ] `.env.example` up to date ✅

### Security Headers (Task #10)
- [ ] HSTS headers configured
- [ ] CSP headers configured
- [ ] X-Frame-Options configured
- [ ] X-Content-Type-Options configured

---

## Troubleshooting

### Issue: `npm run security:jwt` fails

**Possible causes:**
1. localStorage contains auth tokens
2. Manual cookie manipulation in code
3. Custom token storage configuration

**Solution:**
1. Review the failed check output
2. Search codebase for the pattern mentioned
3. Remove insecure token storage
4. Use Clerk's hooks instead

### Issue: Tests fail with "Cookie not found"

**Possible causes:**
1. Not signed in during test
2. Clerk configuration issue
3. Environment variables missing

**Solution:**
1. Check Clerk environment variables
2. Verify Clerk Dashboard configuration
3. Review test setup in `jwt-storage.spec.ts`

### Issue: httpOnly flag not set

**Possible causes:**
1. Custom Clerk configuration overriding defaults
2. Development environment (some flags only in production)
3. Clerk version issue

**Solution:**
1. Remove custom `tokenStorage` configuration
2. Verify Clerk version is up to date
3. Check Clerk Dashboard settings

---

## Documentation Reference

### Quick Start
- [JWT Storage Quick Guide](./JWT-STORAGE-QUICK-GUIDE.md) - 5-minute read

### Detailed Reports
- [JWT Storage Verification Report](./JWT-STORAGE-VERIFICATION.md) - Complete analysis
- [JWT Storage Architecture Diagram](./JWT-STORAGE-DIAGRAM.md) - Visual guide

### Testing
- [JWT Storage Security Tests](../tests/security/jwt-storage.spec.ts) - Automated tests

### Main Reports
- [Security Audit Report](./SECURITY-AUDIT-REPORT.md) - Full security audit
- [Task #3 Completion Summary](./TASK-3-COMPLETION-SUMMARY.md) - Task details

---

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Security Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run JWT security verification
        run: npm run security:jwt
      
      - name: Run security tests
        run: npm run test:security
```

### Pre-commit Hook Example

```bash
#!/bin/bash
# .git/hooks/pre-commit

echo "Running security checks..."

# Run JWT security verification
npm run security:jwt

if [ $? -ne 0 ]; then
    echo "❌ Security checks failed. Commit aborted."
    exit 1
fi

echo "✅ Security checks passed."
exit 0
```

---

## Monitoring in Production

### Clerk Dashboard

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Select your application
3. Navigate to **Sessions**
4. Monitor active sessions
5. Check for suspicious activity

### Security Alerts

Set up alerts for:
- Unusual number of failed sign-in attempts
- Sessions from unexpected locations
- Token refresh failures
- Webhook signature verification failures

### Regular Audits

Schedule regular security audits:
- **Weekly:** Run `npm run security:jwt`
- **Monthly:** Review Clerk Dashboard sessions
- **Quarterly:** Full security audit
- **Before major releases:** Complete security checklist

---

## Support

### Internal Resources
- [Security Documentation](./security/README.md)
- [Tech Stack](./tech.md)
- [Official Docs Rules](./official-docs.md)

### External Resources
- [Clerk Security Documentation](https://clerk.com/docs/guides/secure/overview)
- [OWASP Security Cheat Sheets](https://cheatsheetseries.owasp.org/)
- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/security)

---

**Last Updated:** 2026-04-04  
**Status:** JWT Storage Security Verified ✅
