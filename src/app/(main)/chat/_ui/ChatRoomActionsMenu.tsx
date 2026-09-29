'use client'

import { useState } from 'react'
import { useCloseChatRoom, useChangeChatUserBlock } from '@/features/send-message'
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
  counterpartUserId: string
  counterpartName: string
  onClosed?: () => void
}

/** 채팅방 헤더와 목록이 공유하는 나가기 메뉴·확인 흐름. */
const ChatRoomActionsMenu = ({
  roomId,
  counterpartUserId,
  counterpartName,
  onClosed,
}: ChatRoomActionsMenuProps) => {
  const closeRoom = useCloseChatRoom()
  const changeBlock = useChangeChatUserBlock()
  const [blockAction, setBlockAction] = useState<'block' | 'unblock' | null>(null)

  const closeBlockDialog = () => {
    if (changeBlock.isPending) return
    setBlockAction(null)
    changeBlock.reset()
  }

  const openBlockDialog = (action: 'block' | 'unblock') => {
    changeBlock.reset()
    setBlockAction(action)
  }
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
          <button
            type="button"
            aria-label={`${counterpartName} 채팅방 더보기`}
            className="-m-2 flex size-10 shrink-0 items-center justify-center text-neutral-850 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
          >
            <MoreVertIcon className="size-6" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => openBlockDialog('block')}>사용자 차단</DropdownMenuItem>
          {/* 서버가 차단 상태 조회를 제공하지 않으므로 로컬 상태를 실제 상태처럼 표시하지 않는다.
              차단·해제 명령은 멱등적이며 재실행하거나 재설치한 뒤에도 해제할 수 있다. */}
          <DropdownMenuItem onSelect={() => openBlockDialog('unblock')}>
            사용자 차단 해제
          </DropdownMenuItem>
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
        open={blockAction !== null}
        onOpenChange={(open) => {
          if (!open) closeBlockDialog()
        }}
        title={
          changeBlock.isSuccess
            ? blockAction === 'block'
              ? '사용자를 차단했어요'
              : '차단을 해제했어요'
            : blockAction === 'block'
              ? '사용자를 차단할까요?'
              : '차단을 해제할까요?'
        }
        description={
          changeBlock.error
            ? normalizeApiError(
                changeBlock.error,
                '차단 설정을 변경하지 못했습니다. 다시 시도해 주세요.',
              ).message
            : blockAction === 'block'
              ? `${counterpartName}님과 서로 새 대화를 시작하거나 메시지를 보낼 수 없습니다. 기존 대화는 남아 있으며 이 메뉴에서 차단을 해제할 수 있습니다.`
              : `${counterpartName}님에 대한 내 차단을 해제합니다. 상대방도 나를 차단했다면 대화를 시작할 수 없습니다.`
        }
        showClose={!changeBlock.isPending}
        direction="row"
        actions={
          changeBlock.isSuccess
            ? [{ label: '확인', variant: 'fill', onClick: closeBlockDialog }]
            : [
                {
                  label: '취소',
                  variant: 'outline',
                  onClick: closeBlockDialog,
                  disabled: changeBlock.isPending,
                },
                {
                  label: changeBlock.isPending
                    ? '처리 중'
                    : blockAction === 'block'
                      ? '차단'
                      : '차단 해제',
                  variant: 'fill',
                  disabled: changeBlock.isPending,
                  onClick: () => {
                    if (changeBlock.isPending || !blockAction) return
                    changeBlock.mutate({
                      userId: counterpartUserId,
                      blocked: blockAction === 'block',
                    })
                  },
                },
              ]
        }
      />

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
            variant: 'outline',
            onClick: () => handleOpenChange(false),
            disabled: closeRoom.isPending,
          },
          {
            label: closeRoom.isPending ? '나가는 중' : '나가기',
            variant: 'fill',
            onClick: handleConfirm,
            disabled: closeRoom.isPending,
            className: 'bg-error-500 text-white hover:bg-error-600 active:bg-error-600',
          },
        ]}
      />
    </>
  )
}

export { ChatRoomActionsMenu }
