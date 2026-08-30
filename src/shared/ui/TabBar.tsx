'use client'

import type { CSSProperties, ReactNode } from 'react'
import { PAGE_WIDTH_CLASS } from '@/shared/config'
import { cn } from '@/shared/lib/cn'
import { Tabs, TabsList, TabsTrigger } from './Tabs'

interface TabBarItem {
  value: string
  label: ReactNode
  disabled?: boolean
}

interface TabBarProps {
  items: readonly TabBarItem[]
  value: string
  onValueChange: (value: string) => void
  children?: ReactNode
  className?: string
  barClassName?: string
  barStyle?: CSSProperties
  ariaLabel?: string
}

/**
 * Figma TabBarLayout(976:32388)을 구현한 공통 탭 바.
 *
 * - medium: 116px indicator, 37px 높이
 * - large: 1440px 레이아웃 안에서 PC 좌우 80px, 61px 높이 (탭 개수와 무관하게 페이지 폭)
 * - 하단 구분선과 sticky 같은 페이지 배치는 barClassName으로 제어
 */
const TabBar = ({
  items,
  value,
  onValueChange,
  children,
  className,
  barClassName,
  barStyle,
  ariaLabel,
}: TabBarProps) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('w-full', className)}>
      {/* 폭은 페이지 셸과 동일(PAGE_WIDTH_CLASS) — 하단 구분선도 1440에서 끊기도록 바 자체에 상한을 건다.
          여백만 탭 바 디자인에 맞춤. Container를 쓰지 않는 이유: tab/pc는 Container와 같지만 모바일만 16px(Container는 20px). */}
      <div className={cn(PAGE_WIDTH_CLASS, 'bg-white', barClassName)} style={barStyle}>
        <div className="mx-auto w-full max-w-176 border-b border-neutral-300 px-4 pt-3 tab:max-w-192 tab:px-12 tab:pt-4 pc:max-w-[58.75rem] pc:px-20">
          <TabsList variant="underline" aria-label={ariaLabel}>
            {items.map((item) => (
              <TabsTrigger
                key={item.value}
                value={item.value}
                disabled={item.disabled}
                variant="underline"
                size="md"
                className="after:left-1/2 after:w-[7.25rem] after:-translate-x-1/2 tab:h-[3.8125rem] tab:pt-2 tab:text-base tab:after:left-0 tab:after:h-[0.5625rem] tab:after:w-full tab:after:translate-x-0"
              >
                {item.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>
      </div>

      {children}
    </Tabs>
  )
}

export { TabBar }
export type { TabBarItem, TabBarProps }
