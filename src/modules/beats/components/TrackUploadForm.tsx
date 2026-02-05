/**
 * TrackUploadForm Component
 * 
 * Form for uploading tracks with preview generation option.
 * Includes "Generate Preview" checkbox (default ON).
 * 
 * REFACTORED: Now uses Dribbble design system primitives
 * - PillCTA for buttons
 * - DribbbleCard for containers
 * - CSS tokens for colors
 * - Glass morphism styling
 * 
 * Requirements: 10.1, 10.2, 10.3, 10.6
 */

'use client'

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { PillCTA } from '@/platform/ui/dribbble/PillCTA'
import { useMutation } from 'convex/react'
import { Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { api } from '../../../../convex/_generated/api'
import { Id } from '../../../../convex/_generated/dataModel'

interface TrackUploadFormProps {
  readonly workspaceId: Id<'workspaces'>
  readonly onSuccess?: (trackId: Id<'tracks'>) => void
  readonly onError?: (error: string) => void
}

export function TrackUploadForm({ 
  workspaceId, 
  onSuccess, 
  onError 
}: TrackUploadFormProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [generatePreview, setGeneratePreview] = useState(true) // Default ON
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Form fields
  const [title, setTitle] = useState('')
  const [bpm, setBpm] = useState('')
  const [key, setKey] = useState('')
  const [tags, setTags] = useState('')
  const [priceBasic, setPriceBasic] = useState('9.99')
  const [pricePremium, setPricePremium] = useState('29.99')
  const [priceUnlimited, setPriceUnlimited] = useState('99.99')

  const generateUploadUrl = useMutation(api.modules.beats.generateUploadUrl)
  const createTrack = useMutation(api.modules.beats.createTrack)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Validate file type
      const validTypes = ['audio/wav', 'audio/mpeg', 'audio/mp3']
      if (!validTypes.includes(selectedFile.type)) {
        onError?.('Invalid file type. Please upload WAV or MP3 files only.')
        return
      }

      // Validate file size (1GB max)
      const maxSize = 1024 * 1024 * 1024 // 1GB
      if (selectedFile.size > maxSize) {
        onError?.('File size exceeds 1GB limit.')
        return
      }

      setFile(selectedFile)
      
      // Auto-fill title from filename if empty
      if (!title) {
        const filename = selectedFile.name.replace(/\.[^/.]+$/, '') // Remove extension
        setTitle(filename)
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      onError?.('Please select a file to upload.')
      return
    }

    if (!title.trim()) {
      onError?.('Please enter a track title.')
      return
    }

    setIsUploading(true)

    try {
      // Step 1: Generate upload URL
      const uploadUrl = await generateUploadUrl({
        workspaceId,
        fileSizeBytes: file.size,
      })

      // Step 2: Upload file to Convex storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': file.type },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file')
      }

      const { storageId } = await uploadResponse.json()

      // Step 3: Create track record
      const trackId = await createTrack({
        workspaceId,
        title: title.trim(),
        fullStorageId: storageId,
        fileSizeBytes: file.size,
        mimeType: file.type,
        bpm: bpm ? Number.parseInt(bpm, 10) : undefined,
        key: key.trim() || undefined,
        tags: tags.split(',').map(t => t.trim()).filter(Boolean),
        priceUsdByTier: {
          basic: Number.parseFloat(priceBasic),
          premium: Number.parseFloat(pricePremium),
          unlimited: Number.parseFloat(priceUnlimited),
        },
        generatePreview, // Pass the checkbox value
      })

      // Reset form
      setFile(null)
      setTitle('')
      setBpm('')
      setKey('')
      setTags('')
      setPriceBasic('9.99')
      setPricePremium('29.99')
      setPriceUnlimited('99.99')
      setGeneratePreview(true)

      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }

      onSuccess?.(trackId)
    } catch (error) {
      console.error('Upload error:', error)
      onError?.(error instanceof Error ? error.message : 'Failed to upload track')
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Simple File Input */}
      <div>
        <label className="block text-sm font-semibold uppercase tracking-wide mb-2">
          Audio File <span className="text-[rgb(var(--accent))]">*</span>
        </label>
        
        <div className="border-2 border-dashed border-[rgb(var(--border-alpha))] rounded-lg p-8 text-center hover:border-[rgb(var(--accent))]/50 transition-colors">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-card/60 flex items-center justify-center">
              <Upload className="w-8 h-8 text-muted" />
            </div>
            
            <div>
              <p className="text-lg font-semibold mb-1 uppercase tracking-wide">
                Choose your audio file
              </p>
              <p className="text-sm text-muted mb-3">
                Click the button below to browse
              </p>
              
              {/* Styled label that triggers file input */}
              <label
                htmlFor="track-file"
                className="inline-flex items-center gap-2 px-6 py-2.5 bg-[rgb(var(--accent))] text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
                style={{ opacity: isUploading ? 0.5 : 1, pointerEvents: isUploading ? 'none' : 'auto' }}
              >
                <Upload className="w-4 h-4" />
                Choose File
              </label>
              
              <input
                ref={fileInputRef}
                id="track-file"
                type="file"
                accept="audio/wav,audio/mpeg,audio/mp3"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
            </div>

            {file && (
              <div className="mt-2 px-4 py-2 bg-[rgb(var(--accent))]/10 border border-[rgb(var(--accent))]/30 rounded-lg">
                <p className="text-sm text-[rgb(var(--accent))]">
                  ✓ {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
                </p>
              </div>
            )}

            <p className="text-xs text-muted">
              Supported formats: WAV, MP3 (max 1GB)
            </p>
          </div>
        </div>
      </div>

      {/* Generate Preview Checkbox */}
      <DribbbleCard padding="md" glow={generatePreview} className="flex items-start gap-3">
        <input
          id="generate-preview"
          type="checkbox"
          checked={generatePreview}
          onChange={(e) => setGeneratePreview(e.target.checked)}
          disabled={isUploading}
          className="mt-1 w-4 h-4 accent-[rgb(var(--accent))] bg-card/60 border-[rgb(var(--border-alpha))] rounded focus:ring-[rgb(var(--accent))] focus:ring-2 disabled:opacity-50 cursor-pointer"
        />
        <div className="flex-1">
          <label htmlFor="generate-preview" className="block text-sm font-semibold tracking-wide uppercase cursor-pointer">
            Generate preview now
          </label>
          <p className="mt-1 text-xs text-muted">
            Automatically create a 30-second preview after upload. You can generate it later if unchecked.
          </p>
        </div>
      </DribbbleCard>

      {/* Track Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-semibold tracking-wide uppercase mb-2">
          Track Title <span className="text-[rgb(var(--accent))]">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          placeholder="Enter track title"
          className="w-full px-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all"
        />
      </div>

      {/* BPM and Key */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label htmlFor="bpm" className="block text-sm font-semibold tracking-wide uppercase mb-2">
            BPM
          </label>
          <input
            id="bpm"
            type="number"
            value={bpm}
            onChange={(e) => setBpm(e.target.value)}
            disabled={isUploading}
            placeholder="120"
            min="1"
            max="300"
            className="w-full px-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all"
          />
        </div>
        <div>
          <label htmlFor="key" className="block text-sm font-semibold tracking-wide uppercase mb-2">
            Key
          </label>
          <input
            id="key"
            type="text"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            disabled={isUploading}
            placeholder="C Minor"
            className="w-full px-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label htmlFor="tags" className="block text-sm font-semibold tracking-wide uppercase mb-2">
          Tags
        </label>
        <input
          id="tags"
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          disabled={isUploading}
          placeholder="trap, dark, 808 (comma-separated)"
          className="w-full px-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all"
        />
      </div>

      {/* Pricing */}
      <div>
        <p className="block text-sm font-semibold tracking-wide uppercase mb-3">
          License Pricing (USD) <span className="text-[rgb(var(--accent))]">*</span>
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label htmlFor="price-basic" className="block text-xs font-medium mb-1 text-muted uppercase tracking-wide">
              Basic
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                id="price-basic"
                type="number"
                value={priceBasic}
                onChange={(e) => setPriceBasic(e.target.value)}
                disabled={isUploading}
                step="0.01"
                min="0"
                className="w-full pl-7 pr-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="price-premium" className="block text-xs font-medium mb-1 text-muted uppercase tracking-wide">
              Premium
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                id="price-premium"
                type="number"
                value={pricePremium}
                onChange={(e) => setPricePremium(e.target.value)}
                disabled={isUploading}
                step="0.01"
                min="0"
                className="w-full pl-7 pr-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all"
              />
            </div>
          </div>
          <div>
            <label htmlFor="price-unlimited" className="block text-xs font-medium mb-1 text-muted uppercase tracking-wide">
              Unlimited
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted">$</span>
              <input
                id="price-unlimited"
                type="number"
                value={priceUnlimited}
                onChange={(e) => setPriceUnlimited(e.target.value)}
                disabled={isUploading}
                step="0.01"
                min="0"
                className="w-full pl-7 pr-4 py-2 bg-card/60 border border-[rgb(var(--border-alpha))] rounded-lg focus:ring-2 focus:ring-[rgb(var(--accent))] focus:border-transparent disabled:opacity-50 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <PillCTA
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        disabled={isUploading || !file}
        loading={isUploading}
        icon={Upload}
      >
        {isUploading ? 'Uploading...' : 'Upload Track'}
      </PillCTA>
    </form>
  )
}
