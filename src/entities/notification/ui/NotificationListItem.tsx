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
  compact?: boolean
  /** 삭제 중인 항목은 버튼을 잠근다 */
  deleting?: boolean
}

const NotificationListItem = ({
  item,
  onSelect,
  onDelete,
  compact = false,
  deleting = false,
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
          <span className="flex items-center gap-1.5 text-xs font-medium text-neutral-500">
            {category && !compact && (
              <span className="rounded bg-neutral-100 px-1.5 py-0.5 text-neutral-700">
                {notificationCategoryLabel(category)}
              </span>
            )}
            <time dateTime={item.createdAt}>{formatRelativeTime(item.createdAt)}</time>
          </span>
        </span>
      </button>

      {/* 드롭다운은 바로 지우는 X 버튼, 알림 화면은 확인을 거치는 더보기 메뉴 */}
      {onDelete &&
        (compact ? (
          <IconButton
            tone="danger"
            size="xs"
            edge="end"
            aria-label={`${item.title} 알림 삭제`}
            disabled={deleting}
            onClick={() => onDelete(item)}
          >
            <CloseIcon className="size-4" />
          </IconButton>
        ) : (
          <OwnerActionsMenu
            onDelete={() => onDelete(item)}
            ariaLabel={`${item.title} 알림 더보기`}
          />
        ))}
    </article>
  )
}

export { NotificationListItem }
