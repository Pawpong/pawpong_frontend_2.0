'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { tv, type VariantProps } from 'tailwind-variants'
import { cn } from '@/shared/lib/cn'
import { cafe24Proup } from '@/shared/lib/fonts'

export const Tabs = TabsPrimitive.Root

const tabsListVariants = tv({
  base: 'inline-flex items-center',
  variants: {
    variant: {
      default: 'justify-center',
      // flex(block-level)로 두어 inline-flex line-box strut 여백을 없앤다
      // (바깥 래퍼 border-b 회색선과 갈색 바가 틈 없이 붙도록).
      // 탭은 flex-1 균등 분할 + 디자인(976-32388) large 기준 탭 간 gap-41(2.5625rem).
      // 모바일(medium)은 gap 없음이라 large 전환 지점(tab:)부터 gap 적용.
      underline: 'flex w-full justify-center tab:gap-[2.5625rem]',
    },
  },
  defaultVariants: { variant: 'default' },
})

export const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & VariantProps<typeof tabsListVariants>
>(({ className, variant, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(tabsListVariants({ variant }), className)}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const tabsTriggerVariants = tv({
  base: 'inline-flex items-center justify-center whitespace-nowrap transition-all disabled:pointer-events-none disabled:opacity-50',
  variants: {
    variant: {
      default: '',
      // Figma: 라벨 상단 + 하단 바, 고정 높이(텍스트-바 간격). 활성 primary/비활성 회색.
      // cafe24 폰트 — 변수 단독으론 미적용이라 className 병행
      underline: cn(
        cafe24Proup.className,
        'relative flex-1 items-start font-cafe24 text-neutral-500 data-[state=active]:text-primary-500',
        'after:absolute after:bottom-0 after:left-0 after:w-full after:bg-primary-500',
        'after:opacity-0 data-[state=active]:after:opacity-100',
      ),
    },
    size: { lg: '', md: '' },
  },
  compoundVariants: [
    // 탭 높이: large 61px / medium 37px (컨테이너 pt 포함 시 77/49)
    { variant: 'underline', size: 'lg', class: 'h-[3.8125rem] pt-2 text-base after:h-[0.5625rem]' },
    { variant: 'underline', size: 'md', class: 'h-[2.3125rem] pt-1 text-xs after:h-[0.3125rem]' },
  ],
  defaultVariants: { variant: 'default', size: 'lg' },
})

export const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> &
    VariantProps<typeof tabsTriggerVariants>
>(({ className, variant, size, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(tabsTriggerVariants({ variant, size }), className)}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

export const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content ref={ref} className={cn('mt-2', className)} {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName
