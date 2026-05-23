'use client'

import { Container } from '@/shared/ui'

interface PostFormCTAProps {
  onSaveDraft: () => void
  onSubmit: () => void
  submitLabel?: string
  isValid: boolean
  /** 왼쪽 슬롯 (예: visibility select) */
  leftSlot?: React.ReactNode
}

const PostFormCTA = ({
  onSaveDraft,
  onSubmit,
  submitLabel = '업로드',
  isValid,
  leftSlot,
}: PostFormCTAProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/50 backdrop-blur-sm">
      <Container className="tab:px-[6.25rem]">
        <div className="flex items-center gap-[0.625rem] p-5 tab:h-[5.875rem] tab:justify-between tab:p-0">
          {/* Left Slot — desktop only */}
          {leftSlot && (
            <div className="hidden tab:block">
              {leftSlot}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex w-full items-center gap-[0.625rem] tab:w-auto tab:gap-3">
            <button
              type="button"
              onClick={onSaveDraft}
              className="h-12 w-[6.813rem] shrink-0 rounded-full border border-[#d4d4d4] text-base font-semibold text-text-primary tab:w-[17rem]"
            >
              임시저장
            </button>
            <button
              type="button"
              onClick={onSubmit}
              disabled={!isValid}
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
