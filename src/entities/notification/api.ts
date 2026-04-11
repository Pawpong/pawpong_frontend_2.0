import { apiClient } from '@/shared/api'
import type { ApiResponseFull, NotificationResponseDto, PaginationResponse } from '@/shared/types'

/** 알림 목록 조회 */
export const getNotifications = async (
  page = 1,
  limit = 20,
  isRead?: boolean,
): Promise<PaginationResponse<NotificationResponseDto>> => {
  const params: Record<string, unknown> = { page, limit }
  if (isRead !== undefined) params.isRead = isRead
  const response = await apiClient.get<
    ApiResponseFull<PaginationResponse<NotificationResponseDto>>
  >('/api/notification', { params })
  return response.data.data
}

/** 읽지 않은 알림 수 조회 */
export const getUnreadCount = async (): Promise<number> => {
  const response = await apiClient.get<ApiResponseFull<{ unreadCount: number }>>(
    '/api/notification/unread-count',
  )
  if (!response.data.success) {
    throw new Error(response.data.error ?? '읽지 않은 알림 수를 불러오는데 실패했습니다.')
  }
  return response.data.data.unreadCount
}

/** 알림 읽음 처리 */
export const markAsRead = async (notificationId: string) => {
  const response = await apiClient.patch<
    ApiResponseFull<{ notificationId: string; isRead: boolean; readAt: string }>
  >(`/api/notification/${notificationId}/read`)
  if (!response.data.success) {
    throw new Error(response.data.error ?? '알림 읽음 처리에 실패했습니다.')
  }
  return response.data.data
}

/** 전체 알림 읽음 처리 */
export const markAllAsRead = async () => {
  const response = await apiClient.patch<ApiResponseFull<{ updatedCount: number }>>(
    '/api/notification/read-all',
  )
  if (!response.data.success) {
    throw new Error(response.data.error ?? '모든 알림 읽음 처리에 실패했습니다.')
  }
  return response.data.data
}

/** 알림 삭제 */
export const deleteNotification = async (notificationId: string): Promise<void> => {
  const response = await apiClient.delete<ApiResponseFull<null>>(
    `/api/notification/${notificationId}`,
  )
  if (!response.data.success) {
    throw new Error(response.data.error ?? '알림 삭제에 실패했습니다.')
  }
}
