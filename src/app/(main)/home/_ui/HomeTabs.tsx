'use client'

import type { SVGProps } from 'react'
import { TabBar, TabsContent } from '@/shared/ui'
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

  // 마이홈만 PC 940 레이아웃(브리더 3탭). 입양자 2탭은 기존대로 풀폭
  return (
    <TabBar
      items={tabs.map((tab) => ({
        value: tab.id,
        label: (
          <span className="flex items-center justify-center gap-2.5">
            {tab.label}
            {tab.Icon && <tab.Icon className="size-6 shrink-0 tab:size-8" />}
          </span>
        ),
      }))}
      value={activeTab}
      onValueChange={onTabChange}
      narrow={tabs.length > 2}
      barClassName="tab:sticky tab:z-30"
      barStyle={{ top }}
      ariaLabel="홈 콘텐츠"
    >
      {children}
    </TabBar>
  )
}

export { HomeTabs, TabsContent }
export type { HomeTabConfig }
