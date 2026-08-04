'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { NavigationBar, TabBar, TabsContent } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { mapAdoptionCard } from '@/app/(main)/explore/_lib/mapAdoptionCard'
import { formatDate } from '@/shared/lib/formatDate'
import { uniqueBy } from '@/shared/lib/uniqueBy'
import { MOCK_MY_HOME_POSTS } from '@/shared/mocks/myHome'
import type { AdoptedListingCard } from '@/shared/types'
import { BOOKMARK_TABS } from './constants'
import { FavoritesTab } from './FavoritesTab'
import { SavedFeedsTab } from './SavedFeedsTab'
import { AdoptionListTab } from './AdoptionListTab'

const BookmarksContent = () => {
  const [activeTab, setActiveTab] = useState('favorites')

  // 관심 목록 탭 — GET /adoption/me/favorites
  const { data: favoritesData } = useInfiniteQuery(adoptionQueries.myFavorites())
  const listings = uniqueBy(
    (favoritesData?.pages.flatMap((page) => page.items) ?? []).map(mapAdoptionCard),
    (listing) => listing.listingId,
  )

  // 입양목록 탭 — GET /adoption/me/adopted
  const { data: adoptedData } = useInfiniteQuery(adoptionQueries.myAdopted())
  const adoptedListings: AdoptedListingCard[] = uniqueBy(
    (adoptedData?.pages.flatMap((page) => page.items) ?? []).map((card) => ({
      ...mapAdoptionCard(card),
      adoptedAt: formatDate(card.adoptedAt),
    })),
    (listing) => listing.listingId,
  )

  // 저장피드 탭 — '저장피드' 제품 정의 확정 전까지 목업 유지 (백엔드는 좋아요한 영상만 제공)
  const savedFeeds = MOCK_MY_HOME_POSTS

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
