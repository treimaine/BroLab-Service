# Agent Production Access Guide

## Overview

This guide explains how AI agents (like those in PaperClip AI) can access and interact with the BroLab Entertainment production application deployed on Vercel.

## Production URLs

### Main Application
- **Production URL:** `https://brolabentertainment.com`
- **Convex Backend:** `https://cautious-retriever-22.convex.cloud`
- **Convex Site:** `https://cautious-retriever-22.convex.site`
- **Clerk Auth Domain:** `https://clerk.brolabentertainment.com` (production) or `https://natural-rattler-88.clerk.accounts.dev` (development)

### Tenant Storefronts
- **Pattern:** `{slug}.brolabentertainment.com`
- **Example:** `drakebeats.brolabentertainment.com`

## Clerk Authentication Access

### Overview

BroLab Entertainment uses **Clerk** for authentication and user management. Agents can interact with Clerk in production through various methods.

### Clerk Production Configuration

**Development Environment:**
- **Clerk Domain:** `https://natural-rattler-88.clerk.accounts.dev`
- **Publishable Key:** `pk_test_bmF0dXJhbC1yYXR0bGVyLTg4LmNsZXJrLmFjY291bnRzLmRldiQ`

**Production Environment:**
- **Clerk Domain:** `https://clerk.brolabentertainment.com` (custom domain)
- **Publishable Key:** `pk_live_...` (to be configured)

### What Agents Can Access via Clerk

#### ✅ Public Clerk Endpoints

1. **Sign-In Page**
   ```typescript
   // Navigate to sign-in
   await mcp_playwright_browser_navigate({
     url: "https://brolabentertainment.com/sign-in"
   })
   
   // Take screenshot
   await mcp_playwright_browser_take_screenshot({
     filename: "clerk-sign-in.png"
   })
   ```

2. **Sign-Up Page**
   ```typescript
   await mcp_playwright_browser_navigate({
     url: "https://brolabentertainment.com/sign-up"
   })
   ```

3. **User Profile (requires auth)**
   ```typescript
   await mcp_playwright_browser_navigate({
     url: "https://brolabentertainment.com/user-profile"
   })
   ```

4. **Organization Switcher (requires auth)**
   - Visible in the header after authentication
   - Allows switching between organizations

#### ❌ What Agents CANNOT Access

- User credentials and passwords
- Session tokens and JWTs
- Clerk Secret Key
- Webhook secrets
- User PII (email, phone, etc.) without proper authorization

### Testing Authentication Flows

#### 1. Visual Testing (No Authentication Required)

```typescript
// Test sign-in page rendering
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com/sign-in"
})

// Get page snapshot
const snapshot = await mcp_playwright_browser_snapshot()

// Take screenshot
await mcp_playwright_browser_take_screenshot({
  filename: "clerk-sign-in-page.png",
  fullPage: true
})

// Check for Clerk components
const hasClerkUI = snapshot.includes("Sign in") || snapshot.includes("Email")
```

#### 2. Scraping Auth Pages

```typescript
// Scrape sign-in page structure
const signInPage = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com/sign-in",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract authentication form fields and social login options",
    schema: {
      type: "object",
      properties: {
        formFields: {
          type: "array",
          items: { type: "string" }
        },
        socialProviders: {
          type: "array",
          items: { type: "string" }
        },
        hasPasswordReset: { type: "boolean" }
      }
    }
  }
})
```

#### 3. Testing Protected Routes

```typescript
// Test that protected routes redirect to sign-in
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com/studio"
})

// Check if redirected to sign-in
const currentUrl = await mcp_playwright_browser_evaluate({
  function: "() => window.location.href"
})

// Should redirect to /sign-in if not authenticated
const isRedirected = currentUrl.includes("/sign-in")
```

#### 4. Organization Multi-Tenancy Testing

```typescript
// Test organization-based routing
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com/orgs/test-org"
})

// Check if organization context is required
const snapshot = await mcp_playwright_browser_snapshot()
```

### Clerk Dashboard Access (via Vercel MCP)

Agents can query Clerk-related environment variables through Vercel MCP:

```bash
# List environment variables (non-sensitive)
vercel env ls

# Check Clerk configuration
vercel env pull .env.production
```

