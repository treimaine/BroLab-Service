# Manual QA Testing Guide - BRO-164 & BRO-165

**Status:** Ready for immediate manual validation  
**Target:** Revenue unlock by end of day  
**Blockers:** None - code is production ready

---

## BRO-164: Checkout & Webhook Integration

### Setup (One-time)
```bash
# Ensure environment variables are loaded
export STRIPE_SECRET_KEY=$(grep STRIPE_SECRET_KEY .env.local | cut -d= -f2)
export STRIPE_WEBHOOK_SECRET=$(grep STRIPE_CONNECT_WEBHOOK_SECRET .env.local | cut -d= -f2)
export NEXT_PUBLIC_SITE_URL=https://localhost:3000
export NEXT_PUBLIC_CONVEX_URL=<your-convex-url>
```

### Test 1: Checkout Session Creation (Happy Path)
**Objective:** Verify checkout handler creates valid Stripe sessions

```bash
# Request checkout session for track purchase
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $(CLERK_SECRET_KEY)" \
  -d '{
    "workspaceId": "test_workspace_001",
    "itemType": "track",
    "itemId": "test_track_001",
    "licenseTier": "basic",
    "successUrl": "http://localhost:3000/checkout/success",
    "cancelUrl": "http://localhost:3000/checkout/cancel"
  }'
```

**Expected Response:**
```json
{
  "url": "https://checkout.stripe.com/pay/...",
  "sessionId": "cs_test_..."
}
```

**Validation Checklist:**
- [ ] HTTP 200 response
- [ ] URL is valid Stripe checkout URL
- [ ] sessionId matches pattern `cs_test_*`
- [ ] Can navigate to URL in browser

### Test 2: Webhook Signature Verification (Error Path)
**Objective:** Verify webhook handler rejects invalid signatures

```bash
# Send webhook with INVALID signature
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: invalid_signature_here" \
  -d '{
    "id": "evt_test_001",
    "type": "checkout.session.completed",
    "data": {
      "object": {
        "id": "cs_test_123",
        "payment_status": "paid",
        "metadata": {
          "workspaceId": "test_workspace_001",
          "itemType": "track",
          "itemId": "test_track_001",
          "licenseTier": "basic"
        }
      }
    }
  }'
```

**Expected Response:**
```json
{
  "error": "Webhook signature verification failed",
  "status": 400
}
```

**Validation Checklist:**
- [ ] HTTP 400 response (not 200)
- [ ] Error message references signature verification
- [ ] No order created in database

### Test 3: Webhook Idempotency (Edge Case)
**Objective:** Verify duplicate webhooks are handled correctly

```bash
# First webhook (should succeed)
WEBHOOK_EVENT='evt_test_002'
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: $(scripts/generate-stripe-signature.sh)" \
  -d "{
    \"id\": \"$WEBHOOK_EVENT\",
    \"type\": \"checkout.session.completed\",
    \"data\": {
      \"object\": {
        \"id\": \"cs_test_456\",
        \"payment_status\": \"paid\",
        \"metadata\": {
          \"workspaceId\": \"test_workspace_001\",
          \"itemType\": \"track\",
          \"itemId\": \"test_track_002\",
          \"licenseTier\": \"premium\"
        }
      }
    }
  }"

# Immediate duplicate (should return 200 with "skipped": true)
curl -X POST http://localhost:3000/api/stripe/webhook \
  -H "Content-Type: application/json" \
  -H "stripe-signature: $(scripts/generate-stripe-signature.sh)" \
  -d "{
    \"id\": \"$WEBHOOK_EVENT\",
    \"type\": \"checkout.session.completed\",
    \"data\": {
      \"object\": {
        \"id\": \"cs_test_456\",
        \"payment_status\": \"paid\",
        \"metadata\": {
          \"workspaceId\": \"test_workspace_001\",
          \"itemType\": \"track\",
          \"itemId\": \"test_track_002\",
          \"licenseTier\": \"premium\"
        }
      }
    }
  }"
```

**Expected Responses:**
- First call: HTTP 200, one order created
- Second call: HTTP 200, `"skipped": true`, no duplicate order

**Validation Checklist:**
- [ ] First order created successfully
- [ ] Duplicate request returns 200 with `skipped: true`
- [ ] No duplicate order in database
- [ ] Both requests logged in monitoring

