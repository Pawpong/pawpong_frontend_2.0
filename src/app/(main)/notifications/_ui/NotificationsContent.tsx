'use client'

import { useMemo, useState } from 'react'
import { useInfiniteQuery, useQuery } from '@tanstack/react-query'
import {
  NOTIFICATION_CATEGORY_OPTIONS,
  NotificationListItem,
  notificationCategoryLabel,
  notificationQueries,
} from '@/entities/notification'
import {
  useDeleteAllNotifications,
  useDeleteNotification,
  useMarkAllAsRead,
  useOpenNotification,
} from '@/features/notification'
import { PawPrintIcon } from '@/shared/assets'
import { normalizeApiError } from '@/shared/api'
import type {
  NotificationBulkDeleteFilter,
  NotificationCategory,
  NotificationResponseDto,
} from '@/shared/types'
import { dedupeBy } from '@/shared/lib/dedupeBy'
import { flattenPages } from '@/shared/lib/infiniteList'
import {
  RetryButton,
  Button,
  Chip,
  Container,
  CtaModal,
  DeleteConfirmModal,
  InfiniteScrollTrigger,
  ListState,
  NavigationBar,
} from '@/shared/ui'
import { SkeletonBlock } from '@/shared/ui/Skeleton'

type ReadFilter = 'all' | 'unread' | 'read'

const READ_FILTERS: ReadonlyArray<{ value: ReadFilter; label: string }> = [
  { value: 'all', label: '전체' },
  { value: 'unread', label: '안 읽음' },
  { value: 'read', label: '읽음' },
]

/** 일괄 삭제 확인 문구. 지금 보고 있는 조건과 실제로 지워지는 범위가 같아야 한다. */
const bulkDeleteCopy = (filter: NotificationBulkDeleteFilter, readFiltered: boolean) => {
  const scope = filter.category ? `${notificationCategoryLabel(filter.category)} 알림` : '알림'
  if (filter.onlyRead) {
    return {
      title: `읽은 ${scope}을 삭제할까요?`,
      body: `읽은 ${scope}만 삭제되고 안 읽은 알림은 남아요.`,
      action: '읽은 알림 삭제',
    }
  }
  const target = filter.category ? scope : '모든 알림'
  return {
    title: `${scope}을 모두 삭제할까요?`,
    // 안 읽음/읽음 필터를 보고 있어도 일괄 삭제는 읽음 여부와 무관하다는 점을 분명히 한다.
    body: readFiltered ? `읽음 여부와 관계없이 ${target}이 삭제돼요.` : `${target}이 삭제돼요.`,
    action: '모두 삭제',
  }
}

