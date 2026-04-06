# BroLab Production Release Checklist

**Purpose:** Ensure every production release meets quality, security, and operational standards.

**Owner:** QA Lead  
**Approval Required:** QA Lead + CEO (for major releases)

---

## Pre-Release Checklist

### 1. Code Quality ✓

- [ ] All unit tests passing (`npm run test`)
- [ ] All integration tests passing
- [ ] All E2E tests passing (`npm run test:e2e`)
- [ ] Security tests passing (`npm run test:security`)
- [ ] Code coverage ≥80%
- [ ] No TypeScript errors (`npm run typecheck`)
- [ ] No ESLint errors (`npm run lint`)
- [ ] No console.log or debugger statements in production code
- [ ] Build succeeds without warnings (`npm run build`)

### 2. Feature Validation ✓

- [ ] All new features tested manually
- [ ] User stories acceptance criteria met
- [ ] Edge cases tested
- [ ] Error handling verified
- [ ] Loading states and feedback implemented
- [ ] Feature flags configured (if applicable)

### 3. Payment & Monetization (If Changes) ✓

- [ ] Stripe test mode checkout works
- [ ] Stripe production mode checkout works
- [ ] 0% commission model verified (producer gets 100%)
- [ ] Webhook signature verification tested
- [ ] Refund flow tested (if applicable)
- [ ] Payout schedule correct
- [ ] Tax calculation verified (if applicable)
- [ ] Receipt generation working

### 4. Authentication & Security ✓

- [ ] JWT tokens stored in httpOnly cookies (verified)
- [ ] No tokens in localStorage/sessionStorage
- [ ] Session timeout working
- [ ] Sign-in flow tested
- [ ] Sign-up flow tested
- [ ] Password reset tested (if changed)
- [ ] Multi-device session handling verified
- [ ] CORS configuration correct
- [ ] API rate limiting active
- [ ] No exposed secrets or API keys

### 5. Audio Processing (If Changes) ✓

- [ ] Beat upload works (WAV, MP3, FLAC)
- [ ] File size limits enforced (100MB max)
- [ ] Audio preview generation working
- [ ] Download links functional
- [ ] High-quality audio preserved
- [ ] Metadata extraction correct (BPM, key, duration)
- [ ] Waveform visualization working
- [ ] Audio player controls functional

### 6. Database & Data Integrity ✓

- [ ] Convex schema changes applied to staging
- [ ] Database migrations tested (if applicable)
- [ ] Data validation rules enforced
- [ ] No data loss in migration
- [ ] Backup/restore tested (if schema change)
- [ ] Foreign key relationships intact
- [ ] Indexes optimized

### 7. Performance ✓

- [ ] Lighthouse Performance score ≥85
- [ ] Page load times meet targets (<3s p95)
- [ ] API response times meet targets (<400ms p95)
- [ ] No memory leaks (checked in DevTools)
- [ ] Images optimized (next/image)
- [ ] Bundle size acceptable (<500KB main bundle)
- [ ] No blocking JavaScript
- [ ] Core Web Vitals passing (LCP, FID, CLS)

### 8. Cross-Browser Compatibility ✓

- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile Safari (iOS)
- [ ] Mobile Chrome (Android)

### 9. Responsive Design ✓

- [ ] Desktop (1920x1080)
- [ ] Laptop (1366x768)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667, iPhone SE)
- [ ] Mobile (414x896, iPhone 12)
- [ ] Large screens (2560x1440)

### 10. Accessibility ✓

- [ ] Keyboard navigation works
- [ ] Focus indicators visible
- [ ] ARIA labels present
- [ ] Screen reader tested (NVDA or VoiceOver)
- [ ] Color contrast ratio ≥4.5:1
- [ ] Alt text on images
- [ ] Form validation accessible

### 11. Third-Party Integrations ✓

**Stripe**
- [ ] API keys correct (production)
- [ ] Webhooks configured
- [ ] Connect accounts working

**Clerk**
- [ ] Production instance configured
- [ ] JWT templates correct
- [ ] Webhook endpoints active

**Convex**
- [ ] Production deployment synced
- [ ] Environment variables set
- [ ] Functions deployed

**Email (Resend)**
- [ ] API key set
- [ ] Email templates working
- [ ] Delivery confirmed

