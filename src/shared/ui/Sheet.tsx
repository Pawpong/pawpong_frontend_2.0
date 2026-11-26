'use client'

import type { ReactNode } from 'react'
import { CloseIcon } from '@/shared/assets'
import {
  Dialog,
  DialogBareContent,
  DialogBareTitle,
  DialogClose,
  DialogOverlay,
  DialogPortal,
} from './Dialog'
import { IconButton } from './IconButton'

interface SheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: ReactNode
  /** 제목 옆 작은 안내 (최대 8곳 등) */
  badge?: ReactNode
  children: ReactNode
  /** 시트 아래 고정 줄 (담기·적용 버튼) */
  footer?: ReactNode
}

/**
 * 화면을 떠나지 않고 그 자리에서 여는 내용 시트 — 아래에서 올라오고, 내용이 길면 시트 안에서만 스크롤한다.
 * 액션 목록만 담는 시트는 BottomSheet 를 쓴다. 모양(둥근 위 모서리·그림자·올라오는 움직임)은 BottomSheet 와 같다.
 */
const Sheet = ({ open, onOpenChange, title, badge, children, footer }: SheetProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogPortal>
      <DialogOverlay />
      <DialogBareContent
        aria-describedby={undefined}
        className="fixed inset-x-0 bottom-0 z-modal mx-auto flex max-h-[85dvh] w-full max-w-[40rem] flex-col rounded-t-[1.25rem] bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-0.4375rem_0.4375rem_0_rgba(55,55,55,0.1)] transition-transform duration-200 data-[state=closed]:translate-y-full data-[state=open]:translate-y-0"
      >
        <div className="flex shrink-0 items-center gap-2 px-4 pt-5 pb-3">
          <DialogBareTitle className="text-base leading-[1.5] font-bold text-neutral-850">
            {title}
          </DialogBareTitle>
          {badge}
          <span className="ml-auto">
            <DialogClose asChild>
              <IconButton size="xs" aria-label="닫기" edge="end">
                <CloseIcon className="size-[1.125rem]" />
              </IconButton>
            </DialogClose>
          </span>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-4">{children}</div>
        {footer && <div className="shrink-0 border-t border-neutral-150 px-4 py-3">{footer}</div>}
      </DialogBareContent>
    </DialogPortal>
  </Dialog>
)

export { Sheet }
