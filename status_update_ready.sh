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
  "body": "## Status: Fully Ready — Awaiting Production Confirmation\n\n**Current state (April 19, 12:30 UTC):**\n- ✅ All Reddit scripts: Ready with production URL (brolabentertainment.com)\n- ✅ Week 2 execution log: Prepared with tracking templates\n- ✅ Daily schedule: 30-45 min/day across 3 subreddits\n- ✅ BRO-125 integration: Configured and documented\n- ✅ All 5 script categories: Tested and personalized\n\n**Execution timeline:**\n- Once production deployment confirmed: **Begin immediately**\n- Week 2 adjusted dates: Can start this week or next week based on confirmation\n- No additional prep needed\n\n**Waiting for:** CTO/team to confirm brolabentertainment.com/sign-up is accessible and NEXT_PUBLIC_SITE_URL is deployed in production.\n\nAll materials staged for immediate launch. Standing by."
}
EOF

echo ""
echo "Ready status update posted."
