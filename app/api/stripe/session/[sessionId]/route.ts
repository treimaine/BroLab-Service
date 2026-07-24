import { CONVEX_CONFIG } from '@/lib/env'
import { auth } from '@clerk/nextjs/server'
import { ConvexHttpClient } from 'convex/browser'
import { NextResponse } from 'next/server'
import { api } from 'convex/_generated/api'

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const authResult = await auth()
    if (!authResult.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const convexToken = await authResult.getToken({ template: 'convex' })
    if (!convexToken) {
      return NextResponse.json({ error: 'Convex authentication unavailable' }, { status: 503 })
    }
    const convex = new ConvexHttpClient(CONVEX_CONFIG.url)
    convex.setAuth(convexToken)

    const { sessionId } = await params
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session id' }, { status: 400 })
    }

    const purchase = await convex.query(api.modules.orders.getMySessionPurchaseData, {
      stripeSessionId: sessionId,
    })

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
      licenseStatus: purchase.licenseStatus,
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
