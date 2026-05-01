'use client'

/**
 * Artist Dashboard Component
 * 
 * Requirements: 20.1, 20.2, 20.3
 * 
 * Displays:
 * - Purchased tracks with download links
 * - Service bookings with status
 * - Order history
 * 
 * Uses Convex auth components for proper auth state handling
 */

import { DribbbleCard } from '@/platform/ui/dribbble/DribbbleCard'
import { useUser } from '@clerk/nextjs'
import { AuthLoading, Authenticated, Unauthenticated, useQuery } from 'convex/react'
import { AlertCircle, CheckCircle, Clock, Download, FileText, Loader2, Music, Package, XCircle } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { api } from 'convex/_generated/api'
import { ArtistHeader } from './ArtistHeader'

export function ArtistDashboard() {
  const { user } = useUser()
  const router = useRouter()
  useEffect(() => {
    // Note: Clerk middleware handles most redirection, but this provides a better client-side UX
    // if a user somehow lands here without auth.
    if (user === null) {
      router.push('/sign-in')
    }
  }, [user, router])

  return (
    <>
      <AuthLoading>
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="text-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent" />
            <p className="text-muted">Loading...</p>
          </div>
        </div>
      </AuthLoading>

      <Unauthenticated>
        <div className="min-h-screen bg-app flex items-center justify-center">
          <div className="text-center space-y-4">
            <p className="text-muted">Redirecting to sign in...</p>
          </div>
        </div>
      </Unauthenticated>

      <Authenticated>
        <div className="min-h-screen bg-app">
          <ArtistHeader />

          <main className="max-w-7xl mx-auto px-4 pt-24 py-12">
            <div className="space-y-8 mb-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted mb-1">
                  Artist
                </p>
                <h1 className="text-4xl font-bold uppercase tracking-wide">
                  Dashboard
                </h1>
              </div>

              <DribbbleCard padding="lg" glow>
                <p className="text-lg font-medium">
                  Welcome back,{' '}
                  <span className="text-[rgb(var(--accent))]">
                    {user?.firstName ?? user?.username ?? 'Artist'}
                  </span>
                </p>
                <p className="text-sm text-muted mt-1">
                  Purchases, Bookings, Downloads
                </p>
              </DribbbleCard>
            </div>

            <ArtistDashboardContent />
          </main>
        </div>
      </Authenticated>
    </>
  )
}

