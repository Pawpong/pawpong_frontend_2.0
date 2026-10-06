import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
const closed = { enabled: false, aiEnabled: false, topics: [], aiNotice: '' }
export async function GET(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase()
  const headers = { 'Cache-Control': 'no-store' }
  if (
    !(
      host === 'dev.pawpong.kr' ||
      (['localhost', '127.0.0.1'].includes(host) &&
        process.env.NEXT_PUBLIC_APP_ENV === 'development')
    )
  )
    return NextResponse.json(closed, { headers })
  try {
    const response = await fetch('https://dev-api.pawpong.kr/api/v2/community/experience/config', {
      cache: 'no-store',
      redirect: 'error',
      signal: AbortSignal.timeout(5000),
    })
    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error('unavailable')
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
