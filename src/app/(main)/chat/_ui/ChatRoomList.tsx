'use client'

import * as React from 'react'
import { PageHeader, Badge } from '@/shared/ui'
import { Container } from '@/shared/ui'
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

interface ChatRoomListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatRoomList = ({ activeRoomId, onSelectRoom }: ChatRoomListProps) => {
  const [filter, setFilter] = React.useState<FilterTab>('all')

  const filteredRooms = MOCK_CHAT_ROOMS.filter((room) => {
    if (filter === 'all') return true
    if (filter === 'adoption') return !!room.applicationId
    return true
  })

  return (
    <div>
      {/* Header */}
      <PageHeader title="채팅" backHref="/" />

      {/* Filter Tabs */}
      <Container>
        <div className="flex items-center justify-end gap-4 pb-4">
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
