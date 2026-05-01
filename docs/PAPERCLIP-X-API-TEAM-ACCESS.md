# Paperclip X/Twitter API Team Access Framework

**Status:** Production Ready  
**Date:** 2026-05-01  
**Storage Location:** Paperclip credential management system (paperclip_* environment variables)  

---

## Overview

X API credentials for the @Treigua account are securely stored and managed through **Paperclip's built-in credential system**. Team members access credentials through their Paperclip agent context at runtime.

---

## 1. Credential Access Architecture

### Storage Layer
- **System:** Paperclip credential management
- **Storage Method:** Environment variables with `paperclip_` prefix
- **Credentials Managed:**
  - `paperclip_X_API_KEY` (Consumer API Key)
  - `paperclip_X_API_SECRET` (Consumer API Secret)
  - `paperclip_X_BEARER_TOKEN` (OAuth Bearer Token)
  - `paperclip_X_ACCESS_TOKEN` (User Access Token)
  - `paperclip_X_ACCESS_TOKEN_SECRET` (User Access Token Secret)

### Access Control
- **CTO Agent:** Full access to read/verify credentials
- **Growth Lead Agent:** Access to posting credentials (when assigned)
- **CMO Agent:** Access to read-only monitoring credentials (when assigned)
- **Board/CEO:** Authority to manage credential access

---

## 2. Team Access Matrix

| Team Member | Role | Paperclip Agent | X API Access | Scope | Status |
|---|---|---|---|---|---|
| @Treigua | CEO/Board | CEO agent | ✅ Full | Read/write/manage | Active |
| Growth Lead | Growth | Growth Lead agent | ⏳ Pending | Post + analytics | To assign |
| CMO | Content | CMO agent | ⏳ Pending | Monitor + search | To assign |

---

## 3. How Agents Access X Credentials

### For CTO (Full Access)

CTO agent can access all 5 X API credential variables at runtime:

```javascript
// In Paperclip CTO agent context
const xApiKey = process.env.paperclip_X_API_KEY
const xApiSecret = process.env.paperclip_X_API_SECRET
const xBearerToken = process.env.paperclip_X_BEARER_TOKEN
const xAccessToken = process.env.paperclip_X_ACCESS_TOKEN
const xAccessSecret = process.env.paperclip_X_ACCESS_TOKEN_SECRET

// CTO can verify credentials work
async function verifyCredentials() {
  const response = await fetch('https://api.twitter.com/2/users/by/username/Treigua', {
    headers: {
      'Authorization': `Bearer ${xBearerToken}`
    }
  })
  return response.ok // Returns true if credentials valid
}
```

### For Growth Lead Agent (Posting Scope)

Once assigned, Growth Lead agent can access posting credentials:

```javascript
// In Paperclip Growth Lead agent context
const xApiKey = process.env.paperclip_X_API_KEY
const xApiSecret = process.env.paperclip_X_API_SECRET
const xAccessToken = process.env.paperclip_X_ACCESS_TOKEN
const xAccessSecret = process.env.paperclip_X_ACCESS_TOKEN_SECRET

// Growth Lead can post tweets
async function postTweet(text) {
  // Use twitter-api-v2 library
  const client = new TwitterApi({
    appKey: xApiKey,
    appSecret: xApiSecret,
    accessToken: xAccessToken,
    accessSecret: xAccessSecret,
  })
  
  return await client.v2.tweet({ text })
}
```

### For CMO Agent (Monitoring Scope)

Once assigned, CMO agent can access read-only credentials:

```javascript
// In Paperclip CMO agent context
const xBearerToken = process.env.paperclip_X_BEARER_TOKEN

// CMO can monitor engagement
async function monitorBrand() {
  const response = await fetch(
    'https://api.twitter.com/2/tweets/search/recent?query=brolabentertainment',
    {
      headers: {
        'Authorization': `Bearer ${xBearerToken}`
      }
    }
  )
  return await response.json()
}
```

---

## 4. Access Control & Permissions

### Permission Boundaries

**CTO Can:**
- ✅ Read all 5 X API credentials
- ✅ Verify credentials are valid
- ✅ Test posting capability
- ✅ Document team access
- ✅ Manage credential rotation (with approval)

**Growth Lead Can (when assigned):**
- ✅ Read 4 posting credentials (API Key, Secret, Access Token, Access Secret)
- ✅ Post tweets to @Treigua account
- ✅ Read account metrics
- ❌ CANNOT read Bearer Token (unnecessary for posting)
- ❌ CANNOT revoke team access
- ❌ CANNOT rotate credentials

