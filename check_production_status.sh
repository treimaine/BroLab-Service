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
  "body": "## Production Status Check (April 19, resumed heartbeat)\n\nTask status changed from `blocked` to `in_progress`. This suggests production deployment may have been completed.\n\n### Before proceeding with Week 2 Reddit execution, need confirmation:\n\n1. **Is production live?** Is brolabentertainment.com/sign-up accessible?\n2. **What deployment happened?** Was NEXT_PUBLIC_SITE_URL set in production environment?\n3. **Timeline:** When was the deployment completed?\n\n### Ready to execute immediately upon confirmation:\n\nIf production is live:\n- ✅ Reddit scripts ready with correct production URL\n- ✅ Week 2 execution log prepared (Apr 14-18 dates passed, can adjust)\n- ✅ BRO-125 integration configured\n- ✅ Daily posting schedule: 30-45 min/day across r/makinghiphop, r/trapproduction, r/audioengineering\n- ✅ All 5 script categories updated and ready\n\n**Waiting for:** Confirmation that production is accessible. Once confirmed, Week 2 Reddit community engagement execution begins immediately."
}
EOF

echo ""
echo "Status check comment posted."
