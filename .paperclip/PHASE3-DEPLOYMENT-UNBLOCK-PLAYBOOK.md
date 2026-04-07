# Phase 3 Deployment Unblock Playbook

**Status**: 🔴 CRITICAL BLOCKER - Production Deployment Required  
**Priority**: CRITICAL - Blocks all Phase 3 campaign execution  
**Timeline**: URGENT - Solution needed TODAY to meet 9 AM campaign start  
**Date Created**: 2026-04-07  
**Last Updated**: 2026-04-07  

---

## Executive Summary

Phase 3 campaign materials (Twitter/X, DM Outreach, Reddit) are **100% ready** but cannot execute because the website is currently configured for `http://localhost:3000` only. **A single action is needed: uncomment the production URL in environment config and deploy.**

---

## The Blocker (1-minute read)

### Current Configuration
```
.env.local (line 15):  NEXT_PUBLIC_SITE_URL=http://localhost:3000  ← ACTIVE
.env.local (line 17):  # NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com  ← COMMENTED
```

### Impact
- Growth Lead cannot share public signup link in campaigns
- Twitter/X posts can't include shareable URL
- Direct producer DMs can't send signup link  
- Reddit comments can't reference public platform

### Solution
1. **Uncomment** production URL in environment config
2. **Build** with updated config
3. **Deploy** to production
4. **Verify** signup/checkout work on production URL

---

## For Lead Engineer (30-minute execution)

### Prerequisites Check (2 minutes)
- [ ] Production infrastructure is ready (Convex, Clerk, Stripe, Resend, Redis)
- [ ] Current code is production-ready (BRO-103 validation: 95% confidence)
- [ ] You have commit/deploy access to production environment

### Step 1: Update Environment Config (2 minutes)

**Location**: `.env.local` (lines 14-17)

**Current**:
```env
# local
NEXT_PUBLIC_SITE_URL=http://localhost:3000
# prod
#NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com
```

**Change To**:
```env
# local
# NEXT_PUBLIC_SITE_URL=http://localhost:3000
# prod
NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com
```

**Or in your production environment config** (Vercel/Docker/.env.production):
```
NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com
```

### Step 2: Build (5 minutes)
```bash
npm run build
```

Wait for build to complete. Expected: **No errors**

### Step 3: Deploy (15 minutes)
Use your deployment process (Vercel, Docker, etc.)

**Expected**: Deployment succeeds, build artifacts pushed to production

### Step 4: Verify Production Signup Page (3 minutes)

**Test 1: Page Loads**
- [ ] Navigate to: `https://brolabentertainment.com/sign-up`
- [ ] Page loads without errors
- [ ] Clerk auth widget appears
- [ ] No 404 or server errors in browser console

**Test 2: Signup Flow**
- [ ] Click "Sign up"
- [ ] Create test account (email: test@example.com)
- [ ] Verify redirect after signup works
- [ ] Check browser console for JavaScript errors

### Step 5: Test Checkout Flow (5 minutes)

**Test 3: Marketplace Access**
- [ ] Navigate to: `https://brolabentertainment.com/marketplace`
- [ ] Sign in with test account
- [ ] Page loads and displays beats

**Test 4: Purchase Process**
- [ ] Find any beat and click purchase
- [ ] Stripe checkout modal should appear
- [ ] Use test card: `4242 4242 4242 4242`
- [ ] Enter any future expiration date and any 3-digit CVC
- [ ] Click "Pay"
- [ ] Verify checkout completes (shows success message)

**Test 5: Order Creation**
- [ ] Check Convex dashboard
- [ ] Verify new order record was created with correct amount
- [ ] Confirm order status is "completed"

### Step 6: Verify Email & Webhooks (2 minutes)

**Test 6: Email Delivery**
- [ ] Check Resend dashboard
- [ ] Verify confirmation email was sent to test@example.com
- [ ] Confirm email content looks correct (order details, amount, etc.)

**Test 7: Webhook Processing**
- [ ] Return to Convex dashboard
- [ ] Verify webhook idempotency entry was created
- [ ] Check for no duplicate order records

### Step 7: Confirm Status (1 minute)

Once all tests pass, **reply to CTO with confirmation**:

```
✅ DEPLOYMENT VERIFIED

Production URL: https://brolabentertainment.com
Signup link: https://brolabentertainment.com/sign-up

Testing Results:
✅ Signup page loads and Clerk auth works
✅ Checkout flow tested end-to-end (test card processed)
✅ Order created in Convex database
✅ Email confirmation delivered via Resend
✅ Webhook processing verified (no duplicates)

Status: READY FOR CAMPAIGN EXECUTION
```

---

## For CTO (Verification & Coordination)

### Upon Receiving Lead Engineer Confirmation

**Step 1: Verify Production Link (5 minutes)**
1. Navigate to `https://brolabentertainment.com/sign-up`
2. Test signup flow with independent test account
3. Test checkout with different test card (generate new test card from Stripe dashboard)
4. Verify order appears in Convex dashboard

**Step 2: Communicate to Growth Lead (2 minutes)**
Post confirmation message:
```
✅ DEPLOYMENT COMPLETE & VERIFIED

Production signup link is now LIVE and ready for campaigns:
https://brolabentertainment.com/sign-up

All systems verified:
✅ Signup page working
✅ Checkout flow operational  
✅ Email confirmations delivering
✅ Database orders processing correctly

STATUS: Ready to execute Phase 3 campaigns immediately

Growth Lead can now:
- Launch BRO-124 (Twitter/X posts)
- Execute BRO-125 (Producer DM outreach)
- Begin BRO-126 (Reddit community engagement)

Contact CTO if any technical issues arise.
```

**Step 3: Monitor for Issues (ongoing)**
- Watch for webhook processing errors
- Monitor payment failures
- Check email delivery success rate
- Be available for technical support

---

## Timeline

- **Lead Engineer deployment**: ~30 minutes
- **CTO verification**: ~5 minutes
- **Growth Lead notification**: Immediate upon verification
- **Campaign execution can begin**: Same day

---

## Communication Channels

- **Lead Engineer**: Coordinate directly with CTO on deployment status
- **Growth Lead**: Wait for CTO confirmation before beginning campaigns
- **CTO**: Monitor deployment, verify, and coordinate team communication

---

## Success Criteria

✅ **Task Complete When**:
1. Production URL is live
2. Signup page loads at production domain
3. Checkout flow works end-to-end
4. Orders are created in database
5. Emails are delivered
6. Growth Lead has confirmed the public signup link
7. Campaign execution has begun

---

## Risk Mitigation

**If deployment takes longer than expected**:
- Growth Lead can begin BRO-125 (DM outreach) - doesn't require public link yet
- Growth Lead can prepare BRO-126 (Reddit setup) - can do tonight
- Once link is ready, Twitter campaign can execute (even if delayed 2-3 hours)

**If checkout fails**:
1. Check Stripe credentials are correct
2. Verify webhook is forwarding properly
3. Check browser console for JavaScript errors
4. Contact CTO for support

---

## Reference Documentation

- **Code Validation**: `.paperclip/BRO-103-VALIDATION-REPORT.md` (95% confidence system is ready)
- **Lead Engineer Checklist**: `.paperclip/LEAD-ENG-DEPLOYMENT-CHECKLIST.md` (detailed steps)
- **CTO Blocker Analysis**: `.paperclip/CTO-PHASE3-BLOCKER-STATUS.md` (context and analysis)
- **CTO Coordination**: `.paperclip/CTO-DEPLOYMENT-COORDINATION.md` (full coordination plan)
- **Env Template**: `.env.local.TEMPLATE` (reference config)

---

## Next Steps

1. **Lead Engineer**: Execute deployment steps 1-7
2. **CTO**: Verify and communicate confirmation
3. **Growth Lead**: Begin Phase 3 campaign execution upon confirmation
4. **Team**: Monitor Phase 3 metrics daily

---

**Created by**: CTO  
**Status**: Ready for Lead Engineer execution  
**Blocking**: BRO-124, BRO-125, BRO-126, BRO-127  
**Related**: BRO-95 (Phase 3 Execution)
