import { getAccessToken } from '@/shared/api/token'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'

export type ActivitySession = {
  token: string
  generation: number
  ownerId: string
  scope: string
}

let previousToken: string | null | undefined
let previousGeneration: number | undefined
let snapshot: ActivitySession | null = null
let sequence = 0

/** Cache identity changes on every credential rotation without storing the token in query keys. */
export function getActivitySession(): ActivitySession | null {
  const generation = getAuthSessionGeneration()
  const token = isAuthSessionCurrent(generation) ? getAccessToken() : null
  if (token === previousToken && generation === previousGeneration) return snapshot
  previousToken = token
  previousGeneration = generation
  snapshot = null
  if (!token) return snapshot
  try {
    // Claims only partition UI caches; the backend authenticates every private request.
    const claims = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    if (typeof claims.sub !== 'string' || !['adopter', 'breeder'].includes(claims.role)) return null
    snapshot = { token, generation, ownerId: claims.sub, scope: `activity-session-${++sequence}` }
  } catch {
    return null
  }
  return snapshot
}

export function isActivitySessionCurrent(session: ActivitySession): boolean {
  return isAuthSessionCurrent(session.generation) && getAccessToken() === session.token
}
