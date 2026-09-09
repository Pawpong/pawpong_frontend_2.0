'use client'

import type { ReactNode, SVGProps } from 'react'
import Link from 'next/link'
import { TabBar, TabBarList, TabsContent, TabsList, TabsTrigger, Tabs } from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'
import { HomeColumns } from './HomeColumns'

interface HomeTabConfig {
  id: string
  label: string
  mobileLabel?: string
  Icon?: (props: SVGProps<SVGSVGElement>) => React.ReactElement
}

interface HomeSideLink {
  label: string
  href: string
}

interface HomeTabsProps {
  tabs: HomeTabConfig[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  /** sticky 시 상단 오프셋(px). 미지정 시 GNB 높이만 사용 */
  stickyTop?: number
  /**
   * 주면 태블릿(768+)부터 블로그형 2단이 된다 — 좌측에 이 노드 + 세로 메뉴, 우측에 콘텐츠.
   * 없으면 지금까지처럼 가로 탭 바 한 벌만 그린다 (공개 브리더 홈).
   */
  sidebar?: ReactNode
  /** 세로 메뉴 아래 구분선 뒤에 붙는 이동 링크 (저장목록·설정 등) */
  sideLinks?: HomeSideLink[]
}

const toBarItems = (tabs: HomeTabConfig[]) =>
  tabs.map((tab) => ({
    value: tab.id,
    label: (
      <span className="flex items-center justify-center gap-2.5">
        {tab.mobileLabel ? (
          <>
            <span className="tab:hidden">{tab.mobileLabel}</span>
            <span className="hidden tab:inline">{tab.label}</span>
          </>
        ) : (
          tab.label
        )}
        {tab.Icon && <tab.Icon className="size-6 shrink-0 tab:size-8" />}
      </span>
    ),
  }))

const SIDE_ITEM =
  'flex h-11 items-center rounded-lg px-3 text-sm leading-[1.5] font-medium transition-colors'

/** 2단(tab+)에서 가로 탭 바를 대신하는 좌측 세로 메뉴 — 여기가 마이홈의 유일한 네비가 된다 */
const SideNav = ({ tabs, sideLinks }: { tabs: HomeTabConfig[]; sideLinks: HomeSideLink[] }) => (
  <nav className="mt-6 hidden flex-col tab:flex">
    <TabsList
      className="h-auto flex-col items-stretch gap-1 bg-transparent p-0"
      aria-label="마이홈 콘텐츠"
    >
      {tabs.map((tab) => (
        <TabsTrigger
          key={tab.id}
          value={tab.id}
          className={cn(
            SIDE_ITEM,
            'justify-start text-neutral-700 hover:bg-neutral-50',
            'data-[state=active]:bg-primary-50 data-[state=active]:font-semibold data-[state=active]:text-primary-500',
          )}
        >
          {tab.label}
        </TabsTrigger>
      ))}
    </TabsList>

    {sideLinks.length > 0 && (
      <>
        <hr className="my-3 border-neutral-150" />
        {sideLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(SIDE_ITEM, 'text-neutral-700 hover:bg-neutral-50 hover:text-neutral-850')}
          >
            {link.label}
          </Link>
        ))}
      </>
    )}
  </nav>
)

const HomeTabs = ({
  tabs,
  activeTab,
  onTabChange,
  children,
  stickyTop,
  sidebar,
  sideLinks = [],
}: HomeTabsProps) => {
  const gnbH = useGnbHeight()
  // [refactored] sticky 기준을 한 곳에서 계산한다 — 이전엔 바는 계산값, 사이드바는 원본 prop 을 써서
  // stickyTop 을 넘기지 않는 공개 홈의 사이드바가 top:0 으로 GNB 밑에 파고들었다
  const stickyOffset = stickyTop ?? gnbH
  // [refactored] 두 분기가 같은 값을 두 벌 쓰던 것을 하나로
  const barProps = {
    items: toBarItems(tabs),
    triggerClassName: 'tab:h-[3.1264rem] tab:text-sm',
    barStyle: { top: Math.max(stickyOffset - 1, 0) },
    ariaLabel: '홈 콘텐츠',
  }

  if (!sidebar) {
    return (
      <TabBar
        {...barProps}
        value={activeTab}
        onValueChange={onTabChange}
        barClassName="tab:sticky tab:z-sticky"
      >
        {children}
      </TabBar>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <HomeColumns
        stickyTop={stickyOffset}
        sidebar={
          <>
            {sidebar}
            <SideNav tabs={tabs} sideLinks={sideLinks} />
          </>
        }
      >
        {/* 2단에서는 좌측 메뉴가 현재 위치를 알려주므로 가로 바를 숨긴다 */}
        <TabBarList {...barProps} barClassName="tab:hidden" />
        {children}
      </HomeColumns>
    </Tabs>
  )
}

export { HomeTabs, TabsContent }
export type { HomeTabConfig, HomeSideLink }
