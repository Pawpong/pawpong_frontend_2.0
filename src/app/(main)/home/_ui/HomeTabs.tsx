'use client'

import type { ReactNode, SVGProps } from 'react'
import Link from 'next/link'
import {
  Container,
  TabBar,
  TabBarList,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tabs,
} from '@/shared/ui'
import { cn } from '@/shared/lib/cn'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'

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
   * 주면 PC(1440+)에서 블로그형 2단이 된다 — 좌측에 이 노드 + 세로 메뉴, 우측에 콘텐츠.
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

/** PC 2단에서 가로 탭 바를 대신하는 좌측 세로 메뉴 — 여기가 마이홈의 유일한 네비가 된다 */
const SideNav = ({ tabs, sideLinks }: { tabs: HomeTabConfig[]; sideLinks: HomeSideLink[] }) => (
  <nav className="mt-6 hidden flex-col pc:flex">
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
  const top = Math.max((stickyTop ?? gnbH) - 1, 0)
  const items = toBarItems(tabs)

  if (!sidebar) {
    return (
      <TabBar
        items={items}
        value={activeTab}
        onValueChange={onTabChange}
        barClassName="tab:sticky tab:z-sticky"
        triggerClassName="tab:h-[3.1264rem] tab:text-sm"
        barStyle={{ top }}
        ariaLabel="홈 콘텐츠"
      >
        {children}
      </TabBar>
    )
  }

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      {/* 블로그형 2단 — PC(1440+)에서만 좌 프로필·메뉴(sticky) / 우 콘텐츠로 나뉜다.
          그 아래 해상도는 프로필 → 가로 탭 바 → 콘텐츠로 기존과 같이 쌓인다. */}
      <div className="pc:mx-auto pc:flex pc:w-full pc:max-w-[90rem] pc:items-start pc:gap-10 pc:px-20">
        <Container
          className="px-4 py-5 tab:px-12 tab:py-5 pc:sticky pc:w-65 pc:shrink-0 pc:px-0 pc:py-10"
          style={{ top: stickyTop }}
        >
          {sidebar}
          <SideNav tabs={tabs} sideLinks={sideLinks} />
        </Container>

        <div className="min-w-0 pc:flex-1 pc:pt-10">
          {/* PC 는 좌측 메뉴가 현재 위치를 알려주므로 가로 바를 숨긴다 */}
          <TabBarList
            items={items}
            barClassName="tab:sticky tab:z-sticky pc:hidden"
            triggerClassName="tab:h-[3.1264rem] tab:text-sm"
            barStyle={{ top }}
            ariaLabel="홈 콘텐츠"
          />
          {children}
        </div>
      </div>
    </Tabs>
  )
}

export { HomeTabs, TabsContent }
export type { HomeTabConfig, HomeSideLink }
