'use client'

import { Button, FooterCtaBar } from '@/shared/ui'

interface PostFormCTAProps {
  /** Community groups actions below the body; adoption retains its fixed footer. */
  placement?: 'fixed' | 'inline'
  /** 미전달 시 임시저장 버튼 숨김 (수정 화면 등) */
  onSaveDraft?: () => void
  onSubmit: () => void
  submitLabel?: string
  /** 제출(발행) 가능 여부 */
  isValid: boolean
  /** 임시저장 가능 여부 — 미전달 시 항상 가능 (발행보다 조건이 느슨한 폼용) */
  isSaveDraftValid?: boolean
  /** 업로드/저장 진행 중 — 버튼 비활성화로 중복 제출 방지 */
  isSubmitting?: boolean
  /** 바 왼쪽 슬롯 (Figma 1054-36832 — 공개범위 드롭다운) */
  leftSlot?: React.ReactNode
}

/** 글 작성/수정 하단 CTA — 공통 FooterCtaBar 에 임시저장/업로드 액션만 얹는다 */
const PostFormCTA = ({
  onSaveDraft,
  onSubmit,
  submitLabel = '업로드',
  isValid,
  isSaveDraftValid = true,
  isSubmitting = false,
  leftSlot,
  placement = 'fixed',
}: PostFormCTAProps) =>
  placement === 'inline' ? (
    <div className="flex flex-wrap gap-3">
      {onSaveDraft && (
        <Button
          variant="outline"
          size="lg"
          onClick={onSaveDraft}
          disabled={!isSaveDraftValid || isSubmitting}
          className="min-w-28 flex-1 focus-visible:outline-2 focus-visible:outline-primary-500"
        >
          임시저장
        </Button>
      )}
      <Button
        size="lg"
        onClick={onSubmit}
        disabled={!isValid || isSubmitting}
        className="min-w-36 flex-[2] focus-visible:outline-2 focus-visible:outline-primary-500"
      >
        {isSubmitting ? '저장 중…' : submitLabel}
      </Button>
    </div>
  ) : (
    <FooterCtaBar
      leftSlot={leftSlot}
      secondary={
        onSaveDraft && {
          label: '임시저장',
          onClick: onSaveDraft,
          disabled: !isSaveDraftValid || isSubmitting,
        }
      }
      primary={{ label: submitLabel, onClick: onSubmit, disabled: !isValid || isSubmitting }}
    />
  )

export { PostFormCTA }
export type { PostFormCTAProps }
