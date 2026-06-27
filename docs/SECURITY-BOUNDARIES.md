# Security Boundaries: What You Can and Cannot Access

This guide defines exactly what BroLab Entertainment agents can and cannot access in production.

## 🎯 Quick Answer

**Ask yourself:** "Would a public visitor see this without logging in?"

- ✅ **YES?** → You can access it
- ❌ **NO?** → You cannot access it

If uncertain, **ask first**.

---

## ✅ ALLOWED ACCESS

### 1. Public Website Content

**What you CAN access:**
- Homepage and all public pages
- Pricing page, terms, privacy policy
- Contact page, about page
- Blog posts or public documentation
- Public media (images, videos)
- Public testimonials or case studies

**How to access:**
- Use **Firecrawl MCP** to scrape content
- Use **Playwright MCP** to take screenshots
- Use **Fetch MCP** for API requests to public endpoints

**Examples:**
```
✅ "Scrape the landing page headline and value proposition"
✅ "Take a screenshot of the pricing page"
✅ "Get all public images from the homepage"
❌ "Log in to see the creator dashboard"
❌ "Access user account details"
```

---

### 2. Public Environment Variables

**What you CAN see:**
- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_CONVEX_SITE_URL`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `BRAND_NAME`
- `BRAND_EMAIL`
- `BRAND_WEBSITE`

**How to access:**
- Read from `.env.local` in the repository
- Use `vercel inspect` to view Vercel environment
- Check Kiro steering config (`.kiro/steering/paperclipai-agent-access.md`)

**Why it's safe:**
- These are marked `NEXT_PUBLIC_` which means they're intentionally public
- They're visible in every request the browser makes
- They don't grant access to anything sensitive

**Examples:**
```
✅ "Verify NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is configured"
✅ "Check NEXT_PUBLIC_CONVEX_URL points to production"
❌ "View STRIPE_SECRET_KEY"
❌ "Access CLERK_WEBHOOK_SECRET"
```

---

### 3. Deployment Status and Logs

**What you CAN see:**
- Deployment status (ready, building, error)
- Build logs (public parts)
- Runtime error messages (non-sensitive)
- Application performance metrics
- HTTP status codes and error rates
- Deployment history and timestamps

**How to access:**
- Use **Vercel MCP** (`vercel list`, `vercel inspect`, `vercel logs`)
- Check Vercel dashboard
- View public monitoring tools

**Why it's safe:**
- Tells you if the site is working, not HOW it works
- Error logs don't contain secrets or user data
- Performance metrics are business information

**Examples:**
```
✅ "Check if the last deployment succeeded"
✅ "View production logs to see if Stripe webhook is working"
✅ "Verify build time is under 5 minutes"
❌ "Access database connection strings from logs"
❌ "Extract user data from error traces"
```

---

### 4. Public Social Media

**What you CAN access:**
- Public X/Twitter mentions of BroLab
- Public tweets from @brolabent and @brolabapp
- Follower counts (public metric)
- Engagement metrics (likes, retweets, replies)
- Competitor tweets and mentions
- Trending topics and public discussions

**How to access:**
- Use **Firecrawl MCP** to search the web
- Use **Fetch MCP** with X API (if credentials provided)
- Check Twitter/X public website

**Why it's safe:**
- All of this is publicly visible on X/Twitter
- No authentication needed
- No private messages or user data

**Examples:**
```
✅ "Search for mentions of 'BroLab Entertainment' on X"
✅ "Get follower count for @brolabent"
✅ "Find top tweets about music production beats"
✅ "Monitor competitor activity on X"
❌ "Send direct messages"
❌ "View private accounts or DMs"
```

---

### 5. Public Form Analysis

**What you CAN do:**
- Analyze form structure (fields, labels, required)
- Check form validation messages
- Review form copy and instructions
- Analyze form layout and UX

**How to access:**
- Use **Playwright MCP** to navigate and screenshot
- Use **Firecrawl MCP** to extract form data
- Get DOM structure with `snapshot()`

**Why it's safe:**
- Only analyzing structure and presentation
- No submitting real data
- No accessing form backend

**Examples:**
```
✅ "Analyze the signup form UX and layout"
✅ "Verify all form fields are properly labeled"
✅ "Check if email validation works (test, don't submit)"
❌ "Submit a real email address"
❌ "Test the form with payment information"
```

---

### 6. Public Monitoring and Analytics

**What you CAN see:**
- Public analytics dashboards (if exposed)
- Performance metrics (load time, error rate)
- Deployment status from public status page
- Public monitoring data

**How to access:**
- View public dashboards/status pages
- Use monitoring tools with public URLs
- Check Vercel deployment status

**Examples:**
```
✅ "Check page load time via Playwright timing"
✅ "Monitor deployment status on Vercel"
✅ "Review public analytics dashboard"
❌ "Access Google Analytics with private credentials"
❌ "View user-level analytics data"
```

---

## ❌ BLOCKED ACCESS

### 1. Secret Credentials & API Keys

**What you CANNOT access:**
- `CLERK_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_CONNECT_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `X_API_SECRET`
- `X_ACCESS_TOKEN_SECRET`
- Database connection strings
- JWT tokens or session tokens

