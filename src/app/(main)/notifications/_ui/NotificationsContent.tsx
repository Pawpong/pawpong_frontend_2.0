'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { NotificationListItem, notificationQueries } from '@/entities/notification'
import { useDeleteNotification, useMarkAllAsRead, useMarkAsRead } from '@/features/notification'
import type { NotificationResponseDto } from '@/shared/types'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import { Container, InfiniteScrollTrigger, ListState, NavigationBar } from '@/shared/ui'

const NotificationsContent = () => {
  const router = useRouter()
  const { data: unreadCount = 0 } = useQuery(notificationQueries.unreadCount())
  const { data, isPending, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...notificationQueries.list(),
      refetchOnMount: 'always',
      throwOnError: false,
    })
  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()
  const { mutate: deleteNotification } = useDeleteNotification()

  const notifications = useMemo(
    () => dedupeBy(flattenPages(data), (item) => item.notificationId),
    [data],
  )

  const handleSelect = (item: NotificationResponseDto) => {
    if (!item.isRead) markAsRead(item.notificationId)
    if (item.targetUrl?.startsWith('/')) router.push(item.targetUrl)
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar title="알림" backHref="/home" />

      <Container className="py-5 tab:py-8 pc:max-w-[52rem] pc:py-10">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-neutral-700">
            읽지 않은 알림 <strong className="text-primary-500">{unreadCount}</strong>개
          </p>
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={() => markAllAsRead()}
              disabled={isMarkingAll}
              className="rounded-full border border-primary-200 px-3 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50 disabled:opacity-50"
            >
              모두 읽음
            </button>
          )}
        </div>

        <ListState
          isPending={isPending}
          isError={isError}
          isEmpty={notifications.length === 0}
          loadingText="알림을 불러오는 중입니다."
          errorText="알림을 불러오지 못했습니다."
          emptyText="아직 도착한 알림이 없습니다."
        >
          <div className="flex flex-col gap-2">
            {notifications.map((item) => (
              <NotificationListItem
                key={item.notificationId}
                item={item}
                onSelect={handleSelect}
                onDelete={deleteNotification}
              />
            ))}
            <InfiniteScrollTrigger
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onIntersect={() => void fetchNextPage()}
            />
          </div>
        </ListState>
      </Container>
    </div>
  )
}

export { NotificationsContent }
