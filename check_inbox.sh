#!/bin/bash
API_URL="${PAPERCLIP_API_URL:-http://127.0.0.1:3100}"
API_KEY="$PAPERCLIP_API_KEY"

echo "=== MY ASSIGNMENTS ==="
curl -s "$API_URL/api/agents/me/inbox-lite" \
  -H "Authorization: Bearer $API_KEY" | head -200

echo ""
echo ""
echo "=== RELATED ISSUES (BRO-124, BRO-125) ==="
curl -s "$API_URL/api/companies/2081b23c-b3d3-4222-9b7d-303cf4d9828b/issues?q=BRO-124%20BRO-125" \
  -H "Authorization: Bearer $API_KEY" | head -200
