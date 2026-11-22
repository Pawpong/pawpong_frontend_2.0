'use client'

import { cn } from '@/shared/lib/cn'
import { NotificationBell } from '@/widgets/gnb'
import { CHAT_LIST_HEIGHT } from '../_lib/constants'
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
    <div className={cn(CHAT_LIST_HEIGHT, 'page-width flex flex-col bg-white')}>
      {/* 채팅은 하단 내비 루트 탭 — 모바일은 로고 바 대신 이 52px 한 줄(제목 · 새 채팅 · 알림)이 맨 위에 붙는다.
          알림은 tab+ 로고 바에 이미 있어 모바일에서만 둔다 */}
      <NavigationBar
        title="채팅"
        titleVariant="root"
        height="top"
        right={
          <div className="flex items-center gap-3">
            <ChatUserSearch onSelectRoom={onSelectRoom} />
            <NotificationBell className="tab:hidden" />
          </div>
        }
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
