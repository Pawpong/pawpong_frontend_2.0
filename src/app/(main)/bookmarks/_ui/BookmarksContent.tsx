'use client'

import { useState } from 'react'
import { NavigationBar, TabBar, TabsContent } from '@/shared/ui'
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

      <TabBar
        items={BOOKMARK_TABS.map((tab) => ({ value: tab.id, label: tab.label }))}
        value={activeTab}
        onValueChange={setActiveTab}
        ariaLabel="저장목록"
      >
        <TabsContent value="favorites" className="mt-0">
          <FavoritesTab listings={listings} />
        </TabsContent>

        <TabsContent value="saved-feeds" className="mt-0">
          <SavedFeedsTab feeds={savedFeeds} />
        </TabsContent>

        <TabsContent value="adoption-list" className="mt-0">
          <AdoptionListTab listings={adoptedListings} />
        </TabsContent>
      </TabBar>
    </div>
  )
}

export { BookmarksContent }
