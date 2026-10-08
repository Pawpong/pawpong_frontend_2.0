import { createQuery, createInfiniteQuery, STALE_TIME } from '@/shared/api'
import type { NotificationListFilter, NotificationResponseDto } from '@/shared/types'
import { getNotifications, getUnreadCount } from './notification.api'
import { getAuthReadSession } from '@/shared/lib/authReadSession'

export const notificationQueries = {
  all: () => ['notification'] as const,

  list: (filter: NotificationListFilter = {}, limit = 20) =>
    createInfiniteQuery<NotificationResponseDto>({
      queryKey: [...notificationQueries.all(), 'list', filter.isRead, filter.category, limit],
      queryFn: (page) => getNotifications(page, limit, filter),
      staleTime: STALE_TIME.REALTIME,
    }),

  unreadCount: () => {
    const session = getAuthReadSession()
    const options = createQuery({
      queryKey: [...notificationQueries.all(), 'unread-count', session?.scope ?? 'guest'],
      queryFn: () => getUnreadCount(session),
      enabled: Boolean(session),
      staleTime: STALE_TIME.REALTIME,
    })
    return {
      ...options,
      queryFn: ({ signal }: { signal: AbortSignal }) => getUnreadCount(session, signal),
    }
  },
}
