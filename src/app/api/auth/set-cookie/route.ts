import { NextResponse, type NextRequest } from 'next/server'

const DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24
const DEFAULT_REFRESH_TOKEN_MAX_AGE_SECONDS = 60 * 60 * 24 * 7

/** 백엔드가 프로덕션 로그인에서 굽는 쿠키의 Domain — 덮어쓰려면 이 값이 정확히 같아야 한다 */
const PRODUCTION_COOKIE_DOMAIN = '.pawpong.kr'

/**
 * 백엔드가 쿠키를 굽는 환경인지 — 운영 도메인(pawpong.kr / www.pawpong.kr) 뿐이다.
 *
 * dev.pawpong.kr 은 백엔드가 URL 파라미터 경로를 타서 쿠키를 굽지 않으므로 여기 해당하지 않는다.
 * dev 에서 Domain=.pawpong.kr 로 구우면 그 쿠키가 운영 도메인에도 실려 나가므로 반드시 제외한다.
 */
const isProductionPawpongHost = (host: string | null): boolean =>
  host !== null && /^(www\.)?pawpong\.kr(:\d+)?$/.test(host)

/**
 * 프록시·CDN 뒤에서는 host 에 내부 호스트가 올 수 있다.
 * 그러면 운영에서 host-only 분기로 빠져 중복 쿠키가 그대로 재발하므로
 * 원본 호스트를 실어주는 x-forwarded-host 를 먼저 본다.
 * (쉼표로 여러 개가 올 수 있어 첫 값만 쓴다)
 */
const resolveRequestHost = (req: NextRequest): string | null => {
  const forwarded = req.headers.get('x-forwarded-host')
  if (forwarded) return forwarded.split(',')[0].trim()
  return req.headers.get('host')
}

type JwtPayload = {
  role?: string
  exp?: number
  iat?: number
}

function decodeJwtPayload(token: string): JwtPayload {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(Buffer.from(base64, 'base64').toString('utf8')) as JwtPayload
  } catch {
    return {}
  }
}

function resolveJwtMaxAgeSeconds(token: string, fallbackSeconds: number): number {
  const payload = decodeJwtPayload(token)
  const nowSeconds = Math.floor(Date.now() / 1000)
  if (typeof payload.exp !== 'number') return fallbackSeconds

  const secondsUntilExpiry = payload.exp - nowSeconds
  return secondsUntilExpiry > 0 ? secondsUntilExpiry : 0
}

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
 * ── 운영 도메인에서 Domain 쿠키로 굽는 이유 ──
 * 운영 로그인은 백엔드가 Domain=.pawpong.kr 쿠키를 직접 굽고 /login/success 를 거치지 않는다.
 * 그 뒤 첫 토큰 갱신에서 이 라우트가 host-only 쿠키를 심으면 같은 이름 쿠키가 두 벌이 된다.
 * host-only 와 Domain 쿠키는 서로 다른 쿠키라 덮어써지지 않기 때문이다.
 *
 * 두 벌이 되면 양쪽 모두 첫 항목만 읽어 옛 토큰을 집는다 —
 * 프론트는 getAccessToken() 이, 백엔드는 cookie-parser 가 그렇다.
 * 그러면 갱신에 성공하고도 로그아웃되거나 401 이 반복된다.
 *
 * 그래서 운영 도메인에서는 백엔드와 같은 Domain 으로 구워 덮어쓰고,
 * 이미 두 벌을 가진 사용자를 위해 host-only 쪽을 같은 응답에서 만료시킨다.
 * (삭제하는 clear-cookie 는 이미 두 벌을 처리하고 있어 생성 쪽만 비대칭이었다)
 *
 * 덮어쓰기 판정은 name + domain + path 세 가지다. secure/sameSite/httpOnly/maxAge 는
 * 식별자가 아니라 교체되는 값이므로, 이 셋만 백엔드와 맞으면 한 벌로 수렴한다.
 *
 * NextResponse.cookies.set 은 같은 이름을 덮어쓰기 때문에 "만료 + 생성"을 함께 내보낼 수 없다.
 * (delete 후 set 하면 delete 가 사라져 Set-Cookie 가 아예 나가지 않는다)
 * 그래서 헤더를 직접 append 한다 — clear-cookie 가 같은 이유로 쓰는 방식이다.
 */
function decodeJwtRole(token: string): string {
  return decodeJwtPayload(token).role || 'adopter'
}

type AuthCookie = {
  name: string
  value: string
  httpOnly: boolean
  maxAgeSeconds: number
}

/** 운영 도메인용 — host-only 만료 한 줄 + Domain 생성 한 줄을 같이 내보낸다 */
function appendProductionCookies(res: NextResponse, cookies: AuthCookie[]) {
  for (const { name, value, httpOnly, maxAgeSeconds } of cookies) {
    // 기존 사용자 브라우저에 남아 있는 host-only 쿠키 제거 (Domain 쿠키가 덮어쓰지 못한다)
    res.headers.append('Set-Cookie', `${name}=; Path=/; Max-Age=0`)

    const attrs = [
      `${name}=${encodeURIComponent(value)}`,
      'Path=/',
      `Max-Age=${maxAgeSeconds}`,
      `Domain=${PRODUCTION_COOKIE_DOMAIN}`,
      'Secure',
      // SameSite=None 은 Secure 와 함께여야 브라우저가 받아준다
      'SameSite=None',
    ]
    if (httpOnly) attrs.push('HttpOnly')
    res.headers.append('Set-Cookie', attrs.join('; '))
  }
}

/** 로컬 · dev · vercel 용 — 백엔드가 쿠키를 굽지 않으므로 host-only 한 벌로 충분하다 */
function setHostOnlyCookies(res: NextResponse, cookies: AuthCookie[], isSecure: boolean) {
  for (const { name, value, httpOnly, maxAgeSeconds } of cookies) {
    res.cookies.set(name, value, {
      httpOnly,
      secure: isSecure,
      sameSite: 'lax',
      path: '/',
      maxAge: maxAgeSeconds,
    })
  }
}

export async function POST(req: NextRequest) {
  const { accessToken, refreshToken } = (await req.json()) as {
    accessToken?: string
    refreshToken?: string
  }

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ ok: false, message: '토큰이 없습니다.' }, { status: 400 })
  }

  const userRole = decodeJwtRole(accessToken)
  const accessTokenMaxAge = resolveJwtMaxAgeSeconds(
    accessToken,
    DEFAULT_ACCESS_TOKEN_MAX_AGE_SECONDS,
  )
  const refreshTokenMaxAge = resolveJwtMaxAgeSeconds(
    refreshToken,
    DEFAULT_REFRESH_TOKEN_MAX_AGE_SECONDS,
  )

  const cookies: AuthCookie[] = [
    { name: 'accessToken', value: accessToken, httpOnly: false, maxAgeSeconds: accessTokenMaxAge },
    {
      name: 'refreshToken',
      value: refreshToken,
      httpOnly: true,
      maxAgeSeconds: refreshTokenMaxAge,
    },
    { name: 'userRole', value: userRole, httpOnly: false, maxAgeSeconds: accessTokenMaxAge },
  ]

  const res = NextResponse.json({ ok: true })

  if (isProductionPawpongHost(resolveRequestHost(req))) {
    appendProductionCookies(res, cookies)
  } else {
    // localhost(HTTP)에서는 Secure 쿠키 사용 불가
    setHostOnlyCookies(res, cookies, process.env.NODE_ENV === 'production')
  }

  return res
}
