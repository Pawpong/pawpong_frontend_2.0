'use client'

import { useState } from 'react'
import { NavigationBar, TabBar, TabsContent } from '@/shared/ui'
import { BOOKMARK_TABS } from './constants'
import { FavoritesTab } from './FavoritesTab'
import { SavedFeedsTab } from './SavedFeedsTab'
import { AdoptionListTab } from './AdoptionListTab'

// 각 탭이 자기 데이터를 직접 조회한다 — 비활성 탭은 Radix가 언마운트하므로
// 열린 탭의 API만 호출된다(enabled 분기 불필요).
const BookmarksContent = () => {
  const [activeTab, setActiveTab] = useState('favorites')

  return (
    <div className="flex w-full flex-1 flex-col">
      <NavigationBar title="저장목록" backHref="/home" />

      <TabBar
        narrow
        items={BOOKMARK_TABS.map((tab) => ({ value: tab.id, label: tab.label }))}
        value={activeTab}
        onValueChange={setActiveTab}
        ariaLabel="저장목록"
      >
        <TabsContent value="favorites" className="mt-0">
          <FavoritesTab />
        </TabsContent>

        <TabsContent value="saved-feeds" className="mt-0">
          <SavedFeedsTab />
        </TabsContent>

        <TabsContent value="adoption-list" className="mt-0">
          <AdoptionListTab />
        </TabsContent>
      </TabBar>
    </div>
  )
}

export { BookmarksContent }
