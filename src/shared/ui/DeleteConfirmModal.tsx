'use client'

import { CtaModal } from './CtaModal'

interface DeleteConfirmModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 삭제 대상 이름 — '게시글', '댓글' 처럼 문구에 그대로 들어간다 */
  target: string
  onConfirm: () => void
  /** 삭제 요청 진행 중 — 두 버튼을 잠가 중복 요청/조기 취소를 막는다 */
  isPending?: boolean
}

/** 삭제 확인 모달 — 게시글·댓글 등에서 공통으로 쓰는 취소/삭제 2버튼 확인창 */
const DeleteConfirmModal = ({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending = false,
}: DeleteConfirmModalProps) => (
  <CtaModal
    open={open}
    // 요청 중에는 오버레이·X 로도 닫히지 않게 (닫혀도 요청은 계속 날아간다)
    onOpenChange={(next) => !isPending && onOpenChange(next)}
    title={`${target}을 삭제할까요?`}
    description={`삭제한 ${target}은 복구할 수 없습니다.`}
    actions={[
      {
        label: '취소',
        variant: 'outline',
        onClick: () => onOpenChange(false),
        disabled: isPending,
      },
      { label: '삭제', variant: 'fill', onClick: onConfirm, disabled: isPending },
    ]}
  />
)

export { DeleteConfirmModal }
