'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { tv, type VariantProps } from '@/shared/lib/tv'
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
      // 모바일은 medium, Tablet부터 large 간격으로 전환한다.
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
      // Figma(976-32388): 라벨 상단 + 하단 바, 고정 높이(텍스트-바 간격). 활성 primary/비활성 회색.
      // 모바일은 medium(37px · 14px · 116px 가운데 표시선), 태블릿부터 탭 폭 전체 표시선으로 바뀐다.
      // 탭이 많은 좁은 폰에서도 넘치지 않게 글자 칸·표시선이 탭 폭을 넘지 않는다.
      // cafe24 폰트 — 변수 단독으론 미적용이라 className 병행
      underline: cn(
        cafe24Proup.className,
        'relative min-w-0 flex-1 items-start font-cafe24 text-neutral-700 focus-ring data-[state=active]:text-primary-500',
        'h-[2.3125rem] pt-1 text-sm tab:pt-2',
        'after:absolute after:bottom-0 after:bg-primary-500 after:opacity-0 data-[state=active]:after:opacity-100',
        'after:left-1/2 after:h-[0.3125rem] after:w-[7.25rem] after:max-w-full after:-translate-x-1/2',
        'tab:after:left-0 tab:after:h-[0.5625rem] tab:after:w-full tab:after:translate-x-0',
      ),
    },
    // 태블릿 이상 크기만 다르다 — 기본 61px · 16px, compact(마이홈) 50px · 14px
    size: { responsive: '', compact: '' },
  },
  compoundVariants: [
    { variant: 'underline', size: 'responsive', class: 'tab:h-[3.8125rem] tab:text-base' },
    { variant: 'underline', size: 'compact', class: 'tab:h-[3.1264rem] tab:text-sm' },
  ],
  defaultVariants: { variant: 'default', size: 'responsive' },
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
  // 탭 바와 내용 사이 간격은 화면 배치가 정한다 (상단 바 밑 여백 규칙 등)
  <TabsPrimitive.Content ref={ref} className={className} {...props} />
))
TabsContent.displayName = TabsPrimitive.Content.displayName
