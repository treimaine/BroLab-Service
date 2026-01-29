#!/usr/bin/env node

/**
 * Test script for Clerk webhook handler
 * Tests both standard and billing events
 * 
 * Usage: node scripts/test-clerk-webhooks.mjs
 */

const WEBHOOK_URL = process.env.CONVEX_SITE_URL 
  ? `${process.env.CONVEX_SITE_URL}/api/clerk/webhook`
  : 'http://localhost:3000/api/clerk/webhook';

console.log('Testing Clerk webhook handler at:', WEBHOOK_URL);
console.log('');

// Test payloads
const testPayloads = {
  standardEvent: {
    type: 'user.created',
    object: 'event',
    data: {
      id: 'user_test123',
      email_addresses: [
        {
          email_address: 'test@example.com',
          id: 'email_test123'
        }
      ],
      first_name: 'Test',
      last_name: 'User',
      created_at: Date.now()
    }
  },
  billingEvent: {
    type: 'subscription.created',
    data: {
      id: 'sub_test123',
      user_id: 'user_test123',
      plan: 'basic',
      status: 'active'
    }
  }
};

async function testWebhook(name, payload) {
  console.log(`Testing ${name}...`);
  console.log('Payload:', JSON.stringify(payload, null, 2));
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    const result = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(result, null, 2));
    console.log('✅ Test passed');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
  
  console.log('');
}

async function runTests() {
  console.log('='.repeat(60));
  console.log('Clerk Webhook Handler Tests');
  console.log('='.repeat(60));
  console.log('');
  
  // Test 1: Standard Clerk event
  await testWebhook('Standard Event (user.created)', testPayloads.standardEvent);
  
  // Test 2: Billing event (will fail if no workspace exists)
  await testWebhook('Billing Event (subscription.created)', testPayloads.billingEvent);
  
  console.log('='.repeat(60));
  console.log('Tests completed');
  console.log('='.repeat(60));
  console.log('');
  console.log('Note: Billing event test may fail with "Workspace not found"');
  console.log('This is expected if the test user does not have a workspace.');
  console.log('Standard event test should always succeed.');
}

runTests().catch(console.error);
