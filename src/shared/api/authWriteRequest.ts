import type { ApiRequestConfig } from './client'
import { getAccessToken } from './token'
import { ApiError } from './unwrap'
import { AuthWriteRetryRequiredError } from './authWriteRetryRequiredError'
import {
  getAuthReadSession,
  isAuthReadSessionCurrent,
  type AuthReadSession,
} from '../lib/authReadSession'
import { notifyAuthStateChanged } from '../lib/authStateEvents'
import { refreshAuthSession } from '../lib/authSessionRecovery'

/** 쓰기는 한 번만 전송한다. 인증 복구 뒤에도 재실행은 사용자가 직접 선택한다. */
export async function withAuthWriteSession<T>(
  write: (config: ApiRequestConfig) => Promise<T>,
  session: AuthReadSession | null = getAuthReadSession(),
  signal?: AbortSignal,
): Promise<T> {
  if (!session) throw new ApiError('로그인이 필요합니다.', 401)
  const assertCurrent = () => {
    if (!isAuthReadSessionCurrent(session)) {
      notifyAuthStateChanged()
      throw new ApiError('요청하는 계정이 변경되었습니다.', 401)
    }
    if (signal?.aborted)
      throw signal.reason ?? new DOMException('요청이 취소되었습니다.', 'AbortError')
  }
  try {
    assertCurrent()
    const result = await write({
      signal,
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      skipAuth: true,
      skipAuthRefresh: true,
    })
    assertCurrent()
    return result
  } catch (error) {
    assertCurrent()
    if (!(error instanceof ApiError) || error.status !== 401) throw error
    await refreshAuthSession()
    assertCurrent()
    throw new AuthWriteRetryRequiredError()
  }
}
