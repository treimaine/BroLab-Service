# New Team Member: Variables Onboarding Guide

**Owner:** CTO  
**Status:** Onboarding Checklist  
**Date:** 2026-05-01  
**Issue:** BRO-218 Variables Production / Development

---

## 👋 Welcome to BroLab Entertainment!

This guide gets you set up with the right credentials in 10 minutes.

**Timeline:**
- 5 minutes: Get Vercel access
- 3 minutes: Set up .env.local
- 2 minutes: Verify everything works

**By the end:** You can run the app locally with test credentials.

---

## ✅ Step 1: Get Vercel Access (5 minutes)

### 1.1 Create a Vercel Account (if you don't have one)

```
Go to: https://vercel.com/signup
Use your work email
```

### 1.2 Ask for Team Access

**Slack message to CTO:**
```
@CTO Hi! I just joined the team and need Vercel access 
for BroLab Entertainment project. 
My Vercel email is: yourname@email.com
```

**What CTO does:**
- Adds you to the BroLab Entertainment team on Vercel
- Takes ~5 minutes
- Will confirm when done

### 1.3 Verify Access Works

Once CTO confirms, test your access:

```
1. Go to: https://vercel.com/dashboard
2. Look for "BroLab Entertainment" in the project list
3. Click on it
4. Go to Settings → Environment Variables
5. You should see production variables (don't copy them yet)
```

**If you can't see it:**
- Refresh the page
- Log out and log back in
- Tell CTO (might need to resend invite)

**Congratulations!** You now have access to production configuration.

---

## ✅ Step 2: Set Up .env.local (3 minutes)

### 2.1 Copy Production Variables Locally

**Only do this if you need to test locally** (you probably do)

```
1. Go to: https://vercel.com/dashboard
2. Select "BroLab Entertainment" project
3. Go to Settings → Environment Variables
4. You'll see:
   - STRIPE_SECRET_KEY
   - CLERK_SECRET_KEY
   - CONVEX_DEPLOYMENT
   - RESEND_API_KEY
   - UPSTASH_REDIS_REST_URL
   - UPSTASH_REDIS_REST_TOKEN
```

**Copy the variable names and their VALUES locally:**

```bash
# In your project root, create .env.local
cat > .env.local << 'EOF'
STRIPE_SECRET_KEY=sk_test_xxxx...        (copy value from Vercel)
CLERK_SECRET_KEY=test_xxxx...             (copy value from Vercel)
CONVEX_DEPLOYMENT=xxxx...                 (copy value from Vercel)
RESEND_API_KEY=xxxx...                    (copy value from Vercel)
UPSTASH_REDIS_REST_URL=xxxx...            (copy value from Vercel)
UPSTASH_REDIS_REST_TOKEN=xxxx...          (copy value from Vercel)
EOF
```

### 2.2 CRITICAL: Verify You Have TEST Credentials

```bash
# Check the values
cat .env.local

# Verify:
✅ STRIPE_SECRET_KEY starts with "sk_test_" (not "sk_live_")
✅ CLERK_SECRET_KEY starts with "test_" (not "prod_")
✅ CONVEX_DEPLOYMENT contains "dev" or "test" (not "prod")

# If you see sk_live_ or prod_:
❌ DO NOT USE THESE LOCALLY
❌ Tell CTO immediately
❌ We have separate test credentials for development
```

### 2.3 Verify .env.local Is Protected

```bash
# Check that .env.local is in .gitignore
cat .gitignore | grep "env.local"

# Should show:
✅ .env.local

# If NOT there:
❌ Tell CTO (this is a safety issue)
```

**Why this matters:**
- If `.env.local` is NOT in `.gitignore`, you might accidentally commit production credentials to GitHub
- That would be a security incident
- CTO will rotate credentials if this happens
- So verify NOW before you make your first commit

---

## ✅ Step 3: Test It Works (2 minutes)

### 3.1 Install Dependencies (first time only)

```bash
npm install
```

### 3.2 Run the App

```bash
npm run dev
```

**You should see:**
```
> ready - started server on 0.0.0.0:3000, url: http://localhost:3000
```

### 3.3 Test a Feature

