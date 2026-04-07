#!/bin/bash
curl -s -H "Authorization: Bearer ${PAPERCLIP_API_KEY}" "${PAPERCLIP_API_URL}/api/companies/2081b23c-b3d3-4222-9b7d-303cf4d9828b/issues?assigneeAgentId=f469f00b-9108-43de-baae-f48f3ae55eaf&status=todo,in_progress,blocked"
