'use client'

import { Dialog, DialogOverlay, DialogPortal, DialogTitle } from '@/shared/ui/Dialog'

interface AdoptionCreateExitDialogProps {
  open: boolean
  onExit: () => void
  onSaveDraft: () => void
  onCancel: () => void
}

const AdoptionCreateExitDialog = ({
  open,
  onExit,
  onSaveDraft,
  onCancel,
}: AdoptionCreateExitDialogProps) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="flex w-[22.4375rem] flex-col items-center rounded-[1.25rem] bg-[#2c2c2c] px-[1.5rem] py-[1.75rem]">
          <DialogTitle className="sr-only">분양글 작성 나가기 확인</DialogTitle>
          <button
            type="button"
            onClick={onExit}
            className="w-full py-[0.5rem] text-center text-[1.125rem] leading-[1.5] font-semibold text-white"
          >
            분양글 작성 그만하기
          </button>
          <button
            type="button"
            onClick={onSaveDraft}
            className="w-full py-[0.5rem] text-center text-[1.125rem] leading-[1.5] font-semibold text-white"
          >
            임시저장
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-[0.5rem] w-full py-[0.5rem] text-center text-[1.125rem] leading-[1.5] font-semibold text-white/60"
          >
            닫기
          </button>
        </div>
      </div>
    </DialogPortal>
  </Dialog>
)

export { AdoptionCreateExitDialog }
