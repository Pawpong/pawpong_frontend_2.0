'use client'

import { useState } from 'react'
import { TabBar, TabsContent } from '@/shared/ui'
import { BOOKMARK_TABS } from './constants'
import { FavoritesTab } from './FavoritesTab'
import { SavedFeedsTab } from './SavedFeedsTab'
import { AdoptionListTab } from './AdoptionListTab'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'

// 각 탭이 자기 데이터를 직접 조회한다 — 비활성 탭은 Radix가 언마운트하므로
// 열린 탭의 API만 호출된다(enabled 분기 불필요).
const BookmarksContent = ({ initialTab }: { initialTab?: string }) => {
  // 커뮤니티의 '저장한 글에서 다시 보기'처럼 특정 탭으로 바로 들어오는 링크를 받는다.
  const [activeTab, setActiveTab] = useState(
    BOOKMARK_TABS.some((tab) => tab.id === initialTab) && initialTab ? initialTab : 'favorites',
  )

  return (
    <div className="flex w-full flex-1 flex-col">
      <TabBar
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

        <TabsContent value="breeders" className="mt-0">
          <FavoriteBreedersContent />
        </TabsContent>
      </TabBar>
    </div>
  )
}

export { BookmarksContent }
