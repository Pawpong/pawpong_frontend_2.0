'use client'

import * as React from 'react'
import { PageHeader } from '@/shared/ui'
import { Container } from '@/shared/ui'
import { MOCK_CHAT_ROOMS } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { type FilterTab, filterRooms } from '../_lib/constants'
import { ChatFilterTabs } from './ChatFilterTabs'
import { ChatRoomItem } from './ChatRoomItem'

interface ChatRoomListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatRoomList = ({ activeRoomId, onSelectRoom }: ChatRoomListProps) => {
  const [filter, setFilter] = React.useState<FilterTab>('all')
  const filteredRooms = filterRooms(MOCK_CHAT_ROOMS, filter)

  return (
    <div>
      {/* Header */}
      <PageHeader title="채팅" backHref="/" />

      {/* Filter Tabs */}
      <Container>
        <ChatFilterTabs value={filter} onChange={setFilter} className="justify-end pb-4" />

        {/* Divider */}
        <div className="border-t border-border-light" />
      </Container>

      {/* Room List */}
      <Container>
        {filteredRooms.length === 0 ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-sm font-medium text-text-muted">채팅방이 없습니다</p>
          </div>
        ) : (
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
        )}
      </Container>
    </div>
  )
}

export { ChatRoomList }
