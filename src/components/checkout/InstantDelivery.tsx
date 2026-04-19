'use client'

import {
  DribbbleCard,
  PillCTA,
} from '@/platform/ui'
import { Download, FileText, Loader2, Check } from 'lucide-react'
import { useState } from 'react'

interface InstantDeliveryProps {
  downloadUrl: string | null
  licenseUrl: string | null
}

export function InstantDelivery({
  downloadUrl,
  licenseUrl,
}: Readonly<InstantDeliveryProps>) {
  const [downloadClicked, setDownloadClicked] = useState(false)
  const [licenseClicked, setLicenseClicked] = useState(false)
  const [isDownloading, setIsDownloading] = useState<'files' | 'license' | null>(null)

  const handleDownload = (type: 'files' | 'license') => {
    const targetUrl = type === 'files' ? downloadUrl : licenseUrl
    if (!targetUrl) return

    setIsDownloading(type)
    globalThis.open(targetUrl, '_blank', 'noopener,noreferrer')

    if (type === 'files') {
      setDownloadClicked(true)
    } else {
      setLicenseClicked(true)
    }

    setTimeout(() => setIsDownloading(null), 500)
  }

  const hasDownloadUrl = Boolean(downloadUrl)
  const hasLicenseUrl = Boolean(licenseUrl)

  const getDownloadIcon = () => {
    if (isDownloading === 'files') return Loader2
    if (downloadClicked) return Check
    return Download
  }

  const getLicenseIcon = () => {
    if (isDownloading === 'license') return Loader2
    if (licenseClicked) return Check
    return FileText
  }

  const getDownloadLabel = () => {
    if (isDownloading === 'files') return 'Downloading...'
    if (downloadClicked) return 'Downloaded'
    return 'Download files'
  }

  const getLicenseLabel = () => {
    if (isDownloading === 'license') return 'Opening...'
    if (licenseClicked) return 'Opened'
    return 'Open license'
  }

  return (
    <DribbbleCard className="p-6">
      <h3 className="text-lg font-bold mb-2">
        Instant delivery
      </h3>
      <p className="text-sm text-muted mb-6">
        Your files and documents are available immediately.
      </p>

      <div className="space-y-3">
        {/* Download Files Button */}
        <button
          onClick={() => handleDownload('files')}
          disabled={!hasDownloadUrl || isDownloading !== null}
          className="w-full"
        >
          <PillCTA
            variant="primary"
            size="lg"
            icon={getDownloadIcon()}
            className="w-full"
            disabled={!hasDownloadUrl || isDownloading !== null}
          >
            {hasDownloadUrl ? getDownloadLabel() : 'Preparing your files...'}
          </PillCTA>
        </button>

        {/* Open License Button */}
        <button
          onClick={() => handleDownload('license')}
          disabled={!hasLicenseUrl || isDownloading !== null}
          className="w-full"
        >
          <PillCTA
            variant="secondary"
            size="lg"
            icon={getLicenseIcon()}
            className="w-full"
            disabled={!hasLicenseUrl || isDownloading !== null}
          >
            {hasLicenseUrl ? getLicenseLabel() : 'Preparing your files... this usually takes a few seconds.'}
          </PillCTA>
        </button>
      </div>

      {/* Fallback Message */}
      {(!hasDownloadUrl || !hasLicenseUrl) && (
        <p className="text-xs text-muted text-center mt-4">
          Preparing your files... this usually takes a few seconds.
        </p>
      )}
    </DribbbleCard>
  )
}
