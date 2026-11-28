'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { RetryButton, EmptyState, SearchBar } from '@/shared/ui'
import { useChatRoomFilter } from '../_lib/useChatRoomFilter'
import { ChatFilterTabs } from './ChatFilterTabs'
import { ChatRoomItem } from './ChatRoomItem'

interface ChatRoomFilterableListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
  onRoomClosed?: (roomId: string) => void
  /** 가로 패딩 (전체 목록=반응형 페이지 마진, 사이드바=px-4) */
  gutterClassName?: string
}

// [refactored] sidebar/list가 공유하던 "필터 탭 바 + 빈 상태 + 방 아이템 맵" 블록을 공통 컴포넌트로 추출
const ChatRoomFilterableList = ({
  activeRoomId,
  onSelectRoom,
  onRoomClosed,
  gutterClassName,
}: ChatRoomFilterableListProps) => {
  const {
    filter,
    setFilter,
    filteredRooms,
    isLoading,
    isError,
    refetch,
    isFetching: isRetrying,
  } = useChatRoomFilter()
  const [search, setSearch] = useState('')
  // 스와이프로 액션을 연 행 — 한 번에 한 행만 열린다
  const [swipedRoomId, setSwipedRoomId] = useState<string | null>(null)
  const visibleRooms = filteredRooms.filter((room) =>
    room.counterpart.nickname.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  )

  return (
    <>
      <div className={cn('flex shrink-0 flex-col gap-3 pt-2 pb-3', gutterClassName)}>
        <SearchBar
          appearance="soft"
          placeholder={{ mobile: '대화 상대 검색', desktop: '대화 상대 검색' }}
          defaultValue={search}
          onChange={setSearch}
          onSubmit={setSearch}
        />
        <ChatFilterTabs value={filter} onChange={setFilter} />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <p className="text-sm font-medium text-neutral-700">채팅방을 불러오는 중입니다.</p>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center gap-3 py-20">
          <p className="text-sm font-medium text-neutral-700">채팅방을 불러오지 못했습니다.</p>
          <RetryButton onRetry={() => void refetch()} isRetrying={isRetrying} />
        </div>
      ) : visibleRooms.length === 0 ? (
        <EmptyState
          message={
            search.trim()
              ? '검색한 상대와의 대화가 없어요.'
              : filter === 'unread'
                ? '읽지 않은 대화가 없어요.'
                : '아직 대화가 없어요.'
          }
          className="py-20"
        />
      ) : (
        // 행 사이 1px 헤어라인. 스와이프 액션이 행 끝까지 닿도록 좌우 여백은 행 안이 아니라 목록이 갖는다.
        // PC 사이드바는 헤어라인 대신 행 사이를 띄워, 고른 방이 둥근 카드로 떨어져 보이게 한다
        <div
          className={cn(
            // [refactored] 검색·필터는 고정, 방 목록만 스크롤 — 목록 화면·사이드바가 같다
            'flex-1 divide-y divide-neutral-150 overflow-y-auto bg-white lap:space-y-1 lap:divide-y-0',
            gutterClassName,
          )}
        >
          {visibleRooms.map((room) => (
            <ChatRoomItem
              key={room.roomId}
              room={room}
              isActive={room.roomId === activeRoomId}
              onClick={() => onSelectRoom(room)}
              onRoomClosed={() => onRoomClosed?.(room.roomId)}
              swipeOpen={swipedRoomId === room.roomId}
              onSwipeOpenChange={(open) =>
                setSwipedRoomId((current) =>
                  open ? room.roomId : current === room.roomId ? null : current,
                )
              }
            />
          ))}
        </div>
      )}
    </>
  )
}

export { ChatRoomFilterableList }
