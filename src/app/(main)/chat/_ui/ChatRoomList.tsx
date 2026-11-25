'use client'

import { cn } from '@/shared/lib/cn'
import { CHAT_LIST_HEIGHT } from '../_lib/constants'
import { ChatUserSearch } from './ChatUserSearch'
import { RootHeader } from '@/shared/ui'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomFilterableList } from './ChatRoomFilterableList'

interface ChatRoomListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatRoomList = ({ activeRoomId, onSelectRoom }: ChatRoomListProps) => {
  return (
    // 상단바 + 필터 탭은 고정, 방 목록만 스크롤 (고정 높이 flex 컬럼)
    <div className={cn(CHAT_LIST_HEIGHT, 'page-width flex flex-col bg-white')}>
      {/* 채팅은 하단 내비 루트 탭 — 모바일은 제목 · 새 채팅 한 줄이 맨 위에 붙는다. */}
      <RootHeader
        title="채팅"
        right={<ChatUserSearch onSelectRoom={onSelectRoom} />}
        className="page-shell"
      />

      {/* 검색·필터 칩(고정) + 방 목록(스크롤) */}
      <ChatRoomFilterableList
        activeRoomId={activeRoomId}
        onSelectRoom={onSelectRoom}
        listClassName="flex-1 overflow-y-auto"
      />
    </div>
  )
}

export { ChatRoomList }
