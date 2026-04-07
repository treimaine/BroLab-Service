#!/bin/bash
curl -s -X POST \
  -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: ${PAPERCLIP_RUN_ID}" \
  "${PAPERCLIP_API_URL}/api/issues/7d1c4906-e4b0-44c4-8bdf-3c4d2b07fe04/comments" \
  -d @.paperclip/comment_cmo_bro95.json
