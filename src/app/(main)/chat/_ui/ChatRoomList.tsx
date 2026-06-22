'use client'

import { NavigationBar } from '@/shared/ui'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomFilterableList } from './ChatRoomFilterableList'

interface ChatRoomListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatRoomList = ({ activeRoomId, onSelectRoom }: ChatRoomListProps) => {
  return (
    // 상단바 + 필터 탭은 고정, 방 목록만 스크롤 (고정 높이 flex 컬럼)
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Header — 채팅 전용 상단바 (고정) */}
      <NavigationBar title="채팅" backHref="/" />

      {/* 필터 탭(고정) + 방 목록(스크롤) */}
      <ChatRoomFilterableList
        activeRoomId={activeRoomId}
        onSelectRoom={onSelectRoom}
        listClassName="flex-1 overflow-y-auto"
      />
    </div>
  )
}

export { ChatRoomList }
