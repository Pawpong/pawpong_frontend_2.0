'use client'

import * as React from 'react'
import { Badge } from '@/shared/ui'
import { MOCK_CHAT_MESSAGES } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { getDisplayName } from '../_lib/utils'
import { PetInfoCard } from './PetInfoCard'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatMessageInput } from './ChatMessageInput'

interface ChatRoomPanelProps {
  room: ChatRoomResponseDto
  currentUserId: string
  onBack: () => void
}

const ChatRoomPanel = ({ room, currentUserId, onBack }: ChatRoomPanelProps) => {
  const messages = MOCK_CHAT_MESSAGES.filter((msg) => msg.roomId === room.roomId)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const displayName = getDisplayName(room.breederId)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (_content: string) => {
    // mock: no-op
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col">
      {/* Room Header */}
      <div className="flex items-center gap-[0.625rem] bg-white px-5 py-3 pc:gap-3 pc:py-5">
        <button
          type="button"
          onClick={onBack}
          className="shrink-0 pc:hidden"
          aria-label="뒤로 가기"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M15 18L9 12L15 6"
              stroke="#5d5d5d"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <div className="hidden size-11 shrink-0 rounded-full bg-fill-muted pc:block" />
        <span className="flex-1 text-sm leading-[1.5] font-semibold text-text-primary pc:flex-none pc:text-xl pc:leading-[1.375rem]">
          {displayName}
        </span>
        {room.applicationId && (
          <Badge variant="outline" className="text-xs pc:text-sm">
            80 BPM
          </Badge>
        )}
      </div>

      {/* Pet Info Card */}
      {room.applicationId && <PetInfoCard />}

      {/* Messages */}
      <div className="mx-5 mt-3 flex-1 overflow-y-auto rounded-2xl bg-surface-primary">
        {/* Notice */}
        <div className="px-4 pt-3 text-center pc:px-6 pc:pt-[1.125rem]">
          <p className="text-[0.625rem] leading-[1.5] font-medium text-text-muted pc:text-sm">
            담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요
          </p>
          <p className="text-[0.625rem] leading-[1.5] font-medium text-text-muted pc:text-sm">
            채팅 내용을 pawpong팀이 검수할 수 있습니다.
          </p>
        </div>

        {/* Message List */}
        <div className="flex flex-col gap-5 p-6">
          {messages.map((msg, idx) => {
            const isMine = msg.senderId === currentUserId
            const prevMsg = messages[idx - 1]
            const showAvatar = !isMine && (!prevMsg || prevMsg.senderId !== msg.senderId)

            return (
              <ChatMessageBubble
                key={msg.messageId}
                message={msg}
                isMine={isMine}
                showAvatar={showAvatar}
              />
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatMessageInput onSend={handleSend} disabled={room.status === 'closed'} />
    </div>
  )
}

export { ChatRoomPanel }
