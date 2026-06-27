'use client'

import type { ReactNode } from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { tv, type VariantProps } from 'tailwind-variants'
import { CloseIcon, InfoIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import { Dialog, DialogOverlay, DialogPortal } from './Dialog'

/* 공통 CTA 모달 (Figma 1671-112002 / 모바일·탭 1716-144608)
   - 틀(레이아웃·색상·radius·아이콘 영역·버튼 높이)은 고정 공통
   - 가변: 제목/설명/아이콘/버튼 라벨·동작·배치
   - direction: row(가로, typeA) / column(세로, typeB) / responsive(모바일·탭 세로 → pc 가로) */ // [refactored]

// 버튼 1개 스타일 — 라벨/동작만 가변, 높이·radius·정렬은 고정
const ctaModalButton = tv({
  base: 'flex h-10 w-full items-center justify-center rounded-full p-2 text-base leading-normal font-semibold text-[#3e3e3e] transition-colors',
  variants: {
    variant: {
      // 메인 노란 버튼 — hover/press 컨벤션은 입양 CTA 바와 동일 (AdoptionCtaBar)
      fill: 'bg-[#fffa94] hover:text-[#6b6b6b] active:bg-[#f3ec59] active:text-[#3e3e3e]',
      outline: 'border border-[#cacaca] bg-white hover:bg-[#f5f5f5] active:bg-[#ededed]',
      ghost: 'text-[#6b6b6b] hover:text-[#3e3e3e]',
    },
  },
  defaultVariants: { variant: 'outline' },
})

export interface CtaModalAction extends VariantProps<typeof ctaModalButton> {
  label: string
  onClick: () => void
}

interface CtaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** 제목 (Body xl bold) */
  title: string
  /** 설명 (Body lg medium) — 없으면 숨김. 반응형 줄바꿈 등은 ReactNode로 전달 */
  description?: ReactNode
  /** 상단 원형 아이콘 (기본: InfoIcon). null이면 아이콘 영역 숨김 */
  icon?: ReactNode | null
  /** 하단 버튼들 — variant로 fill/outline/ghost 지정.
   *  배열 순서는 pc 가로 기준 왼→오. responsive에선 모바일/탭에서 역순 세로 배치(주요 버튼이 위로). */
  actions: CtaModalAction[]
  /** 버튼 배치 — row(가로, typeA) / column(세로, typeB) / responsive(모바일·탭 세로 → pc 가로). 기본 column */
  direction?: 'row' | 'column' | 'responsive'
  /** 우상단 X 닫기 노출 (기본 true) */
  showClose?: boolean
  className?: string
}

const DEFAULT_ICON = <InfoIcon className="size-8 text-[#6b6b6b]" />

const CtaModal = ({
  open,
  onOpenChange,
  title,
  description,
  icon = DEFAULT_ICON,
  actions,
  direction = 'column',
  showClose = true,
  className,
}: CtaModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        // 설명이 없으면 Radix의 aria-describedby 누락 경고를 명시적으로 끔
        {...(description ? {} : { 'aria-describedby': undefined })}
        className={cn(
          'fixed top-1/2 left-1/2 z-50 flex w-[calc(100vw-2.5rem)] max-w-[19.5rem] -translate-x-1/2 -translate-y-1/2 flex-col rounded-xl bg-white data-[state=closed]:opacity-0 data-[state=open]:opacity-100 pc:max-w-[22.5rem]',
          className,
        )}
      >
        {/* 상단: 닫기 + 아이콘 + 제목/설명 */}
        <div className="flex flex-col items-center gap-2 rounded-t-xl p-3">
          {/* 닫기 슬롯 — X 없어도 높이(24px) 유지해 제목 상단 여백 확보 (디자인 동일) */}
          <div className="flex h-6 w-full items-center justify-end">
            {showClose && (
              <DialogPrimitive.Close
                aria-label="닫기"
                className="flex size-6 items-center justify-center text-[#6b6b6b]"
              >
                <CloseIcon className="size-[1.125rem]" />
              </DialogPrimitive.Close>
            )}
          </div>
          {icon && (
            <div className="flex items-center justify-center rounded-full bg-[#ededed] p-2.5">
              {icon}
            </div>
          )}
          <div className="flex flex-col items-center text-center text-[#3e3e3e]">
            {/* whitespace-pre-line: title에 \n 넣으면 원하는 위치에서 줄바꿈 (단일 줄은 영향 없음) */}
            <DialogPrimitive.Title className="text-xl leading-normal font-semibold whitespace-pre-line">
              {title}
            </DialogPrimitive.Title>
            {description && (
              <DialogPrimitive.Description className="text-base leading-normal font-medium">
                {description}
              </DialogPrimitive.Description>
            )}
          </div>
        </div>

        {/* 하단: 버튼 영역 */}
        <div
          className={cn('flex rounded-b-xl px-3 py-5', {
            'gap-4': direction === 'row',
            'flex-col gap-2': direction === 'column',
            // 모바일·탭 세로(역순으로 주요 버튼이 위) → pc 가로
            'flex-col-reverse gap-2 pc:flex-row pc:gap-4': direction === 'responsive',
          })}
        >
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={ctaModalButton({ variant: action.variant })}
            >
              {action.label}
            </button>
          ))}
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  </Dialog>
)

export { CtaModal, ctaModalButton }