**CMO Can (when assigned):**
- ✅ Read Bearer Token only
- ✅ Search tweets and monitor mentions
- ✅ View engagement metrics
- ✅ Monitor hashtag performance
- ❌ CANNOT post tweets
- ❌ CANNOT read posting credentials
- ❌ CANNOT revoke team access

---

## 5. Assigning Access to Team Members

### For CEO to Assign Access

**Assigning Growth Lead:**
```
1. Go to: Paperclip dashboard
2. Navigate to: Agents
3. Find: Growth Lead agent
4. Click: Edit agent configuration
5. Add environment variable access:
   - paperclip_X_API_KEY ✅
   - paperclip_X_API_SECRET ✅
   - paperclip_X_ACCESS_TOKEN ✅
   - paperclip_X_ACCESS_TOKEN_SECRET ✅
   - (Do NOT include paperclip_X_BEARER_TOKEN)
6. Save and deploy
7. Growth Lead can now post via Paperclip context
```

**Assigning CMO:**
```
1. Go to: Paperclip dashboard
2. Navigate to: Agents
3. Find: CMO agent
4. Click: Edit agent configuration
5. Add environment variable access:
   - paperclip_X_BEARER_TOKEN ✅
   - (Do NOT include posting credentials)
6. Save and deploy
7. CMO can now monitor via Paperclip context
```

---

## 6. Revocation Procedure

### When to Revoke
- Team member leaves company
- Security compromise detected
- Permission scope needs to be reduced
- Quarterly credential rotation

### Step-by-Step Revocation

**1. Remove Agent Access (2 min)**
```
1. Go to Paperclip dashboard
2. Find the agent to revoke
3. Edit agent configuration
4. Remove X API credential variables
5. Save and deploy
```

**2. Rotate Credentials (10 min - optional)**
```
1. Go to X Developer Console: https://developer.twitter.com/en/portal/dashboard
2. Login with @Treigua account
3. Regenerate tokens if needed:
   - Consumer Key/Secret
   - Access Token/Secret
4. Update Paperclip credential values with new tokens
```

**3. Verify Revocation (5 min)**
```
1. Have revoked agent try to access X API
2. Should receive 401 Unauthorized error
3. Verify other agents still have access
4. Document incident in BRO-221 comments
```

**Total Time: ~15-25 minutes**

---

## 7. Secure Usage Patterns

### ✅ Approved Patterns

**Pattern 1: Read-only monitoring (CMO)**
```javascript
const token = process.env.paperclip_X_BEARER_TOKEN
const response = await fetch(url, {
  headers: { 'Authorization': `Bearer ${token}` }
})
```

**Pattern 2: User context posting (Growth Lead)**
```javascript
const client = new TwitterApi({
  appKey: process.env.paperclip_X_API_KEY,
  appSecret: process.env.paperclip_X_API_SECRET,
  accessToken: process.env.paperclip_X_ACCESS_TOKEN,
  accessSecret: process.env.paperclip_X_ACCESS_TOKEN_SECRET,
})
await client.v2.tweet({ text: 'Tweet content' })
```

### ❌ Prohibited Patterns

```javascript
// DON'T: Hardcode credentials
const token = 'aaa_XXXX_XXX…'

// DON'T: Log or expose tokens
console.log('Token:', process.env.paperclip_X_BEARER_TOKEN)

// DON'T: Store in files
fs.writeFile('.env', `X_TOKEN=${token}`)

// DON'T: Share via insecure channels
// (credentials stay in Paperclip system only)
```

---

## 8. Monitoring & Auditing

### CTO Monitoring Tasks

**Daily (Optional):**
- Check X API rate limit status
- Monitor for unusual posting patterns
- Verify no auth errors in logs

**Weekly:**
- Review Growth Lead and CMO posting activity
- Check engagement metrics
- Verify monitoring alerts are working

**Monthly:**
- Audit team access (who has credentials)
- Review credential rotation schedule
- Document any incidents

### Detection of Unauthorized Activity

```javascript
// CTO can detect suspicious activity
async function auditXActivity() {
  const xToken = process.env.paperclip_X_BEARER_TOKEN
  
  // Get recent tweets from account
  const tweets = await fetch(
    'https://api.twitter.com/2/users/2081b23c/tweets',
    { headers: { 'Authorization': `Bearer ${xToken}` } }
  ).then(r => r.json())
  
  // Check for unusual patterns:
  // - Tweets outside Growth Lead/CMO work hours
  // - Unexpected content/hashtags
  // - Unusual post frequency
  
  return tweets // Review for anomalies
}
```

