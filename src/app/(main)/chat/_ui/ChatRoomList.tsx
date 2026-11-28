'use client'

import { cn } from '@/shared/lib/cn'
import { CHAT_LIST_HEIGHT } from '../_lib/constants'
import { ChatUserSearch } from './ChatUserSearch'
import { RootHeader } from '@/shared/ui'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomFilterableList } from './ChatRoomFilterableList'

interface ChatRoomListProps {
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

// 방을 고르기 전의 전체 목록 화면 — 고른 방이 없으니 강조할 행도 없다
const ChatRoomList = ({ onSelectRoom }: ChatRoomListProps) => {
  return (
    // 상단바 + 필터 탭은 고정, 방 목록만 스크롤 (고정 높이 flex 컬럼)
    // 좌우 여백은 바깥 틀(page-shell) 한 곳이 준다 — 안쪽 머리·목록은 여백을 따로 두지 않는다
    <div className={cn(CHAT_LIST_HEIGHT, 'page-shell flex flex-col bg-white')}>
      {/* 채팅은 하단 내비 루트 탭 — 모바일은 제목 · 새 채팅 한 줄이 맨 위에 붙는다. */}
      <RootHeader title="채팅" right={<ChatUserSearch onSelectRoom={onSelectRoom} />} />

      {/* 검색·필터 칩(고정) + 방 목록(스크롤) */}
      <ChatRoomFilterableList activeRoomId={null} onSelectRoom={onSelectRoom} />
    </div>
  )
}

export { ChatRoomList }
