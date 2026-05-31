import { apiClient, API_VERSION, unwrap, unwrapVoid } from '@/shared/api'
import type { ApiResponseFull } from '@/shared/types'

/** 알림 읽음 처리 */
export const markAsRead = async (notificationId: string) => {
  return apiClient
    .patch<
      ApiResponseFull<{ notificationId: string; isRead: boolean; readAt: string }>
    >(`${API_VERSION}/notification/${notificationId}/read`)
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
