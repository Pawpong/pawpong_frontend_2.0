'use client'

import { CtaModal } from '@/shared/ui'

interface CommunityEditorExitDialogProps {
  open: boolean
  isEdit: boolean
  isSubmitting: boolean
  configReady: boolean
  canSaveDraft: boolean
  error: string | null
  onCancel: () => void
  onDiscard: () => void
  onSaveDraft: () => void
}

export function CommunityEditorExitDialog({
  open,
  isEdit,
  isSubmitting,
  configReady,
  canSaveDraft,
  error,
  onCancel,
  onDiscard,
  onSaveDraft,
}: CommunityEditorExitDialogProps) {
  const description = isSubmitting
    ? '저장 결과를 확인하고 있어요. 잠시만 기다려 주세요.'
    : error
      ? `${error} 입력한 내용은 남아 있어요.`
      : !configReady
        ? '작성 설정을 확인해야 저장할 수 있어요. 계속 작성하기를 눌러 다시 시도해 주세요.'
        : isEdit
          ? '수정한 내용은 저장되지 않아요.'
          : '임시저장한 뒤 이동할 수 있어요. 임시보관함에서 이어서 작성해 주세요.'
  return (
    <CtaModal
      open={open}
      onOpenChange={(next) => !next && !isSubmitting && onCancel()}
      showClose={!isSubmitting}
      title={isEdit ? '게시글 수정을 그만하시겠어요?' : '게시글 작성을 그만하시겠어요?'}
      description={
        <span
          role={!isSubmitting && error ? 'alert' : undefined}
          className="inline-block pt-1 text-sm leading-relaxed font-normal break-keep"
        >
          {description}
        </span>
      }
      actions={[
        ...(!isEdit
          ? [
              {
                label: '임시저장 후 이동',
                intent: 'primary' as const,
                onClick: onSaveDraft,
                disabled: !canSaveDraft || isSubmitting,
              },
            ]
          : []),
        {
          label: isEdit ? '수정 그만하기' : '게시글 작성 그만하기',
          intent: 'secondary',
          onClick: onDiscard,
          disabled: isSubmitting,
        },
        { label: '계속 작성하기', intent: 'ghost', onClick: onCancel, disabled: isSubmitting },
      ]}
    />
  )
}