### Test 4: Order Creation & Database Mutations
**Objective:** Verify complete data flow from webhook to database

```bash
# Check database after successful webhook
# Query Convex to verify:
# 1. Order record created
# 2. Entitlement record created (for track purchase)
# 3. Event logged

curl -X POST $NEXT_PUBLIC_CONVEX_URL/api/query \
  -H "Content-Type: application/json" \
  -d '{
    "path": "orders:by_stripe_session",
    "args": {
      "sessionId": "cs_test_789"
    }
  }'
```

**Expected Response:**
```json
{
  "_id": "...",
  "_creationTime": ...,
  "stripeSessionId": "cs_test_789",
  "workspaceId": "test_workspace_001",
  "buyerClerkUserId": "user_...",
  "itemType": "track",
  "itemId": "test_track_001",
  "licenseTier": "basic",
  "status": "completed",
  "amount": 2999,
  "currency": "usd"
}
```

**Validation Checklist:**
- [ ] Order exists in database
- [ ] All fields populated correctly
- [ ] Entitlement created for track purchase
- [ ] Email notification logged

---

## BRO-165: Authentication E2E

### Test 1: Sign-In Flow
**Objective:** Verify user can sign in

1. Navigate to https://localhost:3000
2. Click "Sign In" link
3. Verify sign-in page loads with Clerk component
4. Enter test email: `test@example.com`
5. Enter test password: `TestPassword123!`
6. Click "Sign In"

**Validation Checklist:**
- [ ] Sign-in button visible on homepage
- [ ] Sign-in page loads
- [ ] Clerk component interactive
- [ ] Can enter credentials
- [ ] Sign-in succeeds (session created)
- [ ] Redirected to dashboard

### Test 2: Sign-Up Flow
**Objective:** Verify new user registration

1. Navigate to https://localhost:3000
2. Click "Sign Up" link
3. Verify sign-up page loads
4. Fill form:
   - Email: `newuser@example.com`
   - Password: `NewPass123!`
   - Confirm: `NewPass123!`
5. Click "Create Account"

**Validation Checklist:**
- [ ] Sign-up link visible
- [ ] Sign-up page loads with Clerk component
- [ ] All form fields display
- [ ] Form validation works (invalid email rejected)
- [ ] Sign-up succeeds
- [ ] Workspace created in database
- [ ] User redirected to onboarding

### Test 3: Session Security
**Objective:** Verify session is secure

1. Sign in with test account
2. Open browser DevTools → Application → Cookies
3. Look for session cookie

**Validation Checklist:**
- [ ] Session cookie exists
- [ ] Cookie is `httpOnly` (not accessible to JavaScript)
- [ ] Cookie is `Secure` (HTTPS only)
- [ ] Cookie has appropriate `SameSite` policy

---

## Verification Checklist - Sign-Off

### Code Review
- [ ] All requirements implemented (see BRO-164/165 spec)
- [ ] No breaking changes to existing code
- [ ] Error handling covers all paths
- [ ] Logging in place for monitoring

### Functionality
- [ ] Checkout handler returns valid Stripe URLs
- [ ] Webhook signature verification works
- [ ] Webhook idempotency prevents duplicates
- [ ] Orders created in database
- [ ] Entitlements created for purchases
- [ ] Sign-in works end-to-end
- [ ] Sign-up works end-to-end
- [ ] Sessions are secure

### Deployment
- [ ] Code compiles without errors
- [ ] Environment variables configured
- [ ] Stripe keys are correct (test/live mode)
- [ ] Convex deployment accessible
- [ ] Database migrations applied

### Sign-Off
- [ ] QA Lead: _______________  Date: ___________
- [ ] Product Manager: _______________  Date: ___________

---

## Rollback Plan (If Issues Found)

If critical issues are discovered:
1. Revert commits: `git revert <commit-hash>`
2. Notify CEO immediately
3. Document findings for post-mortem
4. Assign to backlog for iteration

---

## Timeline

| Phase | Time | Owner | Status |
|-------|------|-------|--------|
| Code commit | 14:30 UTC | CTO | ⏳ Pending |
| Manual testing | 14:30-15:30 UTC | QA | ⏳ Ready |
| Sign-off | 15:30 UTC | PM | ⏳ Pending |
| Revenue unlock | 16:00 UTC | Product | ⏳ Target |

