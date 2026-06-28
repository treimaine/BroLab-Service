#!/bin/bash

# Test health check through Convex
echo "Testing Convex health check endpoint..."
curl -X GET "https://cautious-retriever-22.convex.site/api/health" \
  -H "Content-Type: application/json" \
  -s -w "\nStatus: %{http_code}\n"

echo -e "\n---\n"

# Test via Next.js proxy
echo "Testing via Next.js proxy at /api/stripe/webhook..."
curl -X POST "https://brolabentertainment.com/api/stripe/webhook" \
  -H "Content-Type: application/json" \
  -H "stripe-signature: test" \
  -d '{}' \
  -s -w "\nStatus: %{http_code}\n"