**Accessible Variables:**
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` (public)
- `NEXT_PUBLIC_CLERK_SIGN_IN_URL` (public)
- `NEXT_PUBLIC_CLERK_SIGN_UP_URL` (public)

**NOT Accessible:**
- `CLERK_SECRET_KEY` (sensitive)
- `CLERK_WEBHOOK_SECRET` (sensitive)
- `CLERK_JWT_ISSUER_DOMAIN` (internal)

### Monitoring Clerk Integration

#### 1. Check Clerk Component Rendering

```typescript
// Verify Clerk components load correctly
const clerkCheck = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["json"],
  jsonOptions: {
    prompt: "Check if Clerk authentication components are present in the header",
    schema: {
      type: "object",
      properties: {
        hasUserButton: { type: "boolean" },
        hasSignInButton: { type: "boolean" },
        hasOrganizationSwitcher: { type: "boolean" }
      }
    }
  }
})
```

#### 2. Test CSP Headers for Clerk

```typescript
// Verify Content Security Policy allows Clerk
const response = await mcp_fetch_fetch({
  url: "https://brolabentertainment.com"
})

// Check CSP headers include Clerk domains
// Should include: *.clerk.accounts.dev and clerk.brolabentertainment.com
```

#### 3. Monitor Authentication Errors

```typescript
// Check browser console for Clerk errors
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com/sign-in"
})

const consoleMessages = await mcp_playwright_browser_console_messages({
  level: "error"
})

// Look for Clerk-related errors
const clerkErrors = consoleMessages.filter(msg => 
  msg.includes("clerk") || msg.includes("authentication")
)
```

### Clerk Webhook Testing

Agents can verify webhook endpoints are configured:

```typescript
// Check if webhook endpoint exists
const webhookCheck = await mcp_fetch_fetch({
  url: "https://brolabentertainment.com/api/clerk/webhook"
})

// Should return 405 Method Not Allowed (GET not supported)
// POST requests require valid Clerk signature
```

### Best Practices for Clerk Testing

1. **Never attempt to authenticate with real user credentials**
2. **Use visual testing and page structure analysis**
3. **Test redirect flows without actual authentication**
4. **Monitor CSP headers for Clerk domain allowlisting**
5. **Check for Clerk component rendering issues**
6. **Verify protected routes redirect correctly**

### Common Clerk Issues to Monitor

| Issue | Detection Method | Solution |
|-------|-----------------|----------|
| Clerk UI not loading | Screenshot shows blank auth page | Check CSP headers |
| Redirect loop | URL keeps changing to /sign-in | Check middleware configuration |
| Organization not syncing | Protected routes fail | Verify JWT issuer domain |
| Webhook failures | Check Vercel logs | Verify webhook secret |

## X (Twitter) API Access

### Overview

BroLab Entertainment has an active presence on X (formerly Twitter) with accounts configured for API access. Agents can interact with X to monitor brand presence, analyze engagement, and automate social media tasks.

### X Account Information

**Primary Accounts:**
- **Main Account:** [@brolabent](https://twitter.com/brolabent)
- **App Account:** [@brolabapp](https://x.com/brolabapp)

**Website Integration:**
- X links in footer: `https://x.com/brolabapp`
- Twitter Card metadata configured on all pages
- Schema.org social profile links

### X Developer Console Configuration

**Prerequisites:**
- X Developer Account configured
- App created in X Developer Portal
- API credentials generated (Bearer Token, API Key, API Secret)

**Required Credentials (to be configured in PaperClip AI):**
```env
# X API v2 Credentials
X_API_KEY=your_api_key
X_API_SECRET=your_api_secret
X_BEARER_TOKEN=your_bearer_token
X_ACCESS_TOKEN=your_access_token
X_ACCESS_TOKEN_SECRET=your_access_token_secret
```

### What Agents Can Do with X API

#### 1. Monitor Brand Mentions

