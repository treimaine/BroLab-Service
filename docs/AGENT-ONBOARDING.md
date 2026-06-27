# Agent Onboarding: PaperClip AI at BroLab Entertainment

Welcome! This guide walks new agents through the essential knowledge needed to work on BroLab Entertainment using the PaperClip AI architecture.

## 🎯 What You'll Learn

By the end of this onboarding, you will understand:
1. **Architecture overview** — how agents access production safely
2. **MCP tools** — the specific tools you use to interact with systems
3. **Security boundaries** — what you can and cannot access
4. **Workflows** — how to accomplish common tasks
5. **Best practices** — dos and don'ts for working in production

**Time to complete:** 30-45 minutes

---

## Part 1: Architecture Overview (5 min)

### The Big Picture

BroLab Entertainment uses a **PaperClip AI architecture** that separates agents from production infrastructure through defined access patterns:

```
You (Agent)
    ↓
Kiro Steering Config (auto-loaded)
    ↓
MCP Tools (Vercel, Firecrawl, Playwright, Fetch)
    ↓
Production (BroLab Entertainment)
```

**Key principle:** You never talk directly to databases or secrets. You only use prescribed MCP tools to access what's permitted.

### Why This Matters

This design protects:
- **Company data** — You can't access private user information
- **Secrets** — API keys, database credentials stay hidden
- **Production stability** — Changes are controlled and logged
- **Compliance** — Access is auditable and governed

### Your Role

As an agent, you have **read** and **monitoring** access to production for:
- Analyzing the website (CRO, content, performance)
- Monitoring social media (X/Twitter mentions, engagement)
- Checking deployment status (Vercel logs and metrics)
- Auditing site structure and content

You have **no write** access to:
- Production databases
- Secret credentials
- Deployed code
- User accounts

---

## Part 2: The Kiro Steering File (5 min)

### What It Is

The Kiro steering file is your **configuration roadmap**. It's automatically loaded every time you work and tells you:
- **URLs** — exactly where production systems live
- **Tools** — which MCP tools are available
- **Workflows** — common patterns for tasks
- **Limits** — what you can and cannot access

**Location:** `.kiro/steering/paperclipai-agent-access.md`

### Read This First

Before starting any task:
1. Open `.kiro/steering/paperclipai-agent-access.md`
2. Find the production URLs section
3. Check the MCP tools you'll need
4. Review the workflow for your task type

This takes 2-3 minutes and prevents mistakes.

---

## Part 3: MCP Tools (15 min)

### What are MCP Tools?

**MCP = Model Context Protocol**. These are predefined tools that safely relay your requests to external systems. Think of them as "safe wrappers" around APIs.

Instead of you accessing APIs directly, you call an MCP tool, which:
1. Validates your request
2. Enforces security rules
3. Logs what you did
4. Returns the result

### The 4 Core Tools

#### 1. **Vercel MCP** — Deployment Management
```
Purpose: Check deployment status, view logs, inspect configurations
When to use: Troubleshooting production issues, verifying deploys
Example:
  vercel list                                          # See all deployments
  vercel inspect https://brolabentertainment.com     # Check a deployment
  vercel logs https://brolabentertainment.com        # View production logs
```

**What you CAN do:**
- View deployment status
- Read public environment variables (NEXT_PUBLIC_*)
- Check build logs

