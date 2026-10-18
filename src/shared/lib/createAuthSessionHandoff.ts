import {
  getAuthReadSession,
  isAuthReadSessionCurrent,
  type AuthReadSession,
} from './authReadSession'
import { AUTH_STATE_CHANGED } from './authStateEvents'

/** 개인 파일을 디스크에 남기지 않고 현재 작성자에게 한 번만 전달한다. */
export function createAuthSessionHandoff<T>(lifetimeMs: number) {
  let pending: { value: T; session: AuthReadSession; expiresAt: number } | null = null
  let expiry: ReturnType<typeof setTimeout> | undefined
  let stopWatching: (() => void) | undefined
  const clear = () => {
    clearTimeout(expiry)
    pending = null
    stopWatching?.()
    stopWatching = undefined
  }
  const set = (value: T, session: AuthReadSession | null = getAuthReadSession()) => {
    if (!session || !isAuthReadSessionCurrent(session))
      throw new Error('로그인 정보를 확인한 뒤 다시 시도해 주세요.')
    clear()
    pending = { value, session, expiresAt: Date.now() + lifetimeMs }
    expiry = setTimeout(clear, lifetimeMs)
    if (typeof window === 'undefined') return
    const check = () => {
      if (
        pending &&
        (!isAuthReadSessionCurrent(pending.session) || pending.expiresAt <= Date.now())
      )
        clear()
    }
    const storage = (event: StorageEvent) => {
      if (event.key === null || event.key === 'pawpong:logout-pending') clear()
      else check()
    }
    window.addEventListener('storage', storage)
    window.addEventListener(AUTH_STATE_CHANGED, check)
    window.addEventListener('focus', check)
    window.addEventListener('pageshow', check)
    stopWatching = () => {
      window.removeEventListener('storage', storage)
      window.removeEventListener(AUTH_STATE_CHANGED, check)
      window.removeEventListener('focus', check)
      window.removeEventListener('pageshow', check)
    }
  }
  const take = (): T | null => {
    const entry = pending
    clear()
    return entry && entry.expiresAt > Date.now() && isAuthReadSessionCurrent(entry.session)
      ? entry.value
      : null
  }
  return { set, take, clear }
}
