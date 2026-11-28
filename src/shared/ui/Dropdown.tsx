'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { tv } from '@/shared/lib/tv'
import { ChevronDownIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

// 드롭다운 — 앱의 고르기는 이것 하나로 쓴다 (Figma 1229-43132 를 바탕으로 목록 모양을 통일)
// field: 폼 입력 — 트리거 h-45 rounded-8. 포커스·열림은 고른 chip 과 같은 캐러멜 테두리 + 크림 배경
// chip: 목록 위 필터 칩 (탐색 Option 3) — 30px 칩, 히트 영역 44px. 기본값에서 좁혀지면(active) 캐러멜 테두리
// bare: 도구 모음 글자 버튼 (글쓰기 공개 범위) — 배경·테두리 없이 글자와 화살표만
// 펼친 목록은 세 모양 모두 chip 목록 하나로 쓴다: 고른 항목은 옅은 캐러멜 배경 + 진한 글자
const dropdownVariants = tv({
  slots: {
    trigger:
      'flex items-center outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 [&[data-state=open]>svg]:rotate-180',
    icon: 'shrink-0 transition-transform',
    content:
      // 열고 닫을 때 더보기 메뉴와 같은 팝오버 움직임 (globals.css popover-in/out)
      // 그림자는 모든 모양이 같은 기존 값을 쓴다 (새 색을 만들지 않는다)
      'relative z-dropdown max-h-96 overflow-hidden overflow-y-auto rounded-lg border border-neutral-300 bg-white p-1 shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] data-[side=bottom]:translate-y-2 data-[side=top]:-translate-y-2 origin-[var(--radix-select-content-transform-origin)] data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out motion-reduce:animate-none',
    // 한 줄은 칩 목록과 같은 36px, 설명 줄이 붙으면(공개 범위) 그만큼 늘어난다
    item: 'flex min-h-9 w-full cursor-default items-center rounded-md px-2.5 py-1.5 text-sm leading-[1.5] font-medium text-neutral-700 outline-none select-none focus:bg-neutral-50 data-[state=checked]:bg-primary-50 data-[state=checked]:font-semibold data-[state=checked]:text-neutral-850',
  },
  variants: {
    appearance: {
      field: {
        // 미선택(placeholder)은 Input 과 같은 톤으로, 선택되면 본문 색
        trigger:
          'h-[2.8125rem] w-full justify-between rounded-lg border border-neutral-150 bg-white p-3 text-sm leading-[1.5] font-medium text-neutral-850 data-[placeholder]:text-neutral-500 transition-colors focus-visible:border-primary-500 focus-visible:bg-primary-50 data-[state=open]:border-primary-500 data-[state=open]:bg-primary-50',
        // 칩 화살표와 같은 선 굵기로 보이게 글자 크기에 맞춘 16px
        icon: 'size-4 text-neutral-700',
        content: 'w-[var(--radix-select-trigger-width)]',
      },
      chip: {
        trigger:
          'focus-ring touch-target relative h-[1.875rem] shrink-0 gap-1 rounded-lg border bg-white px-2.5 text-xs whitespace-nowrap transition-colors',
        icon: 'size-3',
        content: 'min-w-[max(var(--radix-select-trigger-width),9.75rem)]',
      },
      bare: {
        trigger:
          'focus-ring touch-target relative h-8 gap-1 text-body-sm leading-[1.3] font-medium whitespace-nowrap text-action-dark transition-colors hover:text-brand',
        icon: 'size-4',
        // 목록 글자만큼 — 짧은 목록(정렬)은 칩 목록과 같은 최소 폭, 설명·안내가 붙는 목록(공개 범위)은 16rem 에서 줄바꿈
        content: 'w-max max-w-64 min-w-[9.75rem]',
      },
    },
    active: { true: '', false: '' },
  },
  compoundVariants: [
    {
      appearance: 'chip',
      active: true,
      class: { trigger: 'border-primary-500 bg-primary-50 font-bold text-neutral-850' },
    },
    {
      appearance: 'chip',
      active: false,
      class: { trigger: 'border-neutral-300 font-semibold text-neutral-700' },
    },
  ],
  defaultVariants: { appearance: 'field', active: false },
})

interface DropdownOption {
  value: string
  label: string
  /** 항목 아래 한 줄 설명 (공개 범위처럼 고르기 전에 뜻을 알려야 할 때) */
  description?: string
}

interface DropdownProps {
  options: readonly DropdownOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
  /** field: 폼 입력(기본) / chip: 목록 위 필터 칩 / bare: 도구 모음 글자 버튼 */
  appearance?: 'field' | 'chip' | 'bare'
  /** chip 전용 — 기본값에서 좁혀진 필터임을 테두리로 알린다 */
  active?: boolean
  /** 목록이 열리는 쪽 — 화면 아래 도구 모음처럼 아래에 자리가 없으면 top */
  side?: 'top' | 'bottom'
  /** 목록 맨 아래 안내 한 줄 */
  note?: string
  /** 트리거 추가 클래스 (너비 등) */
  className?: string
}

const Dropdown = ({
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  ariaLabel,
  appearance = 'field',
  active = false,
  side = 'bottom',
  note,
  className,
}: DropdownProps) => {
  const slots = dropdownVariants({ appearance, active })
  return (
    <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
      <SelectPrimitive.Trigger aria-label={ariaLabel} className={cn(slots.trigger(), className)}>
        <SelectPrimitive.Value placeholder={placeholder} />
        <SelectPrimitive.Icon asChild>
          <ChevronDownIcon className={slots.icon()} />
        </SelectPrimitive.Icon>
      </SelectPrimitive.Trigger>
      <SelectPrimitive.Portal>
        <SelectPrimitive.Content
          position="popper"
          side={side}
          align={appearance === 'bare' ? 'end' : 'start'}
          className={slots.content()}
        >
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={slots.item()}
              >
                <span>
                  <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
                  {option.description && (
                    <span className="block text-xs font-normal text-neutral-700">
                      {option.description}
                    </span>
                  )}
                </span>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
          {note && (
            <p className="mt-1 border-t border-neutral-150 px-3 pt-2 pb-1 text-xs text-neutral-700">
              {note}
            </p>
          )}
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export { Dropdown }
export type { DropdownOption }
