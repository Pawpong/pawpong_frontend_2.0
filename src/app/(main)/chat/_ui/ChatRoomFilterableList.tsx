'use client'

import { cn } from '@/shared/lib/cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { useChatRoomFilter } from '../_lib/useChatRoomFilter'
import { getUnreadCount } from '../_lib/utils'
import { ChatFilterTabs } from './ChatFilterTabs'
import { ChatRoomItem } from './ChatRoomItem'

interface ChatRoomFilterableListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
  /** 방 목록 컨테이너 클래스 (사이드바는 독립 스크롤을 위해 flex-1/overflow 전달) */
  listClassName?: string
}

// [refactored] sidebar/list가 공유하던 "필터 탭 바 + 빈 상태 + 방 아이템 맵" 블록을 공통 컴포넌트로 추출
const ChatRoomFilterableList = ({
  activeRoomId,
  onSelectRoom,
  listClassName,
}: ChatRoomFilterableListProps) => {
  const { filter, setFilter, filteredRooms } = useChatRoomFilter()

  return (
    <>
      <div className="flex flex-col items-end border-b border-[#cacaca] px-4 py-3">
        <ChatFilterTabs value={filter} onChange={setFilter} className="justify-end" />
      </div>

      {filteredRooms.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-medium text-[#6b6b6b]">채팅방이 없습니다</p>
        </div>
      ) : (
        <div className={cn('flex flex-col gap-5 px-4 py-10', listClassName)}>
          {filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.roomId}
              room={room}
              isActive={room.roomId === activeRoomId}
              unreadCount={getUnreadCount(room)}
              onClick={() => onSelectRoom(room)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export { ChatRoomFilterableList }
