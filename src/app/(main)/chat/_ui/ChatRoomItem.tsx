'use client'

import { cn } from '@/shared/lib/Cn'
import { MOCK_ROOM_NAMES } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'

interface ChatRoomItemProps {
  room: ChatRoomResponseDto
  isActive: boolean
  unreadCount?: number
  onClick: () => void
}

const formatRelativeTime = (dateStr?: string) => {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return '방금전'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}분전`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}시간전`
  const days = Math.floor(hours / 24)
  return `${days}일전`
}

const ChatRoomItem = ({ room, isActive, unreadCount = 0, onClick }: ChatRoomItemProps) => {
  const displayName = MOCK_ROOM_NAMES[room.breederId] ?? room.breederId

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'relative flex w-full items-start gap-[1.1875rem] text-left',
        isActive && 'before:absolute before:inset-x-[-1rem] before:inset-y-[-0.5rem] before:rounded-[0.375rem] before:bg-surface-placeholder',
      )}
    >
      {/* Avatar */}
      <div className="relative z-10 size-[3.625rem] shrink-0 rounded-full bg-[#8e8e8e]" />

      {/* Content */}
      <div className="relative z-10 min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-base font-semibold leading-[1.375rem] text-text-primary">{displayName}</span>
          <span className="shrink-0 text-sm font-medium leading-[1.375rem] text-text-primary">
            {formatRelativeTime(room.lastMessageAt)}
          </span>
        </div>
        <div className="mt-[0.53rem] flex items-center gap-2">
          <p className="min-w-0 flex-1 truncate text-base font-semibold leading-[1.375rem] text-text-primary">
            {room.lastMessage ?? ''}
          </p>
          {unreadCount > 0 && (
            <span className="flex size-[1.375rem] shrink-0 items-center justify-center rounded-full bg-text-primary text-xs font-medium text-white">
              {unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  )
}

export { ChatRoomItem, formatRelativeTime }
