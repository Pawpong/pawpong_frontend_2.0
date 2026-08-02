'use client'

import * as SelectPrimitive from '@radix-ui/react-select'
import { tv } from 'tailwind-variants'
import { ChevronDownIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

// 드롭다운 (Figma 1229-43132) — 기존 Select(폼 셀렉트)와 다른 디자인이라 별도 컴포넌트
// 트리거: h-45 rounded-8, 열림 시 border #256ef4 / 메뉴: rounded-8 border #e4e4e4 shadow, 항목 h-49
const dropdownVariants = tv({
  slots: {
    trigger:
      'flex h-[2.8125rem] w-full items-center justify-between rounded-lg border border-neutral-150 bg-white p-3 text-sm leading-[1.5] font-medium text-neutral-850 outline-none data-[state=open]:border-info-500 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1 [&[data-state=open]>svg]:rotate-180',
    content:
      'relative z-50 max-h-96 w-[var(--radix-select-trigger-width)] overflow-hidden overflow-y-auto rounded-lg border border-neutral-150 bg-white shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] data-[side=bottom]:translate-y-2',
    item: 'flex h-[3.0625rem] w-full cursor-default items-center bg-white p-3 text-sm leading-[1.5] font-medium text-neutral-700 outline-none select-none focus:bg-neutral-50 data-[state=checked]:bg-neutral-100 data-[state=checked]:font-semibold data-[state=checked]:text-neutral-850',
  },
})

const slots = dropdownVariants()

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
  /** 트리거 추가 클래스 (너비 등) */
  className?: string
}

const Dropdown = ({
  options,
  value,
  onValueChange,
  placeholder,
  disabled,
  className,
}: DropdownProps) => (
  <SelectPrimitive.Root value={value} onValueChange={onValueChange} disabled={disabled}>
    <SelectPrimitive.Trigger className={cn(slots.trigger(), className)}>
      <SelectPrimitive.Value placeholder={placeholder} />
      <SelectPrimitive.Icon asChild>
        <ChevronDownIcon className="size-6 shrink-0 text-neutral-850 transition-transform" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
    <SelectPrimitive.Portal>
      <SelectPrimitive.Content position="popper" className={slots.content()}>
        <SelectPrimitive.Viewport>
          {options.map((option) => (
            <SelectPrimitive.Item key={option.value} value={option.value} className={slots.item()}>
              <SelectPrimitive.ItemText>{option.label}</SelectPrimitive.ItemText>
            </SelectPrimitive.Item>
          ))}
        </SelectPrimitive.Viewport>
      </SelectPrimitive.Content>
    </SelectPrimitive.Portal>
  </SelectPrimitive.Root>
)

export { Dropdown }
export type { DropdownOption }