function ArtistDashboardContent() {
  const purchasedTracks = useQuery(api.modules.artist.getPurchasedTracks)
  const serviceBookings = useQuery(api.modules.artist.getServiceBookings)
  const orderHistory = useQuery(api.modules.artist.getOrderHistory)
  const isLoading = purchasedTracks === undefined || serviceBookings === undefined || orderHistory === undefined

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-12">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <DribbbleCard padding="md" glow>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[rgba(var(--accent),0.1)]">
              <Music className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{purchasedTracks?.length || 0}</p>
              <p className="text-sm text-muted">Purchases</p>
            </div>
          </div>
        </DribbbleCard>

        <DribbbleCard padding="md" glow>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[rgba(var(--accent),0.1)]">
              <Package className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{serviceBookings?.length || 0}</p>
              <p className="text-sm text-muted">Bookings</p>
            </div>
          </div>
        </DribbbleCard>

        <DribbbleCard padding="md" glow>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-[rgba(var(--accent),0.1)]">
              <Clock className="w-6 h-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orderHistory?.length || 0}</p>
              <p className="text-sm text-muted">Downloads</p>
            </div>
          </div>
        </DribbbleCard>
      </div>

      {/* Purchased Tracks Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Purchases</h2>
        {purchasedTracks && purchasedTracks.length > 0 ? (
          <div className="space-y-4">
            {purchasedTracks.map((track: {
              entitlementId: string;
              trackId: string;
              title: string;
              bpm?: number;
              key?: string;
              licenseTier: string;
              purchasedAt: number;
              providerName: string;
              providerSlug: string;
              fullAudioUrl: string | null;
              stemsUrl: string | null;
              licensePdfUrl: string | null;
            }) => (
              <DribbbleCard key={track.entitlementId} padding="md" glow>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-semibold">{track.title}</h3>
                      <LicenseTierBadge tier={track.licenseTier} />
                    </div>
                    <p className="text-sm text-muted mb-2">
                      by {track.providerName}
                    </p>
                    <div className="flex flex-wrap gap-2 text-sm text-muted">
                      {track.bpm && <span>BPM: {track.bpm}</span>}
                      {track.key && <span>Key: {track.key}</span>}
                      <span>Purchased: {new Date(track.purchasedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {track.fullAudioUrl && (
                      <a
                        href={track.fullAudioUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-full hover:opacity-90 transition-opacity"
                      >
                        <Download className="w-4 h-4" />
                        Download Track
                      </a>
                    )}
                    {track.licensePdfUrl && (
                      <a
                        href={track.licensePdfUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Download License PDF
                      </a>
                    )}
                    {track.stemsUrl && (
                      <a
                        href={track.stemsUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-[rgba(var(--accent),0.1)] transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        Download Stems
                      </a>
                    )}
                  </div>
                </div>
              </DribbbleCard>
            ))}
          </div>
        ) : (
          <DribbbleCard padding="lg" className="text-center">
            <Music className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No results found.</p>
          </DribbbleCard>
        )}
      </section>

      {/* Service Bookings Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Bookings</h2>
        {serviceBookings && serviceBookings.length > 0 ? (
          <div className="space-y-4">
            {serviceBookings.map((booking: {
              bookingId: string;
              serviceId: string;
              serviceTitle: string;
              serviceDescription: string;
              turnaround: string;
              status: string;
              bookedAt: number;
              providerName: string;
              providerSlug: string;
            }) => (
              <DribbbleCard key={booking.bookingId} padding="md" glow>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-xl font-semibold">{booking.serviceTitle}</h3>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-sm text-muted mb-2">{booking.serviceDescription}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted">
                      <span>Provider: {booking.providerName}</span>
                      <span>Turnaround: {booking.turnaround}</span>
                      <span>Booked: {new Date(booking.bookedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              </DribbbleCard>
            ))}
          </div>
        ) : (
          <DribbbleCard padding="lg" className="text-center">
            <Package className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No results found.</p>
          </DribbbleCard>
        )}
      </section>

      {/* Order History Section */}
      <section>
        <h2 className="text-2xl font-bold mb-4">Order History</h2>
        {orderHistory && orderHistory.length > 0 ? (
          <div className="space-y-4">
            {orderHistory.map((order: {
              orderId: string;
              itemType: string;
              itemTitle: string;
              licenseTier?: string;
              currency: string;
              amountCents: number;
              status: string;
              orderedAt: number;
              providerName: string;
              providerSlug: string;
            }) => (
              <DribbbleCard key={order.orderId} padding="md" glow>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{order.itemTitle}</h3>
                    <div className="flex flex-wrap gap-4 text-sm text-muted">
                      <span>Type: {order.itemType === 'track' ? 'Track' : 'Service'}</span>
                      {order.licenseTier && <span>License: {order.licenseTier.toUpperCase()}</span>}
                      <span>Provider: {order.providerName}</span>
                      <span>Date: {new Date(order.orderedAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold">
                      {order.currency.toUpperCase()} {(order.amountCents / 100).toFixed(2)}
                    </p>
                    <StatusBadge status={order.status} />
                  </div>
                </div>
              </DribbbleCard>
            ))}
          </div>
        ) : (
          <DribbbleCard padding="lg" className="text-center">
            <Clock className="w-12 h-12 text-muted mx-auto mb-4" />
            <p className="text-muted">No orders yet</p>
            <p className="text-sm text-muted mt-2">Your purchase history will appear here</p>
          </DribbbleCard>
        )}
      </section>
    </div>
  )
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
  const statusConfig = {
    pending: {
      icon: Clock,
      label: 'Pending',
      className: 'bg-yellow-500/10 text-yellow-500',
    },
    confirmed: {
      icon: CheckCircle,
      label: 'Confirmed',
      className: 'bg-blue-500/10 text-blue-500',
    },
    completed: {
      icon: CheckCircle,
      label: 'Completed',
      className: 'bg-green-500/10 text-green-500',
    },
    canceled: {
      icon: XCircle,
      label: 'Canceled',
      className: 'bg-red-500/10 text-red-500',
    },
    failed: {
      icon: AlertCircle,
      label: 'Failed',
      className: 'bg-red-500/10 text-red-500',
    },
  }

  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
  const Icon = config.icon

  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${config.className}`}>
      <Icon className="w-3 h-3" />
      {config.label}
    </span>
  )
}

function LicenseTierBadge({ tier }: Readonly<{ tier: string }>) {
  const tierConfig = {
    basic: {
      label: 'BASIC',
      className: 'bg-slate-500/10 text-slate-500 border-slate-500/20',
    },
    premium: {
      label: 'PREMIUM',
      className: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    },
    unlimited: {
      label: 'UNLIMITED',
      className: 'bg-accent/10 text-accent border-accent/20',
    },
  }

  const config = tierConfig[tier as keyof typeof tierConfig] || tierConfig.basic

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border ${config.className}`}>
      {config.label} LICENSE
    </span>
  )
}
