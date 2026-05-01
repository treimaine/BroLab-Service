# Team Variables Security Checklist

**Owner:** CTO  
**Status:** Daily Reference Guide  
**Date:** 2026-05-01  
**Issue:** BRO-218 Variables Production / Development

---

## 🎯 Use This Checklist Every Day

Copy and paste this into your daily workflow. It takes 2 minutes.

---

## ✅ Before You Start Coding

### Step 1: Verify Development Credentials (30 seconds)

```bash
# Do you have .env.local with TEST credentials?
cat .env.local | head -5

# You should see:
✅ STRIPE_SECRET_KEY=sk_test_...          (starts with sk_test_)
✅ CLERK_SECRET_KEY=test_...              (starts with test_)
✅ CONVEX_DEPLOYMENT=dev_...              (contains "dev")
✅ RESEND_API_KEY=...                     (any value is fine)

# If you see sk_live_ or prod_ → STOP → Tell CTO immediately
```

### Step 2: Verify .env.local Is Protected (30 seconds)

```bash
# Is .env.local in .gitignore?
grep "\.env\.local" .gitignore

# Should output:
✅ .env.local                             (or *.env.local or .env.*)

# If NOT → Tell CTO (security issue)
```

### Step 3: Clear to Code (30 seconds)

```bash
# Run your dev server
npm run dev

# You're ready to code safely
```

---

## ✅ While You're Coding

### Rule 1: Never Hardcode Secrets

```javascript
// ❌ WRONG (hardcoded)
const stripe = require('stripe')('sk_test_1234567890')

// ✅ CORRECT (from environment)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY)
```

**Check your code:**
```bash
# Search for hardcoded keys
git diff | grep -E "sk_test_|sk_live_|STRIPE_|CLERK_"

# Should find NOTHING (only variable names, not values)
```

### Rule 2: Don't Log Secrets

```javascript
// ❌ WRONG (logs the actual secret)
console.log('Stripe key:', process.env.STRIPE_SECRET_KEY)

// ✅ CORRECT (logs that it exists)
console.log('Stripe key loaded:', !!process.env.STRIPE_SECRET_KEY)

// ✅ CORRECT (logs a masked version)
const key = process.env.STRIPE_SECRET_KEY
console.log('Stripe key:', key.substring(0, 7) + '...')
```

**Check your code:**
```bash
# Search for logs of environment variables
git diff | grep "console\.log.*process\.env"

# Should find NOTHING (no logs of actual values)
```

### Rule 3: Keep .env.local Out of Commits

```bash
# Check what you're about to commit
git status

# .env.local should NOT appear in "Changes to be committed:"
# If it does:
git restore .env.local  # Undo the change
```

### Rule 4: Use Test Credentials for Testing

```javascript
// When testing payments locally:
// ✅ Use Stripe test card: 4242 4242 4242 4242
// ✅ Use test Clerk project (not production)
// ✅ Use dev Convex deployment (not production)

// Production credentials should NEVER be in your code changes
```

---

## ✅ Before You Push Code

### Pre-Push Security Check (2 minutes)

```bash
# 1. See what you're about to push
git log origin/main..HEAD --oneline

# 2. Check for .env.local in any commits
git diff origin/main..HEAD -- .env.local

# Should return NOTHING (no .env.local changes)

# 3. Check for hardcoded secrets
git diff origin/main..HEAD | grep -E "sk_test_|sk_live_|STRIPE_|CLERK_|SECRET"

# Should find ONLY variable names, NOT values

# 4. Safe to push
git push origin my-feature-branch
```

---

## ✅ Code Review Checklist

**For whoever reviews your code:**

```bash
# 1. Does the code use process.env correctly?
grep -r "STRIPE_SECRET_KEY\|CLERK_SECRET_KEY" src/
# Should only show references to process.env.VARIABLE_NAME

# 2. No hardcoded secrets?
grep -r "sk_test_\|sk_live_" src/
# Should return NOTHING

# 3. No .env.local committed?
git log --name-only | grep ".env.local"
# Should return NOTHING

# ✅ Code is safe
```

---

## 🚨 If Something Goes Wrong

