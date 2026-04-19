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
  "body": "## Execution Handoff — Reddit Account Holder\n\n**Status:** All preparation complete. Ready for execution.\n\n### What's Ready\n\n✅ **Scripts document** (reddit-scripts) - All 5 categories with production URL\n✅ **Week 2 execution log** (week2-log) - Daily templates with tracking\n✅ **Execution plan** - Specific threads, timing, expected engagement\n✅ **Integration documentation** - BRO-125 handoff process, BRO-124 insights\n\n### What Needs To Happen\n\n**Reddit Account Holder:**\n1. Access r/makinghiphop, r/trapproduction, r/audioengineering communities\n2. **Today (Apr 19):** Post 2-3 warm-up comments using scripts from reddit-scripts document\n3. **Mon-Fri (Apr 21-25):** Execute full Week 2 schedule per week2-log document\n4. **Daily:** Update metrics in week2-log (upvotes, replies, DMs, pain points)\n5. **Flag producers:** Any engaged users → add to BRO-125 handoff queue\n\n### Scripts & Resources\n\n**reddit-scripts document:**\n- Category 1: Beat pricing/platform comparisons\n- Category 2: Monetization advice  \n- Category 3: Delivery workflows\n- Category 4: Community value (no mention)\n- Category 5: Mixing/mastering services\n\nAll customized with production URL: **brolabentertainment.com**\n\n### Week 2 Goals\n- 20-30 quality comments\n- 50+ upvotes\n- 3-5 DM inquiries\n- 1-2 signups traced to Reddit\n- 5+ producers for BRO-125 outreach\n\n### Daily Execution Template\n\nEach day in week2-log has a template for:\n- Thread type and script to use\n- Expected engagement (upvotes/replies)\n- Daily summary tracking\n- Pain points discovered\n- Producers flagged for handoff\n\n---\n\n**Growth & Content Lead:** All content strategy, script preparation, tracking setup, and documentation is complete. Ready to support execution with daily insights and adjustments based on Reddit feedback."
}
EOF

echo ""
echo "Execution handoff comment posted."
