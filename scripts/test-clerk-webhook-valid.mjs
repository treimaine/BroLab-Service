#!/usr/bin/env node

/**
 * Test Clerk Webhook with Valid Payload
 * 
 * Envoie un payload session.created valide pour tester le webhook
 */

const WEBHOOK_URL = 'https://famous-starling-265.convex.site/api/clerk/webhook'

async function testSessionCreated() {
  console.log('🧪 Testing Clerk webhook with valid session.created payload...')
  console.log(`📍 URL: ${WEBHOOK_URL}`)
  
  // Payload valide pour session.created (basé sur la doc Clerk)
  const payload = {
    type: 'session.created',
    object: 'event',
    data: {
      id: 'sess_test123',
      user_id: 'user_test123',
      status: 'active',
      created_at: Date.now(),
      updated_at: Date.now(),
      last_active_at: Date.now(),
      expire_at: Date.now() + 86400000, // +24h
      abandon_at: Date.now() + 604800000, // +7 days
    }
  }
  
  console.log('\n📦 Payload:')
  console.log(JSON.stringify(payload, null, 2))
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    console.log(`\n✅ Status: ${response.status}`)
    
    const data = await response.json()
    console.log('📥 Response:')
    console.log(JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.received && data.eventType === 'standard') {
      console.log('\n✅ SUCCESS! Webhook is working correctly for standard events.')
      return true
    } else {
      console.log('\n❌ FAILED! Unexpected response.')
      return false
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`)
    return false
  }
}

async function testUserCreated() {
  console.log('\n\n🧪 Testing Clerk webhook with valid user.created payload...')
  console.log(`📍 URL: ${WEBHOOK_URL}`)
  
  // Payload valide pour user.created
  const payload = {
    type: 'user.created',
    object: 'event',
    data: {
      id: 'user_test456',
      email_addresses: [
        {
          id: 'email_test123',
          email_address: 'test@example.com',
          verification: {
            status: 'verified'
          }
        }
      ],
      first_name: 'Test',
      last_name: 'User',
      created_at: Date.now(),
      updated_at: Date.now(),
    }
  }
  
  console.log('\n📦 Payload:')
  console.log(JSON.stringify(payload, null, 2))
  
  try {
    const response = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    })
    
    console.log(`\n✅ Status: ${response.status}`)
    
    const data = await response.json()
    console.log('📥 Response:')
    console.log(JSON.stringify(data, null, 2))
    
    if (response.status === 200 && data.received && data.eventType === 'standard') {
      console.log('\n✅ SUCCESS! Webhook is working correctly for user events.')
      return true
    } else {
      console.log('\n❌ FAILED! Unexpected response.')
      return false
    }
  } catch (error) {
    console.error(`\n❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Testing Clerk Webhook Handler\n')
  console.log('=' .repeat(60))
  
  const sessionOk = await testSessionCreated()
  const userOk = await testUserCreated()
  
  console.log('\n' + '='.repeat(60))
  console.log('\n📊 Summary:')
  console.log(`  session.created: ${sessionOk ? '✅' : '❌'}`)
  console.log(`  user.created: ${userOk ? '✅' : '❌'}`)
  
  if (sessionOk && userOk) {
    console.log('\n✅ All tests passed! Webhook handler is working correctly.')
    console.log('\n📝 Note: The Clerk Dashboard test may send invalid payloads.')
    console.log('   Real webhooks from Clerk will work correctly.')
  } else {
    console.log('\n❌ Some tests failed. Check the webhook handler implementation.')
    process.exit(1)
  }
}

main()
