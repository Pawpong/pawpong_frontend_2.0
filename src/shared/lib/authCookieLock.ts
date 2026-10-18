const LOCK_NAME = 'pawpong:auth-cookie-write'
const leaseKey = Symbol('auth-cookie-lease')
export type AuthCookieLease = { readonly [leaseKey]: true }

const activeLeases = new WeakSet<AuthCookieLease>()
let localQueue: Promise<unknown> = Promise.resolve()

/** 쿠키 변경 응답이 끝날 때까지 잠금을 유지하며 중첩 정리는 같은 잠금을 사용한다. */
export async function withAuthCookieLock<T>(
  operation: (lease: AuthCookieLease) => Promise<T>,
  currentLease?: AuthCookieLease,
): Promise<T> {
  if (currentLease) {
    if (!activeLeases.has(currentLease))
      return Promise.reject(new Error('인증 변경 작업이 이미 종료되었습니다.'))
    return operation(currentLease)
  }
  const run = async () => {
    const lease: AuthCookieLease = { [leaseKey]: true }
    activeLeases.add(lease)
    try {
      return await operation(lease)
    } finally {
      activeLeases.delete(lease)
    }
  }
  if (typeof navigator !== 'undefined' && navigator.locks?.request)
    return await navigator.locks.request(LOCK_NAME, run)

  // Web Locks가 없는 구형 WebView에서도 한 문서 안의 쿠키 변경은 순서대로 처리한다.
  const pending = localQueue.then(run, run)
  localQueue = pending.then(
    () => undefined,
    () => undefined,
  )
  return pending
}
