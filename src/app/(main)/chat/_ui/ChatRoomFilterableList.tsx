'use client'

import { cn } from '@/shared/lib/cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { CHAT_GUTTER_X } from '../_lib/constants'
import { useChatRoomFilter } from '../_lib/useChatRoomFilter'
import { ChatFilterTabs } from './ChatFilterTabs'
import { ChatRoomItem } from './ChatRoomItem'

interface ChatRoomFilterableListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
  /** 방 목록 컨테이너 클래스 (사이드바는 독립 스크롤을 위해 flex-1/overflow 전달) */
  listClassName?: string
  /** 가로 패딩 (전체 목록=반응형 페이지 마진, 사이드바=px-4) */
  gutterClassName?: string
}

// [refactored] sidebar/list가 공유하던 "필터 탭 바 + 빈 상태 + 방 아이템 맵" 블록을 공통 컴포넌트로 추출
const ChatRoomFilterableList = ({
  activeRoomId,
  onSelectRoom,
  listClassName,
  gutterClassName = CHAT_GUTTER_X,
}: ChatRoomFilterableListProps) => {
  const { filter, setFilter, filteredRooms, isLoading, isError } = useChatRoomFilter()

  const emptyMessage = isLoading
    ? '불러오는 중...'
    : isError
      ? '채팅방을 불러오지 못했습니다'
      : '채팅방이 없습니다'

  return (
    <>
      <div
        className={cn(
          'flex flex-col items-end border-b border-[#cacaca] py-3 pc:py-4',
          gutterClassName,
        )}
      >
        <ChatFilterTabs value={filter} onChange={setFilter} className="justify-end" />
      </div>

      {filteredRooms.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-medium text-[#6b6b6b]">{emptyMessage}</p>
        </div>
      ) : (
        <div className={cn('flex flex-col gap-5 py-6 pc:py-10', gutterClassName, listClassName)}>
          {filteredRooms.map((room) => (
            <ChatRoomItem
              key={room.roomId}
              room={room}
              isActive={room.roomId === activeRoomId}
              unreadCount={room.unreadCount}
              onClick={() => onSelectRoom(room)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export { ChatRoomFilterableList }
