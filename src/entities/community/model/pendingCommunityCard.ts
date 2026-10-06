import { getAccessToken } from '@/shared/api/token'
import { authTokenIdentity } from '@/shared/lib/authTokenIdentity'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import { AUTH_STATE_CHANGED } from '@/shared/lib/authStateEvents'

type PendingCard = { file: File; identity: string; generation: number; expiresAt: number }
let pending: PendingCard | null = null
let expiry: ReturnType<typeof setTimeout> | undefined
let stopWatching: (() => void) | undefined

function clear() {
  clearTimeout(expiry)
  pending = null
  stopWatching?.()
  stopWatching = undefined
}

function watchAuthBoundary() {
  if (typeof window === 'undefined') return
  const check = () => {
    if (
      pending &&
      (!isAuthSessionCurrent(pending.generation) ||
        authTokenIdentity(getAccessToken()) !== pending.identity)
    )
      clear()
  }
  const storage = (event: StorageEvent) => {
    // Read the event itself: another tab may have finished logging back in before delivery.
    if (event.key === null || event.key === 'pawpong:logout-pending') clear()
    else check()
  }
  window.addEventListener('storage', storage)
  window.addEventListener(AUTH_STATE_CHANGED, check)
  window.addEventListener('focus', check)
  window.addEventListener('pageshow', check)
  stopWatching = () => {
    window.removeEventListener('storage', storage)
    window.removeEventListener(AUTH_STATE_CHANGED, check)
    window.removeEventListener('focus', check)
    window.removeEventListener('pageshow', check)
  }
}

/** Explicit, one-time in-memory handoff to the signed-in author's new post. */
export function setPendingCommunityCard(file: File) {
  clear()
  const generation = getAuthSessionGeneration()
  const identity = authTokenIdentity(getAccessToken())
  if (!identity || !isAuthSessionCurrent(generation))
    throw new Error('로그인 후 다시 시도해 주세요.')
  if (!file.size || file.type !== 'image/png') throw new Error('완성된 PNG 카드가 필요해요.')
  pending = { file, identity, generation, expiresAt: Date.now() + 5 * 60_000 }
  expiry = setTimeout(clear, 5 * 60_000)
  watchAuthBoundary()
}

export function takePendingCommunityCard(source?: string): File | null {
  const card = pending
  clear()
  if (
    source !== 'memory-card' ||
    !card ||
    card.expiresAt <= Date.now() ||
    !isAuthSessionCurrent(card.generation) ||
    authTokenIdentity(getAccessToken()) !== card.identity
  )
    return null
  return card.file
}
