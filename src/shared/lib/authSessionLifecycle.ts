let sessionGeneration = 0
let signingOut = false
let logoutRequestInProgress = false
const cookieWrites = new Set<Promise<unknown>>()
const LOGOUT_PENDING_KEY = 'pawpong:logout-pending'

/** 오프라인 로그아웃 뒤 문서가 다시 열려도 HttpOnly 쿠키로 자동 복구하지 않는다. */
export function hasPendingLogout(): boolean {
  try {
    return typeof localStorage !== 'undefined' && localStorage.getItem(LOGOUT_PENDING_KEY) === '1'
  } catch {
    return false
  }
}

export function finishAuthCookieClear(): void {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(LOGOUT_PENDING_KEY)
  } catch {
    /* 저장소가 차단된 브라우저에서는 현재 문서의 세션 경계를 사용한다. */
  }
}

/** 현재 문서의 보호된 로그아웃·탈퇴 요청이 쿠키를 사용한 뒤에만 복귀 시 삭제한다. */
export function canResumeAuthCookieClear(): boolean {
  return hasPendingLogout() && !logoutRequestInProgress
}

export function finishLogoutRequest(): void {
  logoutRequestInProgress = false
}

/** 로그아웃 의도 이후 도착한 이전 refresh 응답은 세션을 되살릴 수 없다. */
export function beginLogout(): void {
  signingOut = true
  logoutRequestInProgress = true
  sessionGeneration += 1
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(LOGOUT_PENDING_KEY, '1')
  } catch {
    /* 현재 문서의 signingOut은 계속 적용된다. */
  }
}

/** 가입·소셜 로그인처럼 사용자가 새로 인증한 경우에만 세션을 다시 연다. */
export function beginLogin(): number {
  signingOut = false
  logoutRequestInProgress = false
  finishAuthCookieClear()
  return ++sessionGeneration
}

export function getAuthSessionGeneration(): number {
  return sessionGeneration
}

export function isAuthSessionCurrent(generation = sessionGeneration): boolean {
  return !signingOut && !hasPendingLogout() && generation === sessionGeneration
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
