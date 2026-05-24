'use client'

import * as React from 'react'
import { useChatMessages } from '@/entities/chat'
import { useSendMessage } from '@/features/send-message'
import { Badge } from '@/shared/ui'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatMessageInput } from './ChatMessageInput'

interface ChatRoomPanelProps {
  room: ChatRoomResponseDto
  currentUserId: string
}

const ChatRoomPanel = ({ room, currentUserId }: ChatRoomPanelProps) => {
  const { data: messages = [] } = useChatMessages(room.roomId)
  const sendMessage = useSendMessage(room.roomId)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (content: string) => {
    sendMessage.mutate(content)
  }

  return (
    <div className="flex h-full flex-col">
      {/* Room Header */}
      <div className="flex items-center gap-3 border-b border-border-light px-5 py-5">
        <div className="size-11 shrink-0 rounded-full bg-fill-muted" />
        <span className="text-xl leading-[1.375rem] font-semibold text-text-primary">
          {room.breederId}
        </span>
        {room.applicationId && <Badge variant="outline">80 BPM</Badge>}
      </div>

      {/* Messages */}
      <div className="mx-5 mt-3 flex-1 overflow-y-auto rounded-2xl bg-surface-primary">
        {/* Notice */}
        <div className="px-6 pt-[1.125rem] text-center">
          <p className="text-sm leading-[1.5] font-medium text-text-muted">
            담당 브리더와 채팅을 통해 더 상세한 입양 계획을 세워보세요
          </p>
          <p className="text-sm leading-[1.5] font-medium text-text-muted">
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
      <ChatMessageInput
        onSend={handleSend}
        disabled={room.status === 'closed' || sendMessage.isPending}
      />
    </div>
  )
}

export { ChatRoomPanel }
