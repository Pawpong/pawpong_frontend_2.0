'use client'

import type { SVGProps } from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'

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
}

const HomeTabs = ({ tabs, activeTab, onTabChange, children }: HomeTabsProps) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange}>
      {/* 공통 TabBar (디자인 976-32388 / 마이홈 2046-160969) — 모바일 medium / 탭·PC large */}
      <div className="w-full border-b border-[#cacaca] px-4 pt-3 tab:px-12 tab:pt-4 pc:px-20">
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
