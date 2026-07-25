import { createClerkClient } from '@clerk/backend'
import { config } from 'dotenv'

config({ path: '.env.production.local', quiet: true })
config({ path: '.env.local', quiet: true })

if (!process.env.CLERK_SECRET_KEY) {
  throw new Error('CLERK_SECRET_KEY is required to report MRR')
}

const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function listAllUsers() {
  const users = []
  const limit = 100
  let offset = 0

  while (true) {
    const page = await clerk.users.getUserList({ limit, offset })
    users.push(...page.data)
    offset += page.data.length
    if (offset >= page.totalCount || page.data.length === 0) return users
  }
}

function getAmountCents(item) {
  const amount = item.amount
  if (typeof amount === 'number') return amount
  if (amount && typeof amount.amount === 'number') return amount.amount
  return 0
}

function getMonthlyRunRateCents(item) {
  const amountCents = getAmountCents(item)
  return item.planPeriod === 'annual' ? amountCents / 12 : amountCents
}

const users = await listAllUsers()
const paidItems = []

for (const user of users) {
  const subscription = await clerk.billing.getUserBillingSubscription(user.id)
  const items = subscription?.subscriptionItems ?? []

  for (const item of items) {
    const plan = item.plan?.slug?.toLowerCase()
    const isPaidPlan = plan === 'basic' || plan === 'pro'
    const isActive = item.status === 'active' || item.status === 'upcoming'
    if (!isPaidPlan || !isActive) continue

    paidItems.push({
      plan,
      period: item.planPeriod,
      monthlyRunRateCents: getMonthlyRunRateCents(item),
    })
  }
}

const summary = {
  generatedAt: new Date().toISOString(),
  users: users.length,
  activePaidSubscriptions: paidItems.length,
  basic: paidItems.filter((item) => item.plan === 'basic').length,
  pro: paidItems.filter((item) => item.plan === 'pro').length,
  monthly: paidItems.filter((item) => item.period === 'month').length,
  annual: paidItems.filter((item) => item.period === 'annual').length,
  mrrUsd:
    Math.round(
      paidItems.reduce((total, item) => total + item.monthlyRunRateCents, 0)
    ) / 100,
}

console.log(JSON.stringify(summary, null, 2))
