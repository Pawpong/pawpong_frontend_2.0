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
  IconButton,
} from '@/shared/ui'

interface ChatRoomActionsProps {
  roomId: string
  counterpartUserId: string
  counterpartName: string
  /** 채팅방 응답의 blockedByMe — 없으면(구버전 서버) 차단·해제를 모두 노출한다 */
  blockedByMe?: boolean
  onClosed?: () => void
}

/**
 * 채팅방 차단·차단 해제·나가기 — 확인 모달과 요청을 한 곳에서 갖는다.
 * 여는 방법만 자리마다 다르다: 방 헤더·PC 목록 호버는 ⋮ 메뉴, 모바일 목록은 행 스와이프 버튼.
 */
const useChatRoomActions = ({
  roomId,
  counterpartUserId,
  counterpartName,
  onClosed,
}: ChatRoomActionsProps) => {
  const closeRoom = useCloseChatRoom()
  const changeBlock = useChangeChatUserBlock()
  const [blockAction, setBlockAction] = useState<'block' | 'unblock' | null>(null)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const closeBlockDialog = () => {
    if (changeBlock.isPending) return
    setBlockAction(null)
    changeBlock.reset()
  }

  const openBlockDialog = (action: 'block' | 'unblock') => {
    changeBlock.reset()
    setBlockAction(action)
  }

  const handleLeaveOpenChange = (open: boolean) => {
    if (closeRoom.isPending) return
    setConfirmOpen(open)
    if (!open) closeRoom.reset()
  }

  const openLeaveDialog = () => {
    closeRoom.reset()
    setConfirmOpen(true)
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

  const dialogs = (
    <>
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
            ? [{ label: '확인', intent: 'primary', onClick: closeBlockDialog }]
            : [
                {
                  label: '취소',
                  intent: 'secondary',
                  onClick: closeBlockDialog,
                  disabled: changeBlock.isPending,
                },
                {
                  label: changeBlock.isPending
                    ? '처리 중'
                    : blockAction === 'block'
                      ? '차단'
                      : '차단 해제',
                  intent: 'primary',
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
        onOpenChange={handleLeaveOpenChange}
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
            onClick: () => handleLeaveOpenChange(false),
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

  return { openBlockDialog, openLeaveDialog, dialogs }
}

type ChatRoomActions = ReturnType<typeof useChatRoomActions>

/** ⋮ 메뉴 — 서버의 blockedByMe 로 차단·해제 중 하나만 보인다. 값이 없으면 상태를 모르니 둘 다 둔다
    (차단·해제 명령은 멱등이라 잘못 눌러도 상태가 꼬이지 않는다). */
const ChatRoomActionsDropdown = ({
  actions,
  counterpartName,
  blockedByMe,
}: {
  actions: ChatRoomActions
  counterpartName: string
  blockedByMe?: boolean
}) => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <IconButton edge="both" aria-label={`${counterpartName} 채팅방 더보기`}>
        <MoreVertIcon className="size-6" />
      </IconButton>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end">
      {blockedByMe !== true && (
        <DropdownMenuItem onSelect={() => actions.openBlockDialog('block')}>
          사용자 차단
        </DropdownMenuItem>
      )}
      {blockedByMe !== false && (
        <DropdownMenuItem onSelect={() => actions.openBlockDialog('unblock')}>
          사용자 차단 해제
        </DropdownMenuItem>
      )}
      <DropdownMenuItem
        onSelect={actions.openLeaveDialog}
        className="text-error-500 focus:text-error-600"
      >
        채팅방 나가기
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)

/** 채팅방 헤더의 ⋮ 메뉴 + 확인 흐름. */
const ChatRoomActionsMenu = (props: ChatRoomActionsProps) => {
  const actions = useChatRoomActions(props)
  return (
    <>
      <ChatRoomActionsDropdown
        actions={actions}
        counterpartName={props.counterpartName}
        blockedByMe={props.blockedByMe}
      />
      {actions.dialogs}
    </>
  )
}

export { ChatRoomActionsMenu, ChatRoomActionsDropdown, useChatRoomActions }