**Why it's blocked:**
- These can be used to impersonate the service
- Leaked credentials compromise the entire system
- Legal/compliance violation if exposed
- PCI-DSS and security standards require this

**What happens if you find one:**
1. **Don't use it**
2. **Don't share it**
3. **Report it immediately** to your manager
4. This is NOT a failure on your part—it's how you help secure the system

**Examples:**
```
❌ "What is the Stripe secret key?"
❌ "Show me CLERK_SECRET_KEY"
❌ "Access the database with the connection string"
❌ "Use RESEND_API_KEY to send emails"
```

---

### 2. User Data & PII

**What you CANNOT access:**
- Customer names, emails, phone numbers
- User account information
- Purchase history
- Payment information (card details)
- Addresses or personal information
- Activity logs with user identification
- Creator profiles or credentials

**Why it's blocked:**
- Privacy regulations (GDPR, CCPA, etc.)
- Payment security (PCI-DSS)
- Business confidentiality
- Legal liability if exposed

**How to ask for help:**
If you need user data for analysis:
1. Ask your manager
2. Describe what you need (anonymized, aggregate, etc.)
3. They'll fetch and anonymize it for you
4. You analyze the anonymized version

**Examples:**
```
❌ "How many users signed up today?" (requires accessing user database)
❌ "What's the email address for creator X?"
❌ "Show me credit card data from recent purchases"
❌ "Who are the top revenue generators?"

✅ "How many signups in aggregate?" (ask manager to query this for you)
✅ "What percentage of users complete the onboarding?" (ask for anonymized stats)
```

---

### 3. Production Databases

**What you CANNOT do:**
- Direct database access
- Creating records (Convex mutations)
- Updating records
- Deleting records
- Running database queries
- Accessing raw database connection

**Why it's blocked:**
- Risk of accidental data corruption
- Need audit trail for all changes
- Database locks/performance impact
- Data consistency requirements

**How to ask for help:**
If you need database information:
1. Ask your manager or backend engineer
2. Describe what you need exactly
3. They'll query the database safely
4. They'll anonymize sensitive data
5. You analyze the result

**Examples:**
```
❌ "Query the Convex database for user count"
❌ "Create a test record in the database"
❌ "Update the pricing tier for a user"
❌ "Delete a test creator account"

✅ "Can you query how many users we have?" (ask backend engineer)
✅ "I need anonymized user signup data" (ask for a data export)
```

---

### 4. Protected Routes & Authentication

**What you CANNOT access:**
- `/studio` (creator dashboard) — requires login
- `/admin` (admin panel) — requires special auth
- `/user-profile` (after login) — personalized content
- Any route that requires being logged in
- Protected APIs that need authentication

**Why it's blocked:**
- You don't have valid user credentials
- Trying to bypass auth violates terms of service
- Tests should be on public routes only

**How to test protected features:**
If you need to test a protected route:
1. **Ask a human** to test it for you
2. **Provide exact steps** they should take
3. **Request screenshots** or results
4. They verify, you analyze

**Examples:**
```
❌ "Log in and test the creator dashboard"
❌ "Access /studio to check the beat upload flow"
❌ "Test the admin panel configuration"
❌ "Use real credentials to verify the payment flow"

✅ "Can you test the creator dashboard and show me screenshots?"
✅ "Please verify the admin panel is working correctly"
✅ "Test the payment checkout flow and report any errors"
```

---

### 5. Private Social Media & Communications

