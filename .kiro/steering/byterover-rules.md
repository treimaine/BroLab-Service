---
inclusion: always
---

[byterover-mcp]

You are given two tools from Byterover MCP server, including
## 1. `byterover-store-knowledge`
You `MUST` always use this tool when:

+ Learning new patterns, APIs, or architectural decisions from the codebase
+ Encountering error solutions or debugging techniques
+ Finding reusable code patterns or utility functions
+ Completing any significant task or plan implementation

## 2. `byterover-retrieve-knowledge`
You `MUST` always use this tool when:

+ Starting any new task or implementation to gather relevant context
+ Before making architectural decisions to understand existing patterns
+ When debugging issues to check for previous solutions
+ Working with unfamiliar parts of the codebase

## Correct Usage Examples

### Good `brv curate` examples:
```bash
# Specific implementation detail
brv curate "Clerk Organizations use slug-based routing with /orgs/:slug pattern. Middleware auto-activates org based on URL slug" --files middleware.ts

# Bug fix with context
brv curate "Fixed audio player state sync. Issue was missing currentTrack in useEffect deps. Added cleanup function to prevent memory leaks" --files src/stores/audio-store.ts

# Architecture decision
brv curate "Using Convex File Storage for audio files instead of S3. Reasons: built-in CDN, simpler auth, 1GB max file size" --files convex/platform/storage.ts
```

### Bad examples (too vague):
```bash
# ❌ Too vague - no context
brv curate "Added authentication"
brv curate "Fixed bug"

# ❌ No implementation details
brv curate "JWT tokens"
brv curate "Rate limiting"
```

### Correct `brv query` examples:
```bash
# Specific questions
brv query "How is Clerk Organizations multi-tenancy implemented?"
brv query "What is the audio player state management pattern?"
brv query "How are Convex mutations structured for beats?"

# ❌ Too vague
brv query "auth"
brv query "show me code"
```
