'use client'

import * as React from 'react'
import { useBreakpoint } from '@/shared/lib/useBreakpoint'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomList } from './ChatRoomList'
import { ChatRoomPanel } from './ChatRoomPanel'
import { ChatEmptyState } from './ChatEmptyState'

interface ChatPageContentProps {
  currentUserId: string
}

const ChatPageContent = ({ currentUserId }: ChatPageContentProps) => {
  const [activeRoom, setActiveRoom] = React.useState<ChatRoomResponseDto | null>(null)
  const isPC = useBreakpoint('tab')

  const handleSelectRoom = (room: ChatRoomResponseDto) => {
    setActiveRoom(room)
  }

  const handleBack = () => {
    setActiveRoom(null)
  }

  // Mobile: show either list or room
  if (!isPC) {
    if (activeRoom) {
      return (
        <div className="flex h-[calc(100dvh-3.5rem-3.5rem)] flex-col">
          <button type="button" onClick={handleBack} className="flex items-center gap-2 px-5 py-3">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path
                d="M12.5 15L7.5 10L12.5 5"
                stroke="#5d5d5d"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-semibold text-text-primary">채팅</span>
          </button>
          <div className="flex-1 overflow-hidden">
            <ChatRoomPanel room={activeRoom} currentUserId={currentUserId} />
          </div>
        </div>
      )
    }

    return (
      <div className="h-[calc(100dvh-3.5rem-3.5rem)]">
        <ChatRoomList activeRoomId={null} onSelectRoom={handleSelectRoom} />
      </div>
    )
  }

  // PC: two-column layout
  return (
    <div className="mx-auto flex h-[calc(100dvh-4rem)] max-w-[80rem]">
      {/* Left: Room List */}
      <div className="w-[26.1875rem] shrink-0">
        <ChatRoomList activeRoomId={activeRoom?.roomId ?? null} onSelectRoom={handleSelectRoom} />
      </div>

      {/* Right: Chat Room */}
      <div className="flex-1">
        {activeRoom ? (
          <ChatRoomPanel room={activeRoom} currentUserId={currentUserId} />
        ) : (
          <ChatEmptyState />
        )}
      </div>
    </div>
  )
}

export { ChatPageContent }
