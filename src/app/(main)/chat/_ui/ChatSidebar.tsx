'use client'

import * as React from 'react'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import { MOCK_CHAT_ROOMS } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomItem } from './ChatRoomItem'

type FilterTab = 'all' | 'unread' | 'adoption' | 'counsel'

const FILTER_TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'unread', label: '안읽음' },
  { value: 'adoption', label: '입양' },
  { value: 'counsel', label: '상담' },
]

interface ChatSidebarProps {
  activeRoomId: string
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatSidebar = ({ activeRoomId, onSelectRoom }: ChatSidebarProps) => {
  const [filter, setFilter] = React.useState<FilterTab>('all')

  const filteredRooms = MOCK_CHAT_ROOMS.filter((room) => {
    if (filter === 'all') return true
    if (filter === 'adoption') return !!room.applicationId
    return true
  })

  return (
    <div className="flex h-full w-[26.1875rem] shrink-0 flex-col border border-border-light">
      {/* Header */}
      <div className="flex h-[5.5rem] items-center px-5 py-[0.625rem]">
        <h2 className="text-xl leading-[1.375rem] font-semibold text-text-primary">채팅</h2>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-end gap-4 px-5 pb-4">
        {FILTER_TABS.map((tab) => (
          <button key={tab.value} type="button" onClick={() => setFilter(tab.value)}>
            <Badge
              variant={filter === tab.value ? 'status' : 'filled'}
              className={cn(
                'cursor-pointer',
                filter === tab.value && 'bg-text-primary text-white',
              )}
            >
              {tab.label}
            </Badge>
          </button>
        ))}
      </div>

      {/* Divider */}
      <div className="border-t border-border-light" />

      {/* Room List */}
      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex flex-col gap-12 pt-[0.875rem]">
          {filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.roomId}
              room={room}
              isActive={room.roomId === activeRoomId}
              unreadCount={room.roomId === 'room-2' ? 2 : 0}
              onClick={() => onSelectRoom(room)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

export { ChatSidebar }
