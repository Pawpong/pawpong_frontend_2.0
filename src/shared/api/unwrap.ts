import type { ApiResponse } from '@/shared/types'

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

/**
 * ApiResponse 래퍼를 벗겨 data를 반환합니다.
 * success가 false이거나 data가 없으면 ApiError를 던집니다.
 *
 * @example
 * const data = await apiClient.get<ApiResponse<User>>('/api/user').then(unwrap);
 */
export function unwrap<T>(response: { data: ApiResponse<T> }): T {
  const { success, data, message } = response.data
  if (!success || data === undefined || data === null) {
    throw new ApiError(message ?? 'API 요청에 실패했습니다.')
  }
  return data
}
