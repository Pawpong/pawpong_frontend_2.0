'use client'

import { ChatUserSearch } from './ChatUserSearch'
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
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-[90rem] flex-col bg-white">
      {/* Header — 채팅 전용 상단바 (고정). 새 채팅은 커뮤니티처럼 상단바 오른쪽 + 버튼 */}
      <NavigationBar
        title="채팅"
        backHref="/"
        titleVariant="page"
        right={<ChatUserSearch onSelectRoom={onSelectRoom} />}
      />

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
