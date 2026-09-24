'use client'

import { useState } from 'react'
import { useBlockChatUser, useCloseChatRoom } from '@/features/send-message'
import { normalizeApiError } from '@/shared/api'
import { MoreVertIcon } from '@/shared/assets'
import {
  CtaModal,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/ui'

interface ChatRoomActionsMenuProps {
  roomId: string
  /** 상대 userId — 차단 대상 지정에 쓴다 */
  counterpartUserId: string
  counterpartName: string
  onClosed?: () => void
}

/** 나가기와 차단은 확인창 구조가 같아 한 모달을 문구만 바꿔 쓴다 */
type PendingAction = 'leave' | 'block'

/**
 * 채팅방 헤더와 목록이 공유하는 나가기·차단 메뉴.
 *
 * 차단은 App Store 1.2 / Play UGC 정책이 1:1 대화가 있는 앱에 요구하는 항목이다.
 * 나가기와 달리 되돌리려면 상대를 다시 찾아 해제해야 하므로 문구에서 구분해 알린다.
 */
const ChatRoomActionsMenu = ({
  roomId,
  counterpartUserId,
  counterpartName,
  onClosed,
}: ChatRoomActionsMenuProps) => {
  const closeRoom = useCloseChatRoom()
  const blockUser = useBlockChatUser()
  const [pending, setPending] = useState<PendingAction | null>(null)

  const isPending = closeRoom.isPending || blockUser.isPending

  const openAction = (action: PendingAction) => {
    closeRoom.reset()
    blockUser.reset()
    setPending(action)
  }

  const handleOpenChange = (open: boolean) => {
    if (isPending) return
    if (!open) {
      setPending(null)
      closeRoom.reset()
      blockUser.reset()
    }
  }

  const handleConfirm = () => {
    if (isPending || !pending) return
    const onSuccess = () => {
      setPending(null)
      onClosed?.()
    }
    if (pending === 'block') {
      blockUser.mutate({ userId: counterpartUserId, roomId }, { onSuccess })
      return
    }
    closeRoom.mutate(roomId, { onSuccess })
  }

  const errorMessage = closeRoom.error
    ? normalizeApiError(closeRoom.error, '채팅방에서 나가지 못했습니다.').message
    : blockUser.error
      ? normalizeApiError(blockUser.error, `${counterpartName}님을 차단하지 못했습니다.`).message
      : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            aria-label={`${counterpartName} 채팅방 더보기`}
            className="-m-2 flex size-10 shrink-0 items-center justify-center text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <MoreVertIcon className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => openAction('leave')}>채팅방 나가기</DropdownMenuItem>
          <DropdownMenuItem
            onSelect={() => openAction('block')}
            className="text-error-500 focus:text-error-600"
          >
            {counterpartName}님 차단하기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CtaModal
        open={pending !== null}
        onOpenChange={handleOpenChange}
        title={pending === 'block' ? `${counterpartName}님을 차단할까요?` : '채팅방에서 나갈까요?'}
        description={
          errorMessage ??
          (pending === 'block'
            ? `차단하면 ${counterpartName}님의 메시지를 더 이상 받지 않고 대화가 목록에서 사라집니다. 해제하기 전까지 다시 연결되지 않습니다.`
            : `${counterpartName}님과의 대화가 목록에서 사라집니다. 다시 문의하면 새 채팅방이 만들어집니다.`)
        }
        showClose={!isPending}
        direction="row"
        actions={[
          {
            label: '취소',
            variant: 'outline',
            onClick: () => handleOpenChange(false),
            disabled: isPending,
          },
          {
            label:
              pending === 'block'
                ? blockUser.isPending
                  ? '차단 중'
                  : '차단하기'
                : closeRoom.isPending
                  ? '나가는 중'
                  : '나가기',
            variant: 'fill',
            onClick: handleConfirm,
            disabled: isPending,
            className: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-600',
          },
        ]}
      />
    </>
  )
}

export { ChatRoomActionsMenu }
