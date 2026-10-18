import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
const closed = { enabled: false, aiEnabled: false, topics: [], aiNotice: '' }
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
    if (
      payload.data?.enabled === true &&
      (typeof payload.data.aiEnabled !== 'boolean' ||
        typeof payload.data.aiNotice !== 'string' ||
        !Array.isArray(payload.data.topics) ||
        !payload.data.topics.every(
          (topic: { key?: unknown; label?: unknown } | null) =>
            topic && typeof topic.key === 'string' && typeof topic.label === 'string',
        ))
    )
      throw new Error('invalid config')
    return NextResponse.json(payload.data?.enabled === true ? payload.data : closed, { headers })
  } catch {
    return NextResponse.json(closed, { status: 503, headers })
  }
}
