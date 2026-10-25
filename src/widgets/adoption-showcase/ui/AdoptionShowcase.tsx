'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { ListingCardGrid, ListingCardGridSkeleton, ListState, ShowcaseSection } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { FavoriteAdoptionShowcaseCard } from '@/features/adoption'

const CARD_COUNT = 4
// 공통 격자에서 열 수만 덮는다 — 홈은 4장 한 줄이라 태블릿 3열이면 3+1 로 갈라진다.
const SHOWCASE_GRID = 'tab:grid-cols-4'

const AdoptionShowcase = () => {
  // 홈 섹션은 비필수 — 실패해도 페이지는 렌더되어야 하므로 바운더리로 던지지 않음
  const { data, isPending, isError } = useInfiniteQuery({
    ...adoptionQueries.list('latest', undefined, 'available', undefined, CARD_COUNT),
    throwOnError: false,
  })
  const pets = flattenPages(data).slice(0, CARD_COUNT).map(mapAdoptionCard)

  return (
    <ShowcaseSection
      title="분양중인 동물"
      linkText="탐색 바로가기"
      linkHref="/explore?type=adoption"
    >
      <ListState
        appPublicContent
        isPending={isPending}
        isError={isError}
        isEmpty={pets.length === 0}
        loadingText="분양중인 동물을 불러오는 중이에요."
        loadingFallback={
          <ListingCardGridSkeleton
            label="분양중인 동물을 불러오는 중이에요."
            count={CARD_COUNT}
            className={SHOWCASE_GRID}
          />
        }
        errorText="분양중인 동물을 불러오지 못했어요."
        emptyText="현재 분양중인 동물이 없어요."
      >
        <ListingCardGrid
          className={SHOWCASE_GRID}
          items={pets}
          getKey={(listing) => listing.listingId}
          renderItem={(listing, index) => (
            <FavoriteAdoptionShowcaseCard listing={listing} preload={index === 0} />
          )}
        />
      </ListState>
    </ShowcaseSection>
  )
}

export { AdoptionShowcase }
