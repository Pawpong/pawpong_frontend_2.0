import { NextResponse } from 'next/server'
import { CLOSED_COMMUNITY_REVIEW_CONFIG, parseCommunityReviewConfig } from '@/entities/community'

export const dynamic = 'force-dynamic'
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')
  if (!base) return NextResponse.json(CLOSED_COMMUNITY_REVIEW_CONFIG, { headers })
  try {
    const response = await fetch(`${base}/api/v2/community/review/config`, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    })
    const payload = await response.json()
    if (!response.ok || payload.success !== true) throw new Error('unavailable')
    return NextResponse.json(parseCommunityReviewConfig(payload.data), { headers })
  } catch {
    return NextResponse.json(CLOSED_COMMUNITY_REVIEW_CONFIG, { status: 503, headers })
  }
}
