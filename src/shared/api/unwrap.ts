import type { ApiResponse, ApiResponseFull } from '@/shared/types'

type ApiEnvelope<T> = ApiResponse<T> | ApiResponseFull<T>

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly code?: number,
    public readonly details?: unknown,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export const isApiError = (error: unknown): error is ApiError => error instanceof ApiError

type ApiLikeResponse<T> = {
  status?: number
  data: ApiEnvelope<T>
}

function getErrorMessage<T>(data: ApiEnvelope<T>, fallbackMessage?: string) {
  const errorMessage = 'error' in data ? data.error : undefined
  return errorMessage ?? data.message ?? fallbackMessage ?? 'API 요청에 실패했습니다.'
}

export function createApiError<T>(
  response: ApiLikeResponse<T>,
  fallbackMessage?: string,
  details?: unknown,
) {
  return new ApiError(
    getErrorMessage(response.data, fallbackMessage),
    response.status,
    'code' in response.data ? response.data.code : undefined,
    details ?? response.data,
  )
}

export function normalizeApiError(error: unknown, fallbackMessage?: string): ApiError {
  if (isApiError(error)) return error
  if (error instanceof Error)
    return new ApiError(error.message || fallbackMessage || 'API 요청에 실패했습니다.')
  return new ApiError(fallbackMessage ?? 'API 요청에 실패했습니다.')
}

/**
 * 표준 API 응답 래퍼를 벗겨 data를 반환합니다.
 * success가 false이거나 data가 비어 있으면 ApiError를 던집니다.
 */
export function unwrap<T>(response: ApiLikeResponse<T>, fallbackMessage?: string): T {
  const { success, data } = response.data
  if (!success || data === undefined || data === null) {
    throw createApiError(response, fallbackMessage)
  }
  return data
}

/**
 * success만 검증하고 data는 null을 허용합니다.
 */
export function unwrapNullable<T>(response: ApiLikeResponse<T | null>, fallbackMessage?: string) {
  if (!response.data.success) {
    throw createApiError(response, fallbackMessage)
  }
  return response.data.data ?? null
}

/**
 * success만 검증하고 반환값이 필요 없는 API에서 사용합니다.
 */
export function unwrapVoid(response: ApiLikeResponse<unknown>, fallbackMessage?: string): void {
  if (!response.data.success) {
    throw createApiError(response, fallbackMessage)
  }
}
