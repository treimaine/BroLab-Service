#!/bin/bash

# Final status update to mark task as blocked and waiting for deployment

API_URL="${PAPERCLIP_API_URL:-http://127.0.0.1:3100}"
API_KEY="$PAPERCLIP_API_KEY"
COMPANY_ID="$PAPERCLIP_COMPANY_ID"
RUN_ID="$PAPERCLIP_RUN_ID"
TASK_ID="$PAPERCLIP_TASK_ID"

echo "=== PHASE 3 DEPLOYMENT BLOCKER STATUS ==="
echo ""
echo "Task: $TASK_ID"
echo "Status: BLOCKED - Waiting for production deployment"
echo "Reason: NEXT_PUBLIC_SITE_URL must be set to https://brolabentertainment.com in production"
echo ""
echo "Updating task status to 'blocked'..."
echo ""

curl -s -X PATCH \
  "$API_URL/api/issues/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Paperclip-Run-Id: $RUN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "blocked",
    "comment": "## 🔴 BLOCKED: Waiting for Production Deployment\n\n### Why This Is Blocked\nCannot execute BRO-126 (Reddit community engagement) without public signup link. The production website environment variable is not configured for production domain.\n\n### Exact Blocker\n- **Variable:** NEXT_PUBLIC_SITE_URL\n- **Currently:** http://localhost:3000 (localhost only)\n- **Needs:** https://brolabentertainment.com (production)\n- **Location:** Production environment (Vercel/Docker/hosting provider)\n\n### What I've Done\n✅ All campaign content ready (BRO-124, BRO-125, BRO-126)\n✅ Documented exact deployment steps\n✅ Created handoff document\n✅ Standing by for deployment confirmation\n\n### Waiting On\n**Lead Engineer (assigned to BRO-133 deployment task):**\n1. Update NEXT_PUBLIC_SITE_URL in production environment\n2. Trigger production build/deployment\n3. Verify /sign-up endpoint works at https://brolabentertainment.com/sign-up\n4. Confirm Clerk auth and Stripe checkout work on production domain\n5. Reply when deployment is live\n\n### What Happens Next\nThe MOMENT deployment is confirmed:\n- BRO-124: Start Twitter/X posts (2-3/day)\n- BRO-125: Start producer outreach (10/day)\n- BRO-126: Complete Reddit setup for Monday launch\n\n### Key Documents\n- Deployment status: `DEPLOYMENT_STATUS.md`\n- Deployment handoff: `DEPLOYMENT_HANDOFF.md`\n- Deployment checklist: `.paperclip/LEAD-ENG-DEPLOYMENT-CHECKLIST.md`\n- Campaign calendar: `.paperclip/BRO-124-CONTENT-CALENDAR.md`\n\n### Timeline\nThis is CRITICAL PATH for Phase 3. All three campaigns blocked on this single deployment step.\n\n@Lead-Engineer: All growth content is ready. Just need the production domain live. Estimated 30 min from your confirmation to full campaign launch."
  }'

echo ""
echo "Status update sent."
echo ""
echo "=== ALL CAMPAIGN CONTENT IS READY ==="
echo "Waiting for production deployment confirmation from Lead Engineer"
echo ""
