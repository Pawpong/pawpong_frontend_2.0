'use client'

import type { SVGProps } from 'react'
import { Container, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'

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
      <div className="border-b border-border-light tab:mt-[2.719rem]">
        <Container>
          <TabsList className="flex h-8 w-full items-center gap-4 tab:h-auto tab:gap-8">
            {tabs.map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className={cn(
                  'group relative flex h-full min-w-px flex-1 items-center justify-center px-1.5 py-2.5',
                  'data-[state=active]:border-b-2 data-[state=active]:border-text-primary',
                  'tab:data-[state=active]:border-b-0 tab:data-[state=active]:after:absolute tab:data-[state=active]:after:bottom-[-2px] tab:data-[state=active]:after:left-0 tab:data-[state=active]:after:h-[3px] tab:data-[state=active]:after:w-full tab:data-[state=active]:after:bg-text-primary',
                  tab.Icon ? 'gap-2.5' : '',
                )}
              >
                <span className="text-sm leading-[1.375rem] font-medium whitespace-nowrap text-text-primary group-data-[state=active]:font-bold tab:text-base">
                  {tab.label}
                </span>
                {tab.Icon && (
                  <tab.Icon className="size-5 shrink-0 -translate-y-px text-text-primary" />
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Container>
      </div>
      {children}
    </Tabs>
  )
}

export { HomeTabs, TabsContent }
export type { HomeTabConfig }