### 12. Environment Configuration ✓

- [ ] All `.env.local` variables documented in `.env.example`
- [ ] Production environment variables set in Vercel
- [ ] No hardcoded credentials
- [ ] API URLs correct (production endpoints)
- [ ] Feature flags configured
- [ ] Sentry/error tracking enabled

### 13. Deployment Readiness ✓

- [ ] Staging deployment successful
- [ ] Smoke tests passed on staging
- [ ] Rollback plan documented
- [ ] Database backup taken (if schema change)
- [ ] Deployment time estimate: _____ minutes
- [ ] Team notified of deployment window
- [ ] Monitoring alerts configured

### 14. Documentation ✓

- [ ] Changelog updated
- [ ] API documentation updated (if API changes)
- [ ] README updated (if setup changes)
- [ ] User-facing docs updated (if UI/UX changes)
- [ ] Known issues documented

### 15. Post-Deploy Monitoring ✓

- [ ] Error tracking active (Sentry/LogRocket)
- [ ] Performance monitoring active
- [ ] Uptime monitoring active
- [ ] Stripe webhook monitoring active
- [ ] Alert channels verified (Slack/email)

---

## Release Types

### Minor Release (Weekly)
- Bug fixes
- Small features
- Performance improvements
- **Approval:** QA Lead

### Major Release (Monthly)
- New features
- Breaking changes
- Major refactors
- **Approval:** QA Lead + CEO

### Hotfix (Emergency)
- P0 critical bugs
- Security vulnerabilities
- **Approval:** QA Lead (CEO notified)

---

## Pre-Deploy Actions

1. **Create Release Branch**
   ```bash
   git checkout -b release/v1.2.3
   git push origin release/v1.2.3
   ```

2. **Tag Release**
   ```bash
   git tag -a v1.2.3 -m "Release v1.2.3: [Brief description]"
   git push origin v1.2.3
   ```

3. **Update Changelog**
   - Add release notes to `CHANGELOG.md`
   - List new features, fixes, and breaking changes

4. **Deploy to Staging**
   - Verify deployment successful
   - Run smoke tests

5. **Final Approval**
   - QA Lead sign-off
   - CEO approval (if major release)

---

## Deploy to Production

### Vercel Deployment

```bash
# Automatic deployment via GitHub
git push origin main

# Or manual deployment
npm run build
vercel --prod
```

### Post-Deploy Verification (First 15 Minutes)

- [ ] Home page loads
- [ ] Sign-in works
- [ ] Producer dashboard loads
- [ ] Beat upload works
- [ ] Checkout flow works (test purchase)
- [ ] Tenant storefront loads
- [ ] No JavaScript errors in console
- [ ] API responses normal (<400ms)
- [ ] Error rate normal (<0.1%)

### Post-Deploy Monitoring (First 24 Hours)

- [ ] Monitor error logs
- [ ] Check performance metrics
- [ ] Review user feedback
- [ ] Monitor payment success rate
- [ ] Check audio delivery success

---

## Rollback Procedure

### When to Rollback
- P0 bug discovered
- Error rate >5%
- Payment processing failure
- Authentication broken
- Data integrity issue

### Rollback Steps

1. **Immediate Rollback (Vercel)**
   ```bash
   vercel rollback
   ```

2. **Or Redeploy Previous Version**
   ```bash
   git revert HEAD
   git push origin main
   ```

3. **Database Rollback (If Needed)**
   - Restore from backup
   - Run rollback migration

4. **Post-Rollback**
   - Notify team
   - Document issue
   - Create hotfix plan

---

## Release Sign-Off

**Release Version:** v_______  
**Release Date:** __________  
**Release Type:** ☐ Minor ☐ Major ☐ Hotfix

**QA Lead Approval:**
- Name: _______________
- Date: _______________
- Signature: _______________

**CEO Approval (Major Releases):**
- Name: _______________
- Date: _______________
- Signature: _______________

---

## Post-Release Review (Within 7 Days)

- [ ] Review production metrics
- [ ] Analyze user feedback
- [ ] Document issues found
- [ ] Update QA process (if needed)
- [ ] Celebrate successful release! 🎉

---

**Last Updated:** 2026-04-06  
**Version:** 1.0  
**Maintained By:** QA Lead
