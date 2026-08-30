'use client'

import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { NotificationResponseDto } from '@/shared/types'

interface NotificationListItemProps {
  item: NotificationResponseDto
  onSelect: (item: NotificationResponseDto) => void
  onDelete?: (notificationId: string) => void
  compact?: boolean
}

const NotificationListItem = ({
  item,
  onSelect,
  onDelete,
  compact = false,
}: NotificationListItemProps) => {
  return (
    <article
      className={cn(
        'group relative flex w-full items-start gap-3 transition-colors hover:bg-primary-50/40',
        compact ? 'px-4 py-3' : 'rounded-xl border border-neutral-150 px-4 py-4 tab:px-5',
        !item.isRead && 'bg-point-50',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <span
          className={cn(
            'mt-1.5 size-2 shrink-0 rounded-full',
            item.isRead ? 'bg-transparent' : 'bg-primary-500',
          )}
        />
        <span className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-sm font-semibold text-neutral-850 tab:text-base">
            {item.title}
          </span>
          <span className="line-clamp-2 text-sm leading-[1.5] font-medium text-neutral-700">
            {item.body}
          </span>
          <time className="text-xs font-medium text-neutral-500" dateTime={item.createdAt}>
            {formatRelativeTime(item.createdAt)}
          </time>
        </span>
      </button>

      {onDelete && (
        <button
          type="button"
          onClick={() => onDelete(item.notificationId)}
          aria-label={`${item.title} 알림 삭제`}
          className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-neutral-500 transition-colors hover:bg-white hover:text-error-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
        >
          삭제
        </button>
      )}
    </article>
  )
}

export { NotificationListItem }
