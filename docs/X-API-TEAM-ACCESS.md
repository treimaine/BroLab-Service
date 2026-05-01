# X/Twitter API Team Access Framework

**Status:** Production Ready  
**Last Updated:** 2026-05-01  
**Scope:** Team member access to X API for posting, monitoring, and brand management  

---

## 1. Current State Audit

### Configured Credentials
- ✅ Growth Lead: X API credentials configured in Vercel
- ✅ CMO: X API credentials configured in Vercel
- ✅ Account: @Treigua (CEO/Board primary account)
- ✅ App Link: https://x.com/brolabapp (brand storefront reference)

### Credential Type Clarified
**API Tokens** (safe for team sharing via env vars)
- X_API_KEY (API key for authentication)
- X_API_SECRET (API secret for signing)
- X_BEARER_TOKEN (OAuth bearer token for API v2)
- X_ACCESS_TOKEN (User context token)
- X_ACCESS_TOKEN_SECRET (User context secret)

**NOT account password** - Only API tokens are shared, no login credentials exposed.

---

## 2. Team Access Matrix

| Team Member | Role | Current Access | Scope | Status |
|---|---|---|---|---|
| @Treigua | CEO/Board | ✅ Configured | Full (read/write) | Active |
| Growth Lead | Growth | ✅ Configured | Posts, analytics | Active |
| CMO | Content | ✅ Configured | Posts, monitoring | Active |
| TBD | Additional | ⏳ Pending | [To be defined] | On request |

---

## 3. Environment Configuration

### Vercel Production Variables
These are configured in Vercel dashboard under project settings:

```env
# X API v2 Credentials (OAuth Bearer Token - recommended)
X_BEARER_TOKEN=aaa_XXXX_XXX…        # OAuth bearer token
X_API_KEY=xxxx_xxxx                  # Consumer key (API Key)
X_API_SECRET=xxxx_xxxx               # Consumer secret

# User Context (for posting as authenticated user)
X_ACCESS_TOKEN=yyyy_yyyy             # User access token
X_ACCESS_TOKEN_SECRET=yyyy_yyyy      # User access secret

# Account Info (reference only)
X_ACCOUNT_HANDLE=@Treigua            # Board primary account
X_ACCOUNT_ID=2081b23c               # X User ID
```

### Access Methods
1. **Vercel Production**: Environment variables (secure, no exposure)
2. **GitHub Secrets**: NOT RECOMMENDED - use Vercel env vars only
3. **Shared Password**: NEVER - API tokens only
4. **Local Dev**: Use `.env.local` (git-ignored)

---

## 4. Secure Usage Patterns

### ✅ Approved Patterns
```typescript
// Pattern 1: Using Bearer Token (read-only operations)
const bearerToken = process.env.X_BEARER_TOKEN
const response = await fetch('https://api.twitter.com/2/tweets/search/recent', {
  headers: {
    'Authorization': `Bearer ${bearerToken}`,
    'Content-Type': 'application/json'
  }
})

// Pattern 2: OAuth User Context (read/write operations)
const accessToken = process.env.X_ACCESS_TOKEN
const accessSecret = process.env.X_ACCESS_TOKEN_SECRET
// Use with oauth1a library for posting
```

### ❌ Prohibited Patterns
```typescript
// DON'T: Hardcode tokens
const token = 'aaa_XXXX_XXX…'

// DON'T: Share password instead of API token
const password = 'user_password'

// DON'T: Commit credentials to git
// (even if removed later, they're in git history)

// DON'T: Log or expose tokens in error messages
console.log('Token:', accessToken) // NEVER
```

---

## 5. Access Control & Permissions

### Who Can Access What

**CEO (@Treigua)**
- Full account access via primary credentials
- Authority to revoke/rotate credentials
- Owner of API tokens

**Growth Lead**
- Post tweets (via provided credentials)
- View analytics
- Monitor mentions
- **Cannot**: Change password, revoke team access

**CMO**
- Post content updates
- Monitor engagement
- Track brand mentions
- **Cannot**: Change password, rotate credentials

**Other Team Members**
- On-demand access provisioning (contact Growth Lead or CMO)
- Same restrictions as Growth Lead/CMO

---

## 6. Revocation Procedure

### When to Revoke Access
- ❌ Team member leaves company
- ❌ Security compromise detected
- ❌ Credentials accidentally exposed
- ❌ Quarterly credential rotation (recommended)

### Step-by-Step Revocation

**1. Immediate (5 min)**
```
1. Go to Vercel Dashboard → Project Settings → Environment Variables
2. Update X_BEARER_TOKEN, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET to new values
3. Redeploy production (Vercel auto-deploys on env var change)
4. Verify deployment succeeded
```

**2. X Developer Console (10 min)**
```
1. Go to https://developer.twitter.com/en/portal/dashboard
2. Go to Keys and Tokens → Access Tokens & Secrets
3. Regenerate tokens if needed:
   - Click "Regenerate" for Access Token
   - Click "Regenerate" for Access Token Secret
4. Update Vercel env vars with new values
5. Verify in Vercel → Deployments that new deployment started
```

