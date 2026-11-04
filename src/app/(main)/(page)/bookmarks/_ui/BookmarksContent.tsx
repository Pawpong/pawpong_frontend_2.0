'use client'

import { useState } from 'react'
import { TabBar, TabsContent } from '@/shared/ui'
import { useAuthStatus } from '@/shared/lib/useAuthStatus'
import { BOOKMARK_TABS } from '../_lib/constants'
import { FavoritesTab } from './FavoritesTab'
import { AdoptionListTab } from './AdoptionListTab'
import { FavoriteBreedersContent } from './FavoriteBreedersContent'

// 각 탭이 자기 데이터를 직접 조회한다 — 비활성 탭은 Radix가 언마운트하므로
// 열린 탭의 API만 호출된다(enabled 분기 불필요).
const BookmarksContent = ({ initialTab }: { initialTab?: string }) => {
  // 특정 탭으로 바로 들어오는 링크(?tab=breeders 등)를 받는다.
  const [activeTab, setActiveTab] = useState(
    BOOKMARK_TABS.some((tab) => tab.value === initialTab) && initialTab ? initialTab : 'favorites',
  )

  // 입양 신청이 입양자 전용이라 브리더에게는 입양목록이 생기지 않는다(서버도 403) — 탭을 빼고,
  // ?tab=adoption-list 로 들어와도 첫 탭을 연다 (비활성 탭은 언마운트돼 조회도 하지 않는다)
  const { userRole } = useAuthStatus()
  const tabs =
    userRole === 'breeder'
      ? BOOKMARK_TABS.filter((tab) => tab.value !== 'adoption-list')
      : BOOKMARK_TABS
  const currentTab = tabs.some((tab) => tab.value === activeTab) ? activeTab : 'favorites'

  return (
    <div>
      <TabBar items={tabs} value={currentTab} onValueChange={setActiveTab} ariaLabel="관심 목록">
        <TabsContent value="favorites">
          <FavoritesTab />
        </TabsContent>

        <TabsContent value="adoption-list">
          <AdoptionListTab />
        </TabsContent>

        <TabsContent value="breeders">
          <FavoriteBreedersContent />
        </TabsContent>
      </TabBar>
    </div>
  )
}

export { BookmarksContent }
