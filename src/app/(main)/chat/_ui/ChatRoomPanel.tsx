'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { useChatRoom } from '@/features/chat-realtime'
import { adoptionQueries } from '@/entities/adoption'
import { applicationQueries } from '@/entities/application'
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
  onRoomClosed: () => void
}

const ChatRoomPanel = ({ room, currentUserId, onBack, onRoomClosed }: ChatRoomPanelProps) => {
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

  // 입양 문의 방일 때만 신청 -> 펫 상세 순으로 조회해 상단 카드를 채운다.
  const applicationQuery = useQuery({
    ...applicationQueries.detail(room.applicationId ?? ''),
    throwOnError: false,
  })
  const petQuery = useQuery({
    ...adoptionQueries.detail(applicationQuery.data?.petId ?? ''),
    throwOnError: false,
  })

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  // 상대가 보낸 안 읽은 메시지가 있을 때만 읽음 처리를 emit한다.
  const hasUnread = messages.some((message) => !message.isMine && !message.isRead)
  React.useEffect(() => {
    if (isConnected && hasUnread) markAsRead()
  }, [isConnected, hasUnread, markAsRead])

  return (
    <div className="flex h-[calc(100dvh-4rem)] flex-col bg-point-50">
      {/* [refactored] 헤더 JSX를 ChatRoomHeader 컴포넌트로 추출 */}
      <ChatRoomHeader
        roomId={room.roomId}
        displayName={displayName}
        profileImageUrl={room.counterpart.profileImageUrl}
        // 애정도 뱃지 보류로 미전달
        // hasApplication={!!room.applicationId}
        onBack={onBack}
        onRoomClosed={onRoomClosed}
      />

      {/* Pet Info Card */}
      {petQuery.data && <PetInfoCard detail={petQuery.data} />}

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
              messages.map((msg, idx) => (
                <ChatMessageBubble
                  key={msg.messageId}
                  message={msg}
                  isMine={msg.isMine}
                  senderName={displayName}
                  // 상대 메시지가 연속되면 첫 말풍선에만 프로필을 노출한다.
                  showProfile={!msg.isMine && messages[idx - 1]?.isMine !== false}
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
