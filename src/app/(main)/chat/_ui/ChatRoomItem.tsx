'use client'

import { cn } from '@/shared/lib/cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { Badge, ProfileAvatar } from '@/shared/ui'
import { getChatMessagePreview } from '../_lib/attachment'
import { isAdoptionRoom } from '../_lib/constants'
import { ChatRoomActionsMenu } from './ChatRoomActionsMenu'
import { RelativeTime } from './RelativeTime'

interface ChatRoomItemProps {
  room: ChatRoomResponseDto
  isActive: boolean
  unreadCount?: number
  onClick: () => void
  onRoomClosed?: () => void
}

const ChatRoomItem = ({
  room,
  isActive,
  unreadCount = 0,
  onClick,
  onRoomClosed,
}: ChatRoomItemProps) => {
  return (
    <div
      className={cn(
        'group relative flex min-h-[5.5rem] items-center justify-between gap-2 px-2 py-3 transition-colors hover:bg-primary-50 tab:px-3 tab:py-4',
        isActive && 'bg-point-50 hover:bg-point-50',
        unreadCount > 0 && !isActive && 'bg-primary-50/50',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        <ProfileAvatar
          src={room.counterpart.profileImageUrl}
          alt={`${room.counterpart.nickname} 프로필`}
          size="responsive"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-body-s font-semibold text-neutral-850">
              {room.counterpart.nickname}
            </span>
            <Badge variant="primarySoft" className="shrink-0">
              {isAdoptionRoom(room) ? '입양 문의' : '상담'}
            </Badge>
          </div>
          <p
            className={cn(
              'truncate text-sm leading-[1.5]',
              unreadCount > 0 ? 'font-semibold text-neutral-850' : 'font-medium text-neutral-600',
            )}
          >
            {getChatMessagePreview(room.lastMessage)}
          </p>
          <RelativeTime dateStr={room.lastMessageAt} className="text-neutral-500" />
        </div>
        {unreadCount > 0 && (
          <Badge variant="pointCount" className="min-w-5 shrink-0 px-1.5">
            {unreadCount}
          </Badge>
        )}
      </button>
      <div className="shrink-0">
        <ChatRoomActionsMenu
          roomId={room.roomId}
          counterpartName={room.counterpart.nickname}
          onClosed={onRoomClosed}
        />
      </div>
    </div>
  )
}

export { ChatRoomItem }