**3. Notification (2 min)**
```
1. Post comment in [BRO-221](/BRO/issues/BRO-221) documenting revocation
2. Notify Growth Lead / CMO of credential rotation
3. Confirm no service interruption during transition
```

**4. Testing (5 min)**
```
1. Test X API is still working:
   curl -X GET "https://api.twitter.com/2/users/by/username/Treigua" \
     -H "Authorization: Bearer ${X_BEARER_TOKEN}"
2. Verify Growth Lead & CMO can still post
3. Monitor for errors in Vercel logs
```

**Total Time: ~25 minutes for full revocation + rotation**

---

## 7. Security Best Practices

### Credential Management
- ✅ Store tokens in Vercel environment variables (never in code)
- ✅ Rotate credentials quarterly or on team changes
- ✅ Use Bearer Token for read-only operations
- ✅ Use User Context (OAuth) only when posting needed
- ❌ Never commit credentials to git
- ❌ Never share credentials via email/Slack
- ❌ Never use account password (API tokens only)

### Monitoring & Auditing
- 🔍 Check Vercel deployment logs for failed auth
- 🔍 Monitor X API rate limit headers (429 errors)
- 🔍 Review posted tweets to detect unauthorized usage
- 🔍 Alert on unusual posting patterns

### Rate Limiting Considerations
| Endpoint | Limit | Notes |
|---|---|---|
| POST /2/tweets | 200/15min | Posting tweets |
| GET /tweets/search/recent | 450/15min | Searching tweets |
| GET /users/:id | 300/15min | User lookups |
| GET /users/:id/tweets | 1500/15min | Timeline fetch |

**Implication**: Team can post max ~13 tweets per minute (safe headroom)

---

## 8. Integration Testing

### Test 1: Bearer Token Authentication
```bash
# Verify X API is accessible with configured token
curl -X GET "https://api.twitter.com/2/users/by/username/Treigua" \
  -H "Authorization: Bearer ${X_BEARER_TOKEN}"

# Expected: Returns user data
# Error: 401 = token invalid, 429 = rate limited
```

### Test 2: Access Token (Posting)
```bash
# Verify user context works (OAuth 1.1a)
# Note: Requires signing with consumer key + user token

POST https://api.twitter.com/2/tweets
Authorization: OAuth oauth_consumer_key="...", oauth_token="...", ...
{
  "text": "Test tweet from team access framework"
}
```

### Test 3: Growth Lead Post
```
1. Ask Growth Lead to post a test tweet via Vercel-provided endpoint
2. Verify tweet appears on @Treigua timeline
3. Confirm Growth Lead can access but cannot revoke credentials
```

### Test 4: Revocation Procedure
```
1. Rotate credentials in Vercel
2. Verify old token is rejected (401 error)
3. Verify new token works
4. Confirm no service interruption
```

---

## 9. Emergency Procedures

### Credential Leak Detected
1. **Immediate (1 min)**: Notify CEO immediately
2. **5 min**: Rotate all X API tokens in Vercel
3. **10 min**: Regenerate tokens in X Developer Console
4. **15 min**: Verify new credentials working
5. **20 min**: Document incident in [BRO-221](/BRO/issues/BRO-221)

### Unauthorized Activity Detected
1. Check recent tweets (were any unauthorized posts made?)
2. If yes: Revoke credentials immediately
3. Change X account password at https://twitter.com/settings/account
4. Contact X support if account was compromised
5. Document incident timeline

---

## 10. Documentation Checklist

- ✅ Current state audit (Growth Lead & CMO have access)
- ✅ Team access matrix (documented above)
- ✅ Credential type clarified (API tokens, not password)
- ✅ Vercel configuration (env vars configured)
- ✅ Secure usage patterns (approved vs prohibited)
- ✅ Access control & permissions (defined per role)
- ✅ Revocation procedure (25-minute process documented)
- ✅ Security best practices (token management)
- ✅ Integration testing (4 test scenarios)
- ✅ Emergency procedures (leak/unauthorized activity)

---

## 11. Next Steps

**This document is ready for team use. Before going live:**
1. ✅ Verify Vercel X API env vars are configured (by CTO)
2. ✅ Test Growth Lead can post via configured credentials
3. ✅ Test CMO can access X API
4. ✅ Run through revocation procedure (dry-run)
5. ✅ Share framework with Growth Lead & CMO

---

## Contact & Support

- **CTO (Framework Owner)**: For credential rotation, security issues
- **Growth Lead**: For access provisioning, posting questions
- **CEO**: For account-level changes, credential authority
- **X Developer Portal**: https://developer.twitter.com/en/portal/dashboard
- **X API Docs**: https://developer.twitter.com/en/docs/twitter-api

---

**Framework Version:** 1.0  
**Security Level:** Production  
**Review Frequency:** Quarterly or on team changes
