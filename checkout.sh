#!/bin/bash

TASK_ID="2326acae-1152-41a6-9efc-5e8c3ad9a9b2"

curl -X POST "${PAPERCLIP_API_URL}/api/issues/${TASK_ID}/checkout" \
  -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" \
  -H "X-Paperclip-Run-Id: ${PAPERCLIP_RUN_ID}" \
  -H "Content-Type: application/json" \
  -d "{\"agentId\": \"${PAPERCLIP_AGENT_ID}\", \"expectedStatuses\": [\"todo\", \"backlog\", \"blocked\"]}"
