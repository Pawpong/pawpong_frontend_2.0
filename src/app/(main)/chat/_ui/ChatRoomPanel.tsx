'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { MOCK_CHAT_MESSAGES } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
import { getDisplayName } from '../_lib/utils'
import { ChatRoomHeader } from './ChatRoomHeader'
import { PetInfoCard } from './PetInfoCard'
import { ChatNoticeBanner } from './ChatNoticeBanner'
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
  const [showNotice, setShowNotice] = React.useState(true)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  const handleSend = (_content: string) => {
    // mock: no-op
  }

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-[#ededed]">
      {/* [refactored] 헤더 JSX를 ChatRoomHeader 컴포넌트로 추출 */}
      <ChatRoomHeader
        displayName={displayName}
        hasApplication={!!room.applicationId}
        onBack={onBack}
      />

      {/* Pet Info Card */}
      {room.applicationId && <PetInfoCard />}

      {/* Notice Banner — 펫 카드 아래 고정 (모바일 풀폭 / 태블릿+ 컨테이너 정렬) */}
      {showNotice && (
        <div className="tab:px-12 tab:py-3 pc:px-20">
          <ChatNoticeBanner
            onClose={() => setShowNotice(false)}
            className="rounded-none tab:mx-auto tab:w-full tab:max-w-[55rem] tab:rounded-lg"
          />
        </div>
      )}

      {/* Messages */}
      <div className={cn('flex-1 overflow-y-auto py-5', CHAT_GUTTER_X)}>
        <div className={cn(CHAT_CONTENT_WIDTH, 'flex flex-col gap-3')}>
          {messages.map((msg, idx) => {
            const isMine = msg.senderId === currentUserId
            const prevMsg = messages[idx - 1]
            const showProfile = !isMine && (!prevMsg || prevMsg.senderId !== msg.senderId)

            return (
              <ChatMessageBubble
                key={msg.messageId}
                message={msg}
                isMine={isMine}
                senderName={displayName}
                showProfile={showProfile}
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
