'use client'

import * as React from 'react'
import { useQuery } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { chatQueries, useChatRoomSocket } from '@/entities/chat'
import { profileQueries } from '@/entities/profile'
import { CHAT_CONTENT_WIDTH, CHAT_GUTTER_X } from '../_lib/constants'
import { ChatRoomHeader } from './ChatRoomHeader'
import { PetInfoCard } from './PetInfoCard'
import { ChatNoticeBanner } from './ChatNoticeBanner'
import { ChatMessageBubble } from './ChatMessageBubble'
import { ChatMessageInput } from './ChatMessageInput'

interface ChatRoomPanelProps {
  room: ChatRoomResponseDto
  onBack: () => void
}

const ChatRoomPanel = ({ room, onBack }: ChatRoomPanelProps) => {
  const displayName = room.counterpart.nickname
  const messagesEndRef = React.useRef<HTMLDivElement>(null)
  const [showNotice, setShowNotice] = React.useState(true)

  // 현재 사용자 (소켓 수신 메시지의 isMine 계산에 사용)
  const { data: myProfile } = useQuery(profileQueries.me())
  const currentUserId = myProfile?.userId ?? ''

  // 메시지 내역 조회 (GET /chat/rooms/:roomId/messages) — 시간 오름차순 정렬
  const { data: history } = useQuery(chatQueries.messages(room.roomId))
  const messages = React.useMemo(
    () => [...(history ?? [])].sort((a, b) => a.createdAt.localeCompare(b.createdAt)),
    [history],
  )

  // 실시간 연결 (join_room / new_message 수신 / send_message)
  const { sendMessage } = useChatRoomSocket(room.roomId, currentUserId)

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

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
            className="rounded-none tab:rounded-lg pc:mx-auto pc:w-full pc:max-w-[55rem]"
          />
        </div>
      )}

      {/* Messages */}
      <div className={cn('flex-1 overflow-y-auto py-5', CHAT_GUTTER_X)}>
        <div className={cn(CHAT_CONTENT_WIDTH, 'flex flex-col gap-3')}>
          {messages.map((msg, idx) => {
            const prevMsg = messages[idx - 1]
            // 상대가 연속으로 보낸 메시지 묶음의 첫 줄에만 프로필 표시
            const showProfile = !msg.isMine && (!prevMsg || prevMsg.isMine)

            return (
              <ChatMessageBubble
                key={msg.messageId}
                message={msg}
                isMine={msg.isMine}
                senderName={displayName}
                showProfile={showProfile}
              />
            )
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatMessageInput onSend={sendMessage} disabled={room.status === 'closed'} />
    </div>
  )
}

export { ChatRoomPanel }
