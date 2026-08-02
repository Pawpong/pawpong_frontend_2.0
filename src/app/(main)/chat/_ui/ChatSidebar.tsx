'use client'

import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomFilterableList } from './ChatRoomFilterableList'

interface ChatSidebarProps {
  activeRoomId: string
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatSidebar = ({ activeRoomId, onSelectRoom }: ChatSidebarProps) => {
  return (
    <aside className="flex h-full w-[26.6875rem] shrink-0 flex-col border-r border-neutral-300 bg-white">
      {/* navigation bar spacer */}
      <div className="h-[3.125rem] shrink-0" />

      {/* [refactored] 필터 탭 + 방 목록 공통 컴포넌트로 대체 (사이드바는 독립 스크롤 유지) */}
      <ChatRoomFilterableList
        activeRoomId={activeRoomId}
        onSelectRoom={onSelectRoom}
        listClassName="flex-1 overflow-y-auto"
        gutterClassName="px-4"
      />
    </aside>
  )
}

export { ChatSidebar }
