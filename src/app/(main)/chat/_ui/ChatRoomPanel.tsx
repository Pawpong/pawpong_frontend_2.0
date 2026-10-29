'use client'

import { RetryButton } from '@/shared/ui'
import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { useChatRoom } from '@/features/chat-realtime'
import { adoptionQueries } from '@/entities/adoption'
import { applicationQueries } from '@/entities/application'
import type { ChatRoomResponseDto } from '@/shared/types'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X, CHAT_PANEL_HEIGHT } from '../_lib/constants'
import { findCounterpartReadIndex } from '../_lib/readMarker'
import { isPinnedToBottom, shouldFollowNewMessage } from '../_lib/autoScroll'
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
    isFetching: isRetrying,
  } = useChatRoom(room.roomId, currentUserId)
  const scrollRef = React.useRef<HTMLDivElement>(null)
  // 사용자가 지금 맨 아래를 보고 있는지. 스크롤할 때마다 갱신하고 새 메시지가 올 때 참고한다.
  const pinnedToBottom = React.useRef(true)
  const paintedCount = React.useRef(0)
  const displayName = room.counterpart.nickname
  const [showNotice, setShowNotice] = React.useState(true)

  // 상단 펫 카드 — room.petId(신청서 없이 분양글에서 바로 문의한 방)가 있으면 그걸 바로 쓰고,
  // 없으면(신청서 기반 구방) 신청 -> 펫 상세 순으로 조회해 채운다.
  const applicationQuery = useQuery({
    ...applicationQueries.detail(room.petId ? '' : (room.applicationId ?? '')),
    throwOnError: false,
  })
  const petQuery = useQuery({
    ...adoptionQueries.detail(room.petId ?? applicationQuery.data?.petId ?? ''),
    throwOnError: false,
  })

  const handleScroll = React.useCallback(() => {
    const el = scrollRef.current
    if (el) pinnedToBottom.current = isPinnedToBottom(el)
  }, [])

  // 새 메시지가 늘어난 순간에만 따라 내려간다.
  // scrollIntoView 는 조상 스크롤 컨테이너까지 함께 움직이므로 목록만 직접 조작한다.
  React.useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || messages.length === paintedCount.current) return
    const firstPaint = paintedCount.current === 0
    paintedCount.current = messages.length
    const follow = shouldFollowNewMessage({
      firstPaint,
      pinnedToBottom: pinnedToBottom.current,
      newestIsMine: Boolean(messages[messages.length - 1]?.isMine),
    })
    if (!follow) return
    el.scrollTo({ top: el.scrollHeight, behavior: firstPaint ? 'auto' : 'smooth' })
    pinnedToBottom.current = true
  }, [messages])

  // 방을 다시 열 때 기존 채팅 알림도 정리하고, 보이는 동안 새 메시지를 읽음 처리한다.
  const hasUnread = messages.some((message) => !message.isMine && !message.isRead)
  // 상대가 어디까지 읽었는지 — 그 말풍선 아래에만 상대 프로필을 작게 붙인다.
  const counterpartReadIndex = React.useMemo(() => findCounterpartReadIndex(messages), [messages])
  React.useEffect(() => {
    const readVisibleMessages = () => {
      if (document.visibilityState !== 'hidden' && isConnected) markAsRead()
    }
    readVisibleMessages()
    document.addEventListener('visibilitychange', readVisibleMessages)
    window.addEventListener('pawpong:app-active', readVisibleMessages)
    return () => {
      document.removeEventListener('visibilitychange', readVisibleMessages)
      window.removeEventListener('pawpong:app-active', readVisibleMessages)
    }
  }, [isConnected, hasUnread, markAsRead])

  return (
    <div className={cn(CHAT_PANEL_HEIGHT, 'flex min-w-0 flex-col bg-point-50')}>
      {/* [refactored] 헤더 JSX를 ChatRoomHeader 컴포넌트로 추출 */}
      <ChatRoomHeader
        roomId={room.roomId}
        displayName={displayName}
        profileImageUrl={room.counterpart.profileImageUrl}
        counterpartUserId={room.counterpart.userId}
        blockedByMe={room.blockedByMe}
        // 애정도 뱃지 보류로 미전달
        // hasApplication={!!room.applicationId}
        onBack={onBack}
        onRoomClosed={onRoomClosed}
      />

      {/* Pet Info Card */}
      {petQuery.data && <PetInfoCard detail={petQuery.data} />}

      {/* 모바일 알림 — 펫 카드 바로 아래, 나머지 화면과 같은 가로 여백 + 둥근 카드로 노출한다. */}
      {showNotice && (
        <div className={cn(CHAT_GUTTER_X, 'pt-3 pc:hidden')}>
          <ChatNoticeBanner onClose={() => setShowNotice(false)} className="rounded-lg" />
        </div>
      )}

      {/* PC 알림은 Figma chatting-room 영역 안에서 대화 목록과 스크롤 면을 공유한다. */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className={cn('flex-1 overflow-y-auto py-5 tab:py-7', CHAT_GUTTER_X)}
      >
        <div className={cn(CHAT_CONTENT_WIDTH, 'flex flex-col gap-6')}>
          {showNotice && (
            <ChatNoticeBanner
              onClose={() => setShowNotice(false)}
              className="hidden rounded-lg pc:flex"
            />
          )}

          <div className="flex flex-col gap-2.5">
            {isLoading ? (
              <p className="py-10 text-center text-sm text-neutral-700">
                메시지를 불러오는 중입니다.
              </p>
            ) : isError ? (
              <div className="flex flex-col items-center gap-3 py-10">
                <p className="text-sm text-neutral-700">메시지를 불러오지 못했습니다.</p>
                <RetryButton onRetry={() => void refetch()} isRetrying={isRetrying} />
              </div>
            ) : (
              messages.map((msg, idx) => (
                <ChatMessageBubble
                  key={msg.messageId}
                  message={msg}
                  isMine={msg.isMine}
                  senderName={displayName}
                  senderProfileImageUrl={room.counterpart.profileImageUrl}
                  // 상대 메시지가 연속되면 첫 말풍선에만 프로필을 노출한다.
                  showProfile={!msg.isMine && messages[idx - 1]?.isMine !== false}
                  readByCounterpart={idx === counterpartReadIndex}
                />
              ))
            )}
          </div>
        </div>
      </div>

      {socketError && (
        <p className="bg-error-50 px-4 py-2 text-center text-xs text-error-700">{socketError}</p>
      )}

      {/* Input */}
      <ChatMessageInput
        onSend={sendMessage}
        disabled={room.status === 'closed' || !isConnected}
        unavailableMessage={
          room.canMessage !== false
            ? undefined
            : room.blockedByMe
              ? '차단한 사용자예요. 더보기 메뉴에서 차단을 해제하면 다시 대화할 수 있어요.'
              : '지금은 메시지를 보낼 수 없는 대화예요.'
        }
      />
    </div>
  )
}

export { ChatRoomPanel }
