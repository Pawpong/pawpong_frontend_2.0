'use client'

import { useState } from 'react'
import { cafe24Proup } from '@/shared/lib/fonts'
import {
  Container,
  PageHeader,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from '@/shared/ui'
import { createMockListings, MOCK_ADOPTED_LISTINGS } from '@/shared/mocks/adoption'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import { cn } from '@/shared/lib/Cn'
import { BOOKMARK_TABS } from './constants'
import { FavoritesTab } from './FavoritesTab'
import { SavedFeedsTab } from './SavedFeedsTab'
import { AdoptionListTab } from './AdoptionListTab'

const BookmarksContent = () => {
  const [activeTab, setActiveTab] = useState('favorites')

  // TODO: 실제 API 연동
  const listings = createMockListings().filter((l) => l.status === 'available')
  const savedFeeds = MOCK_MY_HOME_POSTS
  const adoptedListings = MOCK_ADOPTED_LISTINGS

  return (
    <div className="flex w-full flex-col">
      <PageHeader title="저장목록" backHref="/home" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="border-b border-border-light">
          <Container>
            <TabsList className="flex w-full items-center gap-8">
              {BOOKMARK_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className={cn(
                    'group flex flex-1 min-w-px items-center justify-center p-2.5',
                    'data-[state=active]:border-b-2 data-[state=active]:border-text-primary',
                  )}
                >
                  {/* 모바일: cafe24 폰트 */}
                  <span
                    className={cn(
                      cafe24Proup.className,
                      'font-cafe24 text-xs leading-[1.375rem] text-[#a7a7a7] whitespace-nowrap tab:hidden',
                      'group-data-[state=active]:text-text-primary',
                    )}
                  >
                    {tab.label}
                  </span>
                  {/* PC: Pretendard */}
                  <span
                    className={cn(
                      'hidden text-base font-medium leading-[1.375rem] text-[#a7a7a7] whitespace-nowrap tab:inline',
                      'group-data-[state=active]:font-semibold group-data-[state=active]:text-text-primary',
                    )}
                  >
                    {tab.label}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Container>
        </div>

        <TabsContent value="favorites" className="mt-0">
          <FavoritesTab listings={listings} />
        </TabsContent>

        <TabsContent value="saved-feeds" className="mt-0">
          <SavedFeedsTab feeds={savedFeeds} />
        </TabsContent>

        <TabsContent value="adoption-list" className="mt-0">
          <AdoptionListTab listings={adoptedListings} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export { BookmarksContent }
