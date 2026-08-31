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
  onRoomClosed?: (roomId: string) => void
  /** 방 목록 컨테이너 클래스 (사이드바는 독립 스크롤을 위해 flex-1/overflow 전달) */
  listClassName?: string
  /** 가로 패딩 (전체 목록=반응형 페이지 마진, 사이드바=px-4) */
  gutterClassName?: string
}

// [refactored] sidebar/list가 공유하던 "필터 탭 바 + 빈 상태 + 방 아이템 맵" 블록을 공통 컴포넌트로 추출
const ChatRoomFilterableList = ({
  activeRoomId,
  onSelectRoom,
  onRoomClosed,
  listClassName,
  gutterClassName = CHAT_GUTTER_X,
}: ChatRoomFilterableListProps) => {
  const { filter, setFilter, filteredRooms, isLoading, isError, refetch } = useChatRoomFilter()

  return (
    <>
      <div
        className={cn(
          'flex flex-col items-end border-b border-neutral-300 py-3 pc:py-4',
          gutterClassName,
        )}
      >
        <ChatFilterTabs value={filter} onChange={setFilter} className="justify-end" />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-medium text-neutral-700">채팅방을 불러오는 중입니다.</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-sm font-medium text-neutral-700">채팅방을 불러오지 못했습니다.</p>
          <button
            type="button"
            onClick={() => void refetch()}
            className="rounded-lg bg-neutral-850 px-3 py-2 text-sm font-semibold text-white"
          >
            다시 시도
          </button>
        </div>
      ) : filteredRooms.length === 0 ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-medium text-neutral-700">채팅방이 없습니다</p>
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
              onRoomClosed={() => onRoomClosed?.(room.roomId)}
            />
          ))}
        </div>
      )}
    </>
  )
}

export { ChatRoomFilterableList }
