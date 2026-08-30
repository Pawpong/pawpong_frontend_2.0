'use client'

import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { NotificationResponseDto } from '@/shared/types'
import { OwnerActionsMenu } from '@/shared/ui/OwnerActionsMenu'

interface NotificationListItemProps {
  item: NotificationResponseDto
  onSelect: (item: NotificationResponseDto) => void
  onDelete?: (item: NotificationResponseDto) => void
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
        'group relative flex w-full items-start gap-3 transition-colors hover:bg-primary-50/50',
        compact ? 'px-4 py-3' : 'px-4 py-4 tab:px-5 tab:py-5',
        !item.isRead && 'bg-point-50/80',
      )}
    >
      <button
        type="button"
        onClick={() => onSelect(item)}
        className="flex min-w-0 flex-1 items-start gap-3 text-left focus-visible:rounded-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <span
          className={cn(
            'mt-1.5 size-2.5 shrink-0 rounded-full ring-2 ring-transparent',
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
        <OwnerActionsMenu
          onDelete={() => onDelete(item)}
          ariaLabel={`${item.title} 알림 더보기`}
          className="shrink-0 rounded-full p-1 text-neutral-500 transition-colors hover:bg-white hover:text-neutral-850"
        />
      )}
    </article>
  )
}

export { NotificationListItem }
