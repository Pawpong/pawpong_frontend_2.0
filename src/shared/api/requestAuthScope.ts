import { getAccessToken } from './token'
import { authTokenIdentity } from '../lib/authTokenIdentity'
import { getAuthSessionGeneration } from '../lib/authSessionLifecycle'

/** 토큰은 클로저에만 두고 Axios 설정에는 계정 확인 동작만 전달한다. */
export function captureRequestAuthScope(token: string | null) {
  const generation = getAuthSessionGeneration()
  let identity = authTokenIdentity(token)
  return {
    isCurrent: () =>
      generation === getAuthSessionGeneration() && identity === authTokenIdentity(getAccessToken()),
    acceptRefresh: (accessToken: string) => {
      const nextIdentity = authTokenIdentity(accessToken)
      if (
        generation !== getAuthSessionGeneration() ||
        accessToken !== getAccessToken() ||
        (identity !== null && nextIdentity !== identity)
      )
        return false
      identity = nextIdentity
      return true
    },
  }
}
