'use client'

import { useSyncExternalStore } from 'react'
import { getActivitySession } from '@/entities/gamification'
import { AUTH_STATE_CHANGED } from '@/shared/lib/authStateEvents'

function subscribe(listener: () => void) {
  window.addEventListener(AUTH_STATE_CHANGED, listener)
  window.addEventListener('storage', listener)
  window.addEventListener('focus', listener)
  window.addEventListener('pageshow', listener)
  document.addEventListener('visibilitychange', listener)
  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED, listener)
    window.removeEventListener('storage', listener)
    window.removeEventListener('focus', listener)
    window.removeEventListener('pageshow', listener)
    document.removeEventListener('visibilitychange', listener)
  }
}
export function currentToolOwner() {
  const session = getActivitySession()
  return session ? `account:${session.ownerId}` : 'guest'
}
// Null on the server keeps device content out of SSR and prevents hydration mismatch.
export function useToolOwner() {
  return useSyncExternalStore(subscribe, currentToolOwner, () => null)
}
