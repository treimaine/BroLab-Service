#!/usr/bin/env node

const HEALTH_URL = 'https://famous-starling-265.convex.cloud/health';

console.log('Testing health endpoint at:', HEALTH_URL);

try {
  const response = await fetch(HEALTH_URL, {
    method: 'GET',
  });
  
  console.log('Status:', response.status);
  console.log('Status Text:', response.statusText);
  
  const text = await response.text();
  console.log('Response:', text);
  
  if (response.ok) {
    console.log('\n✅ Health check PASSED');
  } else {
    console.log('\n❌ Health check FAILED');
  }
} catch (error) {
  console.error('❌ Error:', error.message);
}
