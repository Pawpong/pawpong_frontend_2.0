'use client'

import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomFilterableList } from './ChatRoomFilterableList'

interface ChatSidebarProps {
  activeRoomId: string
  onSelectRoom: (room: ChatRoomResponseDto) => void
  onRoomClosed: (roomId: string) => void
}

const ChatSidebar = ({ activeRoomId, onSelectRoom, onRoomClosed }: ChatSidebarProps) => {
  return (
    <aside className="flex h-full w-[25rem] shrink-0 flex-col border-r border-neutral-150 bg-white">
      <div className="flex h-[4.5rem] shrink-0 items-center border-b border-neutral-150 px-5">
        <h1 className="font-cafe24 text-xl text-neutral-850">채팅</h1>
      </div>

      {/* [refactored] 필터 탭 + 방 목록 공통 컴포넌트로 대체 (사이드바는 독립 스크롤 유지) */}
      <ChatRoomFilterableList
        activeRoomId={activeRoomId}
        onSelectRoom={onSelectRoom}
        onRoomClosed={onRoomClosed}
        listClassName="flex-1 overflow-y-auto"
        gutterClassName="px-3"
      />
    </aside>
  )
}

export { ChatSidebar }
