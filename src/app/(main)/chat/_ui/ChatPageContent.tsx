'use client'

import * as React from 'react'
import { useSearchParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import { chatQueries } from '@/entities/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomList } from './ChatRoomList'
import { ChatSidebar } from './ChatSidebar'
import { ChatRoomPanel } from './ChatRoomPanel'

const ChatPageContent = () => {
  const [activeRoom, setActiveRoom] = React.useState<ChatRoomResponseDto | null>(null)
  const isPC = useBreakpoint('pc')

  // 메시지 보내기 등으로 ?roomId=... 로 진입하면 해당 방을 한 번 자동으로 연다
  const initialRoomId = useSearchParams().get('roomId')
  const { data: rooms } = useQuery(chatQueries.rooms())
  const consumedInitialRoom = React.useRef(false)

  React.useEffect(() => {
    if (consumedInitialRoom.current || !initialRoomId || !rooms) return
    const found = rooms.find((room) => room.roomId === initialRoomId)
    if (found) {
      setActiveRoom(found)
      consumedInitialRoom.current = true
    }
  }, [initialRoomId, rooms])

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
    return <ChatRoomPanel room={activeRoom} onBack={handleBack} />
  }

  // PC + room selected: sidebar + chat panel
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] w-full max-w-[90rem]">
      <ChatSidebar activeRoomId={activeRoom.roomId} onSelectRoom={handleSelectRoom} />
      <div className="flex-1">
        <ChatRoomPanel room={activeRoom} onBack={handleBack} />
      </div>
    </div>
  )
}

export { ChatPageContent }
