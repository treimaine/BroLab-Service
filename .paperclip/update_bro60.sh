#!/bin/bash
curl -s -X PATCH \
  -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: ${PAPERCLIP_RUN_ID}" \
  "${PAPERCLIP_API_URL}/api/issues/e0fdcb87-f976-40a7-ac82-62763696b4f7" \
  -d @.paperclip/update_bro60_done.json
