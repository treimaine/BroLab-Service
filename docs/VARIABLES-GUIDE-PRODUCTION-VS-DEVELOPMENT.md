# Production vs. Development Variables Guide

**Owner:** CTO  
**Status:** Team Guide - Read This First  
**Date:** 2026-05-01  
**Issue:** BRO-218 Variables Production / Development

---

## ⚡ Quick Summary (Read This First)

| **Aspect** | **Development** | **Production** |
|-----------|-----------------|-----------------|
| **Where** | Your local machine `.env.local` | Vercel dashboard |
| **Access** | Only you see them | Vercel team can see them |
| **Risk Level** | Low (only local) | **HIGH - real customers, real money** |
| **Change Frequency** | Often (test new features) | Rarely (only if needed) |
| **Mistakes** | Won't affect customers | **Will break payments/auth for all customers** |
| **What to Do** | Test freely, experiment | Follow checklist before any change |

---

## 🎯 Key Rule

**PRODUCTION VARIABLES ARE NOT DEVELOPMENT VARIABLES**

- 🟢 **Development:** Use test credentials, experiment, make mistakes, it's fine
- 🔴 **Production:** Use real credentials, no experiments, follow the checklist, one mistake = customer impact

---

## 📍 Where Are They?

### Development Variables (Your Local Machine)

**File:** `.env.local` in your project root

```bash
# Your .env.local file (NEVER commit this)
STRIPE_SECRET_KEY=sk_test_xxxx...      # Test Stripe credentials
CLERK_SECRET_KEY=test_clerk_xxxx...    # Test Clerk credentials
CONVEX_DEPLOYMENT=...                   # Test Convex database
RESEND_API_KEY=test_resend_xxx...       # Test email service
```

**Who can see it:**
- ✅ Only you (your machine)
- ✅ Only your local terminal
- ❌ NOT on GitHub (protected by .gitignore)
- ❌ NOT on other team members' machines

**When to use:**
- Testing new features locally
- Running tests on your machine
- Debugging issues before pushing to production

---

### Production Variables (Vercel Dashboard)

**Location:** https://vercel.com → BroLab Entertainment → Settings → Environment Variables

```bash
# Vercel Production Variables (real customer data)
STRIPE_SECRET_KEY=sk_live_xxxx...      # Real Stripe account
CLERK_SECRET_KEY=prod_clerk_xxxx...    # Real user authentication
CONVEX_DEPLOYMENT=...                   # Real customer database
RESEND_API_KEY=prod_resend_xxx...       # Real customer emails
```