**What you CANNOT do:**
- Deploy code (that's for humans)
- Change configuration
- Access secret environment variables

---

#### 2. **Firecrawl MCP** — Web Scraping & Search
```
Purpose: Extract content, search the web, map site structure
When to use: Content analysis, CRO audits, competitor research
Example:
  Scrape landing page: mcp_firecrawl_firecrawl_scrape({
    url: "https://brolabentertainment.com",
    formats: ["markdown"]
  })
  
  Search web: mcp_firecrawl_firecrawl_search({
    query: "BroLab Entertainment reviews",
    limit: 5
  })
  
  Map site: mcp_firecrawl_firecrawl_map({
    url: "https://brolabentertainment.com"
  })
```

**What you CAN do:**
- Extract page content
- Get structured data from pages
- Search for public information
- Map site structure

**What you CANNOT do:**
- Bypass authentication
- Access paid content
- Scrape at high volume (respect rate limits)

---

#### 3. **Playwright MCP** — Browser Automation
```
Purpose: Navigate sites, take screenshots, interact with pages
When to use: Visual testing, CRO analysis, user flow verification
Example:
  Navigate: mcp_playwright_browser_navigate({
    url: "https://brolabentertainment.com"
  })
  
  Screenshot: mcp_playwright_browser_take_screenshot({
    filename: "landing-page.png",
    fullPage: true
  })
  
  Get page structure: mcp_playwright_browser_snapshot()
```

**What you CAN do:**
- Navigate to pages
- Take screenshots
- Analyze DOM structure
- Test public flows

**What you CANNOT do:**
- Log in with real credentials
- Interact with protected routes
- Submit forms with real data
- Access console logs requiring auth

---

#### 4. **Fetch MCP** — HTTP Requests
```
Purpose: Make direct HTTP requests to APIs
When to use: Simple data retrieval, API testing
Example:
  mcp_fetch_fetch({
    url: "https://api.example.com/data",
    method: "GET"
  })
```

**What you CAN do:**
- GET public endpoints
- POST to public APIs
- Include headers and parameters

**What you CANNOT do:**
- Use secret headers (auth is handled by tool)
- POST to protected endpoints
- Access credentials

---

### Quick Reference

| Tool | Purpose | Example Use |
|------|---------|-------------|
| **Vercel** | Deployment status | "Check if site is deployed" |
| **Firecrawl** | Content extraction | "Scrape and analyze landing page" |
| **Playwright** | Visual testing | "Screenshot all pages for CRO review" |
| **Fetch** | API calls | "Get data from public API" |

---

## Part 4: Security Boundaries (10 min)

### ✅ ALLOWED (You Can Access)

#### Public Website Content
- Landing page, pricing page, terms, privacy
- All public pages accessible in a browser
- Email signup forms (analysis only, no actual submission)

```
Use: Firecrawl to scrape or Playwright to screenshot
Example task: "Analyze our landing page copy for clarity"
```

#### Public Social Media
- X/Twitter mentions of BroLab
- Competitor tweets and engagement metrics
- Public follower counts and engagement rates

```
Use: Firecrawl to search or Fetch for X API calls
Example task: "Monitor mentions of BroLab Entertainment on X"
```

#### Deployment Metrics
- Build time, deployment status, error rates
- Public logs and error traces
- Performance metrics (non-sensitive)

```
Use: Vercel MCP for status, Playwright for UI testing
Example task: "Verify production is responsive"
```

#### Public Environment Variables
- NEXT_PUBLIC_SITE_URL
- NEXT_PUBLIC_CONVEX_URL
- NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
- NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

```
Access: Read .env.local or Vercel dashboard
Example task: "Verify Clerk is configured for production"
```

---

### ❌ BLOCKED (You Cannot Access)

#### Secret Credentials
- CLERK_SECRET_KEY
- STRIPE_SECRET_KEY
- API keys, webhook secrets
- Database connection strings

```
Why: Secrets are for humans only. Exposing them compromises security.
If needed: Ask a human (manager/lead) to handle it.
```

#### User Data
- Customer names, emails, payment info
- Account details, preferences
- Activity logs with PII

```
Why: Privacy and compliance (GDPR, PCI-DSS, etc.)
If needed: Ask a human to anonymize or aggregate the data first.
```

#### Production Databases
- Direct database access
- Convex mutations (creating/updating data)
- Write operations

```
Why: Prevents accidental data corruption and maintains audit trails.
If needed: Ask a human engineer to make the change.
```

#### Protected Routes
- `/studio` (creator dashboard)
- `/admin` (admin panel)
- Any route requiring authentication

```
Why: You can't log in, so testing must be on public routes only.
If needed: Ask someone with access to test the route for you.
```

---

### The Rule of Thumb

**Ask yourself: "Would a public visitor see this?"**

- ✅ Yes? → You can access it
- ❌ No? → You cannot access it

If you're uncertain, **ask first** rather than guessing.

---

## Part 5: Common Workflows (10 min)

### Workflow 1: Analyze the Landing Page (CRO)

**Goal:** Evaluate the landing page for conversion optimization

**Steps:**
1. **Scrape content** (Firecrawl)
   ```
   Extract all text, images, CTAs, value proposition
   ```

2. **Take screenshot** (Playwright)
   ```
   Capture full page visual for design analysis
   ```

3. **Analyze structure** (Playwright + Firecrawl)
   ```
   Check heading hierarchy, form fields, social proof
   ```

4. **Report findings**
   ```
   - Current CRO score (0-100)
   - Strengths (what's working)
   - Weaknesses (what's not)
   - Top 3 recommendations
   ```

**Time:** 15-20 minutes

---

### Workflow 2: Monitor Social Media

**Goal:** Track BroLab's presence and engagement on X/Twitter

**Steps:**
1. **Check mentions** (Firecrawl search or Fetch)
   ```
   Search: "BroLab Entertainment" or "@brolabent"
   Get: Tweet count, sentiment, top tweets
   ```

2. **Analyze account metrics** (Fetch X API)
   ```
   Get: Followers, engagement rate, recent tweets
   ```

3. **Track competitors** (Firecrawl search)
   ```
   Search: Beatstars, Airbit, Traktrain mentions
   Compare: Volume, engagement, topics
   ```

4. **Report findings**
   ```
   - BroLab mentions (count, sentiment)
   - Account growth (followers, engagement)
   - Competitor comparison
   - Opportunities (topics, gaps)
   ```

**Time:** 20-30 minutes

---

### Workflow 3: Audit Site Structure

**Goal:** Map the website and identify issues

**Steps:**
1. **Map entire site** (Firecrawl)
   ```
   Get: List of all URLs, structure
   ```

2. **Scrape key pages** (Firecrawl)
   ```
   Pages: /, /pricing, /contact, /terms, /privacy
   Get: All content in markdown
   ```

3. **Visual audit** (Playwright)
   ```
   Screenshot: Each page, check responsiveness
   ```

4. **Check for issues**
   ```
   - Broken links (404 pages)
   - Missing content
   - Outdated information
   - Poor layout/readability
   ```

5. **Report findings**
   ```
   - Site structure diagram
   - Pages with issues
   - Priority recommendations
   - SEO suggestions
   ```

**Time:** 30-45 minutes

---

## Part 6: Best Practices (5 min)

### DO ✅

- **Read Kiro steering first** — It has the latest URLs and configurations
- **Use Firecrawl for scraping** — It's designed for this and handles edge cases
- **Take screenshots regularly** — Visual analysis catches things text doesn't
- **Respect rate limits** — Space out requests, don't hammer endpoints
- **Document your findings** — Include data sources and timestamps
- **Ask if uncertain** — No penalty for checking with a human first
- **Keep findings actionable** — Not just problems, but solutions

### DON'T ❌

- **Don't try to access secrets** — They're genuinely blocked for good reasons
- **Don't try to write data** — You have read-only access intentionally
- **Don't scrape at high volume** — It slows down production for real users
- **Don't assume URLs** — Always check Kiro steering for current URLs
- **Don't share credentials** — If you somehow get one, report it immediately
- **Don't log in with real accounts** — Even if someone offers credentials
- **Don't guess at workflows** — Copy patterns from documentation

---

## Part 7: Getting Unblocked (5 min)

### If You're Stuck

| Problem | Solution |
|---------|----------|
| "I need to log in to test something" | Use Playwright to analyze the public login page instead |
| "I need database access" | Ask a human engineer to query it for you |
| "The URL in my notes is outdated" | Check `.kiro/steering/paperclipai-agent-access.md` for current URLs |
| "I don't know which tool to use" | Look up your task in the Workflows section |
| "I got a permission error" | Probably hit a security boundary — check BLOCKED section |
| "I think I found a bug in the tool" | Document what happened, ask for help debugging |

### Resources

- **Quick reference:** `.kiro/steering/paperclipai-agent-access.md`
- **Full documentation:** `docs/AGENT-PRODUCTION-ACCESS.md`
- **Architecture details:** `.paperclip/PAPERCLIPAI-ARCHITECTURE.md`
- **Need help?** Ask your manager or a senior agent

---

## Part 8: Next Steps

### After Onboarding

1. **Pick a task** from your assignment
2. **Identify the workflow** (CRO analysis? Social monitoring? Site audit?)
3. **Review the relevant MCP tools** in this guide
4. **Check Kiro steering** for current URLs and configurations
5. **Execute the workflow**
6. **Document findings** with sources and recommendations
7. **Ask for feedback** before submitting

### Your First Task Checklist

- [ ] Read AGENT-ONBOARDING.md (this file) — 30 min
- [ ] Read `.kiro/steering/paperclipai-agent-access.md` — 10 min
- [ ] Read task description and acceptance criteria — 10 min
- [ ] Identify workflow type (CRO/monitoring/audit) — 5 min
- [ ] List MCP tools you'll need — 5 min
- [ ] Verify URLs in Kiro steering match your task — 5 min
- [ ] Execute workflow — varies
- [ ] Document findings — 10-15 min
- [ ] Request review — 5 min

**Total first-task time:** 2-3 hours for a complete task

---

## Glossary

| Term | Meaning |
|------|---------|
| **MCP** | Model Context Protocol — tool framework for safe external access |
| **Kiro Steering** | Auto-loaded config file with URLs, tools, workflows |
| **Production** | BroLab Entertainment live website (https://brolabentertainment.com) |
| **CRO** | Conversion Rate Optimization — analyzing pages for better conversions |
| **Security boundary** | Limits on what you can/cannot access |
| **Scrape** | Extract content from a website |
| **Firecrawl** | Web scraping and search MCP tool |
| **Playwright** | Browser automation MCP tool |
| **Vercel** | Deployment platform where BroLab is hosted |

---

## Your Onboarding is Complete! 🎉

You now understand:
- ✅ How the PaperClip AI architecture works
- ✅ What MCP tools do and how to use them
- ✅ What you can and cannot access (security boundaries)
- ✅ How to accomplish common tasks (workflows)
- ✅ Best practices for working with production systems

**Ready to work?** Pick your first task and refer back to this guide as needed.

Questions? Check the **Getting Unblocked** section or ask a teammate.

---

**Last updated:** June 2026  
**Version:** 1.0  
**Status:** Ready for agent onboarding
