'use client'

import * as React from 'react'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { Container } from '@/shared/ui'
import { MOCK_CURRENT_USER_ID } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomList } from './ChatRoomList'
import { ChatSidebar } from './ChatSidebar'
import { ChatRoomPanel } from './ChatRoomPanel'

const ChatPageContent = () => {
  const [activeRoom, setActiveRoom] = React.useState<ChatRoomResponseDto | null>(null)
  const isPC = useBreakpoint('pc')

  const handleSelectRoom = (room: ChatRoomResponseDto) => {
    setActiveRoom(room)
  }

  const handleBack = () => {
    setActiveRoom(null)
  }

  // No room selected: full-width room list page
  if (!activeRoom) {
    return <ChatRoomList activeRoomId={null} onSelectRoom={handleSelectRoom} />
  }

  // Mobile: full-screen chat room
  if (!isPC) {
    return (
      <ChatRoomPanel
        room={activeRoom}
        currentUserId={MOCK_CURRENT_USER_ID}
        onBack={handleBack}
      />
    )
  }

  // PC + room selected: sidebar + chat panel
  return (
    <Container className="flex h-[calc(100dvh-4rem)] px-0">
      <ChatSidebar
        activeRoomId={activeRoom.roomId}
        onSelectRoom={handleSelectRoom}
      />
      <div className="flex-1">
        <ChatRoomPanel
          room={activeRoom}
          currentUserId={MOCK_CURRENT_USER_ID}
          onBack={handleBack}
        />
      </div>
    </Container>
  )
}

export { ChatPageContent }
