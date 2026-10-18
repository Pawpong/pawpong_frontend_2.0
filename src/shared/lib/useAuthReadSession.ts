'use client'

import { useSyncExternalStore } from 'react'
import { AUTH_STATE_CHANGED } from './authStateEvents'
import { getAuthReadSession } from './authReadSession'

const subscribe = (changed: () => void) => {
  window.addEventListener(AUTH_STATE_CHANGED, changed)
  window.addEventListener('focus', changed)
  window.addEventListener('pageshow', changed)
  document.addEventListener('visibilitychange', changed)
  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED, changed)
    window.removeEventListener('focus', changed)
    window.removeEventListener('pageshow', changed)
    document.removeEventListener('visibilitychange', changed)
  }
}

export function useAuthReadSession() {
  return useSyncExternalStore(subscribe, getAuthReadSession, () => null)
}
