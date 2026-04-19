'use client'

import {
  DribbbleCard,
  PillCTA,
} from '@/platform/ui'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { Check, Download, FileText, Loader2 } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface InstantDeliveryProps {
  beatTitle: string
  downloadUrl: string | null
  licenseUrl: string | null
}

export function InstantDelivery({
  beatTitle,
  downloadUrl,
  licenseUrl,
}: Readonly<InstantDeliveryProps>) {
  const [beatDownloaded, setBeatDownloaded] = useState(false)
  const [licenseDownloaded, setLicenseDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState<'beat' | 'license' | null>(null)

  const handleDownload = async (type: 'beat' | 'license') => {
    const targetUrl = type === 'beat' ? downloadUrl : licenseUrl
    if (!targetUrl) return

    setIsDownloading(type)

    globalThis.open(targetUrl, '_blank', 'noopener,noreferrer')

    if (type === 'beat') {
      setBeatDownloaded(true)
    } else {
      setLicenseDownloaded(true)
    }

    setIsDownloading(null)
  }

  const getBeatIcon = (): LucideIcon => {
    if (isDownloading === 'beat') return Loader2
    if (beatDownloaded) return Check
    return Download
  }

  const getBeatLabel = (): string => {
    if (isDownloading === 'beat') return 'Downloading...'
    if (beatDownloaded) return 'Downloaded'
    return 'Download'
  }

  const getLicenseIcon = (): LucideIcon => {
    if (isDownloading === 'license') return Loader2
    if (licenseDownloaded) return Check
    return FileText
  }

  const getLicenseLabel = (): string => {
    if (isDownloading === 'license') return 'Downloading...'
    if (licenseDownloaded) return 'Downloaded'
    return 'Download'
  }

  return (
    <DribbbleCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-linear-to-br from-accent to-accent-2 flex items-center justify-center">
          <Download className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold">Instant Delivery</h3>
      </div>

      <p className="text-sm text-muted mb-6">
        Your files are ready for download. You can also access them anytime from{' '}
        <Link href="/artist/purchases" className="text-accent hover:underline">
          My Purchases
        </Link>
        .
      </p>

      <div className="space-y-3">
        {/* Beat Download */}
        <DribbbleCard padding="sm" className="flex items-center gap-3 border border-border">
          <div className="flex-1">
            <div className="font-semibold mb-1 flex items-center gap-2">
              {beatDownloaded && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              {beatTitle} (WAV)
            </div>
            <div className="text-xs text-muted">
              {beatDownloaded ? 'Downloaded' : 'High-quality audio file'}
            </div>
          </div>
          <PillCTA
            onClick={() => handleDownload('beat')}
            variant={beatDownloaded ? 'secondary' : 'primary'}
            size="sm"
            disabled={isDownloading !== null || !downloadUrl}
            icon={getBeatIcon()}
            className={isDownloading === 'beat' ? 'animate-pulse' : ''}
          >
            {downloadUrl ? getBeatLabel() : 'Unavailable'}
          </PillCTA>
        </DribbbleCard>

        {/* License Download */}
        <DribbbleCard padding="sm" className="flex items-center gap-3 border border-border">
          <div className="flex-1">
            <div className="font-semibold mb-1 flex items-center gap-2">
              {licenseDownloaded && (
                <Check className="w-4 h-4 text-green-500" />
              )}
              License Agreement
            </div>
            <div className="text-xs text-muted">
              {licenseDownloaded ? 'Downloaded' : 'PDF certificate'}
            </div>
          </div>
          <PillCTA
            onClick={() => handleDownload('license')}
            variant={licenseDownloaded ? 'secondary' : 'primary'}
            size="sm"
            disabled={isDownloading !== null || !licenseUrl}
            icon={getLicenseIcon()}
            className={isDownloading === 'license' ? 'animate-pulse' : ''}
          >
            {licenseUrl ? getLicenseLabel() : 'Preparing...'}
          </PillCTA>
        </DribbbleCard>
      </div>

      {/* Important Notice */}
      <motion.div
        className="mt-6 p-4 rounded-xl bg-accent/5 border border-accent/20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start gap-3">
          <FileText className="w-5 h-5 text-accent shrink-0 mt-0.5" />
          <div className="text-sm">
            <div className="font-semibold mb-1">Keep Your License Safe</div>
            <div className="text-muted text-xs">
              Your license agreement proves you legally own this beat. Save it for your records
              and include it with any official releases.
            </div>
          </div>
        </div>
      </motion.div>
    </DribbbleCard>
  )
}
