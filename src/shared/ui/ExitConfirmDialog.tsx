'use client'

import {
  Dialog,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from '@/shared/ui/Dialog'

interface ExitConfirmDialogProps {
  open: boolean
  onConfirm: () => void
  onCancel: () => void
}

const ExitConfirmDialog = ({ open, onConfirm, onCancel }: ExitConfirmDialogProps) => (
  <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onCancel()}>
    <DialogPortal>
      <DialogOverlay />
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="flex w-[22.4375rem] flex-col items-center rounded-[1.25rem] bg-[#2c2c2c] px-[1.5rem] py-[1.75rem]">
          <DialogTitle className="sr-only">입양 신청 나가기 확인</DialogTitle>
          <button
            type="button"
            onClick={onConfirm}
            className="w-full py-[0.5rem] text-center text-[1.125rem] font-semibold leading-[1.5] text-white"
          >
            입양 신청 그만하기
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="mt-[0.5rem] w-full py-[0.5rem] text-center text-[1.125rem] font-semibold leading-[1.5] text-white/60"
          >
            닫기
          </button>
        </div>
      </div>
    </DialogPortal>
  </Dialog>
)

export { ExitConfirmDialog }
