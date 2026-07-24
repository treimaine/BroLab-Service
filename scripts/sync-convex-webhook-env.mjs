import { spawnSync } from 'node:child_process'
import { config } from 'dotenv'

config({ path: '.env.local', quiet: true })

const variables = [
  ['CLERK_WEBHOOK_SECRET', 'CLERK_WEBHOOK_SIGNING_SECRET'],
  ['STRIPE_SECRET_KEY', 'STRIPE_SECRET_KEY'],
  ['STRIPE_WEBHOOK_SECRET', 'STRIPE_WEBHOOK_SECRET'],
  ['STRIPE_CONNECT_WEBHOOK_SECRET', 'STRIPE_CONNECT_WEBHOOK_SECRET'],
]

for (const [sourceName, targetName] of variables) {
  const value = process.env[sourceName]
  if (!value || /YOUR_|<REDACTED>|\.\.\./.test(value)) {
    throw new Error(`Missing or invalid ${sourceName} in .env.local`)
  }

  const isWindows = process.platform === 'win32'
  const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'npx'
  const commandArgs = isWindows
    ? ['/d', '/s', '/c', `npx.cmd convex env set ${targetName}`]
    : ['convex', 'env', 'set', targetName]
  const result = spawnSync(command, commandArgs, {
    input: value,
    encoding: 'utf8',
  })

  if (result.status !== 0) {
    throw new Error(`Failed to configure ${targetName}: ${result.stderr.trim()}`)
  }

  console.log(`Configured ${targetName}`)
}
