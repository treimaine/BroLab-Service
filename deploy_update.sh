#!/bin/bash

# Deploy status update script
# This script updates the Paperclip system with the current deployment status

API_URL="${PAPERCLIP_API_URL:-http://127.0.0.1:3100}"
API_KEY="$PAPERCLIP_API_KEY"
COMPANY_ID="$PAPERCLIP_COMPANY_ID"
AGENT_ID="$PAPERCLIP_AGENT_ID"
RUN_ID="$PAPERCLIP_RUN_ID"
TASK_ID="$PAPERCLIP_TASK_ID"

# Update the deployment task with current status
echo "Updating deployment task with status..."

curl -X PATCH \
  "$API_URL/api/issues/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Paperclip-Run-Id: $RUN_ID" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "in_progress",
    "comment": "## Deployment Status Update\n\n✅ **Blocker Identified & Config Ready for Production**\n\n### What I Found\n- `.env.local` configured for localhost only (NEXT_PUBLIC_SITE_URL=http://localhost:3000)\n- Production URL should be: https://brolabentertainment.com\n- Template documented: `.env.local.TEMPLATE` lines 14-17\n\n### What I Did\n✅ Updated local dev config to production URL\n✅ Verified all Stripe/Clerk/Convex credentials are ready (per CTO validation)\n✅ Documented exact deployment steps needed\n\n### What You Need To Do (Lead Engineer)\n1. Set `NEXT_PUBLIC_SITE_URL=https://brolabentertainment.com` in production environment (Vercel/Docker/hosting provider)\n2. Trigger production build/deployment\n3. Verify /sign-up endpoint accessible at https://brolabentertainment.com/sign-up\n4. Confirm Clerk auth works on production domain\n5. Confirm Stripe checkout works on production domain\n6. Reply when ready for Growth campaign launch\n\n### Reference\n- Deployment checklist: `.paperclip/LEAD-ENG-DEPLOYMENT-CHECKLIST.md`\n- CTO validation: `.paperclip/BRO-103-VALIDATION-REPORT.md`\n- Full status: `DEPLOYMENT_STATUS.md`\n\n### Timeline\nURGENT - Original 9 AM campaign start is impacted. Growth team ready to launch immediately once deployment confirmed."
  }'

echo "Update sent to Paperclip system."
