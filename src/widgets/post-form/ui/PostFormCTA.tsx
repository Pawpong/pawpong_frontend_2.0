'use client'

import { Button, Container } from '@/shared/ui'

interface PostFormCTAProps {
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
  /** 왼쪽 슬롯 (예: visibility select) */
  leftSlot?: React.ReactNode
}

const PostFormCTA = ({
  onSaveDraft,
  onSubmit,
  submitLabel = '업로드',
  isValid,
  isSaveDraftValid = true,
  isSubmitting = false,
  leftSlot,
}: PostFormCTAProps) => {
  return (
    <div className="fixed right-0 bottom-0 left-0 z-10 bg-white/50 backdrop-blur-sm">
      <Container className="tab:px-[6.25rem]">
        <div
          className={`flex items-center gap-[0.625rem] p-5 tab:h-[5.875rem] tab:p-0 ${leftSlot ? 'tab:justify-between' : 'tab:justify-end'}`}
        >
          {/* Left Slot — desktop only */}
          {leftSlot && <div className="hidden tab:block">{leftSlot}</div>}

          {/* Action Buttons */}
          <div className="flex w-full items-center gap-[0.625rem] tab:w-auto tab:gap-3">
            {onSaveDraft && (
              <Button
                variant="outline"
                size="lg"
                onClick={onSaveDraft}
                disabled={!isSaveDraftValid || isSubmitting}
                className="w-[6.813rem] shrink-0 border-[#d4d4d4] text-text-primary tab:w-[17rem]"
              >
                임시저장
              </Button>
            )}
            {/* 내용을 채우면 primary(노랑)로 활성화, 비어 있으면 회색 비활성 */}
            <Button
              variant="primary"
              size="lg"
              onClick={onSubmit}
              disabled={!isValid || isSubmitting}
              className="flex-1 tab:w-[17rem] tab:flex-none"
            >
              {submitLabel}
            </Button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export { PostFormCTA }
