#!/usr/bin/env node

import { createHmac, randomUUID } from 'node:crypto'
import { Buffer } from 'node:buffer'
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })

const webhookUrl = `${process.env.NEXT_PUBLIC_CONVEX_SITE_URL}/api/clerk/webhook`
const signingSecret = process.env.CLERK_WEBHOOK_SECRET

if (!process.env.NEXT_PUBLIC_CONVEX_SITE_URL || !signingSecret) {
  throw new Error('NEXT_PUBLIC_CONVEX_SITE_URL and CLERK_WEBHOOK_SECRET are required')
}

const payload = JSON.stringify({
  type: 'session.created',
  object: 'event',
  data: {
    id: `sess_codex_${randomUUID()}`,
    user_id: 'user_webhook_verification',
    status: 'active',
    created_at: Date.now(),
  },
})
const svixId = `msg_${randomUUID()}`
const svixTimestamp = String(Math.floor(Date.now() / 1000))
const key = Buffer.from(signingSecret.replace(/^whsec_/, ''), 'base64')
const signature = createHmac('sha256', key)
  .update(`${svixId}.${svixTimestamp}.${payload}`)
  .digest('base64')

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json',
    'svix-id': svixId,
    'svix-timestamp': svixTimestamp,
    'svix-signature': `v1,${signature}`,
  },
  body: payload,
})
const responseBody = await response.json()

console.log(`Clerk webhook response: ${response.status}`)
console.log(JSON.stringify(responseBody, null, 2))

if (!response.ok || responseBody.received !== true) process.exit(1)
