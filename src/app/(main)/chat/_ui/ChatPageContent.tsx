'use client'

import type * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { profileQueries } from '@/entities/profile'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import type { ChatRoomResponseDto } from '@/shared/types'
import { cn } from '@/shared/lib/cn'
import { CHAT_PANEL_HEIGHT } from '../_lib/constants'
import { ChatRoomList } from './ChatRoomList'
import { ChatSidebar } from './ChatSidebar'
import { ChatRoomPanel } from './ChatRoomPanel'
import { RetryButton, Button } from '@/shared/ui'

// [refactored] 방을 띄우기 전 상태(불러오는 중·실패·방 없음)는 같은 자리에 같은 모양으로 보인다
const ChatPanelState = ({ message, children }: { message: string; children?: React.ReactNode }) => (
  <div
    className={cn(
      CHAT_PANEL_HEIGHT,
      'flex flex-col items-center justify-center gap-3 px-5 text-center',
    )}
  >
    <p className="text-sm text-neutral-700">{message}</p>
    {children}
  </div>
)

const ChatPageContent = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const activeRoomId = searchParams.get('roomId')
  const isPC = useBreakpoint('lap')
  // activeRoomId로 방을 찾기 위한 캐시 구독만 한다. 폴링은 useChatRoomFilter가 담당.
  const roomsQuery = useQuery({
    ...chatQueries.rooms(),
    throwOnError: false,
  })
  const profileQuery = useQuery({
    ...profileQueries.me(),
    enabled: !!activeRoomId,
    throwOnError: false,
  })
  const activeRoom = roomsQuery.data?.find((room) => room.roomId === activeRoomId) ?? null

  const handleSelectRoom = (room: ChatRoomResponseDto) => {
    router.push(`/chat?roomId=${encodeURIComponent(room.roomId)}`, { scroll: false })
  }

  const handleBack = () => {
    router.replace('/chat', { scroll: false })
    void queryClient
      .cancelQueries({ queryKey: chatQueries.rooms().queryKey })
      .then(() => queryClient.invalidateQueries({ queryKey: chatQueries.rooms().queryKey }))
  }

  const handleRoomClosed = (roomId: string) => {
    if (roomId === activeRoomId) router.replace('/chat', { scroll: false })
  }

  // No room selected: full-width room list page
  if (!activeRoomId) {
    return <ChatRoomList onSelectRoom={handleSelectRoom} />
  }

  if (roomsQuery.isLoading || profileQuery.isLoading) {
    return <ChatPanelState message="채팅을 불러오는 중입니다." />
  }

  if (roomsQuery.isError || profileQuery.isError) {
    return (
      <ChatPanelState message="채팅방을 불러오지 못했습니다.">
        <div className="flex items-center gap-2">
          <Button intent="secondary" size="sm" onClick={handleBack}>
            목록으로
          </Button>
          <RetryButton
            onRetry={() => {
              void roomsQuery.refetch()
              void profileQuery.refetch()
            }}
            isRetrying={roomsQuery.isFetching || profileQuery.isFetching}
          />
        </div>
      </ChatPanelState>
    )
  }

  if (!activeRoom || !profileQuery.data) {
    return (
      <ChatPanelState message="채팅방을 불러오지 못했습니다.">
        <Button intent="dark" size="sm" onClick={handleBack}>
          목록으로
        </Button>
      </ChatPanelState>
    )
  }

  // Mobile: full-screen chat room
  if (!isPC) {
    return (
      <ChatRoomPanel
        key={activeRoom.roomId}
        room={activeRoom}
        currentUserId={profileQuery.data.userId}
        onBack={handleBack}
        onRoomClosed={() => handleRoomClosed(activeRoom.roomId)}
      />
    )
  }

  // PC + room selected: sidebar + chat panel
  return (
    <div
      className={cn(
        CHAT_PANEL_HEIGHT,
        'page-width flex overflow-hidden border-x border-neutral-150 bg-white',
      )}
    >
      <ChatSidebar
        activeRoomId={activeRoomId}
        onSelectRoom={handleSelectRoom}
        onRoomClosed={handleRoomClosed}
      />
      <div className="min-w-0 flex-1">
        <ChatRoomPanel
          key={activeRoom.roomId}
          room={activeRoom}
          currentUserId={profileQuery.data.userId}
          onBack={handleBack}
          onRoomClosed={() => handleRoomClosed(activeRoom.roomId)}
        />
      </div>
    </div>
  )
}

export { ChatPageContent }
