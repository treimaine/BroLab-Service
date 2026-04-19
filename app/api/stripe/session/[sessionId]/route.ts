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

    return NextResponse.json({
      status: 'ready',
      itemType: purchase.itemType,
      beatTitle: purchase.itemTitle,
      producerName: purchase.producerName,
      licenseType: purchase.licenseType ? `${toTitleCase(purchase.licenseType)} License` : null,
      price: purchase.amountCents / 100,
      currency: purchase.currency,
      downloadUrl: purchase.downloadUrl,
      licenseUrl: purchase.licenseUrl,
    })
  } catch (error) {
    console.error('Failed to fetch checkout session details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session purchase data' },
      { status: 500 }
    )
  }
}
