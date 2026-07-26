'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogOverlay, DialogPortal } from './Dialog'

/* 약관·정책 전문 모달 — 제목 + 스크롤 본문만 있는 공통 셸.
   본문은 plain text를 whitespace-pre-line으로 그대로 렌더한다. */

interface PolicyModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  content: string
  className?: string
}

const PolicyModal = ({ open, onOpenChange, title, content, className }: PolicyModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex h-[min(45rem,85vh)] w-[calc(100vw-2.5rem)] max-w-[40rem] -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-xl bg-white data-[state=closed]:opacity-0 data-[state=open]:opacity-100',
          className,
        )}
      >
        <div className="flex shrink-0 items-center justify-between gap-2 border-b border-border-light px-6 py-4">
          <DialogPrimitive.Title className="text-body-lg font-semibold text-[#3e3e3e]">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="닫기"
            className="flex size-6 shrink-0 items-center justify-center text-[#6b6b6b]"
          >
            <CloseIcon className="size-[1.125rem]" />
          </DialogPrimitive.Close>
        </div>

        <p className="flex-1 overflow-y-auto px-6 py-5 text-body-md whitespace-pre-line text-text-primary">
          {content}
        </p>
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
)

export { PolicyModal, type PolicyModalProps }
