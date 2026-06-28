import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

/**
 * [BFF] 액세스 토큰 재발급
 *
 * POST /api/auth/refresh
 *
 * cross-origin 요청에서는 httpOnly refreshToken 쿠키가 백엔드로 자동 전송되지 않으므로,
 * 이 BFF 라우트가 쿠키에서 refreshToken 을 읽어 백엔드로 대신 전달한다.
 * (shared/api/client.ts 의 401 인터셉터가 이 라우트를 호출 → 성공 시 /api/auth/set-cookie 로 재저장)
 *
 * 주의: 백엔드 refresh 엔드포인트는 v2 경로다 → POST {API_BASE}/api/v2/auth/refresh
 */
export async function POST() {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('refreshToken')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: 'refreshToken이 없습니다.' },
        { status: 401 },
      )
    }

    const backendUrl = (
      process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080'
    ).replace(/\/+$/, '')

    const response = await fetch(`${backendUrl}/api/v2/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    const data = await response.json()

    if (!response.ok || !data.success) {
      return NextResponse.json(
        { success: false, message: data.message || '토큰 갱신에 실패했습니다.' },
        { status: response.status },
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('토큰 리프레시 오류:', error)
    return NextResponse.json(
      { success: false, message: '토큰 갱신 중 오류가 발생했습니다.' },
      { status: 500 },
    )
  }
}
