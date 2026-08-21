'use client'

import { useInfiniteQuery } from '@tanstack/react-query'
import { adoptionQueries } from '@/entities/adoption'
import { ShowcaseSection } from '@/shared/ui'
import { flattenPages } from '@/shared/lib/infiniteList'
import { mapAdoptionCard } from '@/shared/lib/mapAdoptionCard'
import { createMockListings } from '@/shared/mocks/adoption'
import { FavoriteAdoptionShowcaseCard } from '@/features/adoption'

const CARD_COUNT = 4

const AdoptionShowcase = () => {
  // 홈 섹션은 비필수 — 실패해도 페이지는 렌더되어야 하므로 바운더리로 던지지 않음
  const { data } = useInfiniteQuery({
    ...adoptionQueries.list('latest', undefined, 'available', undefined, CARD_COUNT),
    throwOnError: false,
  })
  const pets = flattenPages(data).slice(0, CARD_COUNT).map(mapAdoptionCard)

  // ponytail SSL 인증서 복구 전 홈 UI 확인용 폴백 (명예의 동물과 동일)
  const listings = pets.length > 0 ? pets : createMockListings().slice(0, CARD_COUNT)

  return (
    <ShowcaseSection title="분양중인 동물" linkText="탐색 바로가기" linkHref="/explore">
      {/* 모바일 2열 / 태블릿·PC 4열 (탭 164px, PC 282px 카드) */}
      <div className="grid grid-cols-[repeat(2,10.25rem)] justify-between gap-x-0 gap-y-5 tab:grid-cols-[repeat(4,10.25rem)] tab:gap-y-0 pc:grid-cols-4 pc:gap-[3.125rem]">
        {listings.map((listing) => (
          <FavoriteAdoptionShowcaseCard key={listing.listingId} listing={listing} />
        ))}
      </div>
    </ShowcaseSection>
  )
}

export { AdoptionShowcase }
