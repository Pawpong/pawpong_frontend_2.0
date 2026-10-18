import { ApiError, getAccessToken, type ApiRequestConfig } from '@/shared/api'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import { authTokenIdentity } from '@/shared/lib/authTokenIdentity'

export function captureCommunityWriteSession(signal?: AbortSignal) {
  const token = getAccessToken()
  const identity = authTokenIdentity(token)
  const generation = getAuthSessionGeneration()
  const assertCurrent = () => {
    if (
      signal?.aborted ||
      !token ||
      identity !== authTokenIdentity(getAccessToken()) ||
      !isAuthSessionCurrent(generation)
    )
      throw new ApiError(
        '로그인 또는 화면 상태가 변경됐어요. 최신 상태에서 다시 확인해 주세요.',
        401,
      )
  }
  assertCurrent()
  return assertCurrent
}

export function communityWriteRequestOptions(
  signal?: AbortSignal,
  skipAuthRefresh = true,
): ApiRequestConfig {
  return { signal, timeout: 30_000, skipAuthRefresh }
}
