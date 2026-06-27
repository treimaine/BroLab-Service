# MCP Tools Training: Hands-On Guide

This guide provides detailed, hands-on training for each MCP tool with real examples you can adapt for your tasks.

## Table of Contents

1. [Vercel MCP](#vercel-mcp) — Deployment management
2. [Firecrawl MCP](#firecrawl-mcp) — Web scraping and search
3. [Playwright MCP](#playwright-mcp) — Browser automation
4. [Fetch MCP](#fetch-mcp) — HTTP requests
5. [Common Patterns](#common-patterns) — Real workflow examples

---

## Vercel MCP

### What It Does

Vercel MCP lets you check deployment status, view logs, and inspect configurations without needing direct Vercel access.

### Key Commands

#### 1. List All Deployments
```bash
vercel list
```

**What it returns:**
- URLs of all deployments (production, preview, etc.)
- Deployment status (ready, building, error)
- Timestamps (when deployed)
- Environment (production vs. preview)

**When to use:**
- "Is production deployed?"
- "What version is live?"
- "Did the latest deploy succeed?"

**Example output:**
```
Production: https://brolabentertainment.com (Ready)
Preview:    https://preview-xyz.vercel.app (Ready)
Previous:   https://prev-abc.vercel.app (Ready)
```

---

#### 2. Inspect a Deployment
```bash
vercel inspect https://brolabentertainment.com
```

**What it returns:**
- Deployment ID and URL
- Build status and time
- Environment variables (public only)
- Source branch and commit
- Error logs (if build failed)

**When to use:**
- "Why did the build fail?"
- "Which commit is deployed?"
- "Are environment variables correct?"

**Example use:**
```
Task: Verify production has correct Stripe key configured
Command: vercel inspect https://brolabentertainment.com
Look for: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY in output
Report: "Key is configured and correct" or "Key is missing"
```

---

#### 3. View Production Logs
```bash
vercel logs https://brolabentertainment.com
```

**What it returns:**
- Application logs from production
- Error traces
- Request logs
- Performance metrics

**When to use:**
- "Why is the site returning 500 errors?"
- "Are there JavaScript errors?"
- "What's happening with the Stripe webhook?"

**Example use:**
```
Task: Check if Stripe webhook is receiving events
Command: vercel logs https://brolabentertainment.com | grep stripe
Report: "Last webhook received at [timestamp]" or "No webhooks received in last 24h"
```

---

### When to Use Vercel

✅ **Use Vercel for:**
- Deployment status checks
- Verifying environment configuration
- Debugging build or runtime errors
- Monitoring production logs

❌ **Don't use Vercel for:**
- Changing code (use git)
- Deploying (human engineers do this)
- Accessing secret environment variables
- Modifying configurations

---

## Firecrawl MCP

### What It Does

Firecrawl MCP lets you extract content from websites, search the web, and map site structures without manual browsing.

### Key Functions

#### 1. Scrape a Single Page
```typescript
mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["markdown"],
  onlyMainContent: true
})
```

**What it returns:**
- Full page content in markdown format
- Headings, body text, links
- Images (with alt text if available)
- Structured data (if present)

**Options:**
- `formats` — ["markdown", "json", "html"]. Use markdown for readability.
- `onlyMainContent` — true/false. Set true to skip navigation/footer.
- `jsonOptions` — For structured extraction (e.g., extract only form fields)

**When to use:**
- Extract page copy for analysis
- Get structured content from a page
- Analyze page structure and hierarchy
- Extract links and navigation

**Example workflow:**
```
Task: Analyze landing page copy for clarity and persuasiveness

Step 1: Scrape the page
const content = await scrape({
  url: "https://brolabentertainment.com",
  formats: ["markdown"],
  onlyMainContent: true
})

Step 2: Analyze content
- Read headline and subheading
- Check value proposition clarity
- Review CTA buttons
- Scan social proof sections

Step 3: Report findings
- Current headline: [quote]
- Clarity score: [assessment]
- Recommended improvements: [list]
```

---

#### 2. Extract Structured Data from a Page
```typescript
mcp_firecrawl_firecrawl_scrape({
  url: "https://brolabentertainment.com/pricing",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract pricing tiers and their features"
  }
})
```

**What it returns:**
- Structured JSON with extracted data
- In this case: pricing tiers and features

**Options:**
- `prompt` — Natural language instruction on what to extract
- Can extract: tables, product data, pricing, form fields, etc.

**When to use:**
- Extract pricing information
- Get product features from pages
- Parse form fields
- Extract testimonials or reviews
- Get contact information

**Example use:**
```
Task: Verify all pricing tiers are clearly listed

const pricingData = await scrape({
  url: "https://brolabentertainment.com/pricing",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract all pricing tiers, prices, and what's included in each"
  }
})

Report:
- Tier 1: Basic - $9/month - Features: [list]
- Tier 2: Pro - $29/month - Features: [list]
- Tier 3: Enterprise - Custom - Features: [list]
```

---

#### 3. Search the Web
```typescript
mcp_firecrawl_firecrawl_search({
  query: "BroLab Entertainment reviews",
  limit: 5
})
```

**What it returns:**
- Top search results matching your query
- URL and snippet for each result
- Relevance score

**Options:**
- `query` — What to search for
- `limit` — Number of results (default 10, max 50)

**When to use:**
- Find competitor information
- Search for brand mentions
- Research topics related to music production
- Find reviews or discussions

**Example use:**
```
Task: Monitor online discussion about music production beats

const results = await search({
  query: "music production beats marketplace 2026",
  limit: 10
})

Report:
- Top 3 results overview
- Any mentions of BroLab
- Competitors mentioned
- Emerging trends
```

---

#### 4. Map an Entire Website
```typescript
mcp_firecrawl_firecrawl_map({
  url: "https://brolabentertainment.com"
})
```

**What it returns:**
- Complete list of all URLs on the site
- Site structure/hierarchy
- Which pages link to which
- Page hierarchy (parent/child)

**When to use:**
- Audit site structure
- Find all pages for comprehensive review
- Check for orphaned pages
- Understand site navigation

**Example use:**
```
Task: Audit the site structure to ensure all important pages are present

const siteMap = await map({
  url: "https://brolabentertainment.com"
})

Report:
- Total pages: [count]
- Main sections: [list]
- Missing pages that should exist: [list]
- Orphaned pages (no navigation): [list]
- Recommended structure changes: [list]
```

---

### When to Use Firecrawl

✅ **Use Firecrawl for:**
- Extracting page content
- Scraping data from multiple pages
- Searching for information
- Mapping site structure
- Analyzing public content

❌ **Don't use Firecrawl for:**
- Logging in or accessing protected content
- Accessing private data
- High-volume scraping (respect rate limits)
- Bypassing paywalls or authentication

---

## Playwright MCP

### What It Does

Playwright MCP lets you automate browser actions — navigate sites, take screenshots, and interact with pages like a human would.

### Key Functions

#### 1. Navigate to a URL
```typescript
mcp_playwright_browser_navigate({
  url: "https://brolabentertainment.com/sign-in"
})
```

**What it does:**
- Opens the URL in an automated browser
- Waits for page to load
- Executes any JavaScript
- Readies the page for further actions

**When to use:**
- Before taking screenshots
- Before analyzing page structure
- Before clicking links or elements

**Example:**
```
Task: Take a screenshot of the sign-in page

Step 1: Navigate
await navigate({
  url: "https://brolabentertainment.com/sign-in"
})

Step 2: Wait a moment for page to load
(automatic in the tool)

Step 3: Take screenshot (see next section)
```

---

#### 2. Take a Screenshot
```typescript
mcp_playwright_browser_take_screenshot({
  filename: "landing-page.png",
  fullPage: true
})
```

**What it returns:**
- PNG image of the page
- Saved to specified filename
- Can be full page or viewport only

**Options:**
- `filename` — Where to save the screenshot
- `fullPage` — true = entire page, false = visible viewport only
- Use `fullPage: true` to capture long pages

**When to use:**
- Analyze visual design
- Check responsive layout
- Review CTA button placement
- Verify images are loading
- Create audit reports with visuals

**Example use:**
```
Task: Create a visual audit of all key pages

Step 1: Navigate to homepage
await navigate({ url: "https://brolabentertainment.com" })

Step 2: Screenshot homepage
await screenshot({ filename: "01-homepage.png", fullPage: true })

Step 3: Navigate to pricing
await navigate({ url: "https://brolabentertainment.com/pricing" })

Step 4: Screenshot pricing
await screenshot({ filename: "02-pricing.png", fullPage: true })

Step 5: Repeat for other key pages

Result: Collection of visual screenshots for review
```

---

#### 3. Get Page Snapshot (DOM Structure)
```typescript
mcp_playwright_browser_snapshot()
```

**What it returns:**
- Current DOM structure
- HTML of the page
- Element hierarchy
- CSS selectors

**When to use:**
- Analyze page structure
- Check heading hierarchy (H1, H2, H3)
- Verify form fields are present
- Debug layout issues
- Extract element information

**Example use:**
```
Task: Verify page follows proper heading hierarchy for SEO

Step 1: Navigate to page
await navigate({ url: "https://brolabentertainment.com" })

Step 2: Get snapshot
const dom = await snapshot()

Step 3: Analyze
- Check for single H1 tag (best practice)
- Verify H2s describe sections
- Ensure logical hierarchy
- Check for proper semantic HTML

Report: "Page structure is [good/needs improvement]. Issues: [list]"
```

---

### When to Use Playwright

✅ **Use Playwright for:**
- Visual analysis and screenshots
- Testing public user flows
- Analyzing page structure
- Checking responsive design
- Verifying load behavior
- Testing public forms (no real submission)

❌ **Don't use Playwright for:**
- Logging in (you can't access auth)
- Testing protected routes
- Interacting with personalized content
- Automating data entry to real systems
- Testing payment flows

---

## Fetch MCP

### What It Does

Fetch MCP lets you make HTTP requests to APIs and services without managing headers or authentication directly.

### Basic Usage
```typescript
mcp_fetch_fetch({
  url: "https://api.example.com/endpoint",
  method: "GET",
  headers: {
    "Accept": "application/json"
  }
})
```

**What it returns:**
- Response body (JSON, text, etc.)
- Status code (200, 404, 500, etc.)
- Response headers

**Options:**
- `url` — Endpoint to call
- `method` — GET, POST, PUT, DELETE, etc.
- `headers` — HTTP headers
- `body` — Request body (for POST/PUT)

---

### Example: Fetch from Public API
```typescript
// Get latest public tweets from X about BroLab
mcp_fetch_fetch({
  url: "https://api.twitter.com/2/tweets/search/recent",
  method: "GET",
  headers: {
    "Authorization": "Bearer YOUR_BEARER_TOKEN",
    "Accept": "application/json"
  }
})
```

**When to use:**
- Call REST APIs
- Fetch JSON data
- Query public endpoints
- Integrate with services

**Limitations:**
- Authentication must be handled by the tool
- Can't send arbitrary custom headers (security)
- Rate limits apply to the endpoint

---

### When to Use Fetch

✅ **Use Fetch for:**
- GET requests to public APIs
- Fetching JSON data
- Simple API calls
- Checking API availability

❌ **Don't use Fetch for:**
- APIs requiring secrets/credentials
- High-volume requests
- Streaming data
- File uploads (use Playwright for that)

---

## Common Patterns

### Pattern 1: Full Site Audit

**Goal:** Complete analysis of website structure, content, and issues

```typescript
// Step 1: Map the site
const siteMap = await firecrawl_map({
  url: "https://brolabentertainment.com"
})

// Step 2: For each key page, scrape content
for (const page of ["/", "/pricing", "/contact"]) {
  const content = await firecrawl_scrape({
    url: `https://brolabentertainment.com${page}`,
    formats: ["markdown"],
    onlyMainContent: true
  })
  // Analyze content
}

// Step 3: For each key page, take screenshot
for (const page of ["/", "/pricing", "/contact"]) {
  await navigate({
    url: `https://brolabentertainment.com${page}`
  })
  await screenshot({
    filename: `audit-${page.replace('/', '')}.png`,
    fullPage: true
  })
}

// Step 4: Check deployment status
vercel inspect https://brolabentertainment.com

// Step 5: Report findings
// - Site structure
// - Content issues
// - Visual issues
// - Deployment status
```

**Time:** 30-45 minutes  
**Output:** Comprehensive site audit report with screenshots

---

### Pattern 2: CRO Landing Page Analysis

**Goal:** Optimize landing page for conversions

```typescript
// Step 1: Scrape landing page content
const content = await firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["markdown"],
  onlyMainContent: true
})

// Step 2: Extract structured pricing/CTA data
const ctaData = await firecrawl_scrape({
  url: "https://brolabentertainment.com",
  formats: ["json"],
  jsonOptions: {
    prompt: "Extract all CTAs, buttons, and calls-to-action with their text"
  }
})

// Step 3: Take visual screenshot
await navigate({
  url: "https://brolabentertainment.com"
})
const screenshot = await screenshot({
  filename: "landing-page-full.png",
  fullPage: true
})

// Step 4: Analyze
// - Value proposition clarity
// - CTA clarity and placement
// - Social proof presence
// - Mobile responsiveness
// - Load time (from screenshot timing)

// Step 5: Apply CRO skill
// (See AGENT-ONBOARDING.md for skill details)

// Step 6: Report
// - CRO score (0-100)
// - Top 3 improvements
// - Impact estimation
```

**Time:** 20-30 minutes  
**Output:** CRO analysis with recommendations and visual evidence

---

### Pattern 3: Social Media Monitoring

**Goal:** Track BroLab's presence on X/Twitter

```typescript
// Step 1: Search for brand mentions
const mentions = await firecrawl_search({
  query: "BroLab Entertainment OR @brolabent OR @brolabapp",
  limit: 20
})

// Step 2: Analyze sentiment and engagement
// Categorize: positive, neutral, negative
// Track: likes, retweets, replies

// Step 3: Get account metrics
// (Requires X API credentials from Kiro steering)
await fetch({
  url: "https://api.twitter.com/2/users/by/username/brolabent",
  headers: { "Authorization": "Bearer YOUR_BEARER_TOKEN" }
})

// Step 4: Track competitors
const beatstars = await firecrawl_search({
  query: "beatstars",
  limit: 10
})
const airbit = await firecrawl_search({
  query: "airbit",
  limit: 10
})

// Step 5: Compare and report
// - BroLab mentions (count, sentiment)
// - Competitor volume
// - Trending topics
// - Engagement rate
```

**Time:** 20-30 minutes  
**Output:** Social media monitoring report with trends

---

## Best Practices

### Do's ✅

1. **Start with a plan**
   ```
   Before using tools, write out your workflow steps
   Identify which tool handles each step
   Saves time and avoids mistakes
   ```

2. **Respect rate limits**
   ```
   Don't scrape the same page 10 times in a row
   Space out requests
   Use caching when possible
   ```

3. **Take screenshots for evidence**
   ```
   Always screenshot for visual tasks
   Timestamps help with historical tracking
   Screenshots prove what the site looked like
   ```

4. **Document your sources**
   ```
   When reporting findings, note:
   - Which URL you analyzed
   - When you analyzed it
   - Which tool you used
   - Any errors encountered
   ```

5. **Test on production first**
   ```
   Always verify production is live before reporting issues
   Use: vercel inspect https://brolabentertainment.com
   ```

### Don'ts ❌

1. **Don't assume URLs**
   ```
   URLs change. Always check Kiro steering.
   Your notes from last week might be outdated.
   ```

2. **Don't bypass authentication**
   ```
   You can't log in. Don't try.
   Test only public flows.
   ```

3. **Don't hammer endpoints**
   ```
   If you need to scrape 100 pages, space them out
   Respect rate limits or you'll get blocked
   ```

4. **Don't commit credentials**
   ```
   Never put API keys in screenshots or reports
   Always use Kiro steering config values
   ```

5. **Don't assume success**
   ```
   Always verify:
   - Page loaded successfully
   - Content was extracted correctly
   - Screenshot was captured
   - Report timestamps and sources
   ```

---

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| "Page not found (404)" | Wrong URL | Check Kiro steering for correct URL |
| "Connection timeout" | Server is down or slow | Wait and retry, or check vercel status |
| "No content extracted" | Page requires JavaScript | Playwright screenshot might show it better |
| "Screenshot is blank" | Page didn't load | Increase wait time or check network |
| "Rate limit exceeded" | Too many requests too fast | Wait 15 minutes, space out requests |
| "Permission denied" | Accessing restricted content | Check security boundaries in AGENT-ONBOARDING.md |

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    TOOL QUICK REFERENCE                 │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  VERCEL MCP                                              │
│  • List deploys:     vercel list                         │
│  • Inspect deploy:   vercel inspect <url>               │
│  • View logs:        vercel logs <url>                   │
│                                                          │
│  FIRECRAWL MCP                                           │
│  • Scrape page:      firecrawl_scrape({url, formats})   │
│  • Scrape data:      firecrawl_scrape({..., json})      │
│  • Search web:       firecrawl_search({query, limit})   │
│  • Map site:         firecrawl_map({url})               │
│                                                          │
│  PLAYWRIGHT MCP                                          │
│  • Navigate:         navigate({url})                     │
│  • Screenshot:       screenshot({filename, fullPage})   │
│  • Get structure:    snapshot()                          │
│                                                          │
│  FETCH MCP                                               │
│  • HTTP request:     fetch({url, method, headers})      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Next Steps

1. **Review** this guide (you've already started!)
2. **Pick an example workflow** (audit, CRO, or monitoring)
3. **Adapt it** to your actual task
4. **Execute step-by-step**
5. **Document findings** with sources
6. **Request review** before submitting

---

**Last updated:** June 2026  
**Version:** 1.0  
**Status:** Ready for training use
