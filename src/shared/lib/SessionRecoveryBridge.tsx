'use client'

import { useEffect } from 'react'
import { clearAuthCookies, restoreAuthSession } from './authSessionRecovery'
import { AUTH_INTENT_KEY, canResumeAuthCookieClear, hasPendingLogout } from './authSessionLifecycle'
import { AUTH_STATE_CHANGED } from './authStateEvents'

export function SessionRecoveryBridge() {
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === AUTH_INTENT_KEY || event.key === AUTH_STATE_CHANGED)
        window.dispatchEvent(new Event(AUTH_STATE_CHANGED))
    }
    const recover = () => {
      if (document.visibilityState === 'hidden') return
      if (hasPendingLogout()) {
        if (canResumeAuthCookieClear()) void clearAuthCookies()
        return
      }
      // OAuth 콜백과 가입 화면은 자신의 새 인증 결과를 저장한다.
      if (/^\/(login\/success|signup)(\/|$)/.test(window.location.pathname)) return
      void restoreAuthSession().catch(() => {})
    }
    recover()
    window.addEventListener('online', recover)
    window.addEventListener('pageshow', recover)
    window.addEventListener('pawpong:app-active', recover)
    window.addEventListener('storage', onStorage)
    document.addEventListener('visibilitychange', recover)
    return () => {
      window.removeEventListener('online', recover)
      window.removeEventListener('pageshow', recover)
      window.removeEventListener('pawpong:app-active', recover)
      window.removeEventListener('storage', onStorage)
      document.removeEventListener('visibilitychange', recover)
    }
  }, [])
  return null
}
