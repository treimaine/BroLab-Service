'use client'

import { api } from 'convex/_generated/api'
import { useMutation } from 'convex/react'
import { Calendar, CheckCircle2, Clock3, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

type Segment = 'producer' | 'engineer'

type TimeSlot = {
  label: string
  value: string
}

function buildTimeSlots(): TimeSlot[] {
  const slots: TimeSlot[] = []
  const cursor = new Date()

  while (slots.length < 10) {
    cursor.setDate(cursor.getDate() + 1)
    if (cursor.getDay() === 0 || cursor.getDay() === 6) continue

    for (const hour of [11, 16]) {
      const slot = new Date(cursor)
      slot.setHours(hour, 0, 0, 0)
      slots.push({
        label: slot.toLocaleString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        value: slot.toISOString()
      })
    }
  }

  return slots
}

export function InterviewRequestForm() {
  const submitRequest = useMutation(
    api.modules.interviewRequests.submitInterviewRequest
  )
  const [submitted, setSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([])
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])
  const [attribution, setAttribution] = useState({
    source: 'direct',
    campaign: 'concierge-organic'
  })
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    segment: 'producer' as Segment,
    notes: ''
  })

  useEffect(() => {
    setTimeSlots(buildTimeSlots())
    const params = new URLSearchParams(window.location.search)
    const segment = params.get('segment')
    const handle = params.get('handle')?.replace(/^@/, '').slice(0, 120) ?? ''
    setAttribution({
      source: params.get('source')?.slice(0, 80) || 'direct',
      campaign: params.get('campaign')?.slice(0, 160) || 'concierge-organic'
    })
    setFormData((current) => ({
      ...current,
      company: current.company || handle,
      segment: segment === 'engineer' ? 'engineer' : current.segment
    }))
  }, [])

  function toggleTime(value: string) {
    setSelectedTimes((current) => {
      if (current.includes(value)) {
        return current.filter((time) => time !== value)
      }
      return [...current, value].slice(-3)
    })
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    if (selectedTimes.length === 0) {
      setError('Choose at least one time that works for you.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitRequest({
        email: formData.email,
        name: formData.name,
        company: formData.company || undefined,
        preferredTimes: selectedTimes,
        notes: [
          '[Concierge onboarding]',
          `Segment: ${formData.segment}`,
          `Source: ${attribution.source}`,
          `Campaign: ${attribution.campaign}`,
          `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown'}`,
          formData.notes ? `First offer: ${formData.notes}` : ''
        ]
          .filter(Boolean)
          .join('\n')
      })
      setSubmitted(true)
    } catch (submissionError) {
      console.error('Failed to request concierge onboarding:', submissionError)
      setError('We could not save your request. Email support@brolabentertainment.com and we will arrange it manually.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="rounded-3xl border border-accent/40 bg-surface p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-accent" />
        <h2 className="mt-5 text-2xl font-bold">Your setup request is in</h2>
        <p className="mx-auto mt-3 max-w-md text-muted">
          We will confirm one of your selected times by email within 24 hours.
          Bring one beat or one service offer; we will build from that.
        </p>
        <Link
          href="/sign-up?source=direct&campaign=concierge-requested"
          className="mt-6 inline-flex rounded-full bg-accent px-6 py-3 font-bold text-black"
        >
          Create my account now
        </Link>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-3xl border border-border bg-surface p-6 sm:p-8"
    >
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-accent/15 p-2.5 text-accent">
          <Clock3 className="h-5 w-5" />
        </div>
        <div>
          <h2 className="text-xl font-bold">Book your free setup</h2>
          <p className="text-sm text-muted">15 minutes · no sales call</p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-semibold">
          Name
          <input
            required
            value={formData.name}
            onChange={(event) =>
              setFormData({ ...formData, name: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 font-normal outline-none focus:border-accent"
            placeholder="Your name"
          />
        </label>
        <label className="text-sm font-semibold">
          Email
          <input
            required
            type="email"
            value={formData.email}
            onChange={(event) =>
              setFormData({ ...formData, email: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 font-normal outline-none focus:border-accent"
            placeholder="you@example.com"
          />
        </label>
        <label className="text-sm font-semibold">
          Artist / studio name
          <input
            value={formData.company}
            onChange={(event) =>
              setFormData({ ...formData, company: event.target.value })
            }
            className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 font-normal outline-none focus:border-accent"
            placeholder="Optional"
          />
        </label>
        <label className="text-sm font-semibold">
          I sell
          <select
            value={formData.segment}
            onChange={(event) =>
              setFormData({
                ...formData,
                segment: event.target.value as Segment
              })
            }
            className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 font-normal outline-none focus:border-accent"
          >
            <option value="producer">Beats / instrumentals</option>
            <option value="engineer">Mixing / audio services</option>
          </select>
        </label>
      </div>

      <fieldset className="mt-7">
        <legend className="flex items-center gap-2 text-sm font-semibold">
          <Calendar className="h-4 w-4 text-accent" />
          Choose up to three times in your timezone
        </legend>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {timeSlots.map((slot) => {
            const selected = selectedTimes.includes(slot.value)
            return (
              <button
                key={slot.value}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleTime(slot.value)}
                className={`rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                  selected
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-border bg-bg text-muted hover:border-accent/60'
                }`}
              >
                {slot.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <label className="mt-7 block text-sm font-semibold">
        What should we publish first?
        <textarea
          value={formData.notes}
          onChange={(event) =>
            setFormData({ ...formData, notes: event.target.value })
          }
          rows={3}
          className="mt-2 w-full resize-none rounded-xl border border-border bg-bg px-4 py-3 font-normal outline-none focus:border-accent"
          placeholder="A beat, a mixing package, your current sales link, or the step blocking you"
        />
      </label>

      {error && (
        <p role="alert" className="mt-4 text-sm text-red-400">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || timeSlots.length === 0}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 font-bold text-black disabled:opacity-50"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? 'Saving your request…' : 'Book my free setup'}
      </button>
      <p className="mt-3 text-center text-xs text-muted">
        Free during the early-access cohort. No payment details required to book.
      </p>
    </form>
  )
}
