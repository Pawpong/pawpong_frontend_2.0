import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import { ApiError, normalizeApiError } from './unwrap'
import { getAccessToken } from './token'
import { notifyAuthStateChanged } from '@/shared/lib/authStateEvents'

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  /**
   * 401 응답 시 자동 토큰 refresh(→ set-cookie 재로그인)를 건너뛴다.
   * 로그아웃처럼 "세션을 되살리면 안 되는" 요청에서 사용한다.
   */
  skipAuthRefresh?: boolean
}

const getBaseURL = () => (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/+$/, '')

let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (reason?: unknown) => void
}> = []

const processQueue = (error: Error | null) => {
  failedQueue.forEach((prom) => (error ? prom.reject(error) : prom.resolve()))
  failedQueue = []
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: getBaseURL(),
    withCredentials: true,
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    timeout: 30000,
  })

  instance.interceptors.request.use((config) => {
    // FormData(멀티파트) 업로드는 axios 기본 JSON Content-Type을 제거해
    // 브라우저가 `multipart/form-data; boundary=...`를 직접 설정하도록 한다.
    // 제거하지 않으면 axios가 FormData를 JSON으로 직렬화해 File이 {}로 깨진다.
    if (typeof FormData !== 'undefined' && config.data instanceof FormData) {
      config.headers.delete('Content-Type')
    }

    if ((config as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth) return config

    const accessToken = getAccessToken()
    if (accessToken && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${accessToken}`
    }
    return config
  })

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = (error.config ?? {}) as InternalAxiosRequestConfig & {
        _retry?: boolean
        skipAuth?: boolean
        skipAuthRefresh?: boolean
      }

      const errorData = error.response?.data
      const errorMessage =
        errorData && typeof errorData === 'object'
          ? ((errorData as { message?: string; error?: string }).message ??
            (errorData as { message?: string; error?: string }).error ??
            '')
          : ''

      if (errorMessage.includes('탈퇴')) {
        return Promise.reject(
          new ApiError(errorMessage, error.response?.status, undefined, errorData),
        )
      }

      // 로그아웃 등 세션 복구를 원치 않는 요청은 refresh 인터셉터를 타지 않고 그대로 실패시킨다.
      if (error.response?.status === 401 && originalRequest.skipAuthRefresh) {
        return Promise.reject(new ApiError(errorMessage || '인증이 필요합니다.', 401))
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          return Promise.reject(new ApiError('세션이 만료되었습니다. 다시 로그인해주세요.', 401))
        }

        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject })
          })
            .then(() => instance(originalRequest))
            .catch((err) => Promise.reject(err))
        }

        originalRequest._retry = true
        isRefreshing = true

        try {
          const refreshResponse = await fetch('/api/auth/refresh', {
            method: 'POST',
            credentials: 'include',
          })

          const refreshData = (await refreshResponse.json()) as {
            success: boolean
            data?: { accessToken: string; refreshToken: string }
          }

          if (!refreshResponse.ok || !refreshData.success) {
            throw new ApiError('토큰 갱신 실패', refreshResponse.status, undefined, refreshData)
          }

          if (refreshData.data?.accessToken && refreshData.data?.refreshToken) {
            const saved = await fetch('/api/auth/set-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: refreshData.data.accessToken,
                refreshToken: refreshData.data.refreshToken,
              }),
            })
            if (!saved.ok) throw new ApiError('인증 쿠키 저장 실패', 401)
          }

          if (!refreshData.data?.accessToken || getAccessToken() !== refreshData.data.accessToken) {
            throw new ApiError('인증 쿠키 저장 실패', 401)
          }
          notifyAuthStateChanged()
          processQueue(null)
          return instance(originalRequest)
        } catch (refreshError) {
          processQueue(
            normalizeApiError(refreshError, '세션이 만료되었습니다. 다시 로그인해주세요.'),
          )

          if (typeof window !== 'undefined') {
            // 무효 토큰이 남아 재-401 → /login 무한 루프에 빠지지 않도록 클라이언트 쿠키를 즉시 동기 제거한다.
            // (httpOnly=false 인 accessToken/userRole 은 JS 로 지울 수 있고, isLoggedIn 판정이 이 쿠키에 의존한다)
            document.cookie = 'accessToken=; path=/; max-age=0'
            document.cookie = 'userRole=; path=/; max-age=0'
            // refreshToken(httpOnly)은 서버 라우트로만 제거 가능 — 네비게이션이 요청을 끊지 않도록 완료를 기다린다.
            await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
            notifyAuthStateChanged()
            try {
              localStorage.removeItem('auth-storage')
            } catch {
              // ignore
            }

            if (!window.location.pathname.startsWith('/login')) {
              // href 할당(=history push) 대신 replace 로 이동해 /login 이 히스토리에 중복 축적되는 것을 막는다.
              // (여러 번 401 이 나도 뒤로가기가 /login 사이를 맴도는 트랩 방지 + 로그인 후 원래 위치로 복귀)
              const returnUrl = encodeURIComponent(
                window.location.pathname + window.location.search,
              )
              window.location.replace(`/login?returnUrl=${returnUrl}`)
            }
          }

          return Promise.reject(new ApiError('세션이 만료되었습니다. 다시 로그인해주세요.', 401))
        } finally {
          isRefreshing = false
        }
      }

      const message =
        (errorData && typeof errorData === 'object'
          ? ((errorData as { message?: string; error?: string }).error ??
            (errorData as { message?: string; error?: string }).message)
          : undefined) ??
        error.message ??
        'Unknown error'

      return Promise.reject(new ApiError(message, error.response?.status, undefined, errorData))
    },
  )

  return instance
}

export const apiClient = createApiClient()

/** 외부 API 버전 prefix */
export const API_VERSION = '/api/v2' as const
