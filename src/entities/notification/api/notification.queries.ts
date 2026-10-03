import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { NotificationListFilter, NotificationResponseDto } from '@/shared/types'
import { getNotifications, getUnreadCount } from './notification.api'

export const notificationQueries = {
  all: () => ['notification'] as const,

  list: (filter: NotificationListFilter = {}, limit = 20) =>
    createInfiniteQuery<NotificationResponseDto>({
      queryKey: [...notificationQueries.all(), 'list', filter.isRead, filter.category, limit],
      queryFn: (page) => getNotifications(page, limit, filter),
      staleTime: STALE_TIME.REALTIME,
    }),

  unreadCount: () =>
    createQuery({
      queryKey: [...notificationQueries.all(), 'unread-count'],
      queryFn: getUnreadCount,
      staleTime: STALE_TIME.REALTIME,
    }),
}
