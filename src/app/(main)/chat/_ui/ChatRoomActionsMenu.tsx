'use client'

import { useState } from 'react'
import { useCloseChatRoom } from '@/features/send-message'
import { normalizeApiError } from '@/shared/api'
import { MoreVertIcon } from '@/shared/assets'
import {
  CtaModal,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  IconButton,
} from '@/shared/ui'

interface ChatRoomActionsMenuProps {
  roomId: string
  counterpartName: string
  onClosed?: () => void
}

/** 채팅방 헤더와 목록이 공유하는 나가기 메뉴·확인 흐름. */
const ChatRoomActionsMenu = ({ roomId, counterpartName, onClosed }: ChatRoomActionsMenuProps) => {
  const closeRoom = useCloseChatRoom()
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleOpenChange = (open: boolean) => {
    if (closeRoom.isPending) return
    setConfirmOpen(open)
    if (!open) closeRoom.reset()
  }

  const handleConfirm = () => {
    if (closeRoom.isPending) return
    closeRoom.mutate(roomId, {
      onSuccess: () => {
        setConfirmOpen(false)
        onClosed?.()
      },
    })
  }

  const errorMessage = closeRoom.error
    ? normalizeApiError(closeRoom.error, '채팅방에서 나가지 못했습니다.').message
    : null

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <IconButton edge="both" aria-label={`${counterpartName} 채팅방 더보기`}>
            <MoreVertIcon className="size-6" />
          </IconButton>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onSelect={() => {
              closeRoom.reset()
              setConfirmOpen(true)
            }}
            className="text-error-500 focus:text-error-600"
          >
            채팅방 나가기
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <CtaModal
        open={confirmOpen}
        onOpenChange={handleOpenChange}
        title="채팅방에서 나갈까요?"
        description={
          errorMessage ??
          `${counterpartName}님과의 대화가 목록에서 사라집니다. 다시 문의하면 새 채팅방이 만들어집니다.`
        }
        showClose={!closeRoom.isPending}
        direction="row"
        actions={[
          {
            label: '취소',
            intent: 'secondary',
            onClick: () => handleOpenChange(false),
            disabled: closeRoom.isPending,
          },
          {
            label: closeRoom.isPending ? '나가는 중' : '나가기',
            intent: 'danger',
            onClick: handleConfirm,
            disabled: closeRoom.isPending,
          },
        ]}
      />
    </>
  )
}

export { ChatRoomActionsMenu }
