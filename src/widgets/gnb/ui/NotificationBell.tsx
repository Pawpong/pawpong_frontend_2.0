'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { useAuthStatus } from '@/features/auth'
import { NotificationListItem, notificationQueries } from '@/entities/notification'
import { uniqueBy } from '@/shared/lib/uniqueBy'
import { useOpenNotification, useMarkAsRead, useMarkAllAsRead } from '@/features/notification'
import { normalizeApiError } from '@/shared/api'
import type { NotificationResponseDto } from '@/shared/types'
import { Button, EmptyState, ActionSheetItem, UnreadCountBadge } from '@/shared/ui'

// Figma icon/ bell (1596:77455 세트, 1596:97271) — nav 아이콘과 같은 픽셀 글리프라 currentColor 로 그린다.
// Figma 원본은 속이 찬 실루엣 하나뿐이라, nav 아이콘들처럼 비활성은 외곽선만 남기고
// 안쪽 두 칸(2.5383 단위 그리드)을 evenodd 로 도려낸다. 열려 있을 때만 원본대로 채운다.
const BELL_BODY =
  'M13.615 5.2121H18.6917V7.75043H21.23V10.2888H23.7683V20.4421H26.3066V22.9804H6V20.4421H8.53833V10.2888H11.0767V7.75043H13.615V5.2121ZM12.3458 24.2496H19.9608V26.7879H12.3458V24.2496Z'
const BELL_HOLLOW =
  'M13.615 7.75043H18.6917V10.2888H13.615V7.75043ZM11.0767 10.2888H21.23V20.4421H11.0767V10.2888Z'

const BellIcon = ({ className, filled }: { className?: string; filled?: boolean }) => (
  <svg viewBox="0 0 32 32" fill="currentColor" className={className} aria-hidden>
    <path d={filled ? BELL_BODY : BELL_BODY + BELL_HOLLOW} fillRule="evenodd" clipRule="evenodd" />
  </svg>
)

const NotificationBell = ({ className }: { className?: string }) => {
  const router = useRouter()
  const { isLoggedIn } = useAuthStatus()
  const [open, setOpen] = useState(false)
  const [clearError, setClearError] = useState<string | null>(null)
  const setPanelOpen = useCallback((next: boolean) => {
    setOpen(next)
    if (!next) setClearError(null)
  }, [])
  const rootRef = useRef<HTMLDivElement>(null)

  const { data: unreadCount = 0 } = useQuery({
    ...notificationQueries.unreadCount(),
    enabled: isLoggedIn,
  })

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      // 팝업은 안 읽은 알림만 보여 준다. 지우기는 읽음 처리이며 원본은 센터에 남는다.
      ...notificationQueries.list({ isRead: false }),
      // 드롭다운을 열었을 때만 목록을 불러온다
      enabled: isLoggedIn && open,
    })

  const openNotification = useOpenNotification()
  const clearOne = useMarkAsRead()
  const clearAll = useMarkAllAsRead()
  const isClearing = clearOne.isPending || clearAll.isPending

  const notifications = uniqueBy(
    data?.pages.flatMap((page) => page.items) ?? [],
    (item) => item.notificationId,
  )

  // 바깥 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!open) return
    const handlePointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setPanelOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPanelOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, setPanelOpen])

  if (!isLoggedIn) return null

  const handleClearOne = (item: NotificationResponseDto) => {
    setClearError(null)
    clearOne.mutate(item.notificationId, {
      onError: (error) =>
        setClearError(
          normalizeApiError(error, '알림을 지우지 못했어요. 다시 시도해 주세요.').message,
        ),
    })
  }

  const handleClearAll = () => {
    setClearError(null)
    clearAll.mutate(undefined, {
      onError: (error) =>
        setClearError(
          normalizeApiError(error, '알림을 지우지 못했어요. 다시 시도해 주세요.').message,
        ),
    })
  }

  const handleSelect = (item: NotificationResponseDto) => {
    setPanelOpen(false)
    void openNotification(item)
  }

  return (
    <div ref={rootRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setPanelOpen(!open)}
        aria-label="알림"
        aria-expanded={open}
        className={cn(
          // 헤더 nav 항목(NavBar)과 동일한 톤·아이콘 크기·간격을 쓴다
          'flex min-h-11 min-w-11 items-center justify-center rounded text-sm leading-[1.5] font-medium whitespace-nowrap text-primary-500 focus-ring transition-colors hover:text-primary-700',
          open && 'font-semibold',
        )}
      >
        <span className="relative flex size-7 items-center justify-center">
          <BellIcon className="size-7" filled={open} />
          <UnreadCountBadge count={unreadCount} />
        </span>
        <span className="hidden pc:inline">알림</span>
      </button>

      {/* 전체 알림 화면과 같은 grouped-list 톤의 드롭다운 패널 */}
      {open && (
        // mo·tab 은 벨 기준(right-0)으로 띄우면 오른쪽 햄버거 폭만큼 밀려 화면 왼쪽으로 넘친다.
        // 헤더(h-12) 아래 뷰포트 좌우에 물려 띄우고, pc 에서만 벨 기준 드롭다운으로 되돌린다.
        <div
          className={cn(
            'fixed top-12 right-4 left-4 z-dropdown overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_8px_24px_rgba(73,45,20,0.14)]',
            'pc:absolute pc:top-full pc:right-0 pc:left-auto pc:mt-1 pc:w-[22.5rem]',
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-neutral-150 bg-primary-50/60 px-4 py-3">
            <span className="text-base font-semibold text-neutral-850">알림</span>
            {unreadCount > 0 && (
              <Button intent="link" size="sm" disabled={isClearing} onClick={handleClearAll}>
                {clearAll.isPending ? '지우는 중' : '모두 지우기'}
              </Button>
            )}
          </div>
          <p className="border-b border-neutral-150 px-4 py-2 text-xs text-neutral-600">
            지운 알림도 알림 센터에서 다시 볼 수 있어요.
          </p>
          {clearError && (
            <p
              role="alert"
              className="border-b border-neutral-150 px-4 py-2 text-sm text-error-600"
            >
              {clearError}
            </p>
          )}

          <div className="max-h-[min(26rem,60vh)] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-700">불러오는 중...</p>
            ) : isError ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-700">
                알림을 불러오지 못했어요.
              </p>
            ) : notifications.length === 0 ? (
              <EmptyState message="새 알림이 없어요." className="py-8" />
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100">
                {notifications.map((item) => (
                  <NotificationListItem
                    key={item.notificationId}
                    item={item}
                    onSelect={handleSelect}
                    onDismiss={handleClearOne}
                    dismissing={isClearing}
                    compact
                  />
                ))}
                {hasNextPage && (
                  <ActionSheetItem onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                    {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                  </ActionSheetItem>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-150 p-2">
            <Button
              intent="link"
              size="sm"
              width="full"
              onClick={() => {
                setPanelOpen(false)
                router.push('/notifications')
              }}
            >
              알림 센터
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

export { NotificationBell }
