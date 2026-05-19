'use client'

import { VisibilitySelect, type VisibilityType } from './VisibilitySelect'
import { Container } from '@/shared/ui'

interface PostCreateCTAProps {
  visibility: VisibilityType
  onVisibilityChange: (value: VisibilityType) => void
  onSaveDraft: () => void
  onUpload: () => void
  isValid: boolean
}

const PostCreateCTA = ({
  visibility,
  onVisibilityChange,
  onSaveDraft,
  onUpload,
  isValid,
}: PostCreateCTAProps) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-10 bg-white/50 backdrop-blur-sm">
      <Container className="tab:px-[6.25rem]">
        <div className="flex items-center gap-[0.625rem] p-5 tab:h-[5.875rem] tab:justify-between tab:p-0">
          {/* Visibility Dropdown — desktop only */}
          <div className="hidden tab:block">
            <VisibilitySelect value={visibility} onChange={onVisibilityChange} />
          </div>

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
              onClick={onUpload}
              disabled={!isValid}
              className="h-12 flex-1 rounded-full bg-fill-muted text-base font-semibold text-text-primary disabled:opacity-50 tab:w-[17rem] tab:flex-none"
            >
              업로드
            </button>
          </div>
        </div>
      </Container>
    </div>
  )
}

export { PostCreateCTA }
