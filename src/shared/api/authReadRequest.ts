import type { ApiRequestConfig } from './client'
import { getAccessToken } from './token'
import { ApiError } from './unwrap'
import {
  getAuthReadSession,
  isAuthReadSessionCurrent,
  type AuthReadSession,
} from '../lib/authReadSession'
import { notifyAuthStateChanged } from '../lib/authStateEvents'
import { refreshAuthSession } from '../lib/authSessionRecovery'

/** 읽기 전용 요청만 사용함. 이전 계정의 결과와 401 갱신을 새 계정에 적용하지 않음. */
export async function withAuthReadSession<T>(
  read: (config: ApiRequestConfig) => Promise<T>,
  session: AuthReadSession | null = getAuthReadSession(),
  signal?: AbortSignal,
): Promise<T> {
  if (!session) throw new ApiError('로그인이 필요합니다.', 401)
  const assertCurrent = () => {
    if (!isAuthReadSessionCurrent(session)) {
      notifyAuthStateChanged()
      throw new ApiError('조회하는 계정이 변경되었습니다.', 401)
    }
    if (signal?.aborted) throw signal.reason ?? new DOMException('조회가 취소되었습니다.', 'AbortError')
  }
  const request = async () => {
    assertCurrent()
    const result = await read({
      signal,
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      skipAuth: true,
      skipAuthRefresh: true,
    })
    assertCurrent()
    return result
  }
  try {
    return await request()
  } catch (error) {
    assertCurrent()
    if (!(error instanceof ApiError) || error.status !== 401 || signal?.aborted) throw error
    await refreshAuthSession()
    assertCurrent()
    return request()
  }
}