const NotificationsContent = () => {
  const openNotification = useOpenNotification()
  const unreadCountQuery = useQuery({
    ...notificationQueries.unreadCount(),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const unreadCount = unreadCountQuery.data ?? 0
  const [category, setCategory] = useState<NotificationCategory | undefined>()
  const [readFilter, setReadFilter] = useState<ReadFilter>('all')
  const isRead = readFilter === 'all' ? undefined : readFilter === 'read'
  const {
    data,
    isPending,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
    refetch,
    isFetching: isRetrying,
  } = useInfiniteQuery({
    ...notificationQueries.list({ category, isRead }),
    refetchOnMount: 'always',
    throwOnError: false,
  })
  const { mutate: markAllAsRead, isPending: isMarkingAll } = useMarkAllAsRead()
  const { mutate: deleteNotification, isPending: isDeleting } = useDeleteNotification()
  const { mutate: deleteAllNotifications, isPending: isDeletingAll } = useDeleteAllNotifications()
  const [deleteTarget, setDeleteTarget] = useState<NotificationResponseDto | null>(null)
  const [deleteError, setDeleteError] = useState<string | null>(null)
  // null이면 닫힘. 열린 순간의 조건을 고정해 확인 중에 필터를 바꿔도 범위가 달라지지 않게 한다.
  const [bulkDelete, setBulkDelete] = useState<NotificationBulkDeleteFilter | null>(null)
  const [deleteAllError, setDeleteAllError] = useState<string | null>(null)

  const notifications = useMemo(
    () => dedupeBy(flattenPages(data), (item) => item.notificationId),
    [data],
  )

  const handleSelect = (item: NotificationResponseDto) => {
    void openNotification(item)
  }

  const handleConfirmDelete = () => {
    if (!deleteTarget || isDeleting) return
    setDeleteError(null)
    deleteNotification(deleteTarget.notificationId, {
      onSuccess: () => setDeleteTarget(null),
      onError: () => setDeleteError('알림을 삭제하지 못했어요. 다시 시도해 주세요.'),
    })
  }

  const openBulkDelete = (filter: NotificationBulkDeleteFilter) => {
    setDeleteAllError(null)
    setBulkDelete(filter)
  }

  const handleDeleteAll = () => {
    if (isDeletingAll || !bulkDelete) return
    setDeleteAllError(null)
    deleteAllNotifications(bulkDelete, {
      onSuccess: () => setBulkDelete(null),
      onError: (error) =>
        setDeleteAllError(normalizeApiError(error, '알림을 삭제하지 못했어요.').message),
    })
  }

  const copy = bulkDelete ? bulkDeleteCopy(bulkDelete, readFilter !== 'all') : null
  const isFiltered = category !== undefined || readFilter !== 'all'
  const busy = isDeleting || isDeletingAll || isMarkingAll

  return (
    <div className="flex w-full flex-1 flex-col bg-white pb-16">
      <NavigationBar title="알림센터" backHref="/home" />

      <Container className="py-5 tab:py-8 pc:py-10">
        <div className="mx-auto w-full tab:max-w-[59.25rem]">
          <div className="mb-4 flex min-h-14 items-center justify-between gap-4 rounded-xl bg-primary-50 px-4 py-3 tab:px-5">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white text-primary-500 shadow-[0_3px_12px_rgba(73,45,20,0.08)]">
                <PawPrintIcon className="size-6" />
              </span>
              <p className="truncate text-sm font-medium text-neutral-700 tab:text-base">
                {unreadCountQuery.isError ? (
                  '읽지 않은 알림 수를 확인하지 못했어요.'
                ) : (
                  <>
                    읽지 않은 알림{' '}
                    <strong className="font-semibold text-primary-600">{unreadCount}</strong>개
                  </>
                )}
              </p>
            </div>
            {unreadCountQuery.isError ? (
              <RetryButton
                onRetry={() => void unreadCountQuery.refetch()}
                isRetrying={unreadCountQuery.isFetching}
              />
            ) : unreadCount > 0 ? (
              <Button
                intent="link"
                onClick={() => markAllAsRead()}
                disabled={isMarkingAll || isDeletingAll}
                size="sm"
              >
                모두 읽기
              </Button>
            ) : null}
          </div>

          <div className="mb-3 flex flex-col gap-2">
            <div
              role="group"
              aria-label="알림 분류"
              className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none]"
            >
              <Chip
                size="responsive"
                selected={category === undefined}
                onClick={() => setCategory(undefined)}
              >
                전체
              </Chip>
              {NOTIFICATION_CATEGORY_OPTIONS.map((option) => (
                <Chip
                  key={option.value}
                  size="responsive"
                  selected={category === option.value}
                  onClick={() => setCategory(option.value)}
                >
                  {option.label}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div role="group" aria-label="읽음 상태" className="flex gap-3">
                {READ_FILTERS.map((option) => (
                  <Button
                    key={option.value}
                    intent="link"
                    size="sm"
                    aria-pressed={readFilter === option.value}
                    onClick={() => setReadFilter(option.value)}
                  >
                    <span
                      className={
                        readFilter === option.value
                          ? 'font-semibold text-primary-600 underline underline-offset-4'
                          : 'text-neutral-700'
                      }
                    >
                      {option.label}
                    </span>
                  </Button>
                ))}
              </div>
              <div className="flex items-center gap-3">
                {/* 알림함이 완전히 비었을 때만 숨긴다. 필터 결과가 비어도 같은 분류의 읽은 알림은 남아 있을 수 있다. */}
                {(notifications.length > 0 || isFiltered) && (
                  <Button
                    intent="link"
                    size="sm"
                    disabled={busy}
                    onClick={() => openBulkDelete({ category, onlyRead: true })}
                  >
                    읽은 알림 삭제
                  </Button>
                )}
                {notifications.length > 0 && readFilter !== 'read' && (
                  <Button
                    intent="link"
                    size="sm"
                    disabled={busy}
                    onClick={() => openBulkDelete({ category })}
                  >
                    {category ? `${notificationCategoryLabel(category)} 모두 삭제` : '전체 삭제'}
                  </Button>
                )}
              </div>
            </div>
          </div>

          <ListState
            isPending={isPending}
            isError={isError}
            isEmpty={notifications.length === 0}
            loadingText="알림을 불러오는 중이에요."
            loadingFallback={
              // 알림 행과 같은 틀(테두리 상자·행 여백·읽음 점·세 줄)로 자리를 잡아 둔다.
              <div role="status" aria-busy="true">
                <span className="sr-only">알림을 불러오는 중이에요.</span>
                <div
                  aria-hidden
                  className="flex flex-col divide-y divide-neutral-150 overflow-hidden rounded-xl border border-neutral-150 bg-white"
                >
                  {Array.from({ length: 4 }, (_, index) => (
                    <div key={index} className="flex gap-3 px-4 py-4 tab:px-5 tab:py-5">
                      <SkeletonBlock className="mt-1.5 size-2.5 shrink-0 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <SkeletonBlock className="h-4 w-1/2 rounded" />
                        <SkeletonBlock className="h-3.5 w-full rounded" />
                        <SkeletonBlock className="h-3 w-1/4 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            }
            errorText="알림을 불러오지 못했어요."
            emptyText={isFiltered ? '조건에 맞는 알림이 없어요.' : '아직 도착한 알림이 없어요.'}
            onRetry={() => void refetch()}
            isRetrying={isRetrying}
          >
            <div className="overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_7px_7px_rgba(55,55,55,0.06)]">
              <div className="flex flex-col divide-y divide-neutral-150">
                {notifications.map((item) => (
                  <NotificationListItem
                    key={item.notificationId}
                    item={item}
                    onSelect={handleSelect}
                    onDelete={(item) => {
                      setDeleteError(null)
                      setDeleteTarget(item)
                    }}
                  />
                ))}
              </div>
              <InfiniteScrollTrigger
                hasNextPage={hasNextPage}
                isFetchingNextPage={isFetchingNextPage}
                onIntersect={() => void fetchNextPage()}
              />
              {hasNextPage && (
                <div className="flex justify-center border-t border-neutral-150 py-3">
                  <Button
                    intent="link"
                    size="sm"
                    disabled={isFetchingNextPage}
                    onClick={() => void fetchNextPage()}
                  >
                    {isFetchingNextPage ? '불러오는 중' : '알림 더 보기'}
                  </Button>
                </div>
              )}
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
        errorMessage={deleteError}
      />
      <CtaModal
        open={bulkDelete !== null}
        onOpenChange={(open) => !isDeletingAll && !open && setBulkDelete(null)}
        title={copy?.title ?? ''}
        description={
          <>
            {copy?.body}
            <br />
            삭제한 알림은 다시 볼 수 없어요.
            {deleteAllError && (
              <span role="alert" className="mt-2 block text-sm text-error-600">
                {deleteAllError}
              </span>
            )}
          </>
        }
        actions={[
          {
            label: '취소',
            intent: 'secondary',
            disabled: isDeletingAll,
            onClick: () => setBulkDelete(null),
          },
          {
            label: isDeletingAll ? '삭제하는 중' : (copy?.action ?? '삭제'),
            intent: 'danger',
            disabled: isDeletingAll,
            onClick: handleDeleteAll,
          },
        ]}
      />
    </div>
  )
}

export { NotificationsContent }
