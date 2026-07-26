'use client'

import { api } from 'convex/_generated/api'
import type { Doc } from 'convex/_generated/dataModel'
import { useMutation, useQuery } from 'convex/react'
import {
  Check,
  Clock3,
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  Target,
  Trash2
} from 'lucide-react'
import Link from 'next/link'
import { useMemo, useState } from 'react'

type Prospect = Doc<'growthProspects'>
type ProspectStatus = Prospect['status']
type ProspectSegment = Prospect['segment']
type ProspectPlatform = Prospect['platform']
type ProspectRelationship = 'following' | 'not_following' | 'unknown'
type ProspectConversationState =
  | 'none'
  | 'outbound_unanswered'
  | 'inbound_unanswered'
  | 'active'
  | 'unknown'

const STATUS_OPTIONS: Array<{ value: ProspectStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'replied', label: 'Replied' },
  { value: 'qualified', label: 'Qualified' },
  { value: 'link_sent', label: 'Link sent' },
  { value: 'trial_started', label: 'Trial started' },
  { value: 'activated', label: 'First offer live' },
  { value: 'won', label: 'Won' },
  { value: 'lost', label: 'Lost' }
]

function platformFromUrl(url: string): ProspectPlatform {
  if (url.includes('x.com/') || url.includes('twitter.com/')) return 'x'
  if (url.includes('instagram.com/')) return 'instagram'
  if (url.startsWith('mailto:')) return 'email'
  return 'other'
}

function setupLink(prospect: Prospect) {
  const params = new URLSearchParams({
    plan: 'pro',
    period: 'month',
    source: 'direct',
    campaign: prospect.campaign
  })
  return `https://brolabentertainment.com/sign-up?${params.toString()}`
}

function draftFor(prospect: Prospect): string {
  const personalized = prospect.outreachDrafts
  if (personalized) {
    if (
      prospect.conversationState === 'outbound_unanswered' &&
      prospect.status === 'new'
    ) {
      return personalized.followUp
    }
    if (
      (prospect.conversationState === 'inbound_unanswered' ||
        prospect.conversationState === 'active') &&
      prospect.status === 'new'
    ) {
      return personalized.reentry ?? personalized.replyBridge
    }
    if (prospect.status === 'new') return personalized.opener
    if (prospect.status === 'contacted') return personalized.followUp
    if (prospect.status === 'replied') return personalized.replyBridge
    if (prospect.status === 'qualified') {
      return `${personalized.trialInvite}\n\n${setupLink(prospect)}`
    }
  }

  const offer = prospect.segment === 'engineer' ? 'service' : 'beat'
  const flow = prospect.currentSalesFlow
    ? ` through ${prospect.currentSalesFlow}`
    : ''

  if (prospect.status === 'new') {
    return `I saw ${prospect.signal}${flow}. Quick question: when someone wants to buy your ${offer}, do you send the payment, files and terms manually, or is that flow already automated?`
  }
  if (prospect.status === 'contacted') {
    return `Following up on my question about your ${offer} sales flow — I noticed ${prospect.signal}. If the admin after a sale is still manual, I can show you the exact setup I built for that.`
  }
  if (prospect.status === 'link_sent') {
    return `Did the setup link open correctly? Start with one offer only. Once Stripe is connected and that offer is live, the rest can wait: ${setupLink(prospect)}`
  }
  if (prospect.status === 'trial_started') {
    return `Your free month is active. The fastest path to a sell-ready storefront is: connect Stripe, then publish one ${offer}. The in-app checklist and emails guide each step; reply here only if something blocks you.`
  }
  return `Thanks for giving BroLab a try. Your storefront progress is saved, and your campaign link remains: ${setupLink(prospect)}`
}

