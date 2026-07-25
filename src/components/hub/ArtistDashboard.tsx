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
import { AlertCircle, ArrowRight, Check, CheckCircle, Clock, Download, FileText, LibraryBig, Loader2, Music, Package, ReceiptText, XCircle } from 'lucide-react'
import Link from 'next/link'
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

          <main className="mx-auto max-w-7xl px-4 pb-12 pt-24 sm:px-6">
            <header className="mb-8">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">
                  Artist
                </p>
                <h1 className="text-3xl font-bold uppercase tracking-wide sm:text-4xl">
                  Dashboard
                </h1>
                <p className="mt-2 text-sm text-muted">
                  Welcome back,{' '}
                  <span className="font-semibold text-text">
                    {user?.firstName ?? user?.username ?? 'Artist'}
                  </span>
                  . Your purchases, files, and bookings live here.
                </p>
              </div>
            </header>

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

  if (purchasedTracks === undefined || serviceBookings === undefined || orderHistory === undefined) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-accent mb-4" />
        <p className="text-muted">Loading...</p>
      </div>
    )
  }

  if (purchasedTracks.length === 0 && serviceBookings.length === 0 && orderHistory.length === 0) {
    return <ArtistEmptyState />
  }

  return (
    <div className="space-y-10">
      <section aria-label="Library overview" className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <DribbbleCard padding="md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[rgb(var(--accent)/0.1)] p-3">
              <Music className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{purchasedTracks?.length || 0}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Beats owned</p>
            </div>
          </div>
        </DribbbleCard>

        <DribbbleCard padding="md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[rgb(var(--accent)/0.1)] p-3">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{serviceBookings?.length || 0}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Service bookings</p>
            </div>
          </div>
        </DribbbleCard>

        <DribbbleCard padding="md">
          <div className="flex items-center gap-4">
            <div className="rounded-xl bg-[rgb(var(--accent)/0.1)] p-3">
              <ReceiptText className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{orderHistory?.length || 0}</p>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">Orders</p>
            </div>
          </div>
        </DribbbleCard>
      </section>

      {/* Purchased Tracks Section */}
      <section aria-labelledby="purchases-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Library</p>
            <h2 id="purchases-heading" className="text-xl font-bold uppercase tracking-wide">
              Purchased beats
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted">{purchasedTracks.length} total</span>
        </div>
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
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-[rgb(var(--accent)/0.1)] transition-colors"
                      >
                        <FileText className="w-4 h-4" />
                        Download License PDF
                      </a>
                    )}
                    {track.stemsUrl && (
                      <a
                        href={track.stemsUrl}
                        download
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-full hover:bg-[rgb(var(--accent)/0.1)] transition-colors"
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
          <DribbbleCard padding="md">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <Music className="h-8 w-8 shrink-0 text-muted" />
              <div className="flex-1">
                <p className="font-semibold text-text">No beats in your library yet</p>
                <p className="mt-1 text-sm text-muted">Purchased audio and license files will appear here.</p>
              </div>
              <Link href="/marketplace" className="text-sm font-semibold text-[rgb(var(--accent))] hover:underline">
                Explore beats
              </Link>
            </div>
          </DribbbleCard>
        )}
      </section>

      {/* Service Bookings Section */}
      <section aria-labelledby="bookings-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Services</p>
            <h2 id="bookings-heading" className="text-xl font-bold uppercase tracking-wide">
              Bookings
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted">{serviceBookings.length} total</span>
        </div>
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
          <DribbbleCard padding="md">
            <div className="flex items-center gap-4">
              <Package className="h-8 w-8 shrink-0 text-muted" />
              <div>
                <p className="font-semibold text-text">No service bookings yet</p>
                <p className="mt-1 text-sm text-muted">Mixing, mastering, and production bookings will appear here.</p>
              </div>
            </div>
          </DribbbleCard>
        )}
      </section>

      {/* Order History Section */}
      <section aria-labelledby="orders-heading" className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-1 text-xs font-semibold uppercase tracking-[0.22em] text-muted">Payments</p>
            <h2 id="orders-heading" className="text-xl font-bold uppercase tracking-wide">
              Order history
            </h2>
          </div>
          <span className="text-xs font-semibold text-muted">{orderHistory.length} total</span>
        </div>
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
          <DribbbleCard padding="md">
            <div className="flex items-center gap-4">
              <Clock className="h-8 w-8 shrink-0 text-muted" />
              <div>
                <p className="font-semibold text-text">No orders yet</p>
                <p className="mt-1 text-sm text-muted">Receipts and payment status will appear here.</p>
              </div>
            </div>
          </DribbbleCard>
        )}
      </section>
    </div>
  )
}

function ArtistEmptyState() {
  const firstPurchaseSteps = [
    {
      title: 'Find your sound',
      description: 'Explore beats from independent producers.',
    },
    {
      title: 'Choose your license',
      description: 'Pick the usage rights that fit your release.',
    },
    {
      title: 'Create with confidence',
      description: 'Your audio and license stay together here.',
    },
  ]

  return (
    <DribbbleCard padding="lg" glow className="overflow-hidden">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="max-w-xl">
          <span className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-[rgb(var(--accent))]/25 bg-[rgb(var(--accent))]/10 text-[rgb(var(--accent))]">
            <LibraryBig className="h-7 w-7" />
          </span>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-[rgb(var(--accent))]">
            Your library
          </p>
          <h2 className="max-w-lg text-2xl font-bold uppercase leading-tight tracking-wide sm:text-3xl">
            Your collection starts with one sound
          </h2>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-muted">
            Browse the marketplace, choose a license, and every purchased file will be organized here automatically.
          </p>
          <Link
            href="/marketplace"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-[rgb(var(--accent))] px-5 py-3 text-sm font-bold text-[rgb(var(--bg))] transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2"
          >
            Explore beats
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <ol className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-[rgb(var(--bg-2)/0.4)]">
          {firstPurchaseSteps.map((step, index) => (
            <li key={step.title} className="flex gap-4 p-4 sm:p-5">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[rgb(var(--accent))]/30 text-xs font-bold text-[rgb(var(--accent))]">
                {index + 1}
              </span>
              <div>
                <p className="text-sm font-bold text-text">{step.title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div className="mt-8 grid gap-3 border-t border-border pt-5 sm:grid-cols-3">
        {[
          'Audio files kept together',
          'License documents attached',
          'Downloads available anytime',
        ].map((benefit) => (
          <div key={benefit} className="flex items-center gap-2 text-xs font-semibold text-muted">
            <Check className="h-4 w-4 shrink-0 text-green-400" />
            {benefit}
          </div>
        ))}
      </div>
    </DribbbleCard>
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
