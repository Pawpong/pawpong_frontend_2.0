'use client'

import * as React from 'react'
import { Badge } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { ArrowBackIcon, MoreVertIcon } from '@/shared/assets/icons'
import { MOCK_CHAT_MESSAGES } from '@/shared/mocks/chat'
import type { ChatRoomResponseDto } from '@/shared/types'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
import { getDisplayName } from '../_lib/utils'
import { ProfileAvatar } from './ProfileAvatar'
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
      {/* Room Header */}
      {/* [refactored] 가로 마진·콘텐츠 폭 상수 적용, justify-center → 내부 mx-auto로 통일 */}
      <div
        className={cn(
          'bg-white py-1 pc:py-2 shadow-[0px_7px_7px_rgba(55,55,55,0.1)]',
          CHAT_GUTTER_X,
        )}
      >
        <div className={cn(CHAT_CONTENT_WIDTH, 'flex items-center justify-between')}>
          <div className="flex items-center gap-5">
            <div className="flex items-center gap-1">
              <button type="button" onClick={onBack} className="shrink-0" aria-label="뒤로 가기">
                <ArrowBackIcon className="size-8 text-[#6b6b6b]" />
              </button>
              <div className="flex items-center gap-2">
                <ProfileAvatar size="md" />
                <span className="text-base leading-[1.5] font-semibold text-[#3e3e3e]">
                  {displayName}
                </span>
              </div>
            </div>
            {room.applicationId && <Badge variant="active">애정도</Badge>}
          </div>
          <button type="button" className="shrink-0" aria-label="더보기">
            <MoreVertIcon className="size-6 text-[#3e3e3e]" />
          </button>
        </div>
      </div>

      {/* Pet Info Card */}
      {room.applicationId && <PetInfoCard />}

      {/* Messages */}
      <div className={cn('flex-1 overflow-y-auto py-5', CHAT_GUTTER_X)}>
        <div className={cn(CHAT_CONTENT_WIDTH, 'flex flex-col gap-10')}>
          {showNotice && <ChatNoticeBanner onClose={() => setShowNotice(false)} />}

          <div className="flex flex-col gap-3">
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
      </div>

      {/* Input */}
      <ChatMessageInput onSend={handleSend} disabled={room.status === 'closed'} />
    </div>
  )
}

export { ChatRoomPanel }