```typescript
// Search for mentions of BroLab Entertainment
// Using X API v2 search endpoint
const mentions = await fetch('https://api.twitter.com/2/tweets/search/recent', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${X_BEARER_TOKEN}`,
    'Content-Type': 'application/json'
  },
  params: {
    query: 'BroLab Entertainment OR @brolabent OR @brolabapp',
    max_results: 10,
    'tweet.fields': 'created_at,public_metrics,author_id'
  }
})
```

#### 2. Analyze Account Performance

```typescript
// Get account metrics
const accountMetrics = await fetch('https://api.twitter.com/2/users/by/username/brolabent', {
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${X_BEARER_TOKEN}`
  },
  params: {
    'user.fields': 'public_metrics,created_at,description'
  }
})

// Returns: followers_count, following_count, tweet_count, listed_count
```

#### 3. Post Updates (with proper authorization)

```typescript
// Post a tweet about new features
const tweet = await fetch('https://api.twitter.com/2/tweets', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${X_BEARER_TOKEN}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    text: '🎵 New feature alert! BroLab Entertainment now supports...'
  })
})
```

#### 4. Monitor Competitor Activity

```typescript
// Track competitor mentions and trends
const competitors = ['beatstars', 'airbit', 'traktrain']
for (const competitor of competitors) {
  const tweets = await fetch(`https://api.twitter.com/2/tweets/search/recent`, {
    params: {
      query: competitor,
      max_results: 10
    }
  })
}
```

#### 5. Analyze Engagement Metrics

```typescript
// Get tweet engagement for recent posts
const userTweets = await fetch('https://api.twitter.com/2/users/:id/tweets', {
  params: {
    'tweet.fields': 'public_metrics',
    max_results: 100
  }
})

// Analyze: likes, retweets, replies, impressions
```

#### 6. Track Hashtag Performance

```typescript
// Monitor BroLab-related hashtags
const hashtags = ['#BroLabEntertainment', '#BeatMakers', '#MusicProducers']
for (const tag of hashtags) {
  const results = await fetch('https://api.twitter.com/2/tweets/search/recent', {
    params: {
      query: tag,
      'tweet.fields': 'public_metrics,created_at'
    }
  })
}
```

### X API Endpoints Available to Agents

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| `/2/tweets/search/recent` | Search tweets (last 7 days) | 450 requests/15min |
| `/2/users/by/username/:username` | Get user info | 300 requests/15min |
| `/2/users/:id/tweets` | Get user's tweets | 1500 requests/15min |
| `/2/tweets` | Post a tweet | 200 requests/15min |
| `/2/tweets/:id` | Get tweet details | 300 requests/15min |
| `/2/users/:id/followers` | Get followers | 15 requests/15min |
| `/2/users/:id/following` | Get following | 15 requests/15min |

### Use Cases for Agents

#### Use Case 1: Daily Brand Monitoring

```typescript
// Morning report: Check brand mentions and sentiment
async function dailyBrandReport() {
  // 1. Get mentions
  const mentions = await searchTweets('BroLab Entertainment OR @brolabent')
  
  // 2. Get account metrics
  const metrics = await getUserMetrics('brolabent')
  
  // 3. Analyze sentiment (using AI)
  const sentiment = await analyzeSentiment(mentions)
  
  // 4. Generate report
  return {
    date: new Date(),
    mentions: mentions.length,
    followers: metrics.followers_count,
    sentiment: sentiment.overall,
    topMentions: mentions.slice(0, 5)
  }
}
```

#### Use Case 2: Competitor Analysis

```typescript
// Weekly competitor tracking
async function weeklyCompetitorAnalysis() {
  const competitors = ['beatstars', 'airbit', 'traktrain']
  const analysis = []
  
  for (const competitor of competitors) {
    const tweets = await searchTweets(competitor)
    const engagement = calculateEngagement(tweets)
    
    analysis.push({
      competitor,
      tweetCount: tweets.length,
      avgEngagement: engagement.average,
      topTopics: extractTopics(tweets)
    })
  }
  
  return analysis
}
```

#### Use Case 3: Content Performance Tracking

```typescript
// Track performance of BroLab tweets
async function trackContentPerformance() {
  const tweets = await getUserTweets('brolabent', { max_results: 100 })
  
  const performance = tweets.map(tweet => ({
    id: tweet.id,
    text: tweet.text,
    likes: tweet.public_metrics.like_count,
    retweets: tweet.public_metrics.retweet_count,
    replies: tweet.public_metrics.reply_count,
    impressions: tweet.public_metrics.impression_count,
    engagement_rate: calculateEngagementRate(tweet)
  }))
  
  return performance.sort((a, b) => b.engagement_rate - a.engagement_rate)
}
```

#### Use Case 4: Automated Social Listening

```typescript
// Listen for keywords related to beat selling
async function socialListening() {
  const keywords = [
    'selling beats online',
    'beat marketplace',
    'music producer platform',
    'sell beats directly'
  ]
  
  const insights = []
  
  for (const keyword of keywords) {
    const tweets = await searchTweets(keyword)
    insights.push({
      keyword,
      volume: tweets.length,
      topTweets: tweets.slice(0, 3),
      sentiment: analyzeSentiment(tweets)
    })
  }
  
  return insights
}
```

#### Use Case 5: Influencer Identification

```typescript
// Find music producers with large followings
async function findInfluencers() {
  const keywords = ['music producer', 'beat maker', 'audio engineer']
  const influencers = []
  
  for (const keyword of keywords) {
    const users = await searchUsers(keyword)
    const filtered = users.filter(user => 
      user.public_metrics.followers_count > 10000 &&
      user.public_metrics.followers_count < 100000 // Micro-influencers
    )
    influencers.push(...filtered)
  }
  
  return influencers.sort((a, b) => 
    b.public_metrics.followers_count - a.public_metrics.followers_count
  )
}
```

### X API Best Practices for Agents

#### 1. Rate Limiting
```typescript
// Implement exponential backoff
async function apiCallWithRetry(endpoint, options, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(endpoint, options)
      
      if (response.status === 429) {
        // Rate limited - wait and retry
        const resetTime = response.headers.get('x-rate-limit-reset')
        const waitTime = (resetTime * 1000) - Date.now()
        await sleep(waitTime)
        continue
      }
      
      return response
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await sleep(Math.pow(2, i) * 1000) // Exponential backoff
    }
  }
}
```

#### 2. Caching
```typescript
// Cache frequently accessed data
const cache = new Map()

