'use client'

import { useState } from 'react'
import { Container, NavigationBar, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'
import { createMockListings, MOCK_ADOPTED_LISTINGS } from '@/shared/mocks/adoption'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
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
    <div className="flex w-full flex-1 flex-col">
      <NavigationBar title="저장목록" backHref="/home" />

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        {/* 공통 TabBar (디자인 976-32388) — 모바일 medium / 탭·PC large
            border는 풀폭, 탭 목록은 Container(mx-auto max-w)로 가운데 정렬 */}
        <div className="w-full border-b border-[#cacaca] bg-white">
          <Container className="pt-3 tab:pt-4">
            <TabsList variant="underline">
              {BOOKMARK_TABS.map((tab) => (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  variant="underline"
                  size="md"
                  className="tab:h-[3.8125rem] tab:pt-2 tab:text-base tab:after:h-[0.5625rem]"
                >
                  {tab.label}
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
