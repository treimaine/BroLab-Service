#!/bin/bash
API_URL="${PAPERCLIP_API_URL:-http://127.0.0.1:3100}"
API_KEY="$PAPERCLIP_API_KEY"
RUN_ID="$PAPERCLIP_RUN_ID"
TASK_ID="$PAPERCLIP_TASK_ID"

curl -s -X PATCH "$API_URL/api/issues/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Paperclip-Run-Id: $RUN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "blocked",
    "comment": "BLOCKED: Production deployment pending (NEXT_PUBLIC_SITE_URL not accessible at brolabentertainment.com).\n\nAll Reddit community engagement materials are 100% ready and staged for immediate execution once production site is live. Week 2 scripts, execution logs, and BRO-125 integration are prepared.\n\nWaiting for: CTO/Lead Engineer to confirm production deployment status and timeline (April 11 verification appears incomplete)."
  }'

echo ""
echo "Task marked as blocked."
