import { apiClient, API_VERSION, unwrap, withAuthReadSession } from '@/shared/api'
import { ApiError } from '@/shared/api/unwrap'
import { getAuthReadSession, type AuthReadSession } from '@/shared/lib/authReadSession'
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
  return withAuthReadSession(
    async (config) => {
      const res = await apiClient.get<ApiResponseFull<{ unreadCount: number }>>(
        `${API_VERSION}/notification/unread-count`,
        config,
      )
      const count = unwrap(res, '읽지 않은 알림 수를 불러오는데 실패했습니다.').unreadCount
      if (!Number.isSafeInteger(count) || count < 0)
        throw new ApiError('알림 개수를 확인하지 못했습니다.', 502)
      return count
    },
    session,
    signal,
  )
}
