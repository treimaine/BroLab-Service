#!/bin/bash
# Get the comment that triggered this wake
WAKE_COMMENT_ID="${PAPERCLIP_WAKE_COMMENT_ID}"
echo "Wake comment ID: ${WAKE_COMMENT_ID}"

# I'm currently working on BRO-60 based on the active run, so let's get that task's comments
curl -s -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" "${PAPERCLIP_API_URL}/api/issues/e0fdcb87-f976-40a7-ac82-62763696b4f7/comments"
