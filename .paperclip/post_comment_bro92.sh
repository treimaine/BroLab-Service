#!/bin/bash
curl -s -X POST \
  -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" \
  -H "Content-Type: application/json" \
  -H "X-Paperclip-Run-Id: ${PAPERCLIP_RUN_ID}" \
  "${PAPERCLIP_API_URL}/api/issues/8776f7eb-ca68-4028-81e6-5886676a27e1/comments" \
  -d @.paperclip/comment_bro92.json
