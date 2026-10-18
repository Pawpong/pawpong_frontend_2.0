import { getAccessToken } from '@/shared/api/token'
import { authTokenIdentity } from './authTokenIdentity'
import { getAuthSessionGeneration, isAuthSessionCurrent } from './authSessionLifecycle'

export type AuthReadSession = {
  generation: number
  identity: string
  scope: string
}

let snapshot: AuthReadSession | null = null
let sequence = 0

/** 계정 조회 캐시를 나누되 같은 계정의 정상 토큰 갱신은 유지함. */
export function getAuthReadSession(): AuthReadSession | null {
  const generation = getAuthSessionGeneration()
  const identity = isAuthSessionCurrent(generation) ? authTokenIdentity(getAccessToken()) : null
  if (!identity) return (snapshot = null)
  if (snapshot?.generation === generation && snapshot.identity === identity) return snapshot
  snapshot = { generation, identity, scope: `auth-read-${++sequence}` }
  return snapshot
}

export function isAuthReadSessionCurrent(session: AuthReadSession): boolean {
  return (
    isAuthSessionCurrent(session.generation) &&
    authTokenIdentity(getAccessToken()) === session.identity
  )
}