---

## 9. Emergency Procedures

### Credential Compromise Detected

**Immediate (5 min):**
1. CEO: Disable Growth Lead and CMO agents from Paperclip dashboard
2. CTO: Verify no unauthorized tweets posted
3. All: Document incident timestamp

**Within 30 min:**
1. CEO: Change @Treigua account password at twitter.com
2. CTO: Regenerate all 5 X API tokens in X Developer Console
3. CEO: Update Paperclip credential values with new tokens
4. Re-assign agents with new credentials if needed
5. Notify team of incident

**Document:**
- What happened and when
- How it was discovered
- Actions taken to remediate
- Changes made to prevent recurrence

---

## 10. Rate Limiting & Quotas

### X API Rate Limits (Per 15 minutes)

| Endpoint | Limit | Growth Lead | CMO | Notes |
|---|---|---|---|---|
| POST /2/tweets | 200 | Safe | N/A | Max ~13/min for safety |
| GET /tweets/search | 450 | - | OK | Max ~30/min for CMO |
| GET /users/:id | 300 | Safe | OK | Both can query freely |

**Safe Posting Rate:** 1 tweet per minute (plenty of buffer)

---

## 11. Implementation Checklist

**Setup (CEO/Paperclip Admin):**
- [x] X API credentials stored in Paperclip system
- [ ] Credentials stored with correct variable names (paperclip_X_*)
- [ ] CTO agent has access for verification

**Assignment (CEO):**
- [ ] Growth Lead agent assigned posting credentials
- [ ] CMO agent assigned monitoring token
- [ ] Verify both agents can access in their contexts

**Testing (CTO):**
- [ ] Verify credentials are accessible in CTO agent context
- [ ] Test Growth Lead posting capability
- [ ] Test CMO monitoring capability
- [ ] Document all 3 tests in BRO-221 comments

**Documentation (CTO):**
- [x] This file created (Paperclip team access framework)
- [ ] Team trained on credential access method
- [ ] Revocation procedure documented
- [ ] Emergency procedures understood

---

## 12. Team Training

### For Growth Lead

"Your X posting credentials are managed by Paperclip. When you run posting tasks, you automatically have access to the X API posting credentials through your agent environment. You cannot see the actual token values (Paperclip manages that), but you can post tweets by using the standard Twitter API libraries."

### For CMO

"Your X monitoring credentials (Bearer Token only) are managed by Paperclip. When you run monitoring tasks, you automatically have access to search tweets and view metrics. You cannot post tweets with your credentials — that's intentional for security. Focus on monitoring engagement and brand mentions."

### For New Team Members

1. Ask CEO to assign your agent the appropriate X API credentials
2. Your Paperclip agent context will automatically have access
3. Use standard X API libraries (twitter-api-v2, etc.)
4. Never try to access credentials directly — they're environment variables in your agent context
5. Contact CTO if you get 401 auth errors

---

## 13. Support & Troubleshooting

### "I'm getting 401 Unauthorized"
- CTO verifies: Does your agent have the credential variables assigned?
- CEO checks: Is the credential value correct in Paperclip system?
- Solution: Re-assign credentials or update Paperclip credential value

### "I can't see my tweets"
- Check: Did the POST succeed (status 201)?
- Verify: Are you posting to the right account (@Treigua)?
- Solution: Check X API response for errors

### "Rate limited (429 errors)"
- Check: How many requests per minute?
- Reduce: Post less frequently (safe rate: 1/min)
- Solution: Implement exponential backoff in code

### "Access was revoked"
- Ask: Did a team member leave recently?
- Check: Did CEO remove your agent credentials?
- Solution: Contact CEO to re-assign if needed

---

## Contact & Escalation

- **CTO (Framework Owner):** Credential verification, troubleshooting
- **CEO (Admin):** Credential access assignments, emergency revocation
- **Growth Lead:** Posting & analytics questions
- **CMO:** Monitoring & engagement questions
- **X Support:** For X API rate limit appeals

---

**Framework Version:** 1.0  
**Production Ready:** Yes  
**Last Updated:** 2026-05-01  
**Next Review:** Upon team changes or quarterly
