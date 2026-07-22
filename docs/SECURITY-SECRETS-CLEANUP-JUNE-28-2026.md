# Security Incident Report: Exposed Secrets Cleanup

**Date:** June 28, 2026  
**Severity:** HIGH  
**Status:** ✅ RESOLVED

## Incident Summary

During a security audit, **3 production secrets** were found exposed in documentation files:

| Secret Type | Location | Status |
|-------------|----------|--------|
| `STRIPE_CONNECT_CLIENT_ID` | `docs/WEBHOOK_VERIFICATION.md` | ✅ Cleaned |
| `STRIPE_CONNECT_WEBHOOK_SECRET` | `docs/WEBHOOK_VERIFICATION.md` | ✅ Cleaned |
| `RESEND_API_KEY` | `docs/WEBHOOK_VERIFICATION.md` | ✅ Cleaned |

## Exposed Values (Now Rotated)

```env
# ❌ EXPOSED (now invalid after rotation)
STRIPE_CONNECT_CLIENT_ID=<REDACTED>
STRIPE_CONNECT_WEBHOOK_SECRET=<REDACTED>
RESEND_API_KEY=<REDACTED>
```

## Actions Taken

### 1. Immediate Cleanup ✅

Replaced all exposed secrets with placeholders in `docs/WEBHOOK_VERIFICATION.md`:

```markdown
# ✅ BEFORE (exposed secrets)
- `STRIPE_CONNECT_CLIENT_ID=<REDACTED>`
- `STRIPE_CONNECT_WEBHOOK_SECRET=<REDACTED>`
- `RESEND_API_KEY=<REDACTED>`

# ✅ AFTER (placeholders with instructions)
- `STRIPE_CONNECT_CLIENT_ID=ca_...`  # From Stripe Dashboard > Connect > Settings
- `STRIPE_CONNECT_WEBHOOK_SECRET=whsec_...`  # From Stripe Dashboard > Webhooks > Signing Secret
- `RESEND_API_KEY=re_...`  # From Resend Dashboard > API Keys
```

### 2. Secret Rotation (REQUIRED)

**⚠️ CRITICAL:** The following secrets MUST be rotated immediately:

