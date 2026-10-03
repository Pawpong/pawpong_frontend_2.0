import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type { ApiResponseFull, NotificationBulkDeleteFilter } from '@/shared/types'

/** 알림 읽음 처리 */
export const markAsRead = async (notificationId: string) => {
  return apiClient
    .patch<
      ApiResponseFull<{ notificationId: string; isRead: boolean; readAt: string }>
    >(`${API_VERSION}/notification/${notificationId}/read`, undefined, { timeout: 5000 })
    .then((res) => unwrap(res, '알림 읽음 처리에 실패했습니다.'))
}

/** 전체 알림 읽음 처리 */
export const markAllAsRead = async () => {
  return apiClient
    .patch<ApiResponseFull<{ updatedCount: number }>>(`${API_VERSION}/notification/read-all`)
    .then((res) => unwrap(res, '모든 알림 읽음 처리에 실패했습니다.'))
}

/** 알림 삭제 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponseFull<null>>(
    `${API_VERSION}/notification/${notificationId}`,
  )
  unwrapVoid(response, '알림 삭제에 실패했습니다.')
}

/**
 * 페이지에 아직 불러오지 않은 알림까지 지운다. 조건이 없으면 본인 알림함 전체,
 * category를 주면 그 분류만, onlyRead면 읽은 알림만 지운다.
 */
export const deleteAllNotifications = async (filter: NotificationBulkDeleteFilter = {}) => {
  const params: Record<string, unknown> = {}
  if (filter.category) params.category = filter.category
  if (filter.onlyRead) params.onlyRead = true
  const response = await apiClient.delete<ApiResponseFull<{ deletedCount: number }>>(
    `${API_VERSION}/notification`,
    { params },
  )
  return unwrap(response, '알림 전체 삭제에 실패했습니다.')
}
