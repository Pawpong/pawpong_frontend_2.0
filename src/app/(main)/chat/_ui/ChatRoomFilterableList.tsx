'use client'

import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { Button, EmptyState, SearchBar } from '@/shared/ui'
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
  const [search, setSearch] = useState('')
  const visibleRooms = filteredRooms.filter((room) =>
    room.counterpart.nickname.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()),
  )

  return (
    <>
      <div
        className={cn(
          'flex shrink-0 flex-col gap-3 border-b border-neutral-150 py-4',
          gutterClassName,
        )}
      >
        <SearchBar
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
          <Button
            variant="fill"
            onClick={() => void refetch()}
            className="rounded-lg bg-neutral-850 px-4 py-2 text-sm font-semibold text-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            다시 시도
          </Button>
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
        <div
          className={cn(
            'divide-y divide-neutral-150 overflow-hidden bg-white py-2 pc:py-3',
            gutterClassName,
            listClassName,
          )}
        >
          {visibleRooms.map((room) => (
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
