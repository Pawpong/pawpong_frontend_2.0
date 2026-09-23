'use client'

import { useSyncExternalStore } from 'react'
import { getAccessToken } from '@/shared/api/token'
import { AUTH_STATE_CHANGED } from './authStateEvents'

const subscribe = (onChange: () => void) => {
  window.addEventListener(AUTH_STATE_CHANGED, onChange)
  document.addEventListener('visibilitychange', onChange)
  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED, onChange)
    document.removeEventListener('visibilitychange', onChange)
  }
}
const serverToken = () => null

export function useAccessToken() {
  return useSyncExternalStore(subscribe, getAccessToken, serverToken)
}
