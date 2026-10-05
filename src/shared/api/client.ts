import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import { ApiError } from './unwrap'
import { getAccessToken } from './token'
import { getAuthSessionGeneration, isAuthSessionCurrent } from '@/shared/lib/authSessionLifecycle'
import { refreshAuthSession } from '@/shared/lib/authSessionRecovery'
import { getApiBaseUrl } from '@/shared/config/apiBaseUrl'
import { API_DIAGNOSTIC_ROUTES } from '@/shared/config/apiDiagnosticRoutes'

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
  /**
   * 401 응답 시 자동 토큰 refresh(→ set-cookie 재로그인)를 건너뛴다.
   * 로그아웃처럼 "세션을 되살리면 안 되는" 요청에서 사용한다.
   */
  skipAuthRefresh?: boolean
}

const setAuthorizationHeader = (config: InternalAxiosRequestConfig, accessToken: string) => {
  config.headers['Authorization'] = `Bearer ${accessToken}`
}

/** 운영 오류에서 어느 API가 실패했는지 확인하되 개인정보는 수집하지 않는다. */
const requestDiagnostics = (error: AxiosError) => {
  let endpoint = '/unknown'
  try {
    const path = new URL(error.config?.url ?? '', 'https://api.invalid').pathname
    const segments = path.split('/')
    // 경로 값이 영문 닉네임이어도 정적 템플릿의 문자열로 대체한다.
    endpoint =
      API_DIAGNOSTIC_ROUTES.find((route) => {
        const template = route.split('/')
        return (
          template.length === segments.length &&
          template.every((segment, index) =>
            segment === ':id' ? Boolean(segments[index]) : segment === segments[index],
          )
        )
      }) ?? '/unknown'
  } catch {
    // 주소 해석 실패가 원래 API 오류를 덮지 않게 한다.
  }
  return {
    method: (error.config?.method ?? 'unknown').toUpperCase(),
    endpoint,
    transportCode: error.code,
  }
}

function createApiClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: getApiBaseUrl(),
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
        const generation = getAuthSessionGeneration()
        if (!isAuthSessionCurrent(generation))
          return Promise.reject(new ApiError('로그아웃 중입니다.', 401))
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          return Promise.reject(new ApiError('세션이 만료되었습니다. 다시 로그인해주세요.', 401))
        }

        originalRequest._retry = true
        try {
          const accessToken = await refreshAuthSession()
          if (!isAuthSessionCurrent(generation))
            throw new ApiError('인증 세션이 변경되었습니다.', 401)
          setAuthorizationHeader(originalRequest, accessToken)
          return instance(originalRequest)
        } catch (refreshError) {
          if (!isAuthSessionCurrent(generation)) return Promise.reject(refreshError)
          // 오프라인·5xx에서는 세션을 보존한다. refresh가 401로 거절됐을 때만 로그인으로 간다.
          if (
            refreshError instanceof ApiError &&
            refreshError.status === 401 &&
            typeof window !== 'undefined' &&
            !window.location.pathname.startsWith('/login')
          ) {
            const returnUrl = encodeURIComponent(window.location.pathname + window.location.search)
            window.location.replace(`/login?returnUrl=${returnUrl}`)
          }
          return Promise.reject(refreshError)
        }
      }

      const message =
        (errorData && typeof errorData === 'object'
          ? ((errorData as { message?: string; error?: string }).error ??
            (errorData as { message?: string; error?: string }).message)
          : undefined) ??
        error.message ??
        'Unknown error'

      const transportMessage =
        !error.response && ['ECONNABORTED', 'ETIMEDOUT'].includes(error.code ?? '')
          ? '서버 응답이 늦어지고 있어요. 잠시 후 다시 시도해 주세요.'
          : !error.response && error.code === 'ERR_NETWORK'
            ? '네트워크 연결을 확인한 뒤 다시 시도해 주세요.'
            : message

      return Promise.reject(
        new ApiError(
          transportMessage,
          error.response?.status,
          undefined,
          errorData,
          requestDiagnostics(error),
        ),
      )
    },
  )

  return instance
}

export const apiClient = createApiClient()

/** 외부 API 버전 prefix */
export const API_VERSION = '/api/v2' as const