**Test Authentication:**
1. Go to http://localhost:3000/sign-up
2. Try signing up with a test email
3. Should work (you're using test Clerk credentials)

**Test Payments (if needed):**
1. Go to checkout flow
2. Use test card: `4242 4242 4242 4242`
3. Any future expiration date (e.g., 12/25)
4. Any 3-digit CVC (e.g., 123)
5. Should process (you're using test Stripe credentials)

**Congratulations!** Everything works.

---

## 🚨 Critical Security Rules

### Rule 1: Never Commit .env.local

Before every commit:

```bash
# Check what you're about to push
git status

# .env.local should NOT appear in "Changes to be committed:"
# If it does:
git restore .env.local
git reset HEAD .env.local
```

### Rule 2: Never Use Production Credentials Locally

```bash
# Your .env.local should have TEST values
✅ STRIPE_SECRET_KEY=sk_test_...  (test, safe to lose)
❌ STRIPE_SECRET_KEY=sk_live_...  (real money, DON'T USE)

# If you accidentally see sk_live_ anywhere:
→ Tell CTO immediately
→ Don't use it
→ We'll rotate it as a precaution
```

### Rule 3: Don't Share Credentials

```bash
❌ Don't paste in Slack
❌ Don't email team members
❌ Don't put in documents
❌ Don't log to console

✅ All credentials are in Vercel
✅ Everyone accesses via Vercel dashboard
✅ No sharing, no copy-paste, no email
```

### Rule 4: Report Issues Immediately

If something goes wrong:

```
❌ Accidentally saw a production key?
→ Tell CTO immediately
→ No punishment, we rotate credentials

❌ Accidentally committed something?
→ Tell CTO immediately
→ No punishment, we fix it

❌ Struggling with setup?
→ Ask CTO for help
→ No question is dumb

✅ Report early = problem solved in minutes
✅ Hide it = might become a security issue
```

---

## 📚 Read These Next

Read in this order:

1. **[VARIABLES-GUIDE-PRODUCTION-VS-DEVELOPMENT.md](./VARIABLES-GUIDE-PRODUCTION-VS-DEVELOPMENT.md)**
   - Understand prod vs. dev clearly
   - Learn why each rule exists
   - Know what to do if things go wrong

2. **[TEAM-VARIABLES-SECURITY-CHECKLIST.md](./TEAM-VARIABLES-SECURITY-CHECKLIST.md)**
   - Print this and use daily
   - Reference before every commit
   - Take 2 minutes per day

3. **[CREDENTIAL-ACCESS-FRAMEWORK.md](./CREDENTIAL-ACCESS-FRAMEWORK.md)**
   - Deeper technical details
   - How Vercel environment variables work
   - What to do if you need to rotate credentials

---

## ❓ Troubleshooting

### Problem: "App won't start, says 'Missing environment variable'"

**Solution:**
```bash
# 1. Check .env.local exists
ls -la .env.local

# 2. Check it has the variable
grep STRIPE_SECRET_KEY .env.local

# 3. Restart dev server
# Stop: Ctrl+C
# Start: npm run dev
```

### Problem: "I can't access Vercel"

**Solution:**
```
1. Make sure you have a Vercel account
2. Make sure CTO added you to BroLab Entertainment team
3. Try: https://vercel.com/dashboard/team/brolabentertainment
4. If still can't access, tell CTO
```

### Problem: "The payment test didn't work"

**Solution:**
```bash
# 1. Check you have test Stripe credentials
grep STRIPE_SECRET_KEY .env.local
# Should show: sk_test_...

# 2. Use the correct test card
# Card: 4242 4242 4242 4242
# Expiry: Any future date (e.g., 12/25)
# CVC: Any 3 digits (e.g., 123)

# 3. If still failing, CTO will debug with you
```

### Problem: "I see 'sk_live_' in production and I'm worried"

**Solution (Tell CTO immediately):**
```
Don't worry! Just report it via Slack:
→ "CTO, I saw sk_live_ somewhere and I'm not sure if it's safe"

CTO will:
1. Check if it was exposed
2. Rotate the credential as a precaution (30 minutes)
3. Verify all systems still work
4. You're good to continue

This happens, it's handled, no big deal.
```

---

## 📋 Onboarding Checklist

**Complete this before your first commit:**

- [ ] Created Vercel account
- [ ] Got added to BroLab Entertainment team
- [ ] Can access Vercel → Settings → Environment Variables
- [ ] Created .env.local with values from Vercel
- [ ] Verified .env.local has TEST credentials (sk_test_)
- [ ] Verified .env.local is in .gitignore
- [ ] Ran `npm install` successfully
- [ ] Ran `npm run dev` successfully
- [ ] Tested a feature locally (sign up or payment)
- [ ] Read [VARIABLES-GUIDE-PRODUCTION-VS-DEVELOPMENT.md](./VARIABLES-GUIDE-PRODUCTION-VS-DEVELOPMENT.md)
- [ ] Understand the difference between prod and dev
- [ ] Know NOT to commit .env.local
- [ ] Know to tell CTO if I see a production key

**Once complete:**
- Comment on BRO-218 issue with "Onboarding complete"
- CTO will verify and close out your setup

---

## 🎯 Your First Week

### Day 1
- Set up .env.local
- Get app running locally
- Test one feature
- Read the main guide (30 minutes)

### Days 2-5
- Make code changes normally
- Use the security checklist before each commit
- Ask questions if anything is unclear
- Build familiarity with the codebase

### End of Week
- You're fully on-boarded
- You understand the security model
- You're ready to contribute independently

---

## 📞 Who to Ask

**For Vercel access issues:**
- CTO will add you to the team

**For .env.local setup:**
- CTO can help if something isn't working
- Ask in team Slack

**For general questions:**
- Read the main guide (VARIABLES-GUIDE-...)
- Check the security checklist
- Ask CTO (no question is dumb)

**For security concerns:**
- Tell CTO immediately
- Even if you're not sure, report it
- We'd rather rotate a key than have an exposure

---

## ✨ You're Ready!

You now have:
- ✅ Access to Vercel dashboard
- ✅ Test credentials in .env.local
- ✅ A working development environment
- ✅ Knowledge of security rules
- ✅ A support network (CTO)

**Welcome to the team!** 🎉

Comment on BRO-218 when you complete this onboarding.
