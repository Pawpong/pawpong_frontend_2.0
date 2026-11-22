'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { tv } from '@/shared/lib/tv'
import { ChevronDownIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'

// 드롭다운 (Figma 1229-43132) — 기존 Select(폼 셀렉트)와 다른 디자인이라 별도 컴포넌트
// field: 폼 입력 — 트리거 h-45 rounded-8, 열림 시 border #256ef4 / 메뉴: rounded-8 border shadow, 항목 h-49
// chip: 목록 위 필터 칩 (탐색 Option 3) — 30px 칩, 히트 영역 44px. 기본값에서 좁혀지면(active) 캐러멜 테두리
const dropdownVariants = tv({
  slots: {
    trigger:
      'flex items-center outline-none disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 [&[data-state=open]>svg]:rotate-180',
    icon: 'shrink-0 transition-transform',
    content:
      // 열고 닫을 때 더보기 메뉴와 같은 팝오버 움직임 (globals.css popover-in/out)
      // 그림자는 두 모양이 같은 기존 값을 쓴다 (새 색을 만들지 않는다)
      'relative z-dropdown max-h-96 overflow-hidden overflow-y-auto rounded-lg border bg-white shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] data-[side=bottom]:translate-y-2 origin-[var(--radix-select-content-transform-origin)] data-[state=open]:animate-popover-in data-[state=closed]:animate-popover-out motion-reduce:animate-none',
    item: 'flex w-full cursor-default items-center bg-white text-sm leading-[1.5] font-medium text-neutral-700 outline-none select-none focus:bg-neutral-50 data-[state=checked]:font-semibold data-[state=checked]:text-neutral-850',
  },
  variants: {
    appearance: {
      field: {
        // 미선택(placeholder)은 Input 과 같은 톤으로, 선택되면 본문 색
        trigger:
          'h-[2.8125rem] w-full justify-between rounded-lg border border-neutral-150 bg-white p-3 text-sm leading-[1.5] font-medium text-neutral-850 data-[placeholder]:text-neutral-500 data-[state=open]:border-info-500',
        icon: 'size-6 text-neutral-850',
        content: 'w-[var(--radix-select-trigger-width)] border-neutral-150',
        item: 'h-[3.0625rem] p-3 data-[state=checked]:bg-neutral-100',
      },
      chip: {
        trigger:
          'focus-ring touch-target relative h-[1.875rem] shrink-0 gap-1 rounded-lg border bg-white px-2.5 text-xs whitespace-nowrap transition-colors',
        icon: 'size-3',
        content: 'min-w-[max(var(--radix-select-trigger-width),9.75rem)] border-neutral-300 p-1',
        item: 'h-9 rounded-md px-2.5 data-[state=checked]:bg-primary-50',
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
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
  /** field: 폼 입력(기본) / chip: 목록 위 필터 칩 */
  appearance?: 'field' | 'chip'
  /** chip 전용 — 기본값에서 좁혀진 필터임을 테두리로 알린다 */
  active?: boolean
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
        <SelectPrimitive.Content position="popper" className={slots.content()}>
          <SelectPrimitive.Viewport>
            {options.map((option) => (
              <SelectPrimitive.Item
                key={option.value}
                value={option.value}
                className={slots.item()}
              >
                <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
              </SelectPrimitive.Item>
            ))}
          </SelectPrimitive.Viewport>
        </SelectPrimitive.Content>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  )
}

export { Dropdown }
export type { DropdownOption }