### I accidentally committed .env.local

```bash
# 1. Tell CTO immediately (Slack/email)
# 2. Don't push yet - undo locally first
git restore .env.local

# 3. CTO will rotate credentials as precaution
```

### I accidentally pasted a production key in Slack/email

```bash
# 1. Tell CTO immediately via private message
# 2. CTO will rotate the key (30 minute process)
# 3. No big deal if reported quickly
# 4. System works normally after rotation
```

### My local tests are failing

```bash
# 1. Check .env.local has all required variables
cat .env.local | grep STRIPE_SECRET_KEY
cat .env.local | grep CLERK_SECRET_KEY

# 2. Make sure they're test credentials (sk_test_)
# 3. Restart dev server (variables load on startup)
npm run dev

# 4. Still failing? Ask CTO (no shame, we help)
```

### I don't have access to Vercel

```bash
# Ask CEO or Lead Engineer to add you:
# Settings → Team Members → BroLab Entertainment

# Then verify access:
# https://vercel.com/dashboard/team/brolabentertainment
```

---

## 📋 Weekly Check (Every Friday)

**CTO runs this to verify team compliance:**

```bash
# 1. Any .env.local files committed?
git log --all --oneline --grep="env.local\|.env\|secret"

# Should return NOTHING (no secret commits)

# 2. Any hardcoded secrets in recent code?
git log HEAD~20..HEAD -p | grep -E "sk_test_|sk_live_|STRIPE_SECRET|CLERK_SECRET"

# Should find NOTHING

# 3. Team members reported any security concerns?
# (Check BRO-218 issue for team feedback)

# ✅ All clear = team is compliant
```

---

## 🎯 Team Responsibility Matrix

| Task | Your Responsibility | CTO Responsibility |
|------|---------------------|-------------------|
| Use test credentials locally | ✅ You | - |
| Don't commit .env.local | ✅ You | - |
| Don't hardcode secrets | ✅ You | - |
| Don't log environment values | ✅ You | - |
| Tell CTO if you see secrets | ✅ You | - |
| Monitor for accidental commits | - | ✅ CTO |
| Rotate credentials if exposed | - | ✅ CTO |
| Verify team compliance | - | ✅ CTO |
| Manage Vercel access | - | ✅ CTO |

---

## ✨ Quick Reference Card

**Print this or keep it open:**

```
🟢 SAFE TO DO:
✅ Use test credentials locally
✅ Test payment flows with 4242 4242 4242 4242
✅ Test authentication locally
✅ Commit code (just not .env.local)
✅ Ask CTO questions about security

🔴 NEVER DO:
❌ Copy production keys to your machine
❌ Commit .env.local to Git
❌ Paste keys in Slack/email/docs
❌ Hardcode any credential values
❌ Log environment variable values
❌ Use production data for testing

🚨 IF YOU MESS UP:
📣 Tell CTO immediately
⏱️ Credentials will be rotated (30 minutes)
✅ System works normally after
🆗 You're not in trouble, we handle it

📚 READ FIRST:
→ VARIABLES-GUIDE-PRODUCTION-VS-DEVELOPMENT.md
→ CREDENTIAL-ACCESS-FRAMEWORK.md
→ VARIABLES-ONBOARDING-NEW-TEAM-MEMBERS.md
```

---

## 📚 References

- **Main Guide:** [VARIABLES-GUIDE-PRODUCTION-VS-DEVELOPMENT.md](./VARIABLES-GUIDE-PRODUCTION-VS-DEVELOPMENT.md)
- **Framework:** [CREDENTIAL-ACCESS-FRAMEWORK.md](./CREDENTIAL-ACCESS-FRAMEWORK.md)
- **Onboarding:** [VARIABLES-ONBOARDING-NEW-TEAM-MEMBERS.md](./VARIABLES-ONBOARDING-NEW-TEAM-MEMBERS.md)
- **Emergency:** Tell CTO immediately (no exceptions)

---

## ✅ Team Confirmation

**Team:** Print this checklist, bookmark it, use it daily.

**CTO:** Will verify compliance weekly via GitHub commit history.
