/**
 * ServiceForm Component
 *
 * Form for creating or editing a service listing.
 * Supports both create (no serviceId) and edit (with serviceId) modes.
 * Follows the same pattern as TrackUploadForm in beats module.
 *
 * Requirements: 19.3, 16.1
 */

'use client'

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { useMutation } from 'convex/react'
import { Plus, Save, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { api } from 'convex/_generated/api'
import { Id } from 'convex/_generated/dataModel'

interface ServiceFormProps {
  readonly workspaceId: Id<'workspaces'>
  /** When provided, the form operates in edit mode */
  readonly serviceId?: Id<'services'>
  readonly initialValues?: {
    title: string
    description: string
    priceUSD: number
    priceEUR?: number
    turnaround: string
    features: string[]
    isActive: boolean
  }
  readonly onSuccess?: (serviceId: Id<'services'>) => void
  readonly onCancel?: () => void
  readonly onError?: (error: string) => void
}

export function ServiceForm({
  workspaceId,
  serviceId,
  initialValues,
  onSuccess,
  onCancel,
  onError,
}: ServiceFormProps) {
  const isEditMode = Boolean(serviceId)

  const [isSaving, setIsSaving] = useState(false)
  const [title, setTitle] = useState(initialValues?.title ?? '')
  const [description, setDescription] = useState(initialValues?.description ?? '')
  const [priceUSD, setPriceUSD] = useState(String(initialValues?.priceUSD ?? ''))
  const [priceEUR, setPriceEUR] = useState(String(initialValues?.priceEUR ?? ''))
  const [turnaround, setTurnaround] = useState(initialValues?.turnaround ?? '')
  const [featuresInput, setFeaturesInput] = useState(
    initialValues?.features.join(', ') ?? ''
  )
  const [isActive, setIsActive] = useState(initialValues?.isActive ?? true)
  const [newFeature, setNewFeature] = useState('')

  // Sync when initialValues change (edit mode re-open)
  useEffect(() => {
    if (initialValues) {
      setTitle(initialValues.title)
      setDescription(initialValues.description)
      setPriceUSD(String(initialValues.priceUSD))
      setPriceEUR(initialValues.priceEUR ? String(initialValues.priceEUR) : '')
      setTurnaround(initialValues.turnaround)
      setFeaturesInput(initialValues.features.join(', '))
      setIsActive(initialValues.isActive)
    }
  }, [initialValues])

  const createService = useMutation(api.modules.services.createService)
  const updateService = useMutation(api.modules.services.updateService)

  const parseFeatures = () =>
    featuresInput
      .split(',')
      .map((f) => f.trim())
      .filter(Boolean)

  const addFeature = () => {
    if (!newFeature.trim()) return
    const current = parseFeatures()
    setFeaturesInput([...current, newFeature.trim()].join(', '))
    setNewFeature('')
  }

  const removeFeature = (index: number) => {
    const current = parseFeatures()
    current.splice(index, 1)
    setFeaturesInput(current.join(', '))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const features = parseFeatures()
    const parsedPriceUSD = Number.parseFloat(priceUSD)
    const parsedPriceEUR = priceEUR ? Number.parseFloat(priceEUR) : undefined

    if (!title.trim()) return onError?.('Title is required')
    if (!description.trim()) return onError?.('Description is required')
    if (!priceUSD || Number.isNaN(parsedPriceUSD) || parsedPriceUSD <= 0)
      return onError?.('Price (USD) must be greater than 0')
    if (parsedPriceEUR !== undefined && parsedPriceEUR <= 0)
      return onError?.('EUR price must be greater than 0')
    if (!turnaround.trim()) return onError?.('Turnaround time is required')
    if (features.length === 0) return onError?.('At least one feature is required')

    setIsSaving(true)
    try {
      if (isEditMode && serviceId) {
        await updateService({
          serviceId,
          title: title.trim(),
          description: description.trim(),
          priceUSD: parsedPriceUSD,
          priceEUR: parsedPriceEUR,
          turnaround: turnaround.trim(),
          features,
          isActive,
        })
        onSuccess?.(serviceId)
      } else {
        const newId = await createService({
          workspaceId,
          title: title.trim(),
          description: description.trim(),
          priceUSD: parsedPriceUSD,
          priceEUR: parsedPriceEUR,
          turnaround: turnaround.trim(),
          features,
          isActive,
        })
        onSuccess?.(newId)
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to save service')
    } finally {
      setIsSaving(false)
    }
  }

  const inputClass =
    'w-full px-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all'

  const labelClass = 'block text-sm font-semibold uppercase tracking-wide mb-2'

  const features = parseFeatures()

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label htmlFor="svc-title" className={labelClass}>
          Title <span className="text-[rgb(var(--accent))]">*</span>
        </label>
        <input
          id="svc-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSaving}
          placeholder="e.g. Professional Mixing"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="svc-desc" className={labelClass}>
          Description <span className="text-[rgb(var(--accent))]">*</span>
        </label>
        <textarea
          id="svc-desc"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSaving}
          rows={3}
          placeholder="Describe what's included in this service..."
          className={`${inputClass} resize-none`}
        />
      </div>

      {/* Pricing */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="svc-price-usd" className={labelClass}>
            Price (USD) <span className="text-[rgb(var(--accent))]">*</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
            <input
              id="svc-price-usd"
              type="number"
              value={priceUSD}
              onChange={(e) => setPriceUSD(e.target.value)}
              disabled={isSaving}
              step="0.01"
              min="0.01"
              placeholder="99.99"
              className={`${inputClass} pl-7`}
            />
          </div>
        </div>
        <div>
          <label htmlFor="svc-price-eur" className={labelClass}>
            Price (EUR) <span className="text-muted text-xs normal-case font-normal">optional</span>
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">€</span>
            <input
              id="svc-price-eur"
              type="number"
              value={priceEUR}
              onChange={(e) => setPriceEUR(e.target.value)}
              disabled={isSaving}
              step="0.01"
              min="0.01"
              placeholder="89.99"
              className={`${inputClass} pl-7`}
            />
          </div>
        </div>
      </div>

      {/* Turnaround */}
      <div>
        <label htmlFor="svc-turnaround" className={labelClass}>
          Turnaround Time <span className="text-[rgb(var(--accent))]">*</span>
        </label>
        <input
          id="svc-turnaround"
          type="text"
          value={turnaround}
          onChange={(e) => setTurnaround(e.target.value)}
          disabled={isSaving}
          placeholder="e.g. 3-5 business days"
          className={inputClass}
        />
      </div>

      {/* Features */}
      <div>
        <p className={labelClass}>
          Features <span className="text-[rgb(var(--accent))]">*</span>
        </p>

        {/* Feature tags */}
        {features.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {features.map((f, i) => (
              <span
                key={`${f}-${i}`}
                className="flex items-center gap-1 text-sm px-3 py-1 bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/30 rounded-full"
              >
                {f}
                <button
                  type="button"
                  onClick={() => removeFeature(i)}
                  className="text-muted hover:text-red-500 transition-colors cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Add feature input */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addFeature()
              }
            }}
            disabled={isSaving}
            placeholder="Add a feature and press Enter"
            className={`${inputClass} flex-1`}
          />
          <button
            type="button"
            onClick={addFeature}
            disabled={isSaving || !newFeature.trim()}
            className="px-3 py-2 bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/30 rounded-lg hover:bg-[rgb(var(--accent))]/20 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-[rgb(var(--accent))]" />
          </button>
        </div>
        <p className="text-xs text-muted mt-1">Press Enter or click + to add each feature</p>
      </div>

      {/* Active toggle */}
      <DribbbleCard padding="md" glow={isActive} className="flex items-center gap-3">
        <input
          id="svc-active"
          type="checkbox"
          checked={isActive}
          onChange={(e) => setIsActive(e.target.checked)}
          disabled={isSaving}
          className="w-4 h-4 accent-[rgb(var(--accent))] cursor-pointer"
        />
        <div>
          <label htmlFor="svc-active" className="block text-sm font-semibold uppercase tracking-wide cursor-pointer">
            Active (visible on storefront)
          </label>
          <p className="text-xs text-muted mt-0.5">
            Inactive services are hidden from artists but saved for later.
          </p>
        </div>
      </DribbbleCard>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        {(() => {
          const submitIcon = isEditMode ? Save : Plus
          let submitLabel: string
          if (isSaving) {
            submitLabel = 'Saving...'
          } else if (isEditMode) {
            submitLabel = 'Save Changes'
          } else {
            submitLabel = 'Create Service'
          }
          return (
            <PillCTA
              type="submit"
              variant="primary"
              size="md"
              disabled={isSaving}
              loading={isSaving}
              icon={submitIcon}
              className="flex-1"
            >
              {submitLabel}
            </PillCTA>
          )
        })()}

        {onCancel && (
          <PillCTA
            type="button"
            variant="secondary"
            size="md"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </PillCTA>
        )}
      </div>
    </form>
  )
}
