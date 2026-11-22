'use client'

import { useAuthStatus } from '@/shared/lib/useAuthStatus'
import { cn } from '@/shared/lib/cn'
import type { ChatRoomResponseDto } from '@/shared/types'
import { Badge, ProfileAvatar, SwipeableRow } from '@/shared/ui'
import { getChatMessagePreview } from '../_lib/attachment'
import { isAdoptionRoom, isGeneralRoom } from '../_lib/constants'
import { ChatRoomActionsDropdown, useChatRoomActions } from './ChatRoomActionsMenu'
import { RelativeTime } from './RelativeTime'

interface ChatRoomItemProps {
  room: ChatRoomResponseDto
  isActive: boolean
  unreadCount?: number
  onClick: () => void
  onRoomClosed?: () => void
  /** 스와이프로 액션이 열려 있는지 — 목록이 한 번에 한 행만 열리게 관리한다 */
  swipeOpen: boolean
  onSwipeOpenChange: (open: boolean) => void
}

/**
 * 채팅방 목록 행 (A안) — 48px 아바타 + 두 줄.
 * 1줄: 닉네임 + 종류 배지(입양·상담·일반) | 시간 / 2줄: 마지막 메시지 | 안읽음 수.
 * 차단·나가기는 평소에 보이지 않는다 — 손가락은 행을 왼쪽으로 밀어서, 마우스는 행에 올리면 나오는 ⋮ 로 연다.
 */
const ChatRoomItem = ({
  room,
  isActive,
  unreadCount = 0,
  onClick,
  onRoomClosed,
  swipeOpen,
  onSwipeOpenChange,
}: ChatRoomItemProps) => {
  const { userRole } = useAuthStatus()
  const counterpartName = room.counterpart.nickname
  const actions = useChatRoomActions({
    roomId: room.roomId,
    counterpartUserId: room.counterpart.userId,
    counterpartName,
    blockedByMe: room.blockedByMe,
    onClosed: onRoomClosed,
  })
  const roomType = isGeneralRoom(room, userRole) ? '일반' : isAdoptionRoom(room) ? '입양' : '상담'
  const hasUnread = unreadCount > 0

  return (
    <>
      <SwipeableRow
        open={swipeOpen}
        onOpenChange={onSwipeOpenChange}
        actions={[
          room.blockedByMe
            ? { label: '차단 해제', onClick: () => actions.openBlockDialog('unblock') }
            : { label: '차단', onClick: () => actions.openBlockDialog('block') },
          { label: '나가기', tone: 'danger', onClick: actions.openLeaveDialog },
        ]}
      >
        <div
          className={cn(
            'group relative flex items-center transition-colors hover:bg-primary-50',
            isActive && 'bg-point-50 hover:bg-point-50',
          )}
        >
          <button
            type="button"
            onClick={onClick}
            className="flex min-w-0 flex-1 items-center gap-3 rounded-lg py-3 text-left focus-ring"
          >
            <ProfileAvatar
              src={room.counterpart.profileImageUrl}
              alt={`${counterpartName} 프로필`}
              size="list"
            />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <div className="flex min-w-0 items-center gap-2">
                <span className="truncate text-body-s font-semibold text-neutral-850">
                  {counterpartName}
                </span>
                <Badge variant="primarySoft" className="shrink-0">
                  {roomType}
                </Badge>
                <RelativeTime
                  dateStr={room.lastMessageAt}
                  className="ml-auto shrink-0 text-neutral-700"
                />
              </div>
              <div className="flex min-w-0 items-center gap-2">
                <p
                  className={cn(
                    'min-w-0 flex-1 truncate text-sm leading-[1.5]',
                    hasUnread ? 'font-semibold text-neutral-850' : 'font-medium text-neutral-700',
                  )}
                >
                  {getChatMessagePreview(room.lastMessage)}
                </p>
                {hasUnread && (
                  <Badge variant="pointCount" className="min-w-5 shrink-0 px-1.5">
                    {unreadCount}
                  </Badge>
                )}
              </div>
            </div>
          </button>
          {/* 마우스로 올렸을 때만 보이는 ⋮ — 시간·안읽음 자리를 같은 바탕으로 덮는다.
              hover 가 없는 터치 기기에서는 숨기고 스와이프가 대신한다. 메뉴가 열려 있거나 키보드로 들어오면 남긴다 */}
          <div className="absolute top-1/2 right-0 hidden -translate-y-1/2 bg-primary-50 pl-2 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100 has-[[data-state=open]]:opacity-100 [@media(hover:hover)]:block">
            <ChatRoomActionsDropdown
              actions={actions}
              counterpartName={counterpartName}
              blockedByMe={room.blockedByMe}
            />
          </div>
        </div>
      </SwipeableRow>
      {actions.dialogs}
    </>
  )
}

export { ChatRoomItem }
