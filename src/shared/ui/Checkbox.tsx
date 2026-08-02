'use client'

import * as React from 'react'
import * as CheckboxPrimitive from '@radix-ui/react-checkbox'
import { tv, type VariantProps } from 'tailwind-variants'
import { PixelCheckIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'

// [refactored] Figma 758-74944 — 미체크: 회색(#a6a6a6) 아웃라인 / 체크: 노랑(#fffa94) 배경 + 진한(#3e3e3e) 체크
// 기존 shadcn(zinc) 기본 스타일을 브랜드 디자인으로 교체하고, 사용처마다 덮어쓰던 className을 기본값으로 내장
// Figma 758-74944 — frame(large 32 / medium 24) = 테두리 박스 + 4px 패딩.
// Root는 패딩 포함 클릭영역, 안쪽 box가 실제 24/16 테두리 박스. checked 스타일은 group-data로 box에 전달
const checkbox = tv({
  slots: {
    root: 'group peer shrink-0 p-1 focus-visible:ring-2 focus-visible:ring-zinc-400 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
    box: 'flex size-full items-center justify-center rounded-sm border-2 border-neutral-500 bg-white shadow-none group-data-[state=checked]:border-[#fffa94] group-data-[state=checked]:bg-[#fffa94] group-data-[state=checked]:text-neutral-850',
    icon: '',
  },
  variants: {
    // 체크마크는 박스의 약 50% width, h-auto로 비율 유지
    size: {
      large: { root: 'size-8', icon: 'h-auto w-3' },
      medium: { root: 'size-6', icon: 'h-auto w-2' },
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
  const { root, box, icon } = checkbox({ size })
  return (
    <CheckboxPrimitive.Root ref={ref} className={cn(root(), className)} {...props}>
      <span className={box()}>
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          {/* [refactored] 인라인 svg → Figma 픽셀 체크마크(PixelCheckIcon) 사용 */}
          <PixelCheckIcon className={icon()} aria-hidden />
        </CheckboxPrimitive.Indicator>
      </span>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName
