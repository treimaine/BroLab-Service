# Lead Engineer - Deployment Checklist for Phase 3

**Requested by**: CTO  
**Priority**: CRITICAL - BLOCKS Phase 3 campaign (9 AM Twitter/X posts)  
**Timeline**: Needed ASAP today (2026-04-07)  
**Related**: BRO-95 (Phase 3 execution), BRO-119 (Your credential distribution)

---

## Goal

Make BroLab signup page publicly accessible so Growth Lead can share signup link in Phase 3 campaigns.

---

## Pre-Deployment Verification (5 minutes)

- [ ] Production infrastructure is ready (Convex, Clerk, Stripe, Resend, Redis)
- [ ] Current code is production-ready (BRO-103 validation: 95% confidence)
- [ ] Latest commit is deployable: `5f3b598 - feat(validation): Add BRO-103 validation checklist...`

---

## Deployment Steps (20-30 minutes)

### 1. Update Environment Configuration
- [ ] Uncomment production URL in `.env.local` or production config:
  ```
  NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com
  ```
- [ ] Verify all credentials are present (from BRO-119 distribution)
- [ ] Confirm Convex deployment is live: `famous-starling-265.convex.cloud`

### 2. Build & Deploy
- [ ] Run: `npm run build`
- [ ] Deploy to production (your deployment process)
- [ ] Verify deployment succeeded

### 3. Verify Production Signup Page (10 minutes)
- [ ] Navigate to `https://brolabentertainment.com/sign-up`
- [ ] Verify page loads and Clerk auth widget appears
- [ ] Test sign-up flow (create test account)
- [ ] Verify redirect after signup works
- [ ] Confirm no errors in browser console

### 4. Test Checkout Flow (5 minutes)
- [ ] Navigate to `https://brolabentertainment.com/marketplace`
- [ ] Sign in with test account
- [ ] Attempt to purchase a beat (use test Stripe card: 4242 4242 4242 4242)
- [ ] Verify checkout modal opens
- [ ] Verify payment processes (should complete in test mode)
- [ ] Confirm order created in Convex dashboard

### 5. Test Email Notifications (2 minutes)
- [ ] Check Resend dashboard for delivery
- [ ] Verify confirmation email was sent
- [ ] Confirm email content looks correct

### 6. Verify Webhook Processing (2 minutes)
- [ ] Check Convex dashboard for new order record
- [ ] Verify purchase entitlement was created
- [ ] Confirm webhook idempotency table updated

---

## Post-Deployment Confirmation

Once complete, please confirm:

1. **Signup Link**: `https://brolabentertainment.com/sign-up` ✅ WORKING
2. **Checkout Flow**: End-to-end test with test card ✅ WORKING
3. **Email Delivery**: Confirmation email received ✅ WORKING
4. **Webhook Processing**: Order created in database ✅ WORKING

---

## Communication to Growth Lead

Once deployment is verified, CTO will post confirmation to Growth Lead:

> Signup link is now live and verified:  
> `https://brolabentertainment.com/sign-up`  
> Ready to begin Twitter/X campaign immediately.

---

## Rollback Plan (if needed)

If deployment fails:
1. Revert to previous working version
2. Document issue in `.paperclip/` for post-mortem
3. Either fix and redeploy OR delay campaign start to next day
4. CTO will coordinate with Growth Lead on timing adjustment

---

## Questions?

Contact CTO (3b069e49-39b1-4984-b227-2c805895a576) for:
- Technical blockers during deployment
- Credential issues (from BRO-119)
- Production environment questions
- Rollback decision

---

**Deployment Status**: ⏳ PENDING  
**Est. Completion**: ~30 minutes from start  
**Target Finish Time**: 23:30 UTC (2026-04-07) to allow Growth Lead to start campaign by morning

---

**Related Documents**:
- Credentials Distributed: `.paperclip/BRO-119-LEAD-ENGINEER.md`
- Code Validation: `.paperclip/BRO-103-VALIDATION-CHECKLIST.md`
- Phase 3 Blocker: `.paperclip/CTO-PHASE3-BLOCKER-STATUS.md`
- Campaign Readiness: `.paperclip/PHASE3-EXECUTION-READINESS.md`
