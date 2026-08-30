'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import { NotificationListItem, notificationQueries } from '@/entities/notification'
import { useDeleteNotification, useMarkAllAsRead, useMarkAsRead } from '@/features/notification'
import { PawIcon } from '@/shared/assets'
import type { NotificationResponseDto } from '@/shared/types'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import {
  Button,
  Container,
  DeleteConfirmModal,
  InfiniteScrollTrigger,
  ListState,
  NavigationBar,
} from '@/shared/ui'

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
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification()
  const [deleteTarget, setDeleteTarget] = useState<NotificationResponseDto | null>(null)

  const notifications = useMemo(
    () => dedupeBy(flattenPages(data), (item) => item.notificationId),
    [data],
  )

  const handleSelect = (item: NotificationResponseDto) => {
    if (!item.isRead) markAsRead(item.notificationId)
    if (item.targetUrl?.startsWith('/')) router.push(item.targetUrl)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget) return
    deleteNotification(deleteTarget.notificationId, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <div className="flex w-full flex-1 flex-col bg-primary-50/20 pb-16">
      <NavigationBar title="알림" backHref="/home" />

      <Container className="py-5 tab:py-8 pc:py-10">
        <div className="mx-auto w-full tab:max-w-[59.25rem]">
          <div className="mb-4 flex min-h-14 items-center justify-between gap-4 rounded-xl bg-primary-50 px-4 py-3 tab:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-primary-500 shadow-[0_3px_12px_rgba(73,45,20,0.08)]">
                <PawIcon className="size-5" />
              </span>
              <p className="truncate text-sm font-medium text-neutral-700 tab:text-base">
                읽지 않은 알림{' '}
                <strong className="font-semibold text-primary-600">{unreadCount}</strong>개
              </p>
            </div>
            {unreadCount > 0 && (
              <Button
                variant="text"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll}
                className="h-8 shrink-0 px-3 text-xs text-primary-600 hover:bg-white tab:text-sm"
              >
                모두 읽기
              </Button>
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
            <div className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
              <div className="flex flex-col divide-y divide-neutral-150">
                {notifications.map((item) => (
                  <NotificationListItem
                    key={item.notificationId}
                    item={item}
                    onSelect={handleSelect}
                    onDelete={setDeleteTarget}
                  />
                ))}
              </div>
              <InfiniteScrollTrigger
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onIntersect={() => void fetchNextPage()}
              />
            </div>
          </ListState>
        </div>
      </Container>

      <DeleteConfirmModal
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        target="알림"
        onConfirm={handleConfirmDelete}
        isPending={isDeleting}
      />
    </div>
  )
}

export { NotificationsContent }
