'use client'

import * as React from 'react'
import { useChatRooms } from '@/entities/chat'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomItem } from './ChatRoomItem'

type FilterTab = 'all' | 'unread' | 'adoption' | 'counsel'

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'unread', label: '안읽음' },
  { value: 'adoption', label: '입양' },
  { value: 'counsel', label: '상담' },
]

interface ChatRoomListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatRoomList = ({ activeRoomId, onSelectRoom }: ChatRoomListProps) => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const { data: rooms = [] } = useChatRooms()

  const filteredRooms = rooms.filter((room) => {
    if (filter === 'all') return true
    if (filter === 'adoption') return !!room.applicationId
    return true
  })

  return (
    <div className="flex h-full flex-col border-r border-border-light">
      {/* Header */}
      <div className="px-5 py-3 tab:px-[6.25rem] tab:py-[0.625rem]">
        <h2 className="text-xl leading-[1.375rem] font-semibold text-text-primary">채팅</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-4 px-5 pb-3">
        {FILTER_TABS.map((tab) => (
          <button key={tab.value} type="button" onClick={() => setFilter(tab.value)}>
            <Badge
              variant={filter === tab.value ? 'status' : 'filled'}
              className={cn('cursor-pointer', filter === tab.value && 'bg-text-primary text-white')}
            >
              {tab.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border-light" />

      {/* Room List */}
      <div className="flex-1 overflow-y-auto">
        {filteredRooms.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm font-medium text-text-muted">채팅방이 없습니다</p>
          </div>
        ) : (
          filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.roomId}
              room={room}
              isActive={room.roomId === activeRoomId}
              onClick={() => onSelectRoom(room)}
            />
          ))
        )}
      </div>
    </div>
  )
}

export { ChatRoomList }
