'use client'

import { DEFAULT_LICENSE_TIERS, LicenseSelector } from '@/components/checkout'
import { DribbbleCard, PillCTA } from '@/platform/ui'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRight, Lock, X } from 'lucide-react'
import Link from 'next/link'
import { useEffect, useState } from 'react'

interface DemoBeat {
  id: number
  title: string
  bpm: number
  key: string
  tags: readonly string[]
  price: number
}

interface DemoLicenseModalProps {
  beat: DemoBeat | null
  onClose: () => void
}

export function DemoLicenseModal({
  beat,
  onClose,
}: Readonly<DemoLicenseModalProps>) {
  const [selectedTierId, setSelectedTierId] = useState('premium')
  const selectedTier = DEFAULT_LICENSE_TIERS.find((tier) => tier.id === selectedTierId)

  useEffect(() => {
    if (!beat) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    globalThis.addEventListener('keydown', handleKeyDown)

    return () => {
      document.body.style.overflow = previousOverflow
      globalThis.removeEventListener('keydown', handleKeyDown)
    }
  }, [beat, onClose])

  return (
    <AnimatePresence>
      {beat && (
        <>
          <motion.button
            type="button"
            aria-label="Close license selector"
            className="fixed inset-0 z-50 h-full w-full cursor-default bg-black/65"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          <div className="pointer-events-none fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4">
              <motion.div
                role="dialog"
                aria-modal="true"
                aria-labelledby="demo-license-title"
                className="pointer-events-auto w-full max-w-2xl"
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 20 }}
              >
                <DribbbleCard className="relative p-6 md:p-8">
                  <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-card text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>

                  <div className="mb-6 pr-12">
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-accent">
                      Demo checkout
                    </p>
                    <h2 id="demo-license-title" className="text-2xl font-black text-text md:text-3xl">
                      License {beat.title}
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {beat.bpm} BPM · {beat.key} · Preview the exact license flow your customers see.
                    </p>
                  </div>

                  <LicenseSelector
                    tiers={DEFAULT_LICENSE_TIERS}
                    selectedTierId={selectedTierId}
                    onSelect={setSelectedTierId}
                  />

                  <div className="mt-6 rounded-2xl border border-accent/20 bg-accent/5 p-4">
                    <div className="mb-4 flex items-center justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-wider text-muted">Selected</p>
                        <p className="font-bold text-text">{selectedTier?.name}</p>
                      </div>
                      <p className="text-3xl font-black text-accent">${selectedTier?.price}</p>
                    </div>
                    <Link href="/sign-up" onClick={onClose}>
                      <PillCTA as="span" fullWidth icon={Lock} iconAfter={ArrowRight}>
                        Create a store like this
                      </PillCTA>
                    </Link>
                    <p className="mt-3 text-center text-xs text-muted">
                      Demo only — no payment is started from this storefront.
                    </p>
                  </div>
                </DribbbleCard>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
