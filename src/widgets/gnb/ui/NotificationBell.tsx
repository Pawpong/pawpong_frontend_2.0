'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery, useInfiniteQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { useAuthStatus } from '@/features/auth'
import { NotificationListItem, notificationQueries } from '@/entities/notification'
import { uniqueBy } from '@/shared/lib/uniqueBy'
import { useMarkAsRead, useMarkAllAsRead } from '@/features/notification'
import type { NotificationResponseDto } from '@/shared/types'
import { Button } from '@/shared/ui'

// 전용 벨 아이콘이 없어 인라인 SVG 사용 (nav 아이콘 톤과 동일한 currentColor)
const BellIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
    <path
      d="M12 3a6 6 0 0 0-6 6c0 3.5-.8 5.2-1.6 6.2-.4.5 0 1.3.7 1.3h13.8c.7 0 1.1-.8.7-1.3-.8-1-1.6-2.7-1.6-6.2a6 6 0 0 0-6-6Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path
      d="M9.5 19a2.5 2.5 0 0 0 5 0"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    />
  </svg>
)

const NotificationBell = () => {
  const router = useRouter()
  const { isLoggedIn } = useAuthStatus()
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const { data: unreadCount = 0 } = useQuery({
    ...notificationQueries.unreadCount(),
    enabled: isLoggedIn,
  })

  const { data, isLoading, isError, hasNextPage, fetchNextPage, isFetchingNextPage } =
    useInfiniteQuery({
      ...notificationQueries.list(),
      // 드롭다운을 열었을 때만 목록을 불러온다
      enabled: isLoggedIn && open,
    })

  const { mutate: markAsRead } = useMarkAsRead()
  const { mutate: markAllAsRead } = useMarkAllAsRead()

  const notifications = uniqueBy(
    data?.pages.flatMap((page) => page.items) ?? [],
    (item) => item.notificationId,
  )

  // 바깥 클릭 / ESC 로 닫기
  useEffect(() => {
    if (!open) return
    const handlePointer = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  if (!isLoggedIn) return null

  const handleSelect = (item: NotificationResponseDto) => {
    if (!item.isRead) markAsRead(item.notificationId)
    setOpen(false)
    if (item.targetUrl?.startsWith('/')) router.push(item.targetUrl)
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="알림"
        aria-expanded={open}
        className={cn(
          'flex items-center text-[1rem] font-medium text-neutral-700 transition-colors',
          open && 'font-semibold text-primary-500',
        )}
      >
        <div className="relative flex size-[3rem] items-center justify-center">
          <BellIcon className="size-[1.5rem]" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-error-500 px-1 text-[0.625rem] leading-none font-semibold text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </div>
        <div className="flex h-[3rem] items-center justify-center px-[0.625rem]">알림</div>
      </button>

      {/* 전체 알림 화면과 같은 grouped-list 톤의 드롭다운 패널 */}
      {open && (
        <div className="absolute top-full right-0 z-dropdown mt-1 w-[22.5rem] overflow-hidden rounded-xl border border-neutral-150 bg-white shadow-[0_8px_24px_rgba(73,45,20,0.14)]">
          <div className="flex items-center justify-between border-b border-neutral-150 bg-primary-50/60 px-4 py-3">
            <span className="text-base font-semibold text-neutral-850">알림</span>
            {unreadCount > 0 && (
              <Button
                variant="text"
                onClick={() => markAllAsRead()}
                className="h-7 px-2 text-xs text-primary-600 hover:bg-white"
              >
                모두 읽기
              </Button>
            )}
          </div>

          <div className="max-h-[26rem] overflow-y-auto">
            {isLoading ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-700">불러오는 중...</p>
            ) : isError ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-700">
                알림을 불러오지 못했습니다.
              </p>
            ) : notifications.length === 0 ? (
              <p className="px-4 py-10 text-center text-sm text-neutral-700">알림이 없습니다.</p>
            ) : (
              <div className="flex flex-col divide-y divide-neutral-100">
                {notifications.map((item) => (
                  <NotificationListItem
                    key={item.notificationId}
                    item={item}
                    onSelect={handleSelect}
                    compact
                  />
                ))}
                {hasNextPage && (
                  <button
                    type="button"
                    onClick={() => fetchNextPage()}
                    disabled={isFetchingNextPage}
                    className="py-3 text-center text-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-50 disabled:opacity-50"
                  >
                    {isFetchingNextPage ? '불러오는 중...' : '더 보기'}
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-neutral-150 p-2">
            <button
              type="button"
              onClick={() => {
                setOpen(false)
                router.push('/notifications')
              }}
              className="flex h-9 w-full items-center justify-center rounded-lg text-sm font-semibold text-primary-600 transition-colors hover:bg-primary-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
            >
              알림 전체 보기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export { NotificationBell }
