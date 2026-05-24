'use client'

import { Avatar, AvatarFallback } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import type { ChatRoomResponseDto } from '@/shared/types'

interface ChatRoomItemProps {
  room: ChatRoomResponseDto
  isActive: boolean
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

const ChatRoomItem = ({ room, isActive, onClick }: ChatRoomItemProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-4 rounded-md px-5 py-4 text-left transition-colors hover:bg-surface-primary',
        isActive && 'bg-surface-placeholder',
      )}
    >
      <Avatar size="sm" className="size-[3.625rem] shrink-0">
        <AvatarFallback />
      </Avatar>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="truncate text-base font-semibold text-text-primary">
            {room.breederId}
          </span>
          <span className="shrink-0 text-sm font-medium text-text-primary">
            {formatRelativeTime(room.lastMessageAt)}
          </span>
        </div>
        <p className="mt-0.5 truncate text-base font-semibold text-text-primary">
          {room.lastMessage ?? ''}
        </p>
      </div>
    </button>
  )
}

export { ChatRoomItem, formatRelativeTime }
