import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiRequestConfig } from '@/shared/api'
import type { ApiResponse } from '@/shared/types'

export const logout = async (): Promise<{ message: string; loggedOutAt: string }> => {
  try {
    // 토큰이 만료돼도 refresh로 세션을 되살리지 않도록 로그아웃 요청은 자동 갱신을 건너뛴다.
    const response = await apiClient.post<ApiResponse<{ message: string; loggedOutAt: string }>>(
      `${API_VERSION}/auth/logout`,
      undefined,
      { skipAuthRefresh: true } as ApiRequestConfig,
    )
    await fetch('/api/auth/clear-cookie', { method: 'POST' })
    return unwrap(response, '로그아웃에 실패했습니다.')
  } catch (error) {
    await fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(() => {})
    throw error
  }
}
