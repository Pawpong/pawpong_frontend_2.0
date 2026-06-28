import { NextResponse } from 'next/server'

/**
 * [BFF] 로그아웃 — 인증 쿠키 전체 삭제
 *
 * POST /api/auth/clear-cookie
 *
 * accessToken / refreshToken / userRole 을 모두 만료시킨다.
 * (features/auth/api/auth.api.ts 의 logout 및 client.ts 의 세션 만료 처리에서 호출)
 */
function expireAuthCookies(res: NextResponse) {
  res.cookies.set('accessToken', '', { path: '/', maxAge: 0 })
  res.cookies.set('refreshToken', '', { path: '/', maxAge: 0 })
  res.cookies.set('userRole', '', { path: '/', maxAge: 0 })
}

export async function POST() {
  try {
    const res = NextResponse.json({ ok: true, message: '쿠키가 삭제되었습니다.' })
    expireAuthCookies(res)
    return res
  } catch (error) {
    console.error('쿠키 삭제 실패:', error)
    // 에러가 나도 쿠키 삭제는 보장
    const res = NextResponse.json(
      { ok: false, message: '쿠키 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    )
    expireAuthCookies(res)
    return res
  }
}
