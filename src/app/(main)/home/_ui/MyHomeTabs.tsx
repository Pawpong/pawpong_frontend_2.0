'use client'

import type { SVGProps } from 'react'
import { LockIcon } from '@/shared/assets/icons'
import { Container, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'

type TabType = 'posts' | 'breeders'

interface TabConfig {
  id: TabType
  label: string
  Icon?: (props: SVGProps<SVGSVGElement>) => React.ReactElement
}

const TAB_CONFIG: TabConfig[] = [
  { id: 'posts', label: '게시글' },
  { id: 'breeders', label: '즐겨찾는 브리더', Icon: LockIcon },
]

interface MyHomeTabsProps {
  activeTab: TabType
  onTabChange: (tab: TabType) => void
  children: React.ReactNode
}

const MyHomeTabs = ({ activeTab, onTabChange, children }: MyHomeTabsProps) => {
  return (
    <Tabs
      value={activeTab}
      onValueChange={(v) => onTabChange(v as TabType)}
    >
      <Container className="border-b border-border-light tab:mt-[2.719rem]">
        <TabsList className="flex h-8 w-full items-center gap-4 tab:h-auto tab:gap-8">
          {TAB_CONFIG.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={cn(
                'group relative flex h-full flex-1 min-w-px items-center justify-center px-1.5 py-2.5',
                'data-[state=active]:border-b-2 data-[state=active]:border-text-primary',
                'tab:data-[state=active]:border-b-0 tab:data-[state=active]:after:absolute tab:data-[state=active]:after:bottom-[-2px] tab:data-[state=active]:after:left-0 tab:data-[state=active]:after:h-[3px] tab:data-[state=active]:after:w-full tab:data-[state=active]:after:bg-text-primary',
                tab.Icon ? 'gap-2.5' : '',
              )}
            >
              <span className="text-sm font-medium leading-[1.375rem] text-text-primary whitespace-nowrap group-data-[state=active]:font-bold tab:text-base">
                {tab.label}
              </span>
              {tab.Icon && (
                <tab.Icon className="size-5 shrink-0 -translate-y-px text-text-primary" />
              )}
            </TabsTrigger>
          ))}
        </TabsList>
      </Container>
      {children}
    </Tabs>
  )
}

export { MyHomeTabs, TabsContent }
export type { TabType }
