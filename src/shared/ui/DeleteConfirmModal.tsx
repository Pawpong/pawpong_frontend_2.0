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
  /** 실패 후에도 확인창을 유지하며 재시도할 수 있도록 안내한다. */
  errorMessage?: string | null
  onCheck?: () => void
  isChecking?: boolean
}

/** 삭제 확인 모달 — 게시글·댓글 등에서 공통으로 쓰는 취소/삭제 2버튼 확인창 */
const DeleteConfirmModal = ({
  open,
  onOpenChange,
  target,
  onConfirm,
  isPending = false,
  errorMessage,
  onCheck,
  isChecking = false,
}: DeleteConfirmModalProps) => (
  <CtaModal
    open={open}
    // 요청 중에는 오버레이·X 로도 닫히지 않게 (닫혀도 요청은 계속 날아간다)
    onOpenChange={(next) => !isPending && !isChecking && onOpenChange(next)}
    title={`${target}을 삭제할까요?`}
    description={
      <>
        {`삭제한 ${target}은 복구할 수 없어요.`}
        {(isPending || isChecking) && (
          <span role="status" className="mt-2 block text-sm text-neutral-700">
            {isChecking ? '목록을 확인하고 있어요.' : '삭제 중이에요. 잠시 기다려 주세요.'}
          </span>
        )}
        {errorMessage && (
          <span role="alert" className="mt-2 block text-sm text-error-600">
            {errorMessage}
          </span>
        )}
      </>
    }
    actions={[
      {
        label: '취소',
        intent: 'secondary',
        onClick: () => onOpenChange(false),
        disabled: isPending || isChecking,
      },
      { label: '삭제', intent: 'primary', onClick: onConfirm, disabled: isPending || isChecking },
      ...(onCheck
        ? [
            {
              label: isChecking ? '목록 확인 중…' : '목록 다시 확인',
              intent: 'ghost' as const,
              onClick: onCheck,
              disabled: isPending || isChecking,
            },
          ]
        : []),
    ]}
  />
)

export { DeleteConfirmModal }
