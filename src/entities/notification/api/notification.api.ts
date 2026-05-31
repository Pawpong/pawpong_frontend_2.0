import { apiClient, API_VERSION, unwrap } from '@/shared/api'
import type { ApiResponseFull, NotificationResponseDto, PaginationResponse } from '@/shared/types'

/** 알림 목록 조회 */
export const getNotifications = async (
  page = 1,
  limit = 20,
  isRead?: boolean,
): Promise<PaginationResponse<NotificationResponseDto>> => {
  const params: Record<string, unknown> = { page, limit }
  if (isRead !== undefined) params.isRead = isRead
  return apiClient
    .get<
      ApiResponseFull<PaginationResponse<NotificationResponseDto>>
    >(`${API_VERSION}/notification`, { params })
    .then((res) => unwrap(res, '알림 목록 조회에 실패했습니다.'))
}

/** 읽지 않은 알림 수 조회 */
export const getUnreadCount = async (): Promise<number> => {
  return apiClient
    .get<ApiResponseFull<{ unreadCount: number }>>(`${API_VERSION}/notification/unread-count`)
    .then((res) => unwrap(res, '읽지 않은 알림 수를 불러오는데 실패했습니다.').unreadCount)
}
