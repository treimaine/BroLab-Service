#!/usr/bin/env node

// CORRECT URL - .convex.site instead of .convex.cloud
const WEBHOOK_URL = 'https://famous-starling-265.convex.site/api/clerk/webhook';

const testPayload = {
  type: 'session.created',
  object: 'event',
  data: {
    id: 'sess_test123',
    user_id: 'user_test123',
    status: 'active',
    created_at: Date.now()
  }
};

console.log('Testing webhook at CORRECT URL (.convex.site):', WEBHOOK_URL);
console.log('Payload:', JSON.stringify(testPayload, null, 2));
console.log('');

try {
  const response = await fetch(WEBHOOK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(testPayload)
  });
  
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  
  const text = await response.text();
  console.log('Response:', text);
  
  if (response.ok) {
    console.log('\n✅ Webhook test PASSED - HTTP routes work!');
  } else {
    console.log('\n❌ Webhook test FAILED');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
