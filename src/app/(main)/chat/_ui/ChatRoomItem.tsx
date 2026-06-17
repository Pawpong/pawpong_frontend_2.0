'use client'

import { cn } from '@/shared/lib/cn'
import { MoreVertIcon } from '@/shared/assets/icons'
import type { ChatRoomResponseDto } from '@/shared/types'
import { getDisplayName } from '../_lib/utils'
import { ProfileAvatar } from './ProfileAvatar'
import { RelativeTime } from './RelativeTime'

interface ChatRoomItemProps {
  room: ChatRoomResponseDto
  isActive: boolean
  unreadCount?: number
  onClick: () => void
}

const ChatRoomItem = ({ room, isActive, unreadCount = 0, onClick }: ChatRoomItemProps) => {
  const displayName = getDisplayName(room.breederId)

  return (
    <div
      className={cn(
        'flex items-start justify-between gap-3 rounded-lg p-3',
        isActive && 'bg-[#ededed]',
      )}
    >
      <button
        type="button"
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-2 text-left"
      >
        <ProfileAvatar size="md" />
        <div className="flex min-w-0 flex-1 flex-col justify-center">
          <div className="flex items-center gap-2">
            <span className="text-base leading-[1.5] font-semibold text-[#3e3e3e]">
              {displayName}
            </span>
            <RelativeTime dateStr={room.lastMessageAt} />
          </div>
          <p className="truncate text-sm leading-[1.5] font-semibold text-[#3e3e3e]">
            {room.lastMessage ?? ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="flex h-5 shrink-0 items-center justify-center rounded-full bg-[#d63d4a] px-2 text-sm leading-[1.5] font-normal text-white">
            {unreadCount}
          </span>
        )}
      </button>
      <button type="button" aria-label="더보기" className="shrink-0">
        <MoreVertIcon className="size-6 text-[#3e3e3e]" />
      </button>
    </div>
  )
}

export { ChatRoomItem }
