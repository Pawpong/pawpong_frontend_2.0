import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { NotificationResponseDto } from '@/shared/types'
import { getNotifications, getUnreadCount } from './Api'

export const notificationQueries = {
  all: () => ['notification'] as const,

  list: (isRead?: boolean, limit = 20) =>
    createInfiniteQuery<NotificationResponseDto>({
      queryKey: [...notificationQueries.all(), 'list', isRead, limit],
      queryFn: (page) => getNotifications(page, limit, isRead),
      staleTime: STALE_TIME.REALTIME,
    }),

  unreadCount: () =>
    createQuery({
      queryKey: [...notificationQueries.all(), 'unread-count'],
      queryFn: getUnreadCount,
      staleTime: STALE_TIME.REALTIME,
    }),
}
