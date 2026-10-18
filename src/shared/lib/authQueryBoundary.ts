import type { QueryClient } from '@tanstack/react-query'
import { getAuthSessionGeneration } from './authSessionLifecycle'
import { getAccessToken } from '@/shared/api/token'
import { authTokenIdentity } from './authTokenIdentity'

/** 계정 세대나 작성자가 바뀌면 이전 조회와 늦은 응답을 폐기함. */
export function createAuthQueryBoundary(
  client: QueryClient,
  readGeneration = getAuthSessionGeneration,
  readToken = getAccessToken,
) {
  let generation = readGeneration()
  let identity = authTokenIdentity(readToken())
  return () => {
    const next = readGeneration()
    const nextIdentity = authTokenIdentity(readToken())
    if (generation === next && identity === nextIdentity) return
    generation = next
    identity = nextIdentity
    client.removeQueries({ type: 'inactive' })
    void client.resetQueries({ type: 'active' }, { cancelRefetch: true })
  }
}
