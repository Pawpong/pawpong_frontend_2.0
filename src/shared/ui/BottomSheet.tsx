'use client'

import * as DialogPrimitive from '@radix-ui/react-dialog'
import { CloseIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogOverlay, DialogPortal } from './Dialog'

/* 공통 바텀시트 (Figma 2147-196483)
   - 하단에서 올라오는 액션 시트. 주로 모바일·탭에서 사용
   - 상단: 제목 + X 닫기
   - actions: 한 박스에 묶여 구분선으로 나뉘는 액션 목록
   - cancel: 별도 박스로 분리된 취소 버튼 (라벨 가변) */

interface BottomSheetAction {
  label: string
  onClick: () => void
}

interface BottomSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 상단 제목 (Body lg bold) */
  title: string
  /** 묶음 액션 목록 — 하나의 박스에 구분선으로 나뉘어 표시 */
  actions: BottomSheetAction[]
  /** 취소 버튼 라벨 (기본 "취소"). null이면 취소 박스 숨김 */
  cancelLabel?: string | null
  className?: string
}

// 시트 안 액션 텍스트 버튼 — 라벨/동작만 가변
const sheetItemClass =
  'flex w-full items-center justify-center px-2.5 py-4 text-base leading-[1.5] font-semibold text-neutral-850 transition-colors hover:bg-neutral-100 active:bg-neutral-150'

const BottomSheet = ({
  open,
  onOpenChange,
  title,
  actions,
  cancelLabel = '취소',
  className,
}: BottomSheetProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        aria-describedby={undefined}
        className={cn(
          'fixed inset-x-0 bottom-0 z-modal flex flex-col rounded-t-[1.25rem] bg-white shadow-[0_-0.4375rem_0.4375rem_0_rgba(55,55,55,0.1)] transition-transform duration-200 data-[state=closed]:translate-y-full data-[state=open]:translate-y-0',
          className,
        )}
      >
        {/* 상단: 제목 + X 닫기 */}
        <div className="flex items-center gap-2 border-b border-neutral-150 px-4 pt-5 pb-2">
          <DialogPrimitive.Title className="flex-1 text-base leading-[1.5] font-semibold text-neutral-850">
            {title}
          </DialogPrimitive.Title>
          <DialogPrimitive.Close
            aria-label="닫기"
            className="flex size-6 items-center justify-center text-neutral-850"
          >
            <CloseIcon className="size-[1.125rem]" />
          </DialogPrimitive.Close>
        </div>

        {/* 본문: 묶음 액션 박스 + 취소 박스 */}
        <div className="flex flex-col gap-3 px-4 py-3">
          <div className="flex flex-col overflow-hidden rounded-lg bg-neutral-50">
            {actions.map((action, index) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={cn(sheetItemClass, index > 0 && 'border-t border-neutral-150')}
              >
                {action.label}
              </button>
            ))}
          </div>

          {cancelLabel && (
            <DialogPrimitive.Close className={cn(sheetItemClass, 'rounded-lg bg-neutral-50')}>
              {cancelLabel}
            </DialogPrimitive.Close>
          )}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
)

export { BottomSheet, type BottomSheetAction }