async function getCachedUserMetrics(username) {
  const cacheKey = `user:${username}`
  const cached = cache.get(cacheKey)
  
  if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour
    return cached.data
  }
  
  const data = await getUserMetrics(username)
  cache.set(cacheKey, { data, timestamp: Date.now() })
  return data
}
```

#### 3. Error Handling
```typescript
// Robust error handling
async function safeApiCall(endpoint, options) {
  try {
    const response = await fetch(endpoint, options)
    
    if (!response.ok) {
      const error = await response.json()
      console.error('X API Error:', error)
      return null
    }
    
    return await response.json()
  } catch (error) {
    console.error('Network Error:', error)
    return null
  }
}
```

### Security Considerations

#### ✅ What Agents CAN Do
- Read public tweets and profiles
- Search public content
- Analyze public metrics
- Post tweets (with proper authorization)
- Monitor brand mentions
- Track hashtags and trends

#### ❌ What Agents CANNOT Do
- Access private/protected accounts
- Read DMs without explicit permission
- Impersonate users
- Violate X's Terms of Service
- Spam or abuse the API
- Share API credentials publicly

### Monitoring X Integration

#### 1. Check X Card Metadata

```typescript
// Verify Twitter Card tags are present
const metadata = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract Twitter Card metadata",
    schema: {
      type: "object",
      properties: {
        twitterCard: { type: "string" },
        twitterSite: { type: "string" },
        twitterTitle: { type: "string" },
        twitterDescription: { type: "string" },
        twitterImage: { type: "string" }
      }
    }
  }
})

// Should return:
// twitterCard: "summary_large_image"
// twitterSite: "@brolabent"
```

#### 2. Validate X Links

```typescript
// Check if X links in footer are working
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com"
})

const snapshot = await mcp_playwright_browser_snapshot()

// Verify X link exists: https://x.com/brolabapp
const hasXLink = snapshot.includes("x.com/brolabapp")
```

#### 3. Test X Card Preview

```typescript
// Use X Card Validator
// https://cards-dev.twitter.com/validator
const cardValidation = await mcp_fetch_fetch({
  url: "https://cards-dev.twitter.com/validator",
  // Test with: https://brolabentertainment.com
})
```

### X API Integration Checklist

- [ ] X Developer Account created
- [ ] App registered in X Developer Portal
- [ ] API credentials generated (Bearer Token, API Key/Secret)
- [ ] Credentials configured in PaperClip AI
- [ ] Rate limiting implemented
- [ ] Error handling configured
- [ ] Caching strategy in place
- [ ] Twitter Card metadata verified on website
- [ ] X links tested in footer
- [ ] Brand monitoring workflow set up

### Resources

- **X Developer Portal:** https://developer.twitter.com/en/portal/dashboard
- **X API Documentation:** https://developer.twitter.com/en/docs/twitter-api
- **Twitter Card Validator:** https://cards-dev.twitter.com/validator
- **Rate Limits:** https://developer.twitter.com/en/docs/twitter-api/rate-limits
- **BroLab X Account:** https://x.com/brolabapp

### Contact for X API Issues

For X API access or configuration issues:
- **Email:** support@brolabentertainment.com
- **X Support:** https://help.twitter.com/en/using-twitter/twitter-supported-browsers

## Access Methods for Agents

### 1. MCP Vercel Integration

Agents can use the Vercel MCP server to:
- Query deployment status
- Access deployment logs
- Retrieve environment variables (non-sensitive)
- Monitor build status

**Example MCP commands:**
```bash
# List deployments
vercel list

