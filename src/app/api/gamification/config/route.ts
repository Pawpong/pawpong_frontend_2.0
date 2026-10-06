import { NextRequest, NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
export async function GET(request: NextRequest) {
  const host = (request.headers.get('host') ?? '').split(':')[0].toLowerCase()
  const headers = { 'Cache-Control': 'no-store' }
  const development =
    host === 'dev.pawpong.kr' ||
    (['localhost', '127.0.0.1'].includes(host) && process.env.NEXT_PUBLIC_APP_ENV === 'development')
  if (!development) return NextResponse.json({ enabled: false }, { headers })
  try {
    const response = await fetch('https://dev-api.pawpong.kr/api/v2/gamification/config', {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    // 백엔드의 선택 배포 전에는 엔드포인트가 없을 수 있다. 기존 화면은 계속 이용한다.
    if (response.status === 404) return NextResponse.json({ enabled: false }, { headers })
    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error('unavailable')
    return NextResponse.json({ enabled: payload.data?.enabled === true }, { headers })
  } catch {
    return NextResponse.json({ enabled: false }, { status: 503, headers })
  }
}
