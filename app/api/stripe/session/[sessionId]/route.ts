import { CONVEX_CONFIG } from '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'
import { internal } from '../../../../../convex/_generated/api'

const convex = new ConvexHttpClient(CONVEX_CONFIG.url)

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId } = await params
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session id' }, { status: 400 })
    }

    const purchase = await convex.query(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (internal as any).modules.orders.getSessionPurchaseData,
      {
        stripeSessionId: sessionId,
        buyerClerkUserId: userId,
      }
    )

    if (!purchase) {
      return NextResponse.json(
        { status: 'pending', error: 'Purchase not ready yet' },
        { status: 202 }
      )
    }

    const paidAtDate = new Date(purchase.paidAt)
    const formattedDate = paidAtDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

    return NextResponse.json({
      status: 'ready',
      orderId: purchase.orderId.toString(),
      sessionId: purchase.stripeSessionId,
      itemType: purchase.itemType,
      itemTitle: purchase.itemTitle,
      producerName: purchase.producerName,
      licenseType: purchase.licenseType ? `${toTitleCase(purchase.licenseType)} License` : null,
      amountCents: purchase.amountCents,
      currency: purchase.currency,
      downloadUrl: purchase.downloadUrl,
      licenseUrl: purchase.licenseUrl,
      buyerEmail: purchase.buyerEmail,
      paidAt: formattedDate,
      price: purchase.amountCents / 100,
    })
  } catch (error) {
    console.error('Failed to fetch checkout session details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session purchase data' },
      { status: 500 }
    )
  }
}
