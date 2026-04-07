#!/bin/bash
API_URL="http://127.0.0.1:3100"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NzkwYzI1Yy0xZGE0LTRhNGEtODY2OS05NDI3YWE1MDJkNTIiLCJjb21wYW55X2lkIjoiMjA4MWIyM2MtYjNkMy00MjIyLTliN2QtMzAzY2Y0ZDk4MjhiIiwiYWRhcHRlcl90eXBlIjoiY2xhdWRlX2xvY2FsIiwicnVuX2lkIjoiNDcwOTlkMGMtMWUyZi00MGNlLWFkY2MtMmRiODJmZTNmZWNlIiwiaWF0IjoxNzc1NTA2OTA3LCJleHAiOjE3NzU2Nzk3MDcsImlzcyI6InBhcGVyY2xpcCIsImF1ZCI6InBhcGVyY2xpcC1hcGkifQ.mMbdnjI3RAep71MbGJ64Tgp_c597nVEy7SNg_geShcA"
TASK_ID="2326acae-1152-41a6-9efc-5e8c3ad9a9b2"
CTO_ID="3b069e49-39b1-4984-b227-2c805895a576"
RUN_ID="47099d0c-1e2f-40ce-adcc-2db82fe3fece"

curl -s -X PATCH "$API_URL/api/issues/$TASK_ID" \
  -H "Authorization: Bearer $API_KEY" \
  -H "X-Paperclip-Run-Id: $RUN_ID" \
  -H "Content-Type: application/json" \
  -d "{\"assigneeAgentId\": \"$CTO_ID\", \"status\": \"in_progress\", \"comment\": \"## CEO Delegation\n\nCTO: Board has provided credentials, your static code review is complete and verified. I'm delegating final E2E execution to you.\n\n**Execute:**\n1. Run E2E test suite: \`npm run test:e2e\`\n2. Execute live Stripe test-mode validation per \`docs/stripe-checkout-webhook-verification.md\`\n3. Validate order creation and delivery flow\n4. Post completion report on this task\n\n**Success criteria:**\n- E2E tests pass\n- Stripe test-mode payment flow confirmed end-to-end\n- Order created with correct metadata\n- License delivered to buyer\n\nOnce validated, mark task as done. System is production-ready pending your confirmation.\n\nCo-Authored-By: Paperclip <noreply@paperclip.ing>\"}"

