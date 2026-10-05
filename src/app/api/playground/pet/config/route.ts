import { NextRequest, NextResponse } from 'next/server'
import { isPetServerEnabled } from '@/features/playground-pet/lib/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store' }
  const disabled = () => NextResponse.json({ enabled: false }, { headers })
  // Next 내부 URL이 localhost여도 외부 요청 Host가 운영이면 닫는다.
  if (!isPetServerEnabled(request.headers.get('host') ?? '')) return disabled()
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  if (!base) return disabled()
  try {
    const response = await fetch(`${base.replace(/\/+$/, '')}/api/v2/playground/pet/config`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    })
    if (response.status === 404) return disabled()
    if (!response.ok) return NextResponse.json({ enabled: false }, { status: 503, headers })
    const body = await response.json()
    return NextResponse.json(
      {
        enabled: body.success === true && body.data?.enabled === true,
        policyVersion: body.data?.policyVersion,
      },
      { headers },
    )
  } catch {
    return NextResponse.json({ enabled: false }, { status: 503, headers })
  }
}
