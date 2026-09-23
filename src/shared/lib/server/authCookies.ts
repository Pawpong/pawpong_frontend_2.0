import type { NextRequest, NextResponse } from 'next/server'

/** 기존 host-only 세션과 소셜 로그인에서 남은 Domain 쿠키를 함께 만료시킨다. */
export function expireAuthCookies(response: NextResponse, request: NextRequest) {
  const host =
    request.headers.get('x-forwarded-host')?.split(',')[0].trim() ?? request.headers.get('host')
  const pawpongHost = host !== null && /(^|\.)pawpong\.kr(:\d+)?$/.test(host)
  for (const name of ['accessToken', 'refreshToken', 'userRole']) {
    response.headers.append('Set-Cookie', `${name}=; Path=/; Max-Age=0`)
    if (pawpongHost) {
      response.headers.append(
        'Set-Cookie',
        `${name}=; Path=/; Max-Age=0; Domain=.pawpong.kr; Secure; SameSite=None`,
      )
    }
  }
}
