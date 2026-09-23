let sessionGeneration = 0
let signingOut = false
const cookieWrites = new Set<Promise<unknown>>()

/** 로그아웃 의도 이후 도착한 이전 refresh 응답은 세션을 되살릴 수 없다. */
export function beginLogout(): void {
  signingOut = true
  sessionGeneration += 1
}

/** 가입·소셜 로그인처럼 사용자가 새로 인증한 경우에만 세션을 다시 연다. */
export function beginLogin(): number {
  signingOut = false
  return ++sessionGeneration
}

export function getAuthSessionGeneration(): number {
  return sessionGeneration
}

export function isAuthSessionCurrent(generation = sessionGeneration): boolean {
  return !signingOut && generation === sessionGeneration
}

export function trackAuthCookieWrite<T>(write: Promise<T>): Promise<T> {
  cookieWrites.add(write)
  void write.then(
    () => cookieWrites.delete(write),
    () => cookieWrites.delete(write),
  )
  return write
}

/** 이미 시작한 Set-Cookie 응답보다 로그아웃의 쿠키 삭제가 마지막에 오도록 한다. */
export async function waitForAuthCookieWrites(): Promise<void> {
  await Promise.allSettled([...cookieWrites])
}
