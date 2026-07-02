import { NextResponse } from 'next/server'

/**
 * [BFF] 소셜 로그인 토큰 → 인증 쿠키 저장
 *
 * POST /api/auth/set-cookie  body: { accessToken, refreshToken }
 *
 * 로컬/dev 환경에서는 백엔드 OAuth 콜백이 토큰을 URL 파라미터로 넘겨주므로
 * (/login/success?accessToken=...&refreshToken=...), 그 페이지가 이 라우트로 토큰을
 * 전달해 브라우저 쿠키로 심는다.
 *
 * 쿠키 정책 (shared/api/client.ts 의 인터셉터와 짝이 맞아야 함):
 * - accessToken : httpOnly=false  → client.ts 가 document.cookie 에서 읽어 Authorization 헤더로 붙임
 * - refreshToken: httpOnly=true   → /api/auth/refresh BFF 에서만 사용
 * - userRole    : httpOnly=false  → 프론트에서 역할 분기에 사용
 *
 * TODO(FE): 운영(prod) HTTPS 도메인 확정되면 isSecure 판정/SameSite 정책 재검토.
 */
function decodeJwtRole(token: string): string {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    const json = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )
    return (JSON.parse(json).role as string) || 'adopter'
  } catch {
    return 'adopter'
  }
}

export async function POST(req: Request) {
  const { accessToken, refreshToken } = (await req.json()) as {
    accessToken?: string
    refreshToken?: string
  }

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ ok: false, message: '토큰이 없습니다.' }, { status: 400 })
  }

  const userRole = decodeJwtRole(accessToken)
  const res = NextResponse.json({ ok: true })

  // 계정 전환 시 중복 쿠키 방지를 위해 먼저 제거
  res.cookies.delete('accessToken')
  res.cookies.delete('refreshToken')
  res.cookies.delete('userRole')

  // localhost(HTTP)에서는 Secure 쿠키 사용 불가
  const isSecure = process.env.NODE_ENV === 'production'

  res.cookies.set('accessToken', accessToken, {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1일
  })
  res.cookies.set('refreshToken', refreshToken, {
    httpOnly: true,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 30, // 30일
  })
  res.cookies.set('userRole', userRole, {
    httpOnly: false,
    secure: isSecure,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 1일
  })

  return res
}
