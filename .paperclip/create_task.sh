#!/bin/bash
curl -s -X POST \
  -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: ${PAPERCLIP_RUN_ID}" \
  "${PAPERCLIP_API_URL}/api/companies/2081b23c-b3d3-4222-9b7d-303cf4d9828b/issues" \
  -d @.paperclip/create_bro96.json
