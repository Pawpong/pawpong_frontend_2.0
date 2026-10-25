'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { ListingCardGrid, ListingCardGridSkeleton, ListState, ShowcaseSection } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { FavoriteAdoptionGridCard } from '@/features/adoption'

const CARD_COUNT = 5
// 1024px 부터는 공통 격자 그대로 5장 한 줄. 그보다 좁으면 태블릿 4열·모바일 2×2 로 4장만 보여
// 5번째가 혼자 다음 줄로 넘어가지 않게 한다.
const SHOWCASE_GRID = 'tab:grid-cols-4 max-lap:[&>*:nth-child(5)]:hidden'

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
            <FavoriteAdoptionGridCard listing={listing} preload={index === 0} />
          )}
        />
      </ListState>
    </ShowcaseSection>
  )
}

export { AdoptionShowcase }
