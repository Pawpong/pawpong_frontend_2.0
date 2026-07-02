'use client'

import { Container } from '@/shared/ui'

interface PostFormCTAProps {
  onSaveDraft: () => void
  onSubmit: () => void
  submitLabel?: string
  isValid: boolean
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
            <button
              type="button"
              onClick={onSaveDraft}
              disabled={isSubmitting}
              className="h-12 w-[6.813rem] shrink-0 rounded-full border border-[#d4d4d4] text-base font-semibold text-text-primary disabled:opacity-50 tab:w-[17rem]"
            >
              임시저장
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!isValid || isSubmitting}
              className="h-12 flex-1 rounded-full bg-fill-muted text-base font-semibold text-text-primary disabled:opacity-50 tab:w-[17rem] tab:flex-none"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export { PostFormCTA }