**What you CANNOT do:**
- Send direct messages on X/Twitter
- Access private accounts
- View private messages or DMs
- Post on company social accounts (that's for humans)
- Access company email or Slack
- View private API credentials

**Why it's blocked:**
- Privacy of other users
- Company confidentiality
- Authentication required
- Impersonation risk

**Examples:**
```
❌ "Send a DM to @beatstars about a partnership"
❌ "Post a tweet from @brolabent"
❌ "Access private Discord messages"
❌ "View company Slack conversations"

✅ "Research what Beatstars says publicly about their platform"
✅ "Analyze trends in public music production discussions"
```

---

### 6. System Infrastructure & Configuration

**What you CANNOT access:**
- Vercel project settings
- Clerk console configuration
- Stripe dashboard (backend)
- Database admin panels
- Server configuration
- Deployment secrets
- CloudFlare or CDN settings
- DNS configuration

**Why it's blocked:**
- System stability and security
- Requires special permissions
- Risk of misconfiguration
- Audit trail requirements

**How to ask for help:**
If you need infrastructure changes:
1. Describe what needs to change
2. Ask your manager or CTO
3. They make the change safely
4. You verify the result

**Examples:**
```
❌ "Change the Vercel environment variables"
❌ "Configure a new Stripe webhook"
❌ "Update Clerk settings"
❌ "Deploy new code to production"

✅ "Can you update NEXT_PUBLIC_SITE_URL to the new domain?"
✅ "Please configure Stripe webhook for payment notifications"
✅ "I think Clerk needs to be reconfigured for the new domain"
```

---

## 🔐 Access by MCP Tool

### What Each Tool Can Access

| Tool | ✅ CAN Access | ❌ CANNOT Access |
|------|--------------|-----------------|
| **Firecrawl** | Public pages, web search results, public APIs | Protected content, auth-required pages, private data |
| **Playwright** | Public pages, screenshots, form structure, page DOM | Log in, protected routes, real form submission, auth tests |
| **Vercel** | Deployment status, public logs, environment (public only) | Secrets, private config, deployment triggers, code push |
| **Fetch** | Public APIs, GET requests, public data | Protected endpoints, secret headers, high-volume requests |

---

## 🚨 When You Hit a Boundary

### If You See a "Permission Denied" or "Unauthorized" Error

**This is expected!** It means:
- ✅ You tried to access something outside your boundaries
- ✅ The security system is working correctly
- ✅ No harm was done

**What to do:**
1. **Stop immediately** (don't keep trying)
2. **Document what you were trying to do**
3. **Ask your manager** for an approved way to get that information
4. They'll either give you access or do it for you

### Example Scenario

```
You: "I need to verify that the Stripe webhook is receiving payments"
Tool Error: "Permission denied accessing webhook logs"

What happened: You hit a security boundary (correct behavior)

What to do:
1. Tell your manager: "I need to check if Stripe webhook is working"
2. Manager can: Check logs, query database, run tests
3. Manager reports: "Yes, it's working" or "No, it failed at [time]"
4. You analyze their report and recommend fixes
```

---

## 📋 The Security Principle

### Defense in Depth

BroLab uses **multiple layers** of security:

1. **Network layer** — Only certain IPs can access certain systems
2. **Authentication** — Services require valid credentials
3. **Authorization** — Even with credentials, permissions are checked
4. **Tool layer** — MCP tools enforce what you can do
5. **Audit layer** — Everything you do is logged

**Your job:** Work within your assigned boundaries. This protects both the company and you.

---

## ✅ Checklist Before Accessing Something

Before using a tool to access data, ask yourself:

- [ ] Is this publicly visible without login? (website, social media, public status)
- [ ] Is this a NEXT_PUBLIC_* variable? (these are intentionally public)
- [ ] Am I using the right tool? (Firecrawl for web, Vercel for deployments, etc.)
- [ ] Have I checked Kiro steering for current URLs?
- [ ] Would I break anything by doing this? (high-volume scraping, etc.)
- [ ] Am I respectful of rate limits?
- [ ] Would a reasonable person consider this public information?

If you answered **NO to any question**, **ask your manager first**.

---

## 🆘 Getting Help

### Questions About Access

**If you're unsure whether you can access something:**

1. **Describe what you need**
   ```
   "I need to know how many users are in each pricing tier"
   ```

2. **Ask your manager**
   ```
   "Can I access this? If not, can you help me get it?"
   ```

3. **They'll either:**
   - Grant you access (unlikely)
   - Get the information for you (most likely)
   - Help you achieve your goal another way (common)

**Do not:**
- ❌ Guess and try anyway
- ❌ Assume "they didn't block it, so it's okay"
- ❌ Share credentials if someone offers them
- ❌ Bypass security measures

---

## Reference: Complete Access Matrix

| Category | Resource | Access | How |
|----------|----------|--------|-----|
| **Website** | Public pages | ✅ | Firecrawl, Playwright |
| **Website** | Login/protected pages | ❌ | Ask human to test |
| **Configs** | NEXT_PUBLIC_* vars | ✅ | .env.local or Vercel |
| **Configs** | Secret vars | ❌ | Never |
| **Deployment** | Status & logs | ✅ | Vercel MCP |
| **Deployment** | Code & triggers | ❌ | Humans only |
| **Social Media** | Public posts & mentions | ✅ | Firecrawl, Fetch |
| **Social Media** | Private DMs | ❌ | Never |
| **Database** | Queries | ❌ | Ask backend engineer |
| **Database** | Mutations | ❌ | Humans only |
| **User Data** | PII | ❌ | Ask for anonymized version |
| **User Data** | Public profiles | ✅ | If public on site |
| **Email** | Send emails | ❌ | Humans only |
| **Email** | Access logs | ❌ | Ask for report |

---

## Summary

✅ **You can access:**
- Public website content
- Public environment variables
- Deployment status and logs
- Public social media
- Public form structure

❌ **You cannot access:**
- Secret credentials
- User data and PII
- Production databases
- Protected routes
- Private communications
- System configuration

🤝 **When in doubt:**
- Ask your manager
- They'll help you achieve your goal safely

---

**Last updated:** June 2026  
**Version:** 1.0  
**Status:** Security-critical, review annually
