'use client'

import { useSyncExternalStore } from 'react'
import { getActivitySession } from '@/entities/gamification'
import { AUTH_STATE_CHANGED } from '@/shared/lib/authStateEvents'

function subscribe(changed: () => void) {
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

export function useActivitySession() {
  return useSyncExternalStore(subscribe, getActivitySession, () => null)
}
