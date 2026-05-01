#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';

const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

const REQUIRED = [
  'CLERK_SECRET_KEY',
  'CLERK_WEBHOOK_SECRET',
  'STRIPE_SECRET_KEY',
  'STRIPE_WEBHOOK_SECRET',
  'STRIPE_CONNECT_WEBHOOK_SECRET',
];

const checks = [];
for (const key of REQUIRED) {
  const value = process.env[key];
  if (!value || !String(value).trim()) {
    checks.push({ key, ok: false, msg: 'missing' });
    continue;
  }
  if (String(value).includes('your-') || String(value).includes('...')) {
    checks.push({ key, ok: false, msg: 'placeholder-like value' });
    continue;
  }
  checks.push({ key, ok: true, msg: 'set' });
}

const stripeWebhook = process.env.STRIPE_WEBHOOK_SECRET;
const stripeConnectWebhook = process.env.STRIPE_CONNECT_WEBHOOK_SECRET;
if (stripeWebhook && stripeConnectWebhook && stripeWebhook === stripeConnectWebhook) {
  checks.push({ key: 'STRIPE_WEBHOOK_SECRET vs STRIPE_CONNECT_WEBHOOK_SECRET', ok: false, msg: 'must differ' });
} else {
  checks.push({ key: 'STRIPE_WEBHOOK_SECRET vs STRIPE_CONNECT_WEBHOOK_SECRET', ok: true, msg: 'distinct' });
}

const hasTestCreds = REQUIRED.some((k) => (process.env[k] || '').includes('_test_'));
checks.push({
  key: 'production-test-credential-check',
  ok: !hasTestCreds,
  msg: hasTestCreds ? 'contains _test_ marker in critical secret' : 'no _test_ markers found in critical secret vars',
});

let failed = 0;
console.log('BRO-212 secret rotation preflight');
for (const c of checks) {
  const mark = c.ok ? 'OK' : 'FAIL';
  if (!c.ok) failed += 1;
  console.log(`[${mark}] ${c.key}: ${c.msg}`);
}

if (failed > 0) {
  console.error(`\nValidation failed: ${failed} check(s) failed.`);
  process.exit(1);
}

console.log('\nValidation passed. Ready for deploy/restart and QA smoke checks.');
