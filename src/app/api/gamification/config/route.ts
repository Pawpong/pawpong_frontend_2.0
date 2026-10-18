import { NextResponse } from 'next/server'
export const dynamic = 'force-dynamic'
const DISABLED = { enabled: false, breederLevelPublic: false }

/** 켜짐 여부는 환경이 아니라 백엔드 플래그(GAMIFICATION_ENABLED·BREEDER_LEVEL_PUBLIC)가 정한다. */
export async function GET() {
  const headers = { 'Cache-Control': 'no-store' }
  const base = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '')
  if (!base) return NextResponse.json(DISABLED, { headers })
  try {
    const response = await fetch(`${base}/api/v2/gamification/config`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    // 백엔드의 선택 배포 전에는 엔드포인트가 없을 수 있다. 기존 화면은 계속 이용한다.
    if (response.status === 404) return NextResponse.json(DISABLED, { headers })
    const payload = await response.json()
    if (!response.ok || !payload.success) throw new Error('unavailable')
    return NextResponse.json(
      {
        enabled: payload.data?.enabled === true,
        breederLevelPublic: payload.data?.breederLevelPublic === true,
      },
      { headers },
    )
  } catch {
    return NextResponse.json(DISABLED, { status: 503, headers })
  }
}
