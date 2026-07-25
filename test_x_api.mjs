/* eslint-disable no-undef */
import https from 'https';

// These would come from env vars in the CMO agent
const TWITTER_BEARER_TOKEN = process.env.TWITTER_BEARER_TOKEN;

if (!TWITTER_BEARER_TOKEN) {
  console.log('ERROR: TWITTER_BEARER_TOKEN not set in environment');
  process.exit(1);
}

console.log('=== X API Credential Test ===\n');

// Test 1: Monitoring Access (GET /2/users/me)
console.log('TEST 1: Monitoring Access - Retrieving authenticated user info');
console.log('Endpoint: GET https://api.twitter.com/2/users/me');
console.log('Auth Method: Bearer Token\n');

const monitoringOptions = {
  hostname: 'api.twitter.com',
  path: '/2/users/me',
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${TWITTER_BEARER_TOKEN}`,
    'User-Agent': 'BroLab-CMO-Test/1.0'
  }
};

const monitoringReq = https.request(monitoringOptions, (res) => {
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  res.on('end', () => {
    console.log(`Status: ${res.statusCode}`);
    console.log(`Response:\n${data}\n`);
    
    if (res.statusCode === 200) {
      try {
        const userInfo = JSON.parse(data);
        if (userInfo.data && userInfo.data.username) {
          console.log(`✓ MONITORING ACCESS SUCCESSFUL`);
          console.log(`  Authenticated as: @${userInfo.data.username} (ID: ${userInfo.data.id})\n`);
        }
      } catch (e) {
        console.error('Error parsing response:', e);
      }
    } else if (res.statusCode === 401) {
      console.log(`✗ MONITORING FAILED: 401 Unauthorized - Bearer token invalid or expired\n`);
    } else if (res.statusCode === 403) {
      console.log(`✗ MONITORING FAILED: 403 Forbidden - Insufficient permissions\n`);
    }
  });
});

monitoringReq.on('error', (error) => {
  console.log(`✗ MONITORING ERROR: ${error.message}\n`);
});

monitoringReq.end();