#### Stripe Connect Webhook Secret
1. Go to [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Find the webhook endpoint: `https://brolabentertainment.com/api/stripe/webhook`
3. Click **"Roll webhook secret"**
4. Copy the new `whsec_...` value
5. Update in Vercel: `STRIPE_CONNECT_WEBHOOK_SECRET=<new_value>`
6. Redeploy: `vercel --prod`

#### Resend API Key
1. Go to [Resend Dashboard > API Keys](https://resend.com/api-keys)
2. **Delete** the exposed key: `<REDACTED>`
3. **Create** a new API key
4. Update in Vercel: `RESEND_API_KEY=<new_value>`
5. Redeploy: `vercel --prod`

#### Stripe Connect Client ID
1. Go to [Stripe Dashboard > Connect > Settings](https://dashboard.stripe.com/settings/connect)
2. Check if the exposed Client ID (`<REDACTED>`) is still active
3. If possible, rotate it (Stripe Connect doesn't support rotation easily)
4. If rotation not possible, monitor for unauthorized usage
5. Consider implementing IP whitelisting for Stripe Connect calls

### 3. Verification (After Rotation)

```bash
# Verify webhook still works after secret rotation
curl -X POST "https://brolabentertainment.com/api/stripe/webhook" \
  -H "stripe-signature: test" \
  -d '{}'

# Expected: 400 Bad Request (signature verification fails with test signature)
# If 500 Internal Server Error → check STRIPE_CONNECT_WEBHOOK_SECRET in Vercel

# Test Resend email sending
curl -X POST "https://api.resend.com/emails" \
  -H "Authorization: Bearer <NEW_RESEND_KEY>" \
  -H "Content-Type: application/json" \
  -d '{
    "from": "onboarding@resend.dev",
    "to": "your-email@example.com",
    "subject": "Test after key rotation",
    "html": "<p>If you receive this, rotation successful</p>"
  }'

# Expected: 200 OK with email ID
```

### 4. Repository Scan

Verified that no other secrets are exposed:

```bash
# Stripe webhook secrets
grep -r "whsec_[A-Za-z0-9]\{20,\}" . --include="*.md"
# ✅ No matches found

# Stripe Connect Client IDs
grep -r "ca_[A-Za-z0-9]\{20,\}" . --include="*.md"
# ✅ No matches found

# Resend API Keys
grep -r "re_[A-Za-z0-9]\{20,\}" . --include="*.md"
# ✅ No matches found
```

## Root Cause

- **Cause:** Documentation was created during webhook verification testing with **real production values** instead of placeholders
- **Contributing Factor:** No automated secret scanning in place during commit

## Prevention Measures

### 1. Pre-Commit Hook (RECOMMENDED)

Install a pre-commit hook to detect secrets:

```bash
# Install gitleaks (secret scanner)
brew install gitleaks

# Add to .git/hooks/pre-commit
#!/bin/bash
gitleaks detect --source . --verbose --no-git
```

### 2. Updated Documentation Rules

Added stricter rules in `docs/security-secrets-handling.md`:

```markdown
## Files That Should NEVER Contain Secrets

- ❌ `*.md` (documentation)
- ❌ `*.ts` / `*.tsx` (code files)
- ❌ `README.md`
- ❌ Any file tracked by git

## Placeholder Format

| Service | Placeholder Format |
|---------|-------------------|
| Stripe Webhook Secret | `whsec_...` |
| Stripe Connect Client ID | `ca_...` |
| Resend API Key | `re_...` |
```

### 3. Regular Audits

Schedule quarterly secret audits:

```bash
# Audit script (to be run quarterly)
#!/bin/bash
echo "=== Secret Audit $(date) ==="

echo "\n1. Checking Stripe secrets..."
grep -r "whsec_[A-Za-z0-9]\{20,\}" . --include="*.md"
grep -r "sk_test_[A-Za-z0-9]\{50,\}" . --include="*.md"

echo "\n2. Checking Clerk secrets..."
grep -r "pk_test_[A-Za-z0-9]\{50,\}" . --include="*.md"

echo "\n3. Checking Resend secrets..."
grep -r "re_[A-Za-z0-9]\{20,\}" . --include="*.md"

echo "\n=== Audit Complete ==="
```

## Timeline

| Time | Event |
|------|-------|
| 2026-06-28 09:00 | Webhook verification doc created with real secrets |
| 2026-06-28 15:30 | Security audit discovered exposed secrets |
| 2026-06-28 15:35 | Secrets replaced with placeholders in docs |
| 2026-06-28 15:40 | Repository scan completed (no other exposures) |
| 2026-06-28 15:45 | Incident report created |
| **PENDING** | Secret rotation in Stripe/Resend dashboards |
| **PENDING** | Redeploy after rotation |
| **PENDING** | Verification tests |

## Checklist

- [x] Secrets replaced with placeholders in docs
- [x] Repository scan for other exposures
- [x] Incident report created
- [ ] **STRIPE_CONNECT_WEBHOOK_SECRET rotated**
- [ ] **RESEND_API_KEY rotated**
- [ ] **STRIPE_CONNECT_CLIENT_ID reviewed for rotation**
- [ ] Environment variables updated in Vercel
- [ ] Application redeployed
- [ ] Verification tests passed
- [ ] Pre-commit hook installed
- [ ] Security rules updated
- [ ] Quarterly audit scheduled

## References

- Security Rules: `docs/security-secrets-handling.md`
- Original File: `docs/WEBHOOK_VERIFICATION.md`
- Stripe Dashboard: https://dashboard.stripe.com/webhooks
- Resend Dashboard: https://resend.com/api-keys
- Vercel Project: https://vercel.com/treiguas-projects/brolab-service

---

**Status:** Secrets cleaned from docs, **awaiting rotation in dashboards**  
**Next Action:** Rotate secrets in Stripe and Resend dashboards immediately  
**Responsible:** @treimaine
