import type { NextRequest } from 'next/server'

/** Next의 바인딩 주소 대신 브라우저가 요청한 Host로 동일 출처를 확인한다. */
export function isSameOriginRequest(request: NextRequest): boolean {
  if (request.headers.get('sec-fetch-site') === 'cross-site') return false
  const origin = request.headers.get('origin')
  if (origin === null) return true
  // Host는 브라우저가 임의 지정할 수 없는 요청 대상이다. 전달 헤더로 덮어쓰지 않는다.
  const host = request.headers.get('host') ?? request.nextUrl.host
  if (!host || /[\\/@?#\s,]/.test(host)) return false
  try {
    const target = new URL(`${request.nextUrl.protocol}//${host}`)
    return ['http:', 'https:'].includes(target.protocol) && origin === target.origin
  } catch {
    return false
  }
}
