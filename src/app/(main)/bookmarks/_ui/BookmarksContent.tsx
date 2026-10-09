'use client'

import { useState } from 'react'
import { TabBar, TabsContent } from '@/shared/ui'
import { useAuthStatus } from '@/features/auth'
import { BOOKMARK_TABS } from './constants'
import { FavoritesTab } from './FavoritesTab'
import { AdoptionListTab } from './AdoptionListTab'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'

// 각 탭이 자기 데이터를 직접 조회한다 — 비활성 탭은 Radix가 언마운트하므로
// 열린 탭의 API만 호출된다(enabled 분기 불필요).
const BookmarksContent = ({ initialTab }: { initialTab?: string }) => {
  // 특정 탭으로 바로 들어오는 링크(?tab=breeders 등)를 받는다.
  const [activeTab, setActiveTab] = useState(
    BOOKMARK_TABS.some((tab) => tab.id === initialTab) && initialTab ? initialTab : 'favorites',
  )

  // 입양 신청이 입양자 전용이라 브리더에게는 입양목록이 생기지 않는다(서버도 403) — 탭을 빼고,
  // ?tab=adoption-list 로 들어와도 첫 탭을 연다 (비활성 탭은 언마운트돼 조회도 하지 않는다)
  const { userRole } = useAuthStatus()
  const tabs =
    userRole === 'breeder'
      ? BOOKMARK_TABS.filter((tab) => tab.id !== 'adoption-list')
      : BOOKMARK_TABS
  const currentTab = tabs.some((tab) => tab.id === activeTab) ? activeTab : 'favorites'

  return (
    <div className="flex w-full flex-1 flex-col">
      <TabBar
        items={tabs.map((tab) => ({ value: tab.id, label: tab.label }))}
        value={currentTab}
        onValueChange={setActiveTab}
        ariaLabel="저장목록"
      >
        <TabsContent value="favorites" className="mt-0">
          <FavoritesTab />
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
