'use client'

import { PageHeader } from '@/shared/ui'
import type { ChatRoomResponseDto } from '@/shared/types'
import { ChatRoomFilterableList } from './ChatRoomFilterableList'

interface ChatRoomListProps {
  activeRoomId: string | null
  onSelectRoom: (room: ChatRoomResponseDto) => void
}

const ChatRoomList = ({ activeRoomId, onSelectRoom }: ChatRoomListProps) => {
  return (
    <div>
      {/* Header */}
      <PageHeader title="채팅" backHref="/" />

      {/* [refactored] 필터 탭 + 방 목록 공통 컴포넌트로 대체 */}
      <ChatRoomFilterableList activeRoomId={activeRoomId} onSelectRoom={onSelectRoom} />
    </div>
  )
}

export { ChatRoomList }