# Get deployment details
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>
```

### 2. Web Scraping with Firecrawl

Use Firecrawl MCP tools to scrape and analyze the production site:

```typescript
// Scrape the landing page
mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["markdown"],
  onlyMainContent: true
})

// Search for specific content
mcp_firecrawl_firecrawl_search({
  query: "pricing plans BroLab Entertainment",
  limit: 5,
  sources: [{ type: "web" }]
})

// Map the site structure
mcp_firecrawl_firecrawl_map({
  url: "https://brolabentertainment.com"
})
```

### 3. Direct HTTP Requests

Use the fetch MCP tool to make API calls:

```typescript
// Fetch the landing page
mcp_fetch_fetch({
  url: "https://brolabentertainment.com"
})

// Check API endpoints
mcp_fetch_fetch({
  url: "https://brolabentertainment.com/api/health"
})
```

### 4. Playwright Browser Automation

For interactive testing and screenshots:

```typescript
// Navigate to the site
mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com"
})

// Take a screenshot
mcp_playwright_browser_take_screenshot({
  filename: "landing-page.png",
  fullPage: true
})

// Get page snapshot
mcp_playwright_browser_snapshot()
```

## Key Production Endpoints

### Public Pages
- `/` - Landing page
- `/pricing` - Pricing page
- `/contact` - Contact page
- `/privacy` - Privacy policy
- `/terms` - Terms of service
- `/sign-in` - Clerk sign-in
- `/sign-up` - Clerk sign-up

### API Routes
- `/api/clerk/webhook` - Clerk webhook handler
- `/api/stripe/webhook` - Stripe platform webhook
- `/api/stripe/connect-webhook` - Stripe Connect webhook
- `/api/stripe/checkout` - Checkout session creation

### Protected Routes
- `/onboarding` - User onboarding flow
- `/studio` - Creator dashboard
- `/studio/beats` - Beat management
- `/studio/services` - Service management
- `/studio/settings` - Workspace settings

## Environment Context

### Production Environment Variables

**Public (accessible to agents):**
```env
NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com
NEXT_PUBLIC_CONVEX_URL=https://cautious-retriever-22.convex.cloud
NEXT_PUBLIC_CONVEX_SITE_URL=https://cautious-retriever-22.convex.site
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_bmF0dXJhbC1yYXR0bGVyLTg4LmNsZXJrLmFjY291bnRzLmRldiQ
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

