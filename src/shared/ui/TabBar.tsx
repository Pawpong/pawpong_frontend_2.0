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
      {/* 탭과 하단선은 PAGE_WIDTH_CLASS 전체를 사용한다. 콘텐츠 카드 폭 상한을 탭에
          재사용하면 넓은 화면에서 탭만 940px로 좁아지므로, 거터만 반응형으로 유지한다. */}
      <div
        className={cn(PAGE_WIDTH_CLASS, 'border-b border-neutral-300 bg-white', barClassName)}
        style={barStyle}
      >
        <div className="w-full px-4 pt-3 tab:px-12 tab:pt-4 pc:px-20">
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
