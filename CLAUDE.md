<!-- convex-ai-start -->

This project uses [Convex](https://convex.dev) as its backend.

When working on Convex code, **always read
`convex/_generated/ai/guidelines.md` first** for important guidelines on
how to correctly use Convex APIs and patterns. The file contains rules that
override what you may have learned about Convex from training data.

Convex agent skills for common tasks can be installed by running
`npx convex ai-files install`.

<!-- convex-ai-end -->

---

## 🏛️ PaperClip AI Architecture & Governance

This project follows the **[PaperClip AI Architecture Guide](.paperclip/PAPERCLIPAI-ARCHITECTURE.md)** for all agent-based work.

**Required Reading Before Any Agent Work:**
- **Architecture Guide**: `.paperclip/PAPERCLIPAI-ARCHITECTURE.md` — Defines access patterns, security boundaries, MCP tool usage, and workflows
- **Kiro Steering Config**: `.kiro/steering/paperclipai-agent-access.md` — Automatic configuration loaded for all agents

**Key Governance Rules:**
- ✅ Agents use prescribed MCP tools (Vercel, Firecrawl, Playwright, Fetch) for external access
- ✅ Security boundaries enforced: no direct database access, no secrets, no PII exposure
- ✅ All access patterns follow documented workflows (CRO analysis, social monitoring, site audits)
- ✅ Kiro steering auto-loads agent configuration from `.kiro/` directory

**For Agent Teams:**
- Onboarding: Complete PAPERCLIPAI-ARCHITECTURE.md review before first assignment (BRO-186)
- Development: Follow prescribed workflows in architecture guide
- Code Review: Verify architecture compliance in all PRs (BRO-188)
- Auditing: Monthly compliance checks ensure continued adherence (BRO-191)