**Who can see it:**
- ✅ Team members with Vercel access (CEO, CTO, Lead Engineer)
- ✅ Vercel platform (for deployment)
- ❌ NOT in `.env.local` (that's for development only)
- ❌ NOT in Git commits
- ❌ NOT in Slack, email, or documents

**When to use:**
- Never copy to your local machine unless necessary for debugging
- Only access when troubleshooting production issues
- Always log what you accessed and why

---

## 🚨 The Three Critical Variables to Protect

### 1. STRIPE_SECRET_KEY

**What it controls:** Customer payments, billing, refunds

**Danger if exposed:**
- ❌ Attacker can charge real customers
- ❌ Attacker can refund their own purchases (steal money)
- ❌ Attacker can access payment history

**How to use safely:**
- 🟢 Development: Use `sk_test_...` credentials (Stripe testing)
- 🔴 Production: Never expose `sk_live_...`

**Daily checklist:**
- [ ] `.env.local` only has `sk_test_...` (test key)
- [ ] Never commit `.env.local` to Git
- [ ] Don't paste Stripe keys in Slack/email
- [ ] If you accidentally saw production key, notify CTO immediately

---

### 2. CLERK_SECRET_KEY

**What it controls:** User authentication, password reset, session tokens

**Danger if exposed:**
- ❌ Attacker can create fake user accounts
- ❌ Attacker can reset any user's password
- ❌ Attacker can impersonate users

**How to use safely:**
- 🟢 Development: Use test Clerk project (separate credentials)
- 🔴 Production: Keep in Vercel only

**Daily checklist:**
- [ ] Using test credentials for local development
- [ ] `.env.local` never committed
- [ ] Never paste Clerk keys in documents

---

### 3. CONVEX_DEPLOYMENT

**What it controls:** Database access, customer data, order history

**Danger if exposed:**
- ❌ Attacker can read all customer data
- ❌ Attacker can modify orders, delete records
- ❌ Attacker can lock you out of database

**How to use safely:**
- 🟢 Development: Use dev Convex deployment
- 🔴 Production: Keep in Vercel only

**Daily checklist:**
- [ ] Using dev deployment locally
- [ ] Production deployment never in `.env.local`

---

## ✅ Daily Workflow: Development

### When You Start Work

```bash
# 1. Make sure you have .env.local with TEST credentials only
cat .env.local
# Should show: STRIPE_SECRET_KEY=sk_test_...
#              CLERK_SECRET_KEY=test_clerk_...

# 2. Run your app
npm run dev

# 3. Test with test credentials
# Everything you do locally is on TEST servers
# No real customers affected
```

### When You Make Changes

```bash
# ✅ Safe to do:
- Change code that uses environment variables
- Test payment flows with test cards
- Test authentication with test users
- Add new environment variables to .env.local (test values only)

# ❌ Never do:
- Commit .env.local
- Use real customer data
- Copy production secrets to .env.local
- Push code that logs environment variables
```

### When You're Done

```bash
# 1. Don't commit .env.local
git status
# .env.local should NOT appear in "Changes to be committed"

# 2. If you accidentally see a production key, tell CTO
# We'll rotate it as a precaution

# 3. Push your code (without secrets)
git push origin my-feature-branch
```

---

## 🚀 Deployment: Production

### When Lead Engineer Deploys

**NO MANUAL WORK NEEDED** for environment variables

```bash
# This is what happens (automated):
1. Code pushed to GitHub
2. Vercel detects changes
3. Vercel uses production variables from dashboard
4. App deploys with real credentials (automatically)
5. All systems use production data
```

**Your responsibility:**
- ✅ Make sure code doesn't hardcode any secrets
- ✅ Use `process.env.VARIABLE_NAME` pattern
- ✅ Never log environment variables
- ✅ Tell CTO if you need to check production logs

---

## 🔒 Security Rules (Non-Negotiable)

### Rule #1: Production Keys Stay in Vercel Only
- ❌ Never copy `sk_live_...` to your machine
- ❌ Never paste in Slack/email/documents
- ❌ Never commit to Git
- ✅ Access only via Vercel dashboard when needed

### Rule #2: Development Keys Are For Testing Only
- ✅ Use `sk_test_...` (Stripe testing)
- ✅ Use test Clerk project
- ✅ Use dev Convex deployment
- ❌ Never use production keys locally

### Rule #3: Accidents Happen → Tell Someone
- ✅ Accidentally saw a production key? Tell CTO immediately
- ✅ Accidentally committed a key? Tell CTO immediately
- ✅ Found a hardcoded key? Tell CTO immediately
- ❌ Don't hide it, don't ignore it, don't worry about getting in trouble

**Why:** We rotate keys if exposed. It takes 30 minutes. No big deal if caught early.

### Rule #4: You're Never Alone
- ✅ Questions about production variables? Ask CTO
- ✅ Unsure if something is safe? Ask CTO
- ✅ Debugging production issue? CTO will help access logs safely
- ❌ No such thing as a "dumb question"

---

## 🔍 How to Check You're Doing It Right

### Check #1: Verify Your .env.local
```bash
# Open your .env.local and verify:
cat .env.local

# Should see TEST credentials only:
STRIPE_SECRET_KEY=sk_test_...       # ✅ CORRECT (test key)
CLERK_SECRET_KEY=test_xxxx...        # ✅ CORRECT (test key)
CONVEX_DEPLOYMENT=dev_xxxx...        # ✅ CORRECT (dev only)

# Should NOT see production keys:
STRIPE_SECRET_KEY=sk_live_...        # ❌ WRONG
CLERK_SECRET_KEY=prod_xxxx...        # ❌ WRONG
```

### Check #2: Verify You Haven't Committed
```bash
# Before pushing, check:
git status

# Should show:
# modified: src/my-file.ts
# (no .env.local listed)

# If you see .env.local, undo it:
git restore .env.local
```

### Check #3: Verify Code Doesn't Log Keys
```bash
# Search your changes for console logs of secrets:
git diff | grep "STRIPE_SECRET_KEY\|CLERK_SECRET_KEY"

# Should return nothing (no matches)
# If it finds matches, remove those console.log statements
```

---

## 🆘 Troubleshooting

### Problem: "My app says 'Missing environment variable'"

**Cause:** Likely a typo in `.env.local`

**Fix:**
```bash
# 1. Check .env.local has the variable
cat .env.local | grep STRIPE_SECRET_KEY

# 2. Check spelling matches code
grep STRIPE_SECRET_KEY src/**/*.ts

# 3. Restart dev server (environment variables load on startup)
npm run dev
```

### Problem: "Test payment is failing locally"

**Cause:** Wrong test credentials

**Fix:**
```bash
# 1. Verify you have sk_test_ (not sk_live_)
grep STRIPE_SECRET_KEY .env.local

# 2. Use a valid Stripe test card:
#    4242 4242 4242 4242 (visa)
#    12/25 (any future date)
#    123 (any CVC)
```

### Problem: "I accidentally pasted a production key somewhere"

**Action:** Tell CTO immediately via Slack/Email

**What happens:**
- CTO rotates the key (30 min process)
- System works normally after rotation
- No big deal if reported quickly
- Big deal if hidden

---

## 📚 References & Next Steps

### Read Next
- **[CREDENTIAL-ACCESS-FRAMEWORK.md](./CREDENTIAL-ACCESS-FRAMEWORK.md)** — How to access Vercel variables
- **[TEAM-VARIABLES-SECURITY-CHECKLIST.md](./TEAM-VARIABLES-SECURITY-CHECKLIST.md)** — Daily checklist
- **[VARIABLES-ONBOARDING-NEW-TEAM-MEMBERS.md](./VARIABLES-ONBOARDING-NEW-TEAM-MEMBERS.md)** — For new hires

### For CTO/Lead Engineer
- **[CREDENTIAL-SECURITY-CHECKLIST.md](./CREDENTIAL-SECURITY-CHECKLIST.md)** — Audit results
- **[BRO-212-CREDENTIAL-ROTATION-CHECKLIST-2026-05-01.md](./BRO-212-CREDENTIAL-ROTATION-CHECKLIST-2026-05-01.md)** — If rotation needed

### For Emergency
- Tell CTO if you see/expose production keys
- Notify immediately (no punishment, we rotate keys as precaution)

---

## ✅ Team Confirmation

**Team:** Once you've read this, confirm in the BRO-218 issue comment:
- [ ] I understand the difference between production and development variables
- [ ] I know where development variables live (`.env.local`)
- [ ] I know where production variables live (Vercel dashboard)
- [ ] I know what `sk_test_` vs `sk_live_` means
- [ ] I know NOT to commit `.env.local`
- [ ] I know to tell CTO if I accidentally see a production key

**CTO Verification:** Will follow up with each team member this week.
