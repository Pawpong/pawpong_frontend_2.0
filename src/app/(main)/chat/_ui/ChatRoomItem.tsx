'use client'

import { cn } from '@/shared/lib/cn'
import { MoreVertIcon } from '@/shared/assets/icons'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ProfileAvatar } from '@/shared/ui'
import { getChatMessagePreview } from '../_lib/attachment'
import { RelativeTime } from './RelativeTime'

interface ChatRoomItemProps {
  room: ChatRoomResponseDto
  isActive: boolean
  unreadCount?: number
  onClick: () => void
}

const ChatRoomItem = ({ room, isActive, unreadCount = 0, onClick }: ChatRoomItemProps) => {
  return (
    <div
      className={cn(
        'flex items-start justify-between p-2 hover:bg-neutral-100 tab:p-3',
        isActive && 'bg-point-100 hover:bg-point-100',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-4 text-left"
      >
        {/* community-profile: 아바타 상단 정렬 (모바일 32 / PC 40) */}
        <div className="flex min-w-0 items-start gap-2">
          <ProfileAvatar
            src={room.counterpart.profileImageUrl}
            alt={`${room.counterpart.nickname} 프로필`}
            size="responsive"
          />
          <div className="flex min-w-0 flex-col">
            <div className="flex items-center gap-2">
              <span className="truncate text-body-s font-semibold text-neutral-850">
                {room.counterpart.nickname}
              </span>
              <RelativeTime dateStr={room.lastMessageAt} />
            </div>
            <p className="max-w-[21.625rem] truncate text-sm leading-[1.5] font-semibold text-neutral-850">
              {getChatMessagePreview(room.lastMessage)}
            </p>
          </div>
        </div>
        {unreadCount > 0 && (
          <span className="flex h-5 shrink-0 items-center justify-center rounded-full bg-error-500 px-2 text-sm leading-[1.5] font-normal text-white">
            {unreadCount}
          </span>
        )}
      </button>
      <button type="button" aria-label="더보기" className="shrink-0">
        <MoreVertIcon className="size-6 text-neutral-850" />
      </button>
    </div>
  )
}

export { ChatRoomItem }
