import { apiClient, API_VERSION, unwrap, type ApiRequestConfig } from '@/shared/api'
import { getAccessToken } from '@/shared/api/token'
import { ApiError } from '@/shared/api/unwrap'
import {
  getAuthReadSession,
  isAuthReadSessionCurrent,
  type AuthReadSession,
} from '@/shared/lib/authReadSession'
import { notifyAuthStateChanged } from '@/shared/lib/authStateEvents'
import { refreshAuthSession } from '@/shared/lib/authSessionRecovery'
import type {
  ApiResponseFull,
  NotificationListFilter,
  NotificationResponseDto,
  PaginationResponse,
} from '@/shared/types'

/** 알림 목록 조회 */
export const getNotifications = async (
  page = 1,
  limit = 20,
  filter: NotificationListFilter = {},
): Promise<PaginationResponse<NotificationResponseDto>> => {
  const params: Record<string, unknown> = { pageNumber: page, itemsPerPage: limit }
  if (filter.isRead !== undefined) params.isRead = filter.isRead
  if (filter.category) params.category = filter.category
  return apiClient
    .get<
      ApiResponseFull<PaginationResponse<NotificationResponseDto>>
    >(`${API_VERSION}/notification`, { params })
    .then((res) => unwrap(res, '알림 목록 조회에 실패했습니다.'))
}

/** 읽지 않은 알림 수 조회 */
export const getUnreadCount = async (
  session: AuthReadSession | null = getAuthReadSession(),
  signal?: AbortSignal,
): Promise<number> => {
  if (!session) throw new ApiError('로그인이 필요합니다.', 401)
  const assertCurrent = () => {
    if (!isAuthReadSessionCurrent(session)) {
      notifyAuthStateChanged()
      throw new ApiError('알림을 조회하는 계정이 변경되었습니다.', 401)
    }
  }
  const read = async () => {
    assertCurrent()
    const config: ApiRequestConfig = {
      signal,
      headers: { Authorization: `Bearer ${getAccessToken()}` },
      skipAuth: true,
      skipAuthRefresh: true,
    }
    const res = await apiClient.get<ApiResponseFull<{ unreadCount: number }>>(
      `${API_VERSION}/notification/unread-count`,
      config,
    )
    assertCurrent()
    const count = unwrap(res, '읽지 않은 알림 수를 불러오는데 실패했습니다.').unreadCount
    if (!Number.isSafeInteger(count) || count < 0)
      throw new ApiError('알림 개수를 확인하지 못했습니다.', 502)
    return count
  }
  try {
    return await read()
  } catch (error) {
    assertCurrent()
    if (!(error instanceof ApiError) || error.status !== 401 || signal?.aborted) throw error
    await refreshAuthSession()
    assertCurrent()
    return read()
  }
}
