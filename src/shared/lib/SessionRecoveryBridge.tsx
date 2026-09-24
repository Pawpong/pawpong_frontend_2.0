'use client'

import { useEffect } from 'react'
import { clearAuthCookies, restoreAuthSession } from './authSessionRecovery'
import { canResumeAuthCookieClear, hasPendingLogout } from './authSessionLifecycle'

export function SessionRecoveryBridge() {
  useEffect(() => {
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
    document.addEventListener('visibilitychange', recover)
    return () => {
      window.removeEventListener('online', recover)
      window.removeEventListener('pageshow', recover)
      window.removeEventListener('pawpong:app-active', recover)
      document.removeEventListener('visibilitychange', recover)
    }
  }, [])
  return null
}
