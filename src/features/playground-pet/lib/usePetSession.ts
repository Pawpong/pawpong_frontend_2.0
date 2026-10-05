'use client'

import { useMemo, useSyncExternalStore } from 'react'
import { getAccessToken } from '@/shared/api/token'
import { ApiError } from '@/shared/api/unwrap'
import { AUTH_STATE_CHANGED, notifyAuthStateChanged } from '@/shared/lib/authStateEvents'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import { refreshAuthSession } from '@/shared/lib/authSessionRecovery'

export type PetSession = { token: string; scope: string; generation: number }

function sessionSnapshot() {
  const generation = getAuthSessionGeneration()
  return JSON.stringify([isAuthSessionCurrent(generation) ? getAccessToken() : null, generation])
}

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
  const snapshot = useSyncExternalStore(subscribe, sessionSnapshot, () => '[null,0]')
  return useMemo(() => {
    const [token, generation] = JSON.parse(snapshot) as [string | null, number]
    if (!token) return null
    try {
      // JWT는 캐시 분리에만 사용한다. 자격·권한은 매번 인증된 API에서 검증한다.
      const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
      if (typeof claims.sub !== 'string' || !['adopter', 'breeder'].includes(claims.role))
        return null
      return {
        token,
        generation,
        scope: JSON.stringify([claims.sub, claims.role, claims.iat, claims.exp, generation]),
      }
    } catch {
      return null
    }
  }, [snapshot])
}

export function petSessionIsCurrent(session: PetSession): boolean {
  return isAuthSessionCurrent(session.generation) && getAccessToken() === session.token
}

export async function inPetSession<T>(session: PetSession, request: () => Promise<T>): Promise<T> {
  if (!petSessionIsCurrent(session)) {
    notifyAuthStateChanged()
    throw new ApiError('인증 세션이 변경됐어요.', 401)
  }
  let data: T
  try {
    data = await request()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401 && petSessionIsCurrent(session)) {
      // Recover credentials only. A new scope reloads its own data; the rejected command is never replayed.
      try {
        await refreshAuthSession()
      } catch {
        // Shared recovery clears rejected credentials and preserves them on a transport failure.
      }
      notifyAuthStateChanged()
    }
    throw error
  }
  if (!petSessionIsCurrent(session)) {
    notifyAuthStateChanged()
    throw new ApiError('인증 세션이 변경됐어요.', 401)
  }
  return data
}
