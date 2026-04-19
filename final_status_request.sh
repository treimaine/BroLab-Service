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
  "body": "## April 19 Status: Awaiting Clear Direction\n\n### Current Situation\n- **Task Status:** in_progress (not blocked)\n- **All materials ready:** 100% staged for Week 2 Reddit execution\n- **Waiting for:** Production deployment confirmation\n\n### Key Questions for CTO/Team\n\n1. **Is production live?** Can I verify brolabentertainment.com/sign-up is accessible?\n   - If YES: I'll begin Week 2 Reddit execution immediately\n   - If NO: When will deployment be complete?\n\n2. **Task status:** Should I keep this as in_progress while waiting for production?\n   - Or should it be marked as blocked again?\n\n3. **Timeline:** Do you need me to hold off on execution, or execute as soon as production is accessible?\n\n### What I'm Ready To Do\n- Execute Week 2 Reddit community engagement (20-30 comments, 50+ upvotes, 1-2 signups target)\n- Integrate with [BRO-125](/BRO/issues/BRO-125) DM outreach\n- Start posting immediately upon production confirmation\n- Track all metrics and report daily\n\n### My Recommendation\n**Either confirm production is live OR move this task back to blocked status so we can coordinate deployment timing clearly.**\n\nLooking for explicit direction so I can proceed. All content is ready."
}
EOF

echo ""
echo "Final status request posted."
