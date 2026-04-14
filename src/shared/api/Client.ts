import axios, {
  AxiosError,
  AxiosInstance,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'

export interface ApiRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean
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
    if ((config as InternalAxiosRequestConfig & { skipAuth?: boolean }).skipAuth) return config

    if (typeof window !== 'undefined') {
      const cookies = document.cookie.split(';').reduce(
        (acc, cookie) => {
          const [key, value] = cookie.trim().split('=')
          acc[key] = value
          return acc
        },
        {} as Record<string, string>,
      )

      const accessToken = cookies['accessToken']
      if (accessToken && !config.headers['Authorization']) {
        config.headers['Authorization'] = `Bearer ${accessToken}`
      }
    }
    return config
  })

  instance.interceptors.response.use(
    (res) => res,
    async (error: AxiosError) => {
      const originalRequest = error.config as InternalAxiosRequestConfig & {
        _retry?: boolean
        skipAuth?: boolean
      }

      const errorData = error.response?.data
      const errorMessage =
        errorData && typeof errorData === 'object'
          ? ((errorData as { message?: string; error?: string }).message ??
            (errorData as { message?: string; error?: string }).error ??
            '')
          : ''

      if (errorMessage.includes('탈퇴')) {
        return Promise.reject(new Error(errorMessage))
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (originalRequest.url?.includes('/api/auth/refresh')) {
          return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'))
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
            throw new Error('토큰 갱신 실패')
          }

          if (refreshData.data?.accessToken && refreshData.data?.refreshToken) {
            await fetch('/api/auth/set-cookie', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                accessToken: refreshData.data.accessToken,
                refreshToken: refreshData.data.refreshToken,
              }),
            })
          }

          processQueue(null)
          return instance(originalRequest)
        } catch (refreshError) {
          processQueue(refreshError as Error)

          if (typeof window !== 'undefined') {
            fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
            try {
              localStorage.removeItem('auth-storage')
            } catch {
              // ignore
            }

            if (!window.location.pathname.startsWith('/login')) {
              window.location.href = '/login'
            }
          }

          return Promise.reject(new Error('세션이 만료되었습니다. 다시 로그인해주세요.'))
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

      return Promise.reject(new Error(message))
    },
  )

  return instance
}

export const apiClient = createApiClient()
