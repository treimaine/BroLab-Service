# Secure Credential Access Framework

**Owner:** Lead Engineer  
**Status:** Implementation Guide for Team  
**Date:** 2026-05-01  

---

## Overview

This document defines the secure pattern for accessing production credentials via Vercel environment variables. **All team members must follow this pattern to prevent credential leakage.**

---

## 🚫 What NOT to Do

❌ **DO NOT hardcode credentials in `.env.local`**  
❌ **DO NOT commit credentials to git**  
❌ **DO NOT include credentials in documentation**  
❌ **DO NOT share credentials via email or chat**  
❌ **DO NOT log credentials in console output**  

---

## ✅ Secure Pattern: Vercel Environment Variables

### For Local Development

1. **Never create `.env.local` with hardcoded values**
2. **Access Vercel Dashboard:**
   - Navigate to: https://vercel.com/dashboard
   - Select "BroLab Entertainment" project
   - Go to Settings → Environment Variables
   - Copy production values locally for testing

3. **Load via process.env (Node.js automatically loads from .env.local)**
   ```javascript
   const stripeKey = process.env.STRIPE_SECRET_KEY
   const clerkSecret = process.env.CLERK_SECRET_KEY
   ```

### For Production (Vercel Deployment)

1. **All credentials stored in Vercel Environment Variables**
   - No `.env.local` needed
   - Vercel injects environment variables at runtime
   - Access pattern is identical: `process.env.VARIABLE_NAME`

2. **Credentials are automatically available to:**
   - API routes (`/api/*`)
   - Server components (Next.js)
   - Build-time when needed

---

## 📋 Credential Management Checklist

### Application Code Audit

- [ ] No credentials hardcoded in `.ts`, `.tsx`, `.js` files
- [ ] No credentials in `/convex` functions
- [ ] No credentials in `/api` routes (use `process.env` instead)
- [ ] No credentials in configuration files
- [ ] All imports use `process.env.VARIABLE_NAME` pattern

### .env File Audit

- [ ] `.env.local` references only (no actual values)
- [ ] `.env.example` contains placeholders only (no real values)
- [ ] `.env.test.example` contains test values only
- [ ] All .env files are in `.gitignore`

### Team Access Control

- [ ] All team members have Vercel account access
- [ ] Team members know how to access Vercel Environment Variables
- [ ] No credentials shared via email, chat, or documents
- [ ] Access revocation process established for departing team members

---

## 🔍 Current Status: Security Audit Results

### ⚠️ Issues Found

1. **`.env.local` contains hardcoded credentials**
   - File: `.env.local`
   - Status: RISK - actual secrets in file
   - Fix: Use Vercel environment variables instead

2. **Credentials visible in git history** (from BRO-211 Audit)
   - Status: Documented in BRO-211
   - Action: Monitor for unauthorized access, rotate if compromised

### ✅ Protections in Place

- `.env.local` is in `.gitignore` (prevents future commits)
- No hardcoded credentials in application code
- Webhook signatures validated correctly
- Test credentials used for development

---

## 📖 Team Onboarding: Accessing Production Credentials

### Step 1: Get Vercel Access
1. Ensure you have a Vercel account
2. Ask CEO/Lead Engineer to add you to "BroLab Entertainment" team
3. Verify you can access: https://vercel.com/dashboard/team/brolabentertainment

### Step 2: Find Credentials
1. Select "BroLab Entertainment" project
2. Go to **Settings** → **Environment Variables**
3. View production environment variables:
   - `STRIPE_SECRET_KEY` (for payments)
   - `CLERK_SECRET_KEY` (for authentication)
   - `CONVEX_*` (for database)
   - `RESEND_API_KEY` (for email)
   - `UPSTASH_*` (for caching)

### Step 3: Use in Local Development
1. Create `.env.local` in project root
2. Copy production variable names and values from Vercel
3. **Keep `.env.local` ONLY on your machine** (never commit)
4. Run `npm run dev` — credentials are automatically loaded

### Step 4: Deploy to Production
1. All credentials are already in Vercel Environment Variables
2. Vercel automatically injects them during deployment
3. No additional setup needed

---

## 🛡️ Security Best Practices

### During Development
```javascript
// ✅ CORRECT: Use environment variables
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)

// ❌ WRONG: Hardcoded credentials
const stripe = require('stripe')('sk_test_...')
```

### For New Team Members
1. Add to Vercel team in project settings
2. Provide this onboarding document
3. Verify they can access credentials via Vercel Dashboard
4. Test with a small API call (e.g., fetch current Stripe plan)

### For Credential Rotation (If Needed)
1. Only rotate if compromise is suspected
2. Follow BRO-212 rotation checklist
3. Use `scripts/validate-rotated-secrets.mjs` to verify
4. Update Vercel Environment Variables immediately
5. Verify all services still work after rotation

---

## 🔔 Incident Response

If credentials are compromised:

1. **Immediate Actions:**
   - Notify Lead Engineer and CTO
   - Document what was exposed
   - Follow BRO-212 Credential Rotation Checklist

2. **Rotation Priority (if needed):**
   1. STRIPE_SECRET_KEY
   2. STRIPE_WEBHOOK_SECRET
   3. STRIPE_CONNECT_WEBHOOK_SECRET
   4. CLERK_SECRET_KEY
   5. CLERK_WEBHOOK_SECRET

3. **Validation:**
   - Run `npm run validate-secrets` before and after
   - Test all payment flows work
   - Test all auth flows work

---

## ✅ Success Criteria (BRO-210)

- [x] Credential access pattern documented
- [x] Team onboarding guide created
- [x] Current security audit completed
- [ ] Team confirms they can access Vercel credentials
- [ ] Application code verified (no hardcoded secrets)
- [ ] All team members trained on secure access pattern

---

## References

- **BRO-211:** `docs/BRO-211-SECRETS-AUDIT-2026-05-01.md` — Exposure findings
- **BRO-212:** `docs/BRO-212-CREDENTIAL-ROTATION-CHECKLIST-2026-05-01.md` — Rotation steps
- **Vercel:** https://vercel.com/dashboard
- **Validation Script:** `scripts/validate-rotated-secrets.mjs`
