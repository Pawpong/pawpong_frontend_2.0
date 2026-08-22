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
      {/* 모바일 2열 / 태블릿·PC 4열. 전 구간 고정폭이 아니라 비율 컬럼 —
          고정 164px + justify-between이면 기준폭(375/768)을 벗어나는 순간
          남는 폭이 전부 카드 사이 간격으로 벌어졌다 */}
      <div className="grid grid-cols-2 gap-x-[0.9375rem] gap-y-5 tab:grid-cols-4 tab:gap-x-5 tab:gap-y-0 pc:gap-x-[3.125rem]">
        {listings.map((listing) => (
          <FavoriteAdoptionShowcaseCard key={listing.listingId} listing={listing} />
        ))}
      </div>
    </ShowcaseSection>
  )
}

export { AdoptionShowcase }
