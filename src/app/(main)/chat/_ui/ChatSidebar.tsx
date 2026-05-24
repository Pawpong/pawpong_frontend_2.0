'use client'

import * as React from 'react'
import { MOCK_CHAT_ROOMS } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { type FilterTab, filterRooms } from '../_lib/constants'
import { ChatFilterTabs } from './ChatFilterTabs'
import { ChatRoomItem } from './ChatRoomItem'

interface ChatSidebarProps {
  activeRoomId: string
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatSidebar = ({ activeRoomId, onSelectRoom }: ChatSidebarProps) => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const filteredRooms = filterRooms(MOCK_CHAT_ROOMS, filter)

  return (
    <div className="flex h-full w-[26.1875rem] shrink-0 flex-col border border-border-light">
      {/* Header */}
      <div className="flex h-[5.5rem] items-center px-5 py-[0.625rem]">
        <h2 className="text-xl leading-[1.375rem] font-semibold text-text-primary">채팅</h2>
      </div>

      {/* Filter Tabs */}
      <ChatFilterTabs value={filter} onChange={setFilter} className="justify-end px-5 pb-4" />

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
