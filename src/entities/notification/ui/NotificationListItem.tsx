'use client'

import { cn } from '@/shared/lib/cn'
import { formatRelativeTime } from '@/shared/lib/formatRelativeTime'
import type { NotificationResponseDto } from '@/shared/types'
import { OwnerActionsMenu } from '@/shared/ui/OwnerActionsMenu'
import { IconButton } from '@/shared/ui/IconButton'
import { CloseIcon } from '@/shared/assets'
import { notificationCategoryLabel, notificationCategoryOf } from '../model/notificationCategory'

interface NotificationListItemProps {
  item: NotificationResponseDto
  onSelect: (item: NotificationResponseDto) => void
  onDelete?: (item: NotificationResponseDto) => void
  /** 팝업에서 읽음 처리해 치운다. 알림 원본을 삭제하지 않는다. */
  onDismiss?: (item: NotificationResponseDto) => void
  compact?: boolean
  dismissing?: boolean
}

const NotificationListItem = ({
  item,
  onSelect,
  onDelete,
  onDismiss,
  compact = false,
  dismissing = false,
}: NotificationListItemProps) => {
  const category = notificationCategoryOf(item.type)
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
        className="flex min-w-0 flex-1 items-start gap-3 text-left focus-ring focus-visible:rounded-lg"
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
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-700">
            {category && !compact && (
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700">
                {notificationCategoryLabel(category)}
              </span>
            )}
            <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
          </span>
        </span>
      </button>

      {/* 팝업의 지우기와 센터의 영구 삭제는 서로 다른 동작이다. */}
      {compact && onDismiss ? (
        <IconButton
          tone="muted"
          size="lg"
          edge="end"
          aria-label={`${item.title} 알림 지우기`}
          disabled={dismissing}
          onClick={() => onDismiss(item)}
        >
          <CloseIcon className="size-4" />
        </IconButton>
      ) : !compact && onDelete ? (
        <OwnerActionsMenu onDelete={() => onDelete(item)} ariaLabel={`${item.title} 알림 더보기`} />
      ) : null}
    </article>
  )
}

export { NotificationListItem }
