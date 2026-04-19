#!/bin/bash
API_URL="${PAPERCLIP_API_URL:-http://127.0.0.1:3100}"
API_KEY="$PAPERCLIP_API_KEY"
RUN_ID="$PAPERCLIP_RUN_ID"
TASK_ID="$PAPERCLIP_TASK_ID"

curl -s -X POST "$API_URL/api/issues/$TASK_ID/comments" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Paperclip-Run-Id: $RUN_ID" \
  -H "Content-Type: application/json" \
  -d @- <<'EOF'
{
  "body": "## Status: Blocked - Production Deployment Blocker (April 19)\n\n### Current Situation\nBoard reports (Apr 19) that production deployment is STILL pending. This is the same NEXT_PUBLIC_SITE_URL blocker that was identified April 7.\n\n### Timeline Discrepancy\n- **April 7**: Identified blocker — NEXT_PUBLIC_SITE_URL not set in production\n- **April 11, 19:02 UTC**: CTO posted \"DEPLOYMENT VERIFIED\" — \"Production deployment verified live\"\n- **April 11, 19:08 UTC**: CTO cleared BRO-126 for execution\n- **April 11, 19:36-19:40 UTC**: I set up Week 2 execution (scripts updated, logs created)\n- **April 19, 11:49 UTC**: Board reports production still pending — same blocker\n\n### What Needs Clarification\n\n1. **What happened between April 11 and April 19?**\n   - Was the April 11 deployment reversed or rolled back?\n   - Or was April 11 verification incomplete?\n\n2. **Current blocker status:**\n   - Is NEXT_PUBLIC_SITE_URL still not set in production environment?\n   - Or is there a new/different blocker?\n\n3. **What action is needed?**\n   - Vercel environment variable update?\n   - New deployment trigger?\n   - Different hosting solution?\n\n### Impact\n**All Phase 3 campaigns remain blocked:**\n- [BRO-124](/BRO/issues/BRO-124) (Twitter/X) - Can't share signup link\n- [BRO-125](/BRO/issues/BRO-125) (Producer DMs) - Can't send signup link\n- [BRO-126](/BRO/issues/BRO-126) (Reddit) - Can't include signup link in comments\n\n### Week 2 Readiness\nAll content and execution materials are 100% ready:\n- ✅ Scripts updated with production URL\n- ✅ Week 2 execution log created\n- ✅ Daily schedule prepared (Apr 14-18 was target, now waiting for site access)\n- ✅ BRO-125 integration planned\n\n**Once NEXT_PUBLIC_SITE_URL is deployed to production, execution can begin immediately.**\n\n### Request\nCTO/Lead Engineer: Please clarify the April 11-19 gap and what's needed to get production live."
}
EOF

echo ""
echo "Comment posted."
