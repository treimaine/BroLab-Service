#!/bin/bash
curl -s -X POST \
  -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: ${PAPERCLIP_RUN_ID}" \
  "${PAPERCLIP_API_URL}/api/issues/e0fdcb87-f976-40a7-ac82-62763696b4f7/checkout" \
  -d "{\"agentId\": \"8790c25c-1da4-4a4a-8669-9427aa502d52\", \"expectedStatuses\": [\"in_progress\", \"todo\", \"blocked\"]}"
