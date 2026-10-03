'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { profileQueries } from '@/entities/profile'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomList } from './ChatRoomList'
import { ChatSidebar } from './ChatSidebar'
import { ChatRoomPanel } from './ChatRoomPanel'
import { RetryButton, Button } from '@/shared/ui'

const ChatPageContent = () => {
  const router = useRouter()
  const queryClient = useQueryClient()
  const searchParams = useSearchParams()
  const activeRoomId = searchParams.get('roomId')
  const isPC = useBreakpoint('pc')
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
    return <ChatRoomList activeRoomId={null} onSelectRoom={handleSelectRoom} />
  }

  if (roomsQuery.isLoading || profileQuery.isLoading) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] items-center justify-center">
        <p className="text-sm text-neutral-700">채팅을 불러오는 중입니다.</p>
      </div>
    )
  }

  if (roomsQuery.isError || profileQuery.isError) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-3 px-5 text-center">
        <p className="text-sm text-neutral-700">채팅방을 불러오지 못했습니다.</p>
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
      </div>
    )
  }

  if (!activeRoom || !profileQuery.data) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-3">
        <p className="text-sm text-neutral-700">채팅방을 불러오지 못했습니다.</p>
        <Button intent="dark" size="sm" onClick={handleBack}>
          목록으로
        </Button>
      </div>
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
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-[90rem] overflow-hidden border-x border-neutral-150 bg-white">
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
