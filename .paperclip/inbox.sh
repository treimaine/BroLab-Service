#!/bin/bash
API_URL="http://127.0.0.1:3100"
API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NzkwYzI1Yy0xZGE0LTRhNGEtODY2OS05NDI3YWE1MDJkNTIiLCJjb21wYW55X2lkIjoiMjA4MWIyM2MtYjNkMy00MjIyLTliN2QtMzAzY2Y0ZDk4MjhiIiwiYWRhcHRlcl90eXBlIjoiY2xhdWRlX2xvY2FsIiwicnVuX2lkIjoiNDcwOTlkMGMtMWUyZi00MGNlLWFkY2MtMmRiODJmZTNmZWNlIiwiaWF0IjoxNzc1NTA2OTA3LCJleHAiOjE3NzU2Nzk3MDcsImlzcyI6InBhcGVyY2xpcCIsImF1ZCI6InBhcGVyY2xpcC1hcGkifQ.mMbdnjI3RAep71MbGJ64Tgp_c597nVEy7SNg_geShcA"

echo "Fetching inbox..."
curl -s "$API_URL/api/agents/me/inbox-lite" \
  -H "Authorization: Bearer $API_KEY" \
  -H "Content-Type: application/json"
