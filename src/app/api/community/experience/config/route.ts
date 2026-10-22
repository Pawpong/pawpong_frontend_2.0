import { NextResponse } from 'next/server'
import {
  CLOSED_COMMUNITY_EXPERIENCE as closed,
  parseCommunityExperienceConfig,
} from '@/entities/community/server'
export const dynamic = 'force-dynamic'
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')
  if (!base) return NextResponse.json(closed, { headers })
  try {
    const response = await fetch(`${base}/api/v2/community/experience/config`, {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    })
    const payload = await response.json()
    if (!response.ok || payload.success !== true) throw new Error('unavailable')
    const config = parseCommunityExperienceConfig(payload.data)
    if (!config) throw new Error('invalid config')
    return NextResponse.json(config, { headers })
  } catch {
    return NextResponse.json(closed, { status: 503, headers })
  }
}
