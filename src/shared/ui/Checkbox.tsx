'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { tv, type VariantProps } from 'tailwind-variants'
import { PixelCheckIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

// [refactored] Figma 758-74944 — 미체크: 회색(#a6a6a6) 아웃라인 / 체크: 노랑(#fffa94) 배경 + 진한(#3e3e3e) 체크
// 기존 shadcn(zinc) 기본 스타일을 브랜드 디자인으로 교체하고, 사용처마다 덮어쓰던 className을 기본값으로 내장
const checkbox = tv({
  slots: {
    root: 'peer shrink-0 rounded-sm border-2 border-[#a6a6a6] bg-white shadow-none focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:border-[#fffa94] data-[state=checked]:bg-[#fffa94] data-[state=checked]:text-[#3e3e3e]',
    icon: '',
  },
  variants: {
    // 체크마크가 13x10(비정사각)이라 width만 지정하고 h-auto로 비율 유지
    size: {
      large: { root: 'size-6', icon: 'h-auto w-3' },
      medium: { root: 'size-5', icon: 'h-auto w-2.5' },
    },
  },
  defaultVariants: { size: 'large' },
})

type CheckboxProps = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> &
  VariantProps<typeof checkbox>

export const Checkbox = React.forwardRef<
  React.ComponentRef<typeof CheckboxPrimitive.Root>,
  CheckboxProps
>(({ className, size, ...props }, ref) => {
  const { root, icon } = checkbox({ size })
  return (
    <CheckboxPrimitive.Root ref={ref} className={cn(root(), className)} {...props}>
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        {/* [refactored] 인라인 svg → Figma 픽셀 체크마크(PixelCheckIcon) 사용 */}
        <PixelCheckIcon className={icon()} aria-hidden />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName
