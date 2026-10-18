'use client'

import { useSyncExternalStore } from 'react'
import { AUTH_STATE_CHANGED } from './authStateEvents'
import { getAuthSessionGeneration } from './authSessionLifecycle'

const subscribe = (changed: () => void) => {
  window.addEventListener(AUTH_STATE_CHANGED, changed)
  return () => window.removeEventListener(AUTH_STATE_CHANGED, changed)
}
export function useAuthSessionGeneration() {
  return useSyncExternalStore(subscribe, getAuthSessionGeneration, () => 0)
}
