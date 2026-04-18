import { apiClient, unwrap, unwrapVoid } from '@/shared/api'
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
    .get<ApiResponseFull<PaginationResponse<NotificationResponseDto>>>('/api/notification', {
      params,
    })
    .then((res) => unwrap(res, '알림 목록 조회에 실패했습니다.'))
}

/** 읽지 않은 알림 수 조회 */
export const getUnreadCount = async (): Promise<number> => {
  return apiClient
    .get<ApiResponseFull<{ unreadCount: number }>>('/api/notification/unread-count')
    .then((res) => unwrap(res, '읽지 않은 알림 수를 불러오는데 실패했습니다.').unreadCount)
}

/** 알림 읽음 처리 */
export const markAsRead = async (notificationId: string) => {
  return apiClient
    .patch<
      ApiResponseFull<{ notificationId: string; isRead: boolean; readAt: string }>
    >(`/api/notification/${notificationId}/read`)
    .then((res) => unwrap(res, '알림 읽음 처리에 실패했습니다.'))
}

/** 전체 알림 읽음 처리 */
export const markAllAsRead = async () => {
  return apiClient
    .patch<ApiResponseFull<{ updatedCount: number }>>('/api/notification/read-all')
    .then((res) => unwrap(res, '모든 알림 읽음 처리에 실패했습니다.'))
}

/** 알림 삭제 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponseFull<null>>(
    `/api/notification/${notificationId}`,
  )
  unwrapVoid(response, '알림 삭제에 실패했습니다.')
}
