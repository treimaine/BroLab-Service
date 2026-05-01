# X/Twitter API Testing & Verification Guide

**Created:** 2026-05-01  
**Purpose:** Verify X API credentials are properly configured and accessible  
**Owner:** CTO / Growth Lead / CMO  

---

## Pre-Testing Checklist

Before running any tests:
- [ ] Access to Vercel dashboard (Project: BroLab Entertainment)
- [ ] Access to X Developer Console (https://developer.twitter.com)
- [ ] Terminal/CLI access to run test scripts
- [ ] `curl` or `httpie` available in shell
- [ ] X API credentials verified as valid

---

## Test 1: Verify Vercel Environment Variables

### Objective
Confirm X API environment variables are configured in Vercel production.

### Steps

**1a. Via Vercel CLI**
```bash
# Install Vercel CLI if needed
npm install -g vercel

# Login to Vercel
vercel login

# List all environment variables
vercel env list

# Look for:
# X_API_KEY
# X_API_SECRET
# X_BEARER_TOKEN
# X_ACCESS_TOKEN
# X_ACCESS_TOKEN_SECRET
```

**Expected Output:**
```
Environment Variables for project "brolabentertainment":
Name                       | Production | Preview | Development
─────────────────────────────────────────────────────────────
X_API_KEY                  | ✓ Enabled  | ✓ Enabled | ✓ Enabled
X_API_SECRET               | ✓ Enabled  | ✓ Enabled | ✓ Enabled
X_BEARER_TOKEN             | ✓ Enabled  | ✓ Enabled | ✓ Enabled
X_ACCESS_TOKEN             | ✓ Enabled  | ✓ Enabled | ✓ Enabled
X_ACCESS_TOKEN_SECRET      | ✓ Enabled  | ✓ Enabled | ✓ Enabled
```

**1b. Via Vercel Dashboard**
```
1. Go to: https://vercel.com/dashboard
2. Select project: BroLab Entertainment
3. Go to: Settings → Environment Variables
4. Search for "X_" to filter X API variables
5. Verify all 5 variables are configured
6. Note: Values are masked for security
```

**Expected Result:** ✅ All 5 X API environment variables present

---

## Test 2: Bearer Token Authentication

### Objective
Verify X API v2 Bearer Token is valid and accessible.

### Steps

**Get the Bearer Token from Vercel:**
```bash
# Via CLI (if you have access)
vercel env pull .env.production.local

# Or copy from Vercel Dashboard (masked display, so use carefully)
# Store in a shell variable:
export X_BEARER_TOKEN="your_bearer_token_here"
```

**Test API Connectivity:**
```bash
# Test 1: Get @Treigua user info
curl -X GET "https://api.twitter.com/2/users/by/username/Treigua" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"

# Expected response:
# {
#   "data": {
#     "id": "2081b23c...",
#     "name": "Treigua",
#     "username": "Treigua",
#     "created_at": "...",
#     "public_metrics": {
#       "followers_count": 44,
#       "following_count": ...,
#       "tweet_count": ...,
#       "listed_count": ...
#     }
#   }
# }

# Test 2: Get account metrics
curl -X GET "https://api.twitter.com/2/tweets/search/recent?query=brolabentertainment&max_results=10" \
  -H "Authorization: Bearer $X_BEARER_TOKEN"

# Expected: List of recent tweets mentioning "brolabentertainment"
```

**Check Status Codes:**
- `200 OK` = Token valid, data returned
- `401 Unauthorized` = Token invalid or expired
- `429 Too Many Requests` = Rate limited (try again later)
- `500 Server Error` = X API issue (retry)

**Expected Result:** ✅ Status 200 with user/tweet data

---

## Test 3: OAuth User Context (Posting)

### Objective
Verify team members can post tweets with configured credentials.

### Prerequisites
- Consumer Key (API Key): X_API_KEY
- Consumer Secret: X_API_SECRET
- Access Token: X_ACCESS_TOKEN
- Access Token Secret: X_ACCESS_TOKEN_SECRET

### Steps

**Option A: Using Node.js / TypeScript**

Create `test-post-tweet.js`:
```javascript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

// OAuth 1.1a signing (for Twitter API v1.1 or using twitter package)
// For v2, use Bearer Token approach instead

async function testPostTweet() {
  // Note: Direct OAuth1.1a signing is complex in JS
  // Recommended: Use twitter-api-v2 package
  
  console.log("Testing X API posting capability...");
  
  // For production, use:
  // npm install twitter-api-v2
  // import { TwitterApi } from 'twitter-api-v2'
  
  const twitterClient = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
  
  // Test: Post a tweet
  try {
    const result = await twitterClient.v2.tweet({
      text: "🧪 Team access framework test - posted at " + new Date().toISOString()
    });
    
    console.log("✅ Tweet posted successfully!");
    console.log("Tweet ID:", result.data.id);
    console.log("Tweet text:", result.data.text);
    
    return result;
  } catch (error) {
    console.error("❌ Failed to post tweet:", error.message);
    return null;
  }
}

testPostTweet();
```

**Run the test:**
```bash
# Install dependencies
npm install twitter-api-v2

# Set environment variables
export X_API_KEY="your_key"
export X_API_SECRET="your_secret"
export X_ACCESS_TOKEN="your_token"
export X_ACCESS_TOKEN_SECRET="your_token_secret"

# Run test
node test-post-tweet.js
```

**Option B: Using curl with OAuth header**

```bash
# This requires OAuth signature generation (complex)
# Easier to use twitter-api-v2 or similar library

# For testing purposes, verify credentials manually:
# 1. Go to X Developer Portal
# 2. Navigate to: Keys and Tokens
# 3. Check if tokens are "Active"
# 4. Regenerate if needed
```

**Expected Result:**
- ✅ Tweet posted successfully
- ✅ Tweet visible on @Treigua timeline
- ✅ No auth errors (401)

---

## Test 4: Growth Lead Access Verification

### Objective
Confirm Growth Lead can use X API credentials securely.

### Who Should Run This
Growth Lead

### Steps

**4.1: Verify You Can Access Vercel**
```bash
# Test production deployment
curl -I https://brolabentertainment.com

# Expected: HTTP 200, site is up
```

**4.2: Test Posting Capability**
Create `growth-lead-test.js`:
```javascript
import { TwitterApi } from 'twitter-api-v2';

async function testGrowthLeadAccess() {
  const twitterClient = new TwitterApi({
    appKey: process.env.X_API_KEY,
    appSecret: process.env.X_API_SECRET,
    accessToken: process.env.X_ACCESS_TOKEN,
    accessSecret: process.env.X_ACCESS_TOKEN_SECRET,
  });
  
  try {
    // Test 1: Can read account info
    const me = await twitterClient.v2.me();
    console.log("✅ Authenticated as:", me.data.username);
    
    // Test 2: Can post tweet
    const tweet = await twitterClient.v2.tweet({
      text: "Growth Lead test - Access verified ✅"
    });
    console.log("✅ Posted tweet ID:", tweet.data.id);
    
    // Test 3: Can read recent tweets
    const tweets = await twitterClient.v2.userTimeline(me.data.id, {
      max_results: 5
    });
    console.log("✅ Retrieved", tweets.data?.length || 0, "recent tweets");
    
    console.log("\n✅ ALL TESTS PASSED - Growth Lead access working!");
    
  } catch (error) {
    console.error("❌ TEST FAILED:", error.message);
  }
}

testGrowthLeadAccess();
```

**4.3: Expected Behavior**
- ✅ Can read @Treigua account info
- ✅ Can post tweets to timeline
- ✅ Can retrieve recent tweets
- ❌ CANNOT revoke credentials (permission boundary)
- ❌ CANNOT change X account password (would need account access)

**Expected Result:** ✅ Growth Lead has full post + monitoring access

---

## Test 5: CMO Access Verification

### Objective
Confirm CMO can monitor X API activity.

### Who Should Run This
CMO

### Steps

**5.1: Test Read-Only Access**
```bash
export X_BEARER_TOKEN="your_bearer_token"

# Test: Monitor brand mentions
curl -X GET "https://api.twitter.com/2/tweets/search/recent" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -G \
  --data-urlencode 'query=BroLab Entertainment OR @Treigua' \
  --data-urlencode 'max_results=10' \
  --data-urlencode 'tweet.fields=created_at,public_metrics'

# Expected: List of mentions with engagement metrics
```

**5.2: Test Analytics**
```bash
# Get account metrics
curl -X GET "https://api.twitter.com/2/users/by/username/Treigua" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -G \
  --data-urlencode 'user.fields=public_metrics,created_at'

# Expected response includes:
# "followers_count": 44
# "tweet_count": ...
# "listed_count": ...
```

**5.3: Test Hashtag Monitoring**
```bash
# Track hashtag performance
curl -X GET "https://api.twitter.com/2/tweets/search/recent" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -G \
  --data-urlencode 'query=#BroLabEntertainment' \
  --data-urlencode 'max_results=10' \
  --data-urlencode 'tweet.fields=created_at,public_metrics'
```

**Expected Result:**
- ✅ Can search tweets
- ✅ Can access account metrics
- ✅ Can monitor hashtags
- ✅ Can view engagement data
- ❌ CANNOT post tweets (would need OAuth user context)
- ❌ CANNOT revoke credentials

---

## Test 6: Rate Limiting Verification

### Objective
Understand rate limits to prevent API throttling.

### Testing Steps

```bash
# Check current rate limit status
curl -X GET "https://api.twitter.com/2/tweets/search/recent?query=test&max_results=10" \
  -H "Authorization: Bearer $X_BEARER_TOKEN" \
  -w '\n%{http_code}\n' \
  -D - | grep "x-rate-limit"

# Response headers:
# x-rate-limit-limit: 450
# x-rate-limit-remaining: 449
# x-rate-limit-reset: 1620000000

# Calculate when limit resets:
date -d @1620000000
```

**Expected:**
- Limit: 450 requests per 15 minutes for search
- If you hit limit, get 429 Too Many Requests
- Wait until `x-rate-limit-reset` timestamp

**For Team Safety:**
- 450 requests / 15 min = **30 requests/min max**
- 30 requests/min = **1 request per 2 seconds**
- Safe posting rate: 1 tweet/minute (plenty of buffer)

---

## Test 7: Revocation Procedure (Dry Run)

### Objective
Practice credential rotation without disrupting service.

### ⚠️ CAUTION
This is a DRY RUN only. Only run if you have authority.

### Steps

**7.1: Backup Current Setup**
```bash
# Document current state
echo "Backing up current X API credential state..."

# Note down:
# - Current X_BEARER_TOKEN (first 10 chars only for security)
# - Current X_ACCESS_TOKEN (first 10 chars only)
# - Current deployment hash from Vercel
```

**7.2: Rotate Credentials**
```
1. Go to: https://developer.twitter.com/en/portal/dashboard
2. Click on your App
3. Go to: Keys and Tokens
4. Under "Access Token & Secret":
   - Click "Regenerate"
   - Confirm regeneration
   - Copy new X_ACCESS_TOKEN
   - Copy new X_ACCESS_TOKEN_SECRET
```

**7.3: Update Vercel (DRY RUN)**
```
1. Go to: https://vercel.com/dashboard
2. BroLab Entertainment project
3. Settings → Environment Variables
4. **DO NOT UPDATE YET** - This is dry run
5. Verify you can see the interface
6. Confirm you have permission to change env vars
```

**7.4: Test New Credentials**
```bash
# (Skip in dry run - only test after actual rotation)
# Test API with new token:
curl -X GET "https://api.twitter.com/2/users/by/username/Treigua" \
  -H "Authorization: Bearer $NEW_X_BEARER_TOKEN"

# Expected: 200 OK (old token will now 401)
```

**7.5: Verify Deployment**
```bash
# After credential rotation, Vercel auto-deploys
# Check deployment status:
vercel list  # Shows latest deployment
vercel logs <url>  # Check for auth errors
```

**Expected Result:**
- ✅ Can navigate Vercel env var interface
- ✅ Understand token rotation process
- ✅ New token passes API test
- ✅ No service interruption

---

## Test 8: Integration Test (Full Flow)

### Objective
End-to-end test of team access framework in production.

### Participants
- CTO (orchestrates)
- Growth Lead (tests posting)
- CMO (tests monitoring)

### Timeline
- ~30 minutes total
- Can be done during low-traffic period

### Procedure

**Phase 1: Pre-Test (5 min)**
```
1. CTO: Verify all credentials in Vercel
2. Growth Lead: Confirm has access to env vars
3. CMO: Confirm has access to X API docs
4. All: Agree on test tweet content
```

**Phase 2: Test Posting (10 min)**
```
1. Growth Lead: Post test tweet
   Tweet: "🧪 Team access test - [timestamp]"
2. CTO: Verify tweet appears on @Treigua
3. CMO: Confirm tweet in analytics
4. Growth Lead: Note tweet ID for record
```

**Phase 3: Test Monitoring (5 min)**
```
1. CMO: Search for the test tweet
2. CMO: Verify engagement metrics visible
3. CMO: Check rate limit status
4. All: Confirm monitoring dashboard working
```

**Phase 4: Document Results (10 min)**
```
1. CTO: Update [BRO-221](/BRO/issues/BRO-221) with results
2. Growth Lead: Confirm access notes for documentation
3. CMO: Add monitoring observations
4. All: Approve team access framework as production-ready
```

**Expected Result:** ✅ Full integration test passes, team access ready for production

---

## Troubleshooting

### Problem: 401 Unauthorized
```
Cause: Invalid/expired token
Solution:
1. Verify token in Vercel matches X Developer Console
2. Check token hasn't expired (should be long-lived)
3. Regenerate in X Developer Console if needed
4. Update Vercel env var with new token
5. Retry test
```

### Problem: 429 Rate Limited
```
Cause: Too many requests too quickly
Solution:
1. Check x-rate-limit-remaining header
2. Wait until x-rate-limit-reset time
3. Implement exponential backoff in posting code
4. Limit to ~10 posts/hour for safety
```

### Problem: Service Interruption During Rotation
```
Cause: Old credential still being used during transition
Solution:
1. Vercel auto-deploys on env var change (< 1 min)
2. Check deployment status at vercel.com
3. If stuck, manually redeploy
4. Verify new token working before old expires
```

### Problem: Growth Lead Can't Post
```
Cause: Missing X_ACCESS_TOKEN or X_ACCESS_TOKEN_SECRET
Solution:
1. Verify both tokens configured in Vercel
2. Regenerate both in X Developer Console
3. Update both in Vercel (not just one)
4. Wait for deployment to complete
5. Test again
```

---

## Success Criteria

All tests pass when:
- ✅ All 5 X API credentials configured in Vercel
- ✅ Bearer Token returns valid user data (200)
- ✅ Growth Lead can post tweet successfully
- ✅ CMO can search tweets and view metrics
- ✅ Rate limit status visible and understood
- ✅ Dry-run rotation procedure documented
- ✅ Full integration test completes without errors

---

## Sign-Off

Once all tests pass, this can be signed off as complete:

**CTO:**  
- [ ] All tests executed
- [ ] Results documented
- [ ] Credentials secure
- [ ] Ready for production

**Growth Lead:**  
- [ ] Can post successfully
- [ ] Understands access boundaries
- [ ] Acknowledges revocation procedure

**CMO:**  
- [ ] Can monitor/search
- [ ] Understands access boundaries
- [ ] Monitoring dashboard functional

---

**Document Version:** 1.0  
**Last Updated:** 2026-05-01  
**Next Review:** Upon next credential rotation or team change
