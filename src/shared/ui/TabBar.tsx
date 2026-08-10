'use client'

import type { CSSProperties, ReactNode } from 'react'
import { PAGE_WIDTH_CLASS } from '@/shared/config/layout'
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
  /** PC에서 탭 목록을 940px로 좁힘 (마이홈 3탭 레이아웃). 기본은 페이지 폭 그대로 */
  narrow?: boolean
}

/**
 * Figma TabBarLayout(976:32388)을 구현한 공통 탭 바.
 *
 * - medium: 348px 목록, 116px indicator, 37px 높이
 * - large 3탭: 940px 레이아웃
 * - large 2탭: 1440px 레이아웃 안에서 PC 좌우 80px, 61px 높이
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
  narrow,
}: TabBarProps) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('w-full', className)}>
      <div
        className={cn('w-full border-b border-neutral-300 bg-white', barClassName)}
        style={barStyle}
      >
        {/* 폭은 페이지 셸과 동일(PAGE_WIDTH_CLASS), 여백만 탭 바 디자인에 맞춤.
            Container를 쓰지 않는 이유: 모바일 좌우 여백 없이 348px 목록을 가운데 두는 배치라
            Container의 px를 전부 덮어써야 한다. */}
        <div
          className={cn(
            PAGE_WIDTH_CLASS,
            'pt-3 tab:px-12 tab:pt-4 pc:px-20',
            narrow && 'pc:max-w-[58.75rem]',
          )}
        >
          <TabsList
            variant="underline"
            aria-label={ariaLabel}
            className="mx-auto w-[21.75rem] max-w-full tab:w-full"
          >
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
