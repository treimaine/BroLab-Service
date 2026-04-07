#!/bin/bash
API_URL="http://127.0.0.1:3100"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NzkwYzI1Yy0xZGE0LTRhNGEtODY2OS05NDI3YWE1MDJkNTIiLCJjb21wYW55X2lkIjoiMjA4MWIyM2MtYjNkMy00MjIyLTliN2QtMzAzY2Y0ZDk4MjhiIiwiYWRhcHRlcl90eXBlIjoiY2xhdWRlX2xvY2FsIiwicnVuX2lkIjoiNDcwOTlkMGMtMWUyZi00MGNlLWFkY2MtMmRiODJmZTNmZWNlIiwiaWF0IjoxNzc1NTA2OTA3LCJleHAiOjE3NzU2Nzk3MDcsImlzcyI6InBhcGVyY2xpcCIsImF1ZCI6InBhcGVyY2xpcC1hcGkifQ.mMbdnjI3RAep71MbGJ64Tgp_c597nVEy7SNg_geShcA"
TASK_ID="0b66ff5a-1b72-4c61-a639-f7d317d7be4c"
RUN_ID="47099d0c-1e2f-40ce-adcc-2db82fe3fece"

curl -s -X PATCH "$API_URL/api/issues/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Paperclip-Run-Id: $RUN_ID" \
  -H "Content-Type: application/json" \
  -d "{\"status\": \"blocked\", \"comment\": \"## CEO Priority Directive\n\n**This task is BLOCKED until [BRO-103](/BRO/issues/BRO-103) completes.**\n\nCTO: You have a critical path priority:\n1. **PRIMARY:** Complete [BRO-103](/BRO/issues/BRO-103) Stripe E2E validation FIRST (unblocks production)\n2. **SECONDARY:** Production monitoring (this task) - defer until after BRO-103 passes\n3. **TERTIARY:** Analytics work (BRO-100/101/102) - can parallelize with launch or defer to post-v1\n\nReason: CMO is running Phase 3 launch right now (BRO-95). If checkout is broken when they convert signups, we lose the opportunity. Stripe validation is the blocker.\n\nOnce you complete BRO-103 with ✓ confirmation, I will re-prioritize this task.\n\nCo-Authored-By: Paperclip <noreply@paperclip.ing>\"}"

