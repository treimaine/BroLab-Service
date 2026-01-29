#!/usr/bin/env node

/**
 * Test Convex URLs
 * 
 * Vérifie que les deux URLs Convex sont accessibles :
 * 1. .convex.cloud (queries/mutations)
 * 2. .convex.site (HTTP routes/webhooks)
 */

const DEPLOYMENT = 'famous-starling-265'

async function testConvexCloud() {
  const url = `https://${DEPLOYMENT}.convex.cloud`
  console.log(`\n🔍 Testing Convex Cloud URL: ${url}`)
  
  try {
    const response = await fetch(url)
    console.log(`✅ Status: ${response.status}`)
    console.log(`✅ Convex Cloud is accessible`)
    return true
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    return false
  }
}

async function testConvexSite() {
  const url = `https://${DEPLOYMENT}.convex.site/health`
  console.log(`\n🔍 Testing Convex Site URL: ${url}`)
  
  try {
    const response = await fetch(url)
    const data = await response.json()
    console.log(`✅ Status: ${response.status}`)
    console.log(`✅ Response:`, data)
    console.log(`✅ Convex Site HTTP routes are accessible`)
    return true
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    return false
  }
}

async function testWebhookEndpoint() {
  const url = `https://${DEPLOYMENT}.convex.site/api/clerk/webhook`
  console.log(`\n🔍 Testing Webhook Endpoint: ${url}`)
  
  try {
    // Test with a minimal payload (will fail validation but should return 400, not 404)
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true })
    })
    
    console.log(`✅ Status: ${response.status}`)
    
    if (response.status === 404) {
      console.error(`❌ Webhook endpoint not found (404)`)
      return false
    }
    
    const data = await response.json()
    console.log(`✅ Response:`, data)
    console.log(`✅ Webhook endpoint is accessible`)
    return true
  } catch (error) {
    console.error(`❌ Error: ${error.message}`)
    return false
  }
}

async function main() {
  console.log('🚀 Testing Convex URLs...')
  console.log(`📦 Deployment: ${DEPLOYMENT}`)
  
  const cloudOk = await testConvexCloud()
  const siteOk = await testConvexSite()
  const webhookOk = await testWebhookEndpoint()
  
  console.log('\n📊 Summary:')
  console.log(`  Convex Cloud (.convex.cloud): ${cloudOk ? '✅' : '❌'}`)
  console.log(`  Convex Site (.convex.site): ${siteOk ? '✅' : '❌'}`)
  console.log(`  Webhook Endpoint: ${webhookOk ? '✅' : '❌'}`)
  
  if (cloudOk && siteOk && webhookOk) {
    console.log('\n✅ All Convex URLs are working correctly!')
    console.log('\n📝 Next steps:')
    console.log('  1. Configure Clerk webhook with: https://famous-starling-265.convex.site/api/clerk/webhook')
    console.log('  2. Select events: user.*, session.*, organization.*')
    console.log('  3. Test webhook in Clerk Dashboard')
  } else {
    console.log('\n❌ Some URLs are not working. Check your Convex deployment.')
    process.exit(1)
  }
}

main()
