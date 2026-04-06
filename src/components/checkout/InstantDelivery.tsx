'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Download, FileText, Loader2 } from 'lucide-react'
import {
  DribbbleCard,
  PillCTA,
} from '@/platform/ui'

interface InstantDeliveryProps {
  beatTitle: string
  downloadUrl: string
  licenseUrl: string
}

export function InstantDelivery({
  beatTitle,
  downloadUrl,
  licenseUrl,
}: InstantDeliveryProps) {
  const [beatDownloaded, setBeatDownloaded] = useState(false)
  const [licenseDownloaded, setLicenseDownloaded] = useState(false)
  const [isDownloading, setIsDownloading] = useState<'beat' | 'license' | null>(null)

  const handleDownload = async (type: 'beat' | 'license') => {
    setIsDownloading(type)

    // Simulate download delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    if (type === 'beat') {
      setBeatDownloaded(true)
      // In production: window.open(downloadUrl, '_blank')
    } else {
      setLicenseDownloaded(true)
      // In production: window.open(licenseUrl, '_blank')
    }

    setIsDownloading(null)
  }

  return (
    <DribbbleCard className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent-2 flex items-center justify-center">
          <Download className="w-4 h-4 text-white" />
        </div>
        <h3 className="text-lg font-bold">Instant Delivery</h3>
      </div>

      <p className="text-sm text-muted mb-6">
        Your files are ready for download. You can also access them anytime from{' '}
        <a href="/artist/purchases" className="text-accent hover:underline">
          My Purchases
        </a>
        .
      </p>

      <div className="space-y-3">
        {/* Beat Download */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card/60 backdrop-blur-glass border border-border">
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
            disabled={isDownloading !== null}
            iconBefore={
              isDownloading === 'beat' ? Loader2 : beatDownloaded ? Check : Download
            }
            className={isDownloading === 'beat' ? 'animate-pulse' : ''}
          >
            {isDownloading === 'beat'
              ? 'Downloading...'
              : beatDownloaded
              ? 'Downloaded'
              : 'Download'}
          </PillCTA>
        </div>

        {/* License Download */}
        <div className="flex items-center gap-3 p-4 rounded-xl bg-card/60 backdrop-blur-glass border border-border">
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
            disabled={isDownloading !== null}
            iconBefore={
              isDownloading === 'license' ? Loader2 : licenseDownloaded ? Check : FileText
            }
            className={isDownloading === 'license' ? 'animate-pulse' : ''}
          >
            {isDownloading === 'license'
              ? 'Downloading...'
              : licenseDownloaded
              ? 'Downloaded'
              : 'Download'}
          </PillCTA>
        </div>
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