function parseImport(raw: string) {
  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line, index) => {
      const [
        rawHandle,
        rawUrl,
        rawSegment,
        rawSignal,
        rawFlow,
        rawOpener,
        rawFollowUp,
        rawReplyBridge,
        rawTrialInvite,
        rawRelationship,
        rawConversationState,
        rawConversationSummary,
        rawFitScore,
        rawResearchNotes,
        rawReentry
      ] = line.split('|').map((part) => part.trim())
      const handle = rawHandle?.replace(/^@/, '')
      const segment: ProspectSegment =
        rawSegment?.toLowerCase() === 'engineer' ? 'engineer' : 'producer'

      if (!handle || !rawUrl || !rawSignal) {
        throw new Error(
          `Line ${index + 1}: expected handle | profile URL | producer/engineer | specific signal`
        )
      }
      const draftParts = [
        rawOpener,
        rawFollowUp,
        rawReplyBridge,
        rawTrialInvite
      ]
      if (draftParts.some(Boolean) && !draftParts.every(Boolean)) {
        throw new Error(
          `Line ${index + 1}: provide all four personalized drafts or leave all four empty`
        )
      }
      const relationship: ProspectRelationship | undefined =
        rawRelationship === 'following' ||
        rawRelationship === 'not_following' ||
        rawRelationship === 'unknown'
          ? rawRelationship
          : undefined
      const conversationState: ProspectConversationState | undefined =
        rawConversationState === 'none' ||
        rawConversationState === 'outbound_unanswered' ||
        rawConversationState === 'inbound_unanswered' ||
        rawConversationState === 'active' ||
        rawConversationState === 'unknown'
          ? rawConversationState
          : undefined
      const fitScore = rawFitScore ? Number(rawFitScore) : undefined
      if (
        fitScore !== undefined &&
        (!Number.isFinite(fitScore) || fitScore < 0 || fitScore > 100)
      ) {
        throw new Error(
          `Line ${index + 1}: fit score must be between 0 and 100`
        )
      }
      return {
        displayName: handle,
        handle,
        platform: platformFromUrl(rawUrl),
        profileUrl: rawUrl,
        segment,
        signal: rawSignal,
        currentSalesFlow: rawFlow || undefined,
        outreachDrafts:
          rawOpener && rawFollowUp && rawReplyBridge && rawTrialInvite
            ? {
                opener: rawOpener,
                followUp: rawFollowUp,
                replyBridge: rawReplyBridge,
                trialInvite: rawTrialInvite,
                reentry: rawReentry || undefined
              }
            : undefined,
        relationship,
        conversationState,
        conversationSummary: rawConversationSummary || undefined,
        fitScore,
        researchNotes: rawResearchNotes || undefined,
        lastResearchedAt:
          relationship || conversationState || rawResearchNotes
            ? Date.now()
            : undefined
      }
    })
}

function Metric({
  label,
  value,
  accent = false
}: {
  label: string
  value: number | string
  accent?: boolean
}) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-muted">{label}</p>
      <p
        className={`mt-2 text-2xl font-bold ${accent ? 'text-accent' : 'text-text'}`}
      >
        {value}
      </p>
    </div>
  )
}

