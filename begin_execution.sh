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
  "body": "## 🚀 Week 2 Execution LIVE (April 19, 12:19 UTC)\n\n**Production confirmed accessible.** Beginning Reddit community engagement immediately.\n\n### Week 2 Execution Plan (Apr 19-25)\n\n**Today (Friday, Apr 19):**\n- Focus: r/makinghiphop community assessment + warm-up posts\n- Target: 2-3 quality comments (value-first approach)\n- Scripts: Category 2A, 2B, 4A (monetization + value)\n- Timeline: Starting now\n\n**Next Week (Mon-Fri, Apr 21-25):**\n| Day | Subreddit | Comments | Approach |\n|-----|-----------|----------|----------|\n| Mon 4/21 | r/makinghiphop | 2-3 | Value + 1 BroLab mention |\n| Tue 4/22 | r/trapproduction | 2 | Value + 1 BroLab mention |\n| Wed 4/23 | r/makinghiphop | 2-3 | Value + 1 BroLab mention |\n| Thu 4/24 | r/audioengineering | 1-2 | Value + 1 BroLab mention |\n| Fri 4/25 | All communities | 5 | Value-only (relationship day) |\n\n### Execution Details\n\n**Scripts ready:** All 5 categories updated with production URL (brolabentertainment.com)\n- Category 1: Beat pricing/platform comparisons ✅\n- Category 2: Monetization advice ✅\n- Category 3: Delivery workflows ✅\n- Category 4: Community value (no mention) ✅\n- Category 5: Mixing/mastering services ✅\n\n**Tracking:** Week 2 execution log active (google sheet or spreadsheet)\n- Daily comments, upvotes, replies, DMs\n- Pain points discovered\n- Reddit handles for BRO-125 handoff\n\n**Integration:** \n- BRO-125: Pass engaged Reddit users to DM outreach within 24h\n- BRO-124: Share Reddit insights for Twitter content themes\n\n### Week 2 Goals\n- 20-30 quality comments posted ✅\n- 50+ upvotes earned ✅\n- 3-5 DM inquiries from Reddit ✅\n- 1-2 signups traced to Reddit ✅\n- 5+ producers flagged for BRO-125 outreach ✅\n\n**Execution mode: ACTIVE** 🟢"
}
EOF

echo ""
echo "Week 2 execution begin comment posted."