**Private (NOT accessible):**
- `CLERK_SECRET_KEY` (sk_test_... or sk_live_...)
- `CLERK_JWT_ISSUER_DOMAIN` (https://natural-rattler-88.clerk.accounts.dev)
- `CLERK_WEBHOOK_SECRET` (whsec_...)
- `STRIPE_SECRET_KEY` (sk_test_... or sk_live_...)
- `STRIPE_WEBHOOK_SECRET` (whsec_...)
- `STRIPE_CONNECT_WEBHOOK_SECRET` (whsec_...)
- `RESEND_API_KEY` (re_...)

## Testing Scenarios for Agents

### 1. Landing Page Analysis

```typescript
// Scrape and analyze the landing page
const landingPage = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["markdown", "json"],
  jsonOptions: {
    prompt: "Extract the main value propositions and CTAs",
    schema: {
      type: "object",
      properties: {
        headline: { type: "string" },
        subheadline: { type: "string" },
        ctas: {
          type: "array",
          items: { type: "string" }
        },
        features: {
          type: "array",
          items: { type: "string" }
        }
      }
    }
  }
})
```

### 2. Pricing Page Verification

```typescript
// Extract pricing information
const pricing = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com/pricing",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract all pricing plans with features and prices",
    schema: {
      type: "object",
      properties: {
        plans: {
          type: "array",
          items: {
            type: "object",
            properties: {
              name: { type: "string" },
              price: { type: "string" },
              features: {
                type: "array",
                items: { type: "string" }
              }
            }
          }
        }
      }
    }
  }
})
```

### 3. Authentication Flow Testing

```typescript
// Navigate to sign-in page
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com/sign-in"
})

// Take screenshot
await mcp_playwright_browser_take_screenshot({
  filename: "sign-in-page.png"
})

// Get page structure
const snapshot = await mcp_playwright_browser_snapshot()
```

### 4. Storefront Discovery

```typescript
// Map all tenant storefronts
const storefronts = await mcp_firecrawl_firecrawl_search({
  query: "site:brolabentertainment.com storefront",
  limit: 10
})
```

## Monitoring & Analytics

### Performance Monitoring

```typescript
// Check page load performance
const performance = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract performance metrics if visible"
  }
})
```

### SEO Analysis

```typescript
// Analyze SEO elements
const seo = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract SEO metadata: title, description, og tags",
    schema: {
      type: "object",
      properties: {
        title: { type: "string" },
        description: { type: "string" },
        ogTitle: { type: "string" },
        ogDescription: { type: "string" },
        ogImage: { type: "string" }
      }
    }
  }
})
```

## Security Considerations

### What Agents CAN Access
✅ Public pages and content
✅ Public API endpoints (health checks, etc.)
✅ Deployment status and logs (via Vercel MCP)
✅ Public environment variables
✅ Page structure and metadata

### What Agents CANNOT Access
❌ Private API keys and secrets
❌ User authentication tokens
❌ Database records (Convex)
❌ Stripe customer data
❌ Clerk user data
❌ Protected routes without authentication

## Best Practices for Agents

### 1. Rate Limiting
- Respect rate limits (100 req/min per IP)
- Use caching when possible
- Batch requests efficiently

### 2. Error Handling
- Handle 404s gracefully
- Retry on 5xx errors with exponential backoff
- Log all errors for debugging

### 3. Data Privacy
- Never log sensitive user data
- Redact PII from screenshots
- Follow GDPR/privacy guidelines

### 4. Performance
- Use `onlyMainContent: true` for faster scraping
- Limit `fullPage` screenshots to when necessary
- Cache frequently accessed data

## Example Agent Workflows

### Workflow 1: Landing Page CRO Analysis

```typescript
// 1. Scrape the landing page
const page = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["markdown"]
})

// 2. Take screenshot for visual analysis
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com"
})
await mcp_playwright_browser_take_screenshot({
  filename: "landing-page-full.png",
  fullPage: true
})

// 3. Analyze with CRO skill
// Use .agent/skills/skills/page-cro/SKILL.md
```

### Workflow 2: Pricing Page Optimization

```typescript
// 1. Extract pricing data
const pricing = await mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com/pricing",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract pricing plans, features, and CTAs"
  }
})

// 2. Screenshot for visual analysis
await mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com/pricing"
})
await mcp_playwright_browser_take_screenshot({
  filename: "pricing-page.png"
})

// 3. Apply paywall-upgrade-cro skill
// Use .agent/skills/skills/paywall-upgrade-cro/SKILL.md
```

### Workflow 3: Multi-Page Site Audit

```typescript
// 1. Map the entire site
const siteMap = await mcp_firecrawl_firecrawl_map({
  url: "https://brolabentertainment.com"
})

// 2. Scrape key pages
const pages = ["/", "/pricing", "/contact", "/terms", "/privacy"]
for (const page of pages) {
  const content = await mcp_firecrawl_firecrawl_scrape({
    url: `https://brolabentertainment.com${page}`,
    formats: ["markdown"]
  })
  // Analyze content...
}
```

## Troubleshooting

### Issue: Cannot access production site

**Solution:**
1. Verify the URL is correct: `https://brolabentertainment.com`
2. Check Vercel deployment status
3. Ensure no firewall/IP blocking

### Issue: Scraping returns empty content

**Solution:**
1. Use `waitFor: 5000` for JavaScript-rendered content
2. Try `firecrawl_map` to find the correct URL
3. Use `firecrawl_agent` for complex SPAs

### Issue: Rate limiting errors

**Solution:**
1. Reduce request frequency
2. Use caching
3. Implement exponential backoff

## Resources

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Convex Dashboard:** https://dashboard.convex.dev
- **Clerk Dashboard:** https://dashboard.clerk.com
- **Stripe Dashboard:** https://dashboard.stripe.com

## Contact

For production access issues or questions:
- **Email:** support@brolabentertainment.com
- **Documentation:** See `.kiro/steering/` for detailed docs

---

**Last Updated:** January 2026
**Version:** 1.0
