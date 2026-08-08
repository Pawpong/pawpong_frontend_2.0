'use client'

import * as React from 'react'
import { cn } from '@/shared/lib/cn'
import { useChatRoom } from '@/features/chat-realtime'
import type { ChatRoomResponseDto } from '@/shared/types'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
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
  const {
    messages,
    isLoading,
    isError,
    isConnected,
    socketError,
    sendMessage,
    markAsRead,
    refetch,
  } = useChatRoom(room.roomId, currentUserId)
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const displayName = room.counterpart.nickname
  const [showNotice, setShowNotice] = React.useState(true)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  React.useEffect(() => {
    if (isConnected) markAsRead()
  }, [isConnected, markAsRead, messages.length])

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-point-50">
      {/* [refactored] 헤더 JSX를 ChatRoomHeader 컴포넌트로 추출 */}
      <ChatRoomHeader
        displayName={displayName}
        profileImageUrl={room.counterpart.profileImageUrl}
        hasApplication={!!room.applicationId}
        onBack={onBack}
      />

      {/* Pet Info Card */}
      {room.applicationId && <PetInfoCard />}

      {/* 모바일 알림은 펫 카드 바로 아래에서 전체 폭으로 노출한다. */}
      {showNotice && (
        <ChatNoticeBanner onClose={() => setShowNotice(false)} className="rounded-none pc:hidden" />
      )}

      {/* PC 알림은 Figma chatting-room 영역 안에서 대화 목록과 스크롤 면을 공유한다. */}
      <div className={cn('flex-1 overflow-y-auto py-5', CHAT_GUTTER_X)}>
        <div className={cn(CHAT_CONTENT_WIDTH, 'flex flex-col gap-10')}>
          {showNotice && (
            <ChatNoticeBanner
              onClose={() => setShowNotice(false)}
              className="hidden rounded-lg pc:flex"
            />
          )}

          <div className="flex flex-col gap-3">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-neutral-700">
                메시지를 불러오는 중입니다.
              </p>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <p className="text-sm text-neutral-700">메시지를 불러오지 못했습니다.</p>
                <button
                  type="button"
                  onClick={() => void refetch()}
                  className="rounded-lg bg-neutral-850 px-3 py-2 text-sm font-semibold text-white"
                >
                  다시 시도
                </button>
              </div>
            ) : (
              messages.map((msg) => (
                <ChatMessageBubble
                  key={msg.messageId}
                  message={msg}
                  isMine={msg.isMine}
                  senderName={displayName}
                  showProfile={!msg.isMine}
                />
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {socketError && (
        <p className="bg-error-50 px-4 py-2 text-center text-xs text-error-700">{socketError}</p>
      )}

      {/* Input */}
      <ChatMessageInput onSend={sendMessage} disabled={room.status === 'closed' || !isConnected} />
    </div>
  )
}

export { ChatRoomPanel }
