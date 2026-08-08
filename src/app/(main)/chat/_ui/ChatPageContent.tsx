'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { chatQueries } from '@/entities/chat'
import { profileQueries } from '@/entities/profile'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomList } from './ChatRoomList'
import { ChatSidebar } from './ChatSidebar'
import { ChatRoomPanel } from './ChatRoomPanel'

const ChatPageContent = () => {
  const [activeRoomId, setActiveRoomId] = React.useState<string | null>(null)
  const isPC = useBreakpoint('pc')
  const roomsQuery = useQuery({
    ...chatQueries.rooms(),
    refetchInterval: 5_000,
    refetchIntervalInBackground: false,
  })
  const profileQuery = useQuery({
    ...profileQueries.me(),
    enabled: !!activeRoomId,
  })
  const activeRoom = roomsQuery.data?.find((room) => room.roomId === activeRoomId) ?? null

  const handleSelectRoom = (room: ChatRoomResponseDto) => {
    setActiveRoomId(room.roomId)
  }

  const handleBack = () => {
    setActiveRoomId(null)
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

  if (!activeRoom || !profileQuery.data) {
    return (
      <div className="flex h-[calc(100dvh-4rem)] flex-col items-center justify-center gap-3">
        <p className="text-sm text-neutral-700">채팅방을 불러오지 못했습니다.</p>
        <button
          type="button"
          onClick={handleBack}
          className="rounded-lg bg-neutral-850 px-3 py-2 text-sm font-semibold text-white"
        >
          목록으로
        </button>
      </div>
    )
  }

  // Mobile: full-screen chat room
  if (!isPC) {
    return (
      <ChatRoomPanel
        room={activeRoom}
        currentUserId={profileQuery.data.userId}
        onBack={handleBack}
      />
    )
  }

  // PC + room selected: sidebar + chat panel
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-[90rem]">
      <ChatSidebar activeRoomId={activeRoomId} onSelectRoom={handleSelectRoom} />
      <div className="flex-1">
        <ChatRoomPanel
          room={activeRoom}
          currentUserId={profileQuery.data.userId}
          onBack={handleBack}
        />
      </div>
    </div>
  )
}

export { ChatPageContent }
