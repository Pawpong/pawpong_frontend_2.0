import { NextResponse, type NextRequest } from 'next/server'

const AUTH_COOKIES = ['accessToken', 'refreshToken', 'userRole'] as const

/**
 * [BFF] 로그아웃 — 인증 쿠키 전체 삭제
 *
 * POST /api/auth/clear-cookie
 *
 * accessToken / refreshToken / userRole 을 모두 만료시킨다.
 * (features/auth/api/auth.api.ts 의 logout 및 client.ts 의 세션 만료 처리에서 호출)
 *
 * 쿠키는 두 벌로 존재할 수 있다:
 * 1) 프론트 BFF(set-cookie/refresh)가 구운 host-only 쿠키
 * 2) 백엔드 소셜 로그인 콜백이 구운 Domain=.pawpong.kr 쿠키
 * 삭제는 Domain 속성까지 일치해야 하므로 두 벌 모두 만료시킨다 —
 * host-only 만 지우면 .pawpong.kr 쿠키가 남아 로그아웃이 안 먹는 것처럼 보인다.
 * (같은 이름을 res.cookies.set 으로 두 번 설정하면 덮어써지므로 헤더를 직접 append)
 */
function expireAuthCookies(res: NextResponse, host: string | null) {
  const isPawpongHost = host !== null && /(^|\.)pawpong\.kr(:\d+)?$/.test(host)
  for (const name of AUTH_COOKIES) {
    res.headers.append('Set-Cookie', `${name}=; Path=/; Max-Age=0`)
    if (isPawpongHost) {
      res.headers.append(
        'Set-Cookie',
        `${name}=; Path=/; Max-Age=0; Domain=.pawpong.kr; Secure; SameSite=None`,
      )
    }
  }
}

export async function POST(request: NextRequest) {
  const host = request.headers.get('host')
  try {
    const res = NextResponse.json({ ok: true, message: '쿠키가 삭제되었습니다.' })
    expireAuthCookies(res, host)
    return res
  } catch (error) {
    console.error('쿠키 삭제 실패:', error)
    // 에러가 나도 쿠키 삭제는 보장
    const res = NextResponse.json(
      { ok: false, message: '쿠키 삭제 중 오류가 발생했습니다.' },
      { status: 500 },
    )
    expireAuthCookies(res, host)
    return res
  }
}
