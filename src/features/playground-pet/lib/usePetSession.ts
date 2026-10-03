'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { getAccessToken } from '@/shared/api/token'
import { ApiError } from '@/shared/api/unwrap'
import { AUTH_STATE_CHANGED } from '@/shared/lib/authStateEvents'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'

export type PetSession = { token: string; scope: string; generation: number }

function subscribe(listener: () => void) {
  window.addEventListener(AUTH_STATE_CHANGED, listener)
  window.addEventListener('focus', listener)
  window.addEventListener('pageshow', listener)
  document.addEventListener('visibilitychange', listener)
  return () => {
    window.removeEventListener(AUTH_STATE_CHANGED, listener)
    window.removeEventListener('focus', listener)
    window.removeEventListener('pageshow', listener)
    document.removeEventListener('visibilitychange', listener)
  }
}

export function usePetSession(): PetSession | null {
  const token = useSyncExternalStore(subscribe, getAccessToken, () => null)
  return useMemo(() => {
    if (!token) return null
    try {
      // JWT는 캐시 분리에만 사용한다. 자격·권한은 매번 인증된 API에서 검증한다.
      const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (typeof claims.sub !== 'string' || !['adopter', 'breeder'].includes(claims.role))
        return null
      const generation = getAuthSessionGeneration()
      return {
        token,
        generation,
        scope: JSON.stringify([claims.sub, claims.role, claims.iat, claims.exp, generation]),
      }
    } catch {
      return null
    }
  }, [token])
}

export function petSessionIsCurrent(session: PetSession): boolean {
  return isAuthSessionCurrent(session.generation) && getAccessToken() === session.token
}

export async function inPetSession<T>(session: PetSession, request: () => Promise<T>): Promise<T> {
  if (!petSessionIsCurrent(session)) throw new ApiError('인증 세션이 변경됐어요.', 401)
  const data = await request()
  if (!petSessionIsCurrent(session)) throw new ApiError('인증 세션이 변경됐어요.', 401)
  return data
}
