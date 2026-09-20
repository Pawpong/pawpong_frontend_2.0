'use client'

import type { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogClose, DialogOverlay, DialogPortal } from './Dialog'

interface MediaDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
  /** 사진 뷰어처럼 내용 높이에 맞출 때. 기본은 고정 높이(게시글 모달의 댓글 스크롤용) */
  fitContent?: boolean
  className?: string
  onKeyDown?: React.KeyboardEventHandler<HTMLDivElement>
}

/** 사진·게시글 모달의 공통 표면과 헤더. 본문만 각 뷰어에서 구성한다. */
export const MediaDialog = ({
  open,
  onOpenChange,
  title,
  children,
  fitContent = false,
  className,
  onKeyDown,
}: MediaDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        onKeyDown={onKeyDown}
        className={cn(
          'fixed top-1/2 left-1/2 z-modal flex w-[calc(100vw-2rem)] max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-neutral-150 bg-white text-neutral-850 shadow-lg',
          // [refactored] 두 사진 뷰어가 각자 덮어쓰던 높이 규칙을 prop 으로
          fitContent ? 'max-h-[calc(100dvh-2rem)]' : 'h-[min(44rem,calc(100dvh-2rem))]',
          className,
        )}
      >
        <header className="flex h-16 shrink-0 items-center justify-between gap-4 px-5 tab:px-6">
          <DialogPrimitive.Title className="font-cafe24 text-body-xl text-primary-700">
            {title}
          </DialogPrimitive.Title>
          <DialogClose
            aria-label="닫기"
            className="-mr-2 flex size-10 items-center justify-center rounded-full text-neutral-700 transition-colors hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-primary-500"
          >
            <CloseIcon className="size-5" />
          </DialogClose>
        </header>
        {children}
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
)
