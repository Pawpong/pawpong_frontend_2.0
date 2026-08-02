'use client'

import type { SVGProps } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'
import { useGnbHeight } from '@/shared/lib/useGnbHeight'

interface HomeTabConfig {
  id: string
  label: string
  Icon?: (props: SVGProps<SVGSVGElement>) => React.ReactElement
}

interface HomeTabsProps {
  tabs: HomeTabConfig[]
  activeTab: string
  onTabChange: (tab: string) => void
  children: React.ReactNode
  /** sticky 시 상단 오프셋(px). 미지정 시 GNB 높이만 사용 */
  stickyTop?: number
}

const HomeTabs = ({ tabs, activeTab, onTabChange, children, stickyTop }: HomeTabsProps) => {
  const gnbH = useGnbHeight()
  const top = Math.max((stickyTop ?? gnbH) - 1, 0)

  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      {/* 공통 TabBar (디자인 976-32388 / 마이홈 2046-160969) — 모바일 medium / 탭·PC large */}
      {/* 스크롤 시 GNB(+navbar) 아래 고정(sticky) — tab+만, 모바일은 비고정 */}
      <div
        className="w-full border-b border-neutral-300 bg-white px-4 pt-3 tab:sticky tab:z-30 tab:px-12 tab:pt-4 pc:px-20"
        style={{ top }}
      >
        <TabsList variant="underline">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              variant="underline"
              size="md"
              className="tab:h-[3.8125rem] tab:pt-2 tab:text-base tab:after:h-[0.5625rem]"
            >
              {/* 라벨+아이콘을 items-center 묶음으로 — 트리거 items-start 영향 없이 세로 중앙 정렬 */}
              <span className="flex items-center justify-center gap-2.5">
                {tab.label}
                {tab.Icon && <tab.Icon className="size-6 shrink-0 tab:size-8" />}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {children}
    </Tabs>
  )
}

export { HomeTabs, TabsContent }
export type { HomeTabConfig }
