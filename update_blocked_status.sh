#!/bin/bash

API_URL="${PAPERCLIP_API_URL:-http://127.0.0.1:3100}"
API_KEY="$PAPERCLIP_API_KEY"
RUN_ID="$PAPERCLIP_RUN_ID"
TASK_ID="$PAPERCLIP_TASK_ID"

# Create JSON data in a file to avoid quoting issues
cat > /tmp/status_update.json <<'EOF'
{
  "status": "blocked",
  "comment": "BLOCKED: Waiting for Production Deployment\n\nCannot execute Phase 3 Reddit campaign without public signup link.\n\nBLOCKER:\n- Variable: NEXT_PUBLIC_SITE_URL\n- Currently: http://localhost:3000 (localhost only)\n- Needs: https://brolabentertainment.com (production)\n- Location: Production environment (Vercel/Docker/hosting provider)\n\nWHAT I'VE DONE:\n✓ All campaign content ready (BRO-124, BRO-125, BRO-126)\n✓ Documented deployment steps\n✓ Created deployment handoff\n✓ Standing by for deployment confirmation\n\nWAITING ON (Lead Engineer - BRO-133):\n1. Update NEXT_PUBLIC_SITE_URL to https://brolabentertainment.com\n2. Trigger production build/deployment\n3. Verify /sign-up works at https://brolabentertainment.com/sign-up\n4. Confirm Clerk auth and Stripe work on production domain\n5. Reply when deployment is live\n\nWHAT HAPPENS NEXT (upon deployment confirmation):\n- BRO-124: Start Twitter/X posts (2-3/day)\n- BRO-125: Start producer outreach (10/day)\n- BRO-126: Complete Reddit setup for Monday launch\n\nKEY DOCS:\n- Deployment status: DEPLOYMENT_STATUS.md\n- Deployment handoff: DEPLOYMENT_HANDOFF.md\n- Campaign calendar: .paperclip/BRO-124-CONTENT-CALENDAR.md\n\nTIMELINE: Critical path for Phase 3. All campaigns blocked on this single step."
}
EOF

curl -s -X PATCH \
  "$API_URL/api/issues/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Paperclip-Run-Id: $RUN_ID" \
  -H "Content-Type: application/json" \
  -d @/tmp/status_update.json

echo "Status update sent. Task marked as BLOCKED."
