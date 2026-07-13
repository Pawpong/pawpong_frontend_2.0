'use client'

import { useState } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { Container, NavigationBar, Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { mapAdoptionCard } from '@/app/(main)/explore/_lib/mapAdoptionCard'
import { formatDate } from '@/shared/lib/formatDate'
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
  const listings = (favoritesData?.pages.flatMap((page) => page.items) ?? []).map(mapAdoptionCard)

  // 입양목록 탭 — GET /adoption/me/adopted
  const { data: adoptedData } = useInfiniteQuery(adoptionQueries.myAdopted())
  const adoptedListings: AdoptedListingCard[] = (
    adoptedData?.pages.flatMap((page) => page.items) ?? []
  ).map((card) => ({ ...mapAdoptionCard(card), adoptedAt: formatDate(card.adoptedAt) }))

  // 저장피드 탭 — '저장피드' 제품 정의 확정 전까지 목업 유지 (백엔드는 좋아요한 영상만 제공)
  const savedFeeds = MOCK_MY_HOME_POSTS

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
