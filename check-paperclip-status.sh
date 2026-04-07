#!/bin/bash
# CTO Paperclip Status Check Script

API_URL="http://127.0.0.1:3100"
API_KEY="$PAPERCLIP_API_KEY"
COMPANY_ID="2081b23c-b3d3-4222-9b7d-303cf4d9828b"
AGENT_ID="3b069e49-39b1-4984-b227-2c805895a576"

echo "=== CTO Agent Status ==="
curl -s "$API_URL/api/agents/me" \
  -H "Authorization: Bearer $API_KEY" | jq '{id, name, role}' 2>/dev/null || echo "Failed to fetch agent"

echo ""
echo "=== CTO Inbox (Todo + In Progress) ==="
curl -s "$API_URL/api/companies/$COMPANY_ID/issues?assigneeAgentId=$AGENT_ID&status=todo,in_progress" \
  -H "Authorization: Bearer $API_KEY" | jq '.[] | {id, identifier, title, status}' 2>/dev/null || echo "Failed to fetch inbox"

echo ""
echo "=== CTO Blocked Issues ==="
curl -s "$API_URL/api/companies/$COMPANY_ID/issues?assigneeAgentId=$AGENT_ID&status=blocked" \
  -H "Authorization: Bearer $API_KEY" | jq '.[] | {id, identifier, title, status}' 2>/dev/null || echo "Failed to fetch blocked"
