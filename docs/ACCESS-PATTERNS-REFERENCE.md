# Access Patterns Reference: Common Tasks & How to Do Them

Quick reference guide for accomplishing common agent tasks using the PaperClip AI architecture.

---

## 📋 Task Index

1. [Analyze the Landing Page](#1-analyze-the-landing-page)
2. [Audit Site Structure](#2-audit-site-structure)
3. [Monitor Social Media](#3-monitor-social-media)
4. [Check Deployment Status](#4-check-deployment-status)
5. [Extract Pricing Information](#5-extract-pricing-information)
6. [Test User Flows](#6-test-user-flows)
7. [Compare with Competitors](#7-compare-with-competitors)
8. [Verify Configuration](#8-verify-configuration)

---

## 1. Analyze the Landing Page

### Task
Evaluate the landing page for content quality, UX, and conversion optimization.

### Pattern
```
Scrape → Screenshot → Analyze → Report
```

### Tools Needed
- ✅ Firecrawl (scrape content)
- ✅ Playwright (screenshot)
- ✅ No authentication needed

### Step-by-Step

**Step 1: Scrape the content**
```typescript
const content = await firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["markdown"],
  onlyMainContent: true
})
```
Look for:
- Headline (first H1)
- Value proposition (what's the offer?)
- Call-to-action (what do you want users to do?)
- Social proof (testimonials, logos, metrics)
- Key features or benefits
- Friction points (anything confusing?)

**Step 2: Extract structured data (CTAs)**
```typescript
const ctaData = await firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract all buttons and CTAs with their text and position"
  }
})
```
Look for:
- Number of CTAs
- CTA text clarity
- CTA placement (above fold? repeated?)
- Button colors and prominence

**Step 3: Take a full-page screenshot**
```typescript
await navigate({
  url: "https://brolabentertainment.com"
})
await screenshot({
  filename: "landing-page-full.png",
  fullPage: true
})
```
Look for:
- Visual hierarchy (most important elements prominent?)
- Mobile responsiveness
- Image quality
- Color scheme consistency
- White space and readability

**Step 4: Analyze and report**
```
Report Format:
─────────────
Current State:
  • Headline: [quote]
  • Value Prop: [assessment]
  • CTAs: [count and clarity]
  • Social Proof: [present? quality?]

CRO Score: [0-100]
  - Clarity: [score]
  - Trust: [score]
  - Urgency: [score]

Top 3 Improvements:
  1. [recommendation with rationale]
  2. [recommendation with rationale]
  3. [recommendation with rationale]

Effort Level:
  • Easy wins (1-2 hours)
  • Medium lifts (4-8 hours)
  • Major changes (1+ week)
```

### Time Estimate
15-20 minutes

### Success Criteria
- ✅ Screenshots show current state
- ✅ Content analysis is specific (use quotes)
- ✅ Recommendations are actionable
- ✅ Includes effort estimates

---

## 2. Audit Site Structure

### Task
Map the entire website and identify structural issues.

### Pattern
```
Map → Scrape Pages → Screenshot → Analyze → Report
```

### Tools Needed
- ✅ Firecrawl (map and scrape)
- ✅ Playwright (screenshots)
- ✅ No authentication needed

### Step-by-Step

**Step 1: Map the entire site**
```typescript
const siteMap = await firecrawl_map({
  url: "https://brolabentertainment.com"
})
// Returns: List of all URLs on the site
```

**Step 2: Identify key pages to audit**
```
Priority pages:
  - / (homepage)
  - /pricing (pricing)
  - /contact (contact)
  - /terms, /privacy (legal)
  - /about (company info)
  - Additional important pages from site map
```

**Step 3: Scrape each key page**
```typescript
for (const page of ["/", "/pricing", "/contact"]) {
  const content = await firecrawl_scrape({
    url: `https://brolabentertainment.com${page}`,
    formats: ["markdown"],
    onlyMainContent: true
  })
  // Analyze for:
  // - Outdated information
  // - Broken references
  // - Missing content
  // - SEO issues (headings, structure)
}
```

**Step 4: Screenshot each key page**
```typescript
for (const page of ["/", "/pricing", "/contact"]) {
  await navigate({
    url: `https://brolabentertainment.com${page}`
  })
  await screenshot({
    filename: `audit-${page.replace('/', 'home')}.png`,
    fullPage: true
  })
}
```

**Step 5: Analyze structure**
```
Audit Checklist:
  ✓ All important pages present
  ✓ No orphaned pages (unreachable)
  ✓ Navigation menu complete
  ✓ Heading hierarchy correct (one H1 per page)
  ✓ Links are working (non-404)
  ✓ Mobile responsive
  ✓ Content current (no outdated dates)
  ✓ CTAs present where needed
```

**Step 6: Report findings**
```
Audit Report:
─────────────
Site Structure:
  • Total pages: [count]
  • Key sections: [list]
  • Navigation depth: [levels]

Issues Found:
  1. [Issue] - Priority: [High/Medium/Low]
     Location: [page]
     Impact: [user confusion/broken flow/missing info]
     Fix: [specific recommendation]
  
  2. [More issues...]

Strengths:
  • [What's working well]
  • [What's well-structured]

Recommendations:
  • [High priority]
  • [Medium priority]
  • [Nice to have]
```

### Time Estimate
30-45 minutes

### Success Criteria
- ✅ All pages mapped and analyzed
- ✅ Issues are specific with locations
- ✅ Recommendations include effort levels
- ✅ Screenshots support findings

---

## 3. Monitor Social Media

### Task
Track mentions of BroLab and competitor activity on X/Twitter.

### Pattern
```
Search → Analyze → Compare → Report
```

### Tools Needed
- ✅ Firecrawl (search)
- ✅ Fetch (X API calls, if credentials available)
- ✅ No authentication needed

### Step-by-Step

**Step 1: Search for BroLab mentions**
```typescript
const mentions = await firecrawl_search({
  query: "BroLab Entertainment OR @brolabent OR @brolabapp",
  limit: 20
})
```
Collect:
- Tweet/post URL
- Author
- Text content
- Engagement (likes, replies, retweets)
- Sentiment (positive/negative/neutral)

**Step 2: Get account metrics** (optional, requires X API)
```typescript
// Get metrics for @brolabent
const metrics = await fetch({
  url: "https://api.twitter.com/2/users/by/username/brolabent",
  headers: { "Authorization": "Bearer YOUR_BEARER_TOKEN" }
})
// Extract: followers, engagement rate, recent tweets
```

**Step 3: Monitor competitors**
```typescript
const competitors = ["beatstars", "airbit", "traktrain"]

for (const competitor of competitors) {
  const tweets = await firecrawl_search({
    query: competitor,
    limit: 10
  })
  // Analyze:
  // - Volume (how much discussion)
  // - Topics (what are people saying)
  // - Engagement (what performs well)
  // - Any gaps BroLab could fill
}
```

**Step 4: Analyze sentiment**
```
For each mention, categorize:
  ✅ Positive: Praising BroLab, recommending it
  ⚪ Neutral: Just mentioning, no opinion
  ❌ Negative: Criticizing, complaining

Note the reasons (price, features, competition, etc.)
```

**Step 5: Report findings**
```
Social Media Monitoring Report:
────────────────────────────
Period: [date range]

BroLab Mentions:
  • Total: [count]
  • Positive: [count] - [%]
  • Neutral: [count] - [%]
  • Negative: [count] - [%]
  • Top mentions: [links and quotes]

Account Metrics (@brolabent):
  • Followers: [count]
  • Engagement Rate: [%]
  • Recent tweet performance: [best/worst]

Competitor Analysis:
  Beatstars:
    • Volume: [count]
    • Top topics: [list]
    • Engagement: [average likes/retweets]
  
  [Repeat for other competitors]

Opportunities:
  1. [Gap or trend BroLab could exploit]
  2. [Emerging interest in topic]
  3. [Response to competitor move]

Risks:
  • [Any negative sentiment]
  • [Competitor advantage]
```

### Time Estimate
20-30 minutes

### Success Criteria
- ✅ Mentions include specific URLs/quotes
- ✅ Sentiment analysis is clear
- ✅ Competitor comparison is balanced
- ✅ Opportunities are actionable

---

## 4. Check Deployment Status

### Task
Verify production is deployed, working, and configured correctly.

### Pattern
```
List Deployments → Inspect → Check Logs → Report
```

### Tools Needed
- ✅ Vercel MCP (only tool needed)
- ✅ No authentication needed

### Step-by-Step

**Step 1: List all deployments**
```bash
vercel list
```
Look for:
- Current production URL
- Latest deployment status (Ready/Building/Error)
- Time of last deployment
- Preview deployments (if any)

**Step 2: Inspect production deployment**
```bash
vercel inspect https://brolabentertainment.com
```
Look for:
- Deployment ID
- Build time
- Environment variables (public only)
- Source branch and commit
- Error logs (if build failed)

**Step 3: Check deployment logs**
```bash
vercel logs https://brolabentertainment.com
```
Look for:
- Recent errors or exceptions
- Webhook events (Stripe, Clerk, etc.)
- Performance issues
- Any warnings

**Step 4: Verify configuration**
```
Checklist:
  ✓ NEXT_PUBLIC_SITE_URL is correct
  ✓ NEXT_PUBLIC_CONVEX_URL is correct
  ✓ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is present
  ✓ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is present
  ✓ Build logs show no errors
  ✓ Deployment is marked "Ready"
```

**Step 5: Test with Playwright**
```typescript
// Test that the site is actually responding
await navigate({
  url: "https://brolabentertainment.com"
})
const screenshot = await screenshot({
  filename: "deployment-check.png"
})
// If screenshot succeeds, site is working
```

**Step 6: Report status**
```
Deployment Status Report:
─────────────────────────
Overall Status: ✅ READY / ⚠️ WARNING / ❌ ERROR

Production Deployment:
  • URL: https://brolabentertainment.com
  • Status: [Ready/Building/Error]
  • Last deployed: [time]
  • Deployed by: [branch/commit]

Configuration:
  • NEXT_PUBLIC_SITE_URL: ✅ Correct
  • NEXT_PUBLIC_CONVEX_URL: ✅ Correct
  • NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ✅ Present
  • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ✅ Present

Recent Logs:
  • Last 10 errors: [summary]
  • Last successful request: [time]

Recommendation:
  • ✅ All clear, production is operational
  • ⚠️ Monitor [issue], may need attention
  • ❌ Critical issue: [problem]. Needs human engineer.
```

### Time Estimate
10-15 minutes

### Success Criteria
- ✅ Deployment status is clear
- ✅ Configuration verified
- ✅ Live test confirms site is working
- ✅ Any errors are documented

---

## 5. Extract Pricing Information

### Task
Get current pricing tiers, prices, and features from the pricing page.

### Pattern
```
Navigate → Scrape Structured → Analyze → Report
```

### Tools Needed
- ✅ Firecrawl (extract pricing data)
- ✅ Playwright (screenshot)
- ✅ No authentication needed

### Step-by-Step

**Step 1: Scrape pricing page with structured extraction**
```typescript
const pricing = await firecrawl_scrape({
  url: "https://brolabentertainment.com/pricing",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract all pricing tiers, prices (monthly/annual), and features included in each tier"
  }
})
```

**Step 2: Screenshot pricing page**
```typescript
await navigate({
  url: "https://brolabentertainment.com/pricing"
})
await screenshot({
  filename: "pricing-page.png",
  fullPage: true
})
```

**Step 3: Analyze pricing structure**
```
Analysis checklist:
  ✓ Number of tiers
  ✓ Price points (competitive?)
  ✓ Feature differentiation (clear why choose higher?)
  ✓ CTAs (clear buy buttons?)
  ✓ Comparison clarity (easy to compare?)
  ✓ Trial/money-back guarantee (any?)
  ✓ Annual vs monthly discounts
```

**Step 4: Report findings**
```
Pricing Analysis:
──────────────
Current Pricing Structure:

Tier 1: [Name]
  • Price: $X/month
  • Annual: $X/year (savings: X%)
  • Features:
    - [feature]
    - [feature]
  • Target: [type of user]

Tier 2: [Name]
  • Price: $X/month
  • Annual: $X/year
  • Features: [list]
  • Target: [type]

Tier 3: [Name] / Enterprise
  • Price: [Custom/X+]
  • Features: [list]
  • Target: [type]

Analysis:
  • Clarity: [Good/Could improve]
  • Competitiveness: [vs. competitors]
  • Feature value: [Is premium worth it?]
  • CTAs: [Clear? Prominent?]

Recommendations:
  1. [If pricing needs adjustment]
  2. [If feature tiers unclear]
  3. [If CTAs not prominent]
```

### Time Estimate
10-15 minutes

### Success Criteria
- ✅ All tiers captured with prices
- ✅ Features clearly listed
- ✅ Screenshot shows current state
- ✅ Analysis addresses competitiveness

---

## 6. Test User Flows

### Task
Verify public user flows work correctly (without logging in).

### Pattern
```
Navigate → Follow Flow → Verify → Report
```

### Tools Needed
- ✅ Playwright (navigation and screenshots)
- ✅ No authentication needed

### Step-by-Step

**Step 1: Identify the flow to test**
Examples:
- Landing page → Pricing page → Signup form
- Homepage → Blog post → Related posts
- Services page → Contact form submission
- Browse beats → Add to cart → Checkout (stop at payment)

**Step 2: Navigate through the flow**
```typescript
// Step 1: Homepage
await navigate({
  url: "https://brolabentertainment.com"
})
await screenshot({
  filename: "01-homepage.png"
})

// Step 2: Click to pricing (via page analysis)
await navigate({
  url: "https://brolabentertainment.com/pricing"
})
await screenshot({
  filename: "02-pricing.png"
})

// Step 3: Click to signup
await navigate({
  url: "https://brolabentertainment.com/sign-up"
})
await screenshot({
  filename: "03-signup.png"
})
```

**Step 3: Verify key points**
```
For each step, verify:
  ✓ Page loads (no 404 or error)
  ✓ Content displays correctly
  ✓ Links/navigation work
  ✓ No JavaScript errors (check logs)
  ✓ Mobile responsive (check screenshot)
  ✓ CTAs are clear and clickable
  ✓ Form fields are present (if form)
```

**Step 4: Do NOT submit real data**
```
❌ DO NOT:
  • Enter real email addresses
  • Submit actual forms
  • Complete payment flows
  • Create real accounts

✅ DO:
  • Take screenshots of forms
  • Analyze form layout
  • Check field labels and validation messages
  • Ask humans to test actual submission
```

**Step 5: Report findings**
```
User Flow Test Report:
──────────────────────
Flow Tested: [Homepage → Pricing → Signup]

Results:
  Step 1: Homepage
    ✅ Page loads
    ✅ All sections visible
    ✅ Navigation clear
  
  Step 2: Pricing
    ✅ Page loads
    ✅ Pricing tiers display
    ✅ CTA buttons work
  
  Step 3: Signup
    ✅ Page loads
    ✅ Form fields present
    ✅ Labels clear
    ⚠️ Password requirements not visible

Issues Found:
  1. [Issue with detail]
  2. [Issue with detail]

Recommendations:
  • [Fix needed]
  • [Enhancement]

Test Confidence:
  • Visual: ✅ Complete
  • Navigation: ✅ Complete
  • Form submission: ⚠️ Not tested (ask engineer)
```

### Time Estimate
15-20 minutes per flow

### Success Criteria
- ✅ Screenshots document each step
- ✅ Issues are specific and actionable
- ✅ Clear notes on what wasn't tested
- ✅ Recommendations for improvements

---

## 7. Compare with Competitors

### Task
Research competitor offerings and identify gaps/opportunities for BroLab.

### Pattern
```
Search → Scrape → Screenshot → Analyze → Report
```

### Tools Needed
- ✅ Firecrawl (search and scrape)
- ✅ Playwright (screenshots)
- ✅ No authentication needed

### Step-by-Step

**Step 1: Identify competitors**
```
Music production beat marketplaces:
  • Beatstars (https://beatstars.com)
  • Airbit (https://airbit.com)
  • Traktrain (https://traktrain.com)
  • Splice (https://splice.com)
```

**Step 2: Search for information**
```typescript
// Search for each competitor
const competitors = ["Beatstars", "Airbit", "Traktrain"]

for (const competitor of competitors) {
  const results = await firecrawl_search({
    query: `${competitor} beat marketplace features pricing`,
    limit: 5
  })
  // Analyze results for features, pricing, reviews
}
```

**Step 3: Scrape competitor landing pages**
```typescript
for (const url of ["https://beatstars.com", "https://airbit.com"]) {
  const content = await firecrawl_scrape({
    url: url,
    formats: ["markdown"],
    onlyMainContent: true
  })
  // Extract: value proposition, features, pricing
}
```

**Step 4: Screenshot competitor pages**
```typescript
for (const url of ["https://beatstars.com", "https://airbit.com"]) {
  await navigate({ url: url })
  await screenshot({
    filename: `competitor-${url.replace('https://', '').replace('.com', '')}.png`,
    fullPage: true
  })
}
```

**Step 5: Analyze and compare**
```
Comparison Matrix:
──────────────────
Feature          | BroLab | Beatstars | Airbit | Traktrain
─────────────────────────────────────────────────────────
Pricing Tiers    | [count]| [count]   | [count]| [count]
Royalty Rate     | [X%]   | [X%]      | [X%]   | [X%]
Creator Tools    | [yes]  | [yes]     | [yes]  | [yes]
Mobile App       | [yes]  | [yes]     | [yes]  | [no]
Beats Library    | [X]    | [X]       | [X]    | [X]
Custom Features  | [list] | [list]    | [list] | [list]
```

**Step 6: Report findings**
```
Competitive Analysis:
─────────────────────
Market Overview:
  • Total addressable market: [market size]
  • Key competitors: [list]
  • Market trends: [emerging patterns]

BroLab's Position:
  Strengths:
    • [Advantage vs competitors]
    • [Unique feature]
    • [Better pricing/features]
  
  Weaknesses:
    • [Gap vs competitors]
    • [Missing feature]
    • [Higher/lower pricing]
  
  Opportunities:
    • [Underserved segment]
    • [Emerging need]
    • [Feature opportunity]
  
  Threats:
    • [Competitor advantage]
    • [Market shift]
    • [Pricing pressure]

Recommendations:
  1. [Build feature to close gap]
  2. [Emphasize strength in marketing]
  3. [Expand into opportunity]
```

### Time Estimate
45-60 minutes

### Success Criteria
- ✅ All major competitors analyzed
- ✅ Features compared in matrix
- ✅ Screenshots support analysis
- ✅ SWOT analysis is balanced
- ✅ Recommendations are strategic

---

## 8. Verify Configuration

### Task
Confirm all production environment variables and integrations are correctly configured.

### Pattern
```
Check Vars → Verify URLs → Test Connections → Report
```

### Tools Needed
- ✅ Vercel MCP (environment check)
- ✅ Firecrawl or Fetch (optional, to test endpoints)
- ✅ No authentication needed

### Step-by-Step

**Step 1: Check public environment variables**
```bash
vercel inspect https://brolabentertainment.com
```
Verify:
- NEXT_PUBLIC_SITE_URL = https://brolabentertainment.com
- NEXT_PUBLIC_CONVEX_URL = https://cautious-retriever-22.convex.cloud
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = pk_test_...
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = pk_test_...

**Step 2: Verify URLs are accessible**
```typescript
// Test each endpoint
const endpoints = {
  "Site": "https://brolabentertainment.com",
  "Convex": "https://cautious-retriever-22.convex.cloud",
  "Clerk": "https://natural-rattler-88.clerk.accounts.dev"
}

for (const [name, url] of Object.entries(endpoints)) {
  const response = await fetch({ url: url })
  // Check response status (should be 200 or 3xx redirect)
}
```

**Step 3: Test key pages load correctly**
```typescript
const testPages = [
  "/",
  "/pricing",
  "/sign-in",
  "/sign-up",
  "/terms",
  "/privacy"
]

for (const page of testPages) {
  await navigate({
    url: `https://brolabentertainment.com${page}`
  })
  // Page should load without errors
}
```

**Step 4: Verify integrations**
```
Checklist:
  ✓ Clerk sign-in page loads (public)
  ✓ Stripe publishable key is accessible
  ✓ Convex database is connected (check logs)
  ✓ Email service is configured (check deployment)
  ✓ Webhooks are registered (check Vercel logs)
```

**Step 5: Report configuration status**
```
Configuration Verification Report:
──────────────────────────────────
Environment:
  • NEXT_PUBLIC_SITE_URL: ✅ [value]
  • NEXT_PUBLIC_CONVEX_URL: ✅ [value]
  • NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ✅ Present
  • NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ✅ Present

URL Accessibility:
  • https://brolabentertainment.com: ✅ 200 OK
  • Convex endpoint: ✅ 200 OK
  • Clerk endpoint: ✅ 200 OK

Page Load Tests:
  • Homepage: ✅ Loads correctly
  • Pricing: ✅ Loads correctly
  • Sign-up: ✅ Loads correctly
  • [Other pages]: ✅ All pass

Integration Status:
  • Clerk: ✅ Properly configured
  • Stripe: ✅ Publishable key accessible
  • Convex: ✅ Connected (logs show activity)
  • Email: ✅ Configured

Overall Status: ✅ PRODUCTION READY
  or
Overall Status: ⚠️ ISSUES FOUND
  Issues:
    1. [Issue with detail]
    2. [Recommended fix]
```

### Time Estimate
15-20 minutes

### Success Criteria
- ✅ All env vars verified
- ✅ URLs tested and accessible
- ✅ Key pages load correctly
- ✅ Integrations are functional

---

## 🎯 Quick Decision Tree

**What task am I doing?**

```
├─ Analyzing page content?
│  └─ Use Pattern: Scrape → Screenshot → Analyze
│
├─ Checking if site is broken?
│  └─ Use Pattern: Vercel status → Test pages
│
├─ Finding what's on the site?
│  └─ Use Pattern: Map → Scrape → Screenshot
│
├─ Monitoring competitors or social?
│  └─ Use Pattern: Search → Analyze → Compare
│
├─ Comparing with other sites?
│  └─ Use Pattern: Scrape multiple → Screenshot → Compare
│
└─ Testing user workflows?
   └─ Use Pattern: Navigate → Screenshot → Verify
```

---

## Common Patterns Summary

| Pattern | Use For | Tools | Time |
|---------|---------|-------|------|
| Scrape → Screenshot → Analyze | Content review, CRO | Firecrawl, Playwright | 15-20m |
| Map → Scrape → Screenshot | Site audit | Firecrawl, Playwright | 30-45m |
| Search → Analyze → Compare | Competitor/social analysis | Firecrawl | 20-30m |
| Navigate → Screenshot → Verify | User flow testing | Playwright | 15-20m |
| Vercel inspect → Test | Deployment status | Vercel | 10-15m |
| Scrape structured → Analyze | Data extraction | Firecrawl | 10-15m |

---

**Last updated:** June 2026  
**Version:** 1.0  
**Status:** Ready for agent use
