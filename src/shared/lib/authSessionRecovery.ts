import { getAccessToken } from '@/shared/api/token'
import { ApiError } from '@/shared/api/unwrap'
import { notifyAuthStateChanged } from './authStateEvents'
import {
  getAuthSessionGeneration,
  finishAuthCookieClear,
  isAuthSessionCurrent,
  trackAuthCookieWrite,
} from './authSessionLifecycle'

let refresh: { generation: number; promise: Promise<string> } | null = null
let anonymousGeneration: number | null = null

/** WebView가 오프라인이어도 인증 작업이 끝없이 대기하지 않게 한다. */
async function authFetch<T>(
  path: string,
  options: RequestInit,
  readResponse: (response: Response) => Promise<T>,
): Promise<T> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 10_000)
  try {
    const response = await fetch(path, {
      ...options,
      credentials: 'include',
      signal: controller.signal,
    })
    return await readResponse(response)
  } finally {
    clearTimeout(timeout)
  }
}

/** 서버 통신이 실패해도 JS가 읽는 로그인 상태는 즉시 제거한다. */
export async function clearAuthCookies(): Promise<void> {
  const generation = getAuthSessionGeneration()
  document.cookie = 'accessToken=; path=/; max-age=0'
  document.cookie = 'userRole=; path=/; max-age=0'
  // 이전 운영 Domain 쿠키도 남아 있으면 getAccessToken이 다시 읽을 수 있다.
  if (/^(www\.)?pawpong\.kr$/.test(window.location.hostname)) {
    document.cookie = 'accessToken=; path=/; domain=.pawpong.kr; max-age=0; secure'
    document.cookie = 'userRole=; path=/; domain=.pawpong.kr; max-age=0; secure'
  }
  const response = await trackAuthCookieWrite(
    authFetch('/api/auth/clear-cookie', { method: 'POST' }, async (response) => response),
  ).catch(() => null)
  if (response?.ok && generation === getAuthSessionGeneration()) finishAuthCookieClear()
  notifyAuthStateChanged()
}

/** API 401, 앱 복귀, 로그인 화면이 하나의 refresh 요청과 쿠키 저장을 공유한다. */
export function refreshAuthSession(): Promise<string> {
  const generation = getAuthSessionGeneration()
  if (!isAuthSessionCurrent(generation))
    return Promise.reject(new ApiError('인증 세션이 변경되었습니다.', 401))
  if (refresh?.generation === generation) return refresh.promise

  const promise = (async () => {
    try {
      const { response, data } = await authFetch(
        '/api/auth/refresh',
        { method: 'POST' },
        async (response) => ({
          response,
          data: (response.ok ? await response.json() : null) as {
            success?: boolean
            data?: { accessToken?: string; refreshToken?: string }
          } | null,
        }),
      )
      if (!isAuthSessionCurrent(generation)) throw new ApiError('인증 세션이 변경되었습니다.', 401)
      if (response.status === 401) {
        anonymousGeneration = generation
        await clearAuthCookies()
        throw new ApiError('세션이 만료되었습니다. 다시 로그인해주세요.', 401)
      }
      if (!response.ok) throw new ApiError('로그인 상태를 확인하지 못했습니다.', response.status)
      const accessToken = data?.data?.accessToken
      const refreshToken = data?.data?.refreshToken
      if (!data?.success || typeof accessToken !== 'string' || typeof refreshToken !== 'string')
        throw new ApiError('로그인 상태를 확인하지 못했습니다.', 503)
      if (!isAuthSessionCurrent(generation)) throw new ApiError('인증 세션이 변경되었습니다.', 401)
      const saved = await trackAuthCookieWrite(
        authFetch(
          '/api/auth/set-cookie',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accessToken, refreshToken }),
          },
          async (response) => response,
        ),
      )
      if (!isAuthSessionCurrent(generation)) throw new ApiError('인증 세션이 변경되었습니다.', 401)
      if (!saved.ok || !accessToken || getAccessToken() !== accessToken)
        throw new ApiError('로그인 정보를 저장하지 못했습니다.', 503)
      anonymousGeneration = null
      notifyAuthStateChanged()
      return accessToken
    } catch (error) {
      // 통신 장애·5xx·쿠키 저장 장애는 refreshToken이 무효라는 증거가 아니다.
      if (error instanceof ApiError) throw error
      throw new ApiError('연결을 확인한 뒤 다시 시도해주세요.', 503)
    }
  })()
  refresh = { generation, promise }
  const release = () => {
    if (refresh?.promise === promise) refresh = null
  }
  void promise.then(release, release)
  return promise
}

/** refresh 쿠키는 HttpOnly이므로 토큰이 사라졌을 때 BFF에서 세션 존재를 확인한다. */
export async function restoreAuthSession(): Promise<string | null> {
  const generation = getAuthSessionGeneration()
  if (!isAuthSessionCurrent(generation)) return null
  const token = getAccessToken()
  if (token) return token
  if (anonymousGeneration === generation) return null
  try {
    return await refreshAuthSession()
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) return null
    throw error
  }
}
