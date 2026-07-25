import { config } from 'dotenv'
import { ConvexHttpClient } from 'convex/browser'
import { makeFunctionReference } from 'convex/server'

const productionEnv = config({
  path: '.env.production.local',
  quiet: true,
}).parsed

const convexUrl = productionEnv?.NEXT_PUBLIC_CONVEX_URL
if (!convexUrl) {
  throw new Error(
    'NEXT_PUBLIC_CONVEX_URL is required in .env.production.local to report production growth'
  )
}

const convex = new ConvexHttpClient(convexUrl)
const getDashboardMetrics = makeFunctionReference(
  'modules/analytics:getDashboardMetrics'
)
const getFunnel = makeFunctionReference('modules/growth:getFunnel')

function compactError(error) {
  if (!(error instanceof Error)) return String(error)
  return error.message.split('\n')[0]
}

function getFallbackDiagnosis(activation, instrumentationStatus) {
  const trackingEvidence =
    instrumentationStatus === 'legacy'
      ? 'Acquisition events are readable, but the deployed query lacks the diagnostic and coverage fields.'
      : 'Acquisition events cannot be read until the growth query is deployed.'

  if (activation.userCounts.total === 0 && activation.totalWorkspaces === 0) {
    return {
      status: 'pre_launch',
      priority: 'instrumentation_and_acquisition',
      evidence: [
        'No registered user exists in production.',
        'No workspace exists in production.',
        trackingEvidence,
      ],
      nextAction:
        'Deploy the growth instrumentation, verify one test visit end to end, then drive qualified traffic.',
    }
  }

  return {
    status: 'measurement_gap',
    priority: 'instrumentation',
    evidence: [
      `${activation.userCounts.total} registered user(s) exist in production.`,
      `${activation.totalWorkspaces} workspace(s) exist in production.`,
      trackingEvidence,
    ],
    nextAction:
      'Deploy the growth query before attributing drop-off to the offer, price, or onboarding.',
  }
}

async function getReport() {
  const activation = await convex.query(getDashboardMetrics, {})
  let acquisition = null
  let acquisitionError = null

  try {
    acquisition = await convex.query(getFunnel, {})
  } catch (error) {
    acquisitionError = compactError(error)
  }

  const instrumentationStatus =
    acquisition === null
      ? 'unavailable'
      : acquisition.diagnosis && acquisition.coverage
        ? 'current'
        : 'legacy'

  return {
    generatedAt: new Date().toISOString(),
    acquisition,
    activation: {
      users: activation.userCounts.total,
      workspaces: activation.totalWorkspaces,
      tracks: activation.totalTracks,
      orders: activation.totalOrders,
      completedOrders: activation.completedOrders,
      revenueUsd: activation.totalRevenueCents / 100,
    },
    diagnosis:
      acquisition?.diagnosis ??
      getFallbackDiagnosis(activation, instrumentationStatus),
    instrumentation: {
      growthQuery: instrumentationStatus,
      detail: acquisitionError,
    },
  }
}

function printHumanReport(report) {
  const lines = [
    `BroLab production funnel — ${report.generatedAt}`,
    '',
    'Known facts',
    `- Registered users: ${report.activation.users}`,
    `- Workspaces: ${report.activation.workspaces}`,
    `- Tracks: ${report.activation.tracks}`,
    `- Orders: ${report.activation.orders}`,
    `- Revenue: $${report.activation.revenueUsd.toFixed(2)}`,
    '',
  ]

  if (report.acquisition) {
    lines.push(
      'Acquisition tracking',
      `- Query version: ${report.instrumentation.growthQuery}`,
      `- Events: ${report.acquisition.totalEvents}${report.acquisition.isTruncated ? '+' : ''}`,
      `- Landing sessions: ${report.acquisition.uniqueSessions.landing_view ?? 0}`,
      `- CTA sessions: ${report.acquisition.uniqueSessions.cta_clicked ?? 0}`,
      `- Signup sessions: ${report.acquisition.uniqueSessions.signup_view ?? 0}`,
      ''
    )
  } else {
    lines.push(
      'Acquisition tracking',
      '- Unavailable: the growth query is not deployed or cannot be reached.',
      ''
    )
  }

  lines.push(
    `Diagnosis: ${report.diagnosis.status}`,
    `Evidence: ${
      Array.isArray(report.diagnosis.evidence)
        ? report.diagnosis.evidence.join(' ')
        : report.diagnosis.evidence
    }`,
    `Next action: ${report.diagnosis.nextAction}`
  )

  console.log(lines.join('\n'))
}

const report = await getReport()
if (process.argv.includes('--json')) {
  console.log(JSON.stringify(report, null, 2))
} else {
  printHumanReport(report)
}