export function GrowthPipelineClient() {
  const [now] = useState(() => Date.now())
  const prospects = useQuery(api.modules.growthProspects.listMine)
  const summary = useQuery(api.modules.growthProspects.getMySummary, { now })
  const bulkUpsert = useMutation(api.modules.growthProspects.bulkUpsert)
  const updateStatus = useMutation(api.modules.growthProspects.updateStatus)
  const reschedule = useMutation(api.modules.growthProspects.reschedule)
  const remove = useMutation(api.modules.growthProspects.remove)
  const [importText, setImportText] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const orderedProspects = useMemo(
    () =>
      [...(prospects ?? [])].sort((a, b) => {
        const aDue = a.nextFollowUpAt !== undefined && a.nextFollowUpAt <= now
        const bDue = b.nextFollowUpAt !== undefined && b.nextFollowUpAt <= now
        if (aDue !== bDue) return aDue ? -1 : 1
        if ((a.fitScore ?? 0) !== (b.fitScore ?? 0)) {
          return (b.fitScore ?? 0) - (a.fitScore ?? 0)
        }
        return b.updatedAt - a.updatedAt
      }),
    [prospects, now]
  )

  async function importProspects() {
    setMessage(null)
    setBusy(true)
    try {
      const parsed = parseImport(importText)
      const result = await bulkUpsert({ prospects: parsed })
      setImportText('')
      setMessage(
        `${result.created} added, ${result.updated} personalized, ${result.skipped} duplicate(s) skipped.`
      )
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Import failed.')
    } finally {
      setBusy(false)
    }
  }

  async function copyDraft(prospect: Prospect) {
    await navigator.clipboard.writeText(draftFor(prospect))
    setCopiedId(prospect._id)
    window.setTimeout(() => setCopiedId(null), 1500)
  }

  return (
    <main className="min-h-screen bg-bg px-4 py-10 text-text sm:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em] text-accent">
              <Target className="h-4 w-4" />
              Founder growth pipeline
            </div>
            <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
              Conversations that can become MRR
            </h1>
            <p className="mt-3 max-w-3xl text-muted">
              Qualify first, copy a contextual draft, send it manually, then
              move the prospect forward. Product events automatically advance
              attributed trials and first offers every hour.
            </p>
          </div>
          <Link
            href="/studio"
            className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text"
          >
            Back to studio <ExternalLink className="h-4 w-4" />
          </Link>
        </div>

        <section className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 lg:grid-cols-8">
          <Metric label="Total" value={summary?.total ?? 0} />
          <Metric label="Due now" value={summary?.due ?? 0} accent />
          <Metric label="New" value={summary?.new ?? 0} />
          <Metric label="Replies" value={summary?.replied ?? 0} />
          <Metric label="Qualified" value={summary?.qualified ?? 0} />
          <Metric label="Links" value={summary?.linksSent ?? 0} />
          <Metric label="Trials" value={summary?.trials ?? 0} />
          <Metric label="Activated" value={summary?.activated ?? 0} />
        </section>

        <section className="mt-8 rounded-3xl border border-border bg-surface p-5 sm:p-7">
          <div className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-accent" />
            <h2 className="text-xl font-bold">Import qualified prospects</h2>
          </div>
          <p className="mt-2 text-sm text-muted">
            One per line: handle | profile URL | producer/engineer | specific
            public signal | current sales flow (optional) | opener | follow-up |
            reply bridge | trial invite | relationship | conversation state |
            conversation summary | fit score | research notes | re-entry draft.
            Drafts 1–4 are optional as a group. Maximum 50.
          </p>
          <textarea
            value={importText}
            onChange={(event) => setImportText(event.target.value)}
            rows={6}
            className="mt-4 w-full rounded-2xl border border-border bg-bg p-4 font-mono text-sm outline-none focus:border-accent"
            placeholder="KazTheBeatMaker | https://x.com/KazTheBeatMaker | producer | promoting a new beat this week | BeatStars link in bio"
          />
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={importProspects}
              disabled={busy || !importText.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-black disabled:opacity-50"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              Import
            </button>
            {message && <p className="text-sm text-muted">{message}</p>}
          </div>
        </section>

        <section className="mt-8 space-y-4">
          {prospects === undefined && (
            <div className="flex justify-center py-16">
              <Loader2 className="h-7 w-7 animate-spin text-accent" />
            </div>
          )}
          {prospects?.length === 0 && (
            <div className="rounded-3xl border border-dashed border-border p-10 text-center text-muted">
              Add only producers or engineers who already have an offer ready to
              sell. Public engagement without buying intent does not enter this
              pipeline.
            </div>
          )}
          {orderedProspects.map((prospect) => {
            const isDue =
              prospect.nextFollowUpAt !== undefined &&
              prospect.nextFollowUpAt <= now
            return (
              <article
                key={prospect._id}
                className={`rounded-3xl border bg-surface p-5 sm:p-6 ${
                  isDue ? 'border-accent' : 'border-border'
                }`}
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <a
                        href={prospect.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold hover:text-accent"
                      >
                        @{prospect.handle}
                      </a>
                      <span className="rounded-full bg-bg px-2.5 py-1 text-xs uppercase text-muted">
                        {prospect.segment}
                      </span>
                      {prospect.relationship && (
                        <span className="rounded-full bg-bg px-2.5 py-1 text-xs text-muted">
                          {prospect.relationship === 'following'
                            ? 'Following'
                            : prospect.relationship === 'not_following'
                              ? 'Not followed'
                              : 'Follow unknown'}
                        </span>
                      )}
                      {prospect.conversationState && (
                        <span className="rounded-full bg-bg px-2.5 py-1 text-xs text-muted">
                          {prospect.conversationState === 'none'
                            ? 'No prior DM'
                            : prospect.conversationState.replaceAll('_', ' ')}
                        </span>
                      )}
                      {prospect.fitScore !== undefined && (
                        <span className="rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                          Fit {prospect.fitScore}/100
                        </span>
                      )}
                      {isDue && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-accent/15 px-2.5 py-1 text-xs font-semibold text-accent">
                          <Clock3 className="h-3 w-3" /> Follow up now
                        </span>
                      )}
                    </div>
                    <p className="mt-3 text-sm text-muted">{prospect.signal}</p>
                    {prospect.researchNotes && (
                      <p className="mt-2 text-xs leading-5 text-muted">
                        Research: {prospect.researchNotes}
                      </p>
                    )}
                    {prospect.conversationSummary && (
                      <p className="mt-2 text-xs leading-5 text-muted">
                        Conversation: {prospect.conversationSummary}
                      </p>
                    )}
                    <div className="mt-4 whitespace-pre-line rounded-2xl bg-bg p-4 text-sm leading-6">
                      {draftFor(prospect)}
                    </div>
                    {prospect.outreachDrafts && (
                      <details className="mt-3 rounded-2xl border border-border px-4 py-3">
                        <summary className="cursor-pointer text-sm font-semibold">
                          View the complete personalized DM sequence
                        </summary>
                        <div className="mt-4 space-y-4 text-sm">
                          {[
                            [
                              '1. First exchange',
                              prospect.outreachDrafts.opener
                            ],
                            ['2. Follow-up', prospect.outreachDrafts.followUp],
                            [
                              '3. After a reply',
                              prospect.outreachDrafts.replyBridge
                            ],
                            [
                              '4. Trial invitation',
                              prospect.outreachDrafts.trialInvite
                            ],
                            ...(prospect.outreachDrafts.reentry
                              ? [
                                  [
                                    'Existing conversation',
                                    prospect.outreachDrafts.reentry
                                  ]
                                ]
                              : [])
                          ].map(([label, draft]) => (
                            <div key={label}>
                              <p className="text-xs font-semibold uppercase tracking-wide text-accent">
                                {label}
                              </p>
                              <p className="mt-1 whitespace-pre-line leading-6 text-muted">
                                {draft}
                              </p>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>

                  <div className="flex w-full flex-col gap-3 lg:w-56">
                    <select
                      value={prospect.status}
                      onChange={(event) =>
                        updateStatus({
                          prospectId: prospect._id,
                          status: event.target.value as ProspectStatus
                        })
                      }
                      className="rounded-xl border border-border bg-bg px-3 py-2.5 text-sm"
                    >
                      {STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => copyDraft(prospect)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-black"
                    >
                      {copiedId === prospect._id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                      {copiedId === prospect._id ? 'Copied' : 'Copy draft'}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        reschedule({
                          prospectId: prospect._id,
                          nextFollowUpAt: Date.now() + 24 * 60 * 60 * 1000
                        })
                      }
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-semibold hover:border-accent"
                    >
                      <Clock3 className="h-4 w-4" /> Tomorrow
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (
                          window.confirm(
                            `Remove @${prospect.handle} from the pipeline?`
                          )
                        ) {
                          void remove({ prospectId: prospect._id })
                        }
                      }}
                      className="inline-flex items-center justify-center gap-2 px-4 py-2 text-xs text-muted hover:text-red-500"
                    >
                      <Trash2 className="h-3.5 w-3.5" /> Remove
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
