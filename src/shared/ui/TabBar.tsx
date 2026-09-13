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
  triggerClassName?: string
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
type TabBarListProps = Omit<TabBarProps, 'value' | 'onValueChange' | 'children' | 'className'>

/**
 * [refactored] Tabs 루트에서 분리한 탭 바 본체.
 * 한 Tabs 안에서 가로 바와 세로 메뉴를 해상도별로 갈아끼워야 하는 화면(마이홈 2단)이 있어,
 * 루트 없이 리스트만 렌더할 수 있어야 한다. TabBar 는 이 컴포넌트에 루트만 씌운 것이다.
 */
const TabBarList = ({
  items,
  barClassName,
  triggerClassName,
  barStyle,
  ariaLabel,
}: TabBarListProps) => (
  /* 탭과 하단선은 PAGE_WIDTH_CLASS 전체를 사용한다. 콘텐츠 카드 폭 상한을 탭에
     재사용하면 넓은 화면에서 탭만 940px로 좁아지므로, 거터만 반응형으로 유지한다. */
  <div
    className={cn(PAGE_WIDTH_CLASS, 'border-b border-neutral-300 bg-white', barClassName)}
    style={barStyle}
  >
    <div className="w-full px-4 pt-3 tab:page-gutter-x tab:pt-4">
      <TabsList variant="underline" aria-label={ariaLabel}>
        {items.map((item) => (
          <TabsTrigger
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            variant="underline"
            size="md"
            className={cn(
              'after:left-1/2 after:w-[7.25rem] after:-translate-x-1/2 tab:h-[3.8125rem] tab:pt-2 tab:text-base tab:after:left-0 tab:after:h-[0.5625rem] tab:after:w-full tab:after:translate-x-0',
              triggerClassName,
            )}
          >
            {item.label}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  </div>
)

const TabBar = ({
  items,
  value,
  onValueChange,
  children,
  className,
  ...listProps
}: TabBarProps) => {
  return (
    <Tabs value={value} onValueChange={onValueChange} className={cn('w-full', className)}>
      <TabBarList items={items} {...listProps} />
      {children}
    </Tabs>
  )
}

export { TabBar, TabBarList }
export type { TabBarItem, TabBarProps, TabBarListProps }
