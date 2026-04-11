'use client'

/**
 * Interview Request Form Component
 *
 * Allows customers to sign up for 15-minute product feedback interviews.
 * Collects email, name, company, preferred times, and notes.
 */

import {
    DribbbleCard,
    PillCTA,
} from '@/platform/ui'
import { useMutation } from 'convex/react'
import { motion } from 'framer-motion'
import { Calendar, Clock, Loader2, MessageSquare } from 'lucide-react'
import { useState } from 'react'
import { api } from '../../../convex/_generated/api'

export function InterviewRequestForm() {
  const [step, setStep] = useState<'form' | 'success'>('form')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    company: '',
    notes: '',
  })
  const [selectedTimes, setSelectedTimes] = useState<string[]>([])

  const submitRequest = useMutation(api.modules.interviewRequests.submitInterviewRequest)

  // Generate sample time slots (next 7 days, 15-min slots)
  const generateTimeSlots = (): Array<{ label: string; value: string }> => {
    const slots: Array<{ label: string; value: string }> = []
    const now = new Date()

    for (let day = 1; day <= 7; day++) {
      const date = new Date(now)
      date.setDate(date.getDate() + day)
      date.setHours(0, 0, 0, 0)

      // Business hours: 9 AM - 5 PM
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(date)
          slotTime.setHours(hour, minute)

          slots.push({
            label: slotTime.toLocaleString('en-US', {
              month: 'short',
              day: 'numeric',
              hour: 'numeric',
              minute: '2-digit',
              hour12: true,
            }),
            value: slotTime.toISOString(),
          })
        }
      }
    }

    return slots.slice(0, 14) // Show first 14 slots (1 week worth)
  }

  const timeSlots = generateTimeSlots()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.email || !formData.name || selectedTimes.length === 0) {
      alert('Please fill in all required fields and select at least one time.')
      return
    }

    setIsSubmitting(true)
    try {
      await submitRequest({
        email: formData.email,
        name: formData.name,
        company: formData.company || undefined,
        preferredTimes: selectedTimes,
        notes: formData.notes || undefined,
      })
      setStep('success')
    } catch (error) {
      console.error('Failed to submit interview request:', error)
      alert('Failed to submit your request. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'success') {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <DribbbleCard className="p-8 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-green-500/10 border border-green-500/30 flex items-center justify-center">
              <MessageSquare className="w-10 h-10 text-green-400" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3">
            Thanks for Your Interest!
          </h2>
          <p className="text-lg text-muted mb-6">
            We've received your interview request and will confirm a time slot shortly.
          </p>

          <p className="text-sm text-muted mb-4">
            Look for an email from <span className="font-semibold">hello@brolabentertainment.com</span> within the next 24 hours.
          </p>

          <button
            onClick={() => {
              setStep('form')
              setFormData({ email: '', name: '', company: '', notes: '' })
              setSelectedTimes([])
            }}
            className="text-sm text-accent hover:underline font-semibold"
          >
            Submit Another Request
          </button>
        </DribbbleCard>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <DribbbleCard className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-linear-to-br from-accent to-accent-2 flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-xl font-bold">Quick Feedback Interview</h2>
            </div>
            <p className="text-sm text-muted">
              Join us for a 15-minute interview to share your feedback on BroLab. We'd love to hear from you!
            </p>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold mb-2">
                Email Address *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-2">
                Company / Artist Name
              </label>
              <input
                type="text"
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Optional"
                className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text placeholder:text-muted focus:outline-none focus:border-accent"
              />
            </div>
          </div>

          {/* Preferred Times */}
          <div>
            <label className="block text-sm font-semibold mb-3 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-accent" />
              Preferred Time Slots * (select at least 1)
            </label>
            <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => {
                    setSelectedTimes((prev) =>
                      prev.includes(slot.value)
                        ? prev.filter((t) => t !== slot.value)
                        : [...prev, slot.value]
                    )
                  }}
                  className={`text-left px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                    selectedTimes.includes(slot.value)
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-card hover:bg-border text-muted'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {selectedTimes.length > 0 && (
              <p className="text-xs text-accent mt-2">
                {selectedTimes.length} time slot{selectedTimes.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Additional Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Tell us what you'd like to discuss..."
              rows={3}
              className="w-full px-4 py-3 rounded-xl border border-border bg-card text-text placeholder:text-muted focus:outline-none focus:border-accent resize-none"
            />
          </div>

          {/* Submit Button */}
          <PillCTA
            type="submit"
            disabled={isSubmitting || selectedTimes.length === 0}
            fullWidth
            icon={isSubmitting ? Loader2 : undefined}
            className={isSubmitting ? 'animate-pulse' : ''}
          >
            {isSubmitting ? 'Submitting...' : 'Schedule Interview'}
          </PillCTA>

          <p className="text-xs text-muted text-center">
            We respect your privacy. Your information will only be used to schedule your interview.
          </p>
        </form>
      </DribbbleCard>
    </motion.div>
  )
}
