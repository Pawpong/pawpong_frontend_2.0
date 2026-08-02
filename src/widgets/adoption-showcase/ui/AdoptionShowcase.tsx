'use client'

import { useQuery } from '@tanstack/react-query'
import { ShowcaseSection } from '@/shared/ui'
import { adoptionQueries } from '@/entities/adoption'
import { mapAdoptionCard } from '@/app/(main)/explore/_lib/mapAdoptionCard'
import { createMockListings } from '@/shared/mocks/adoption'
import { FavoriteAdoptionShowcaseCard } from '@/features/adoption'

const CARD_COUNT = 4

const AdoptionShowcase = () => {
  // 홈은 부분 실패 허용 — throwOnError만 꺼서 실패 시 목업으로 스켈레톤 유지
  // (AdoptionPetCard → AdoptionListingCard 변환은 explore와 동일하게 mapAdoptionCard 재사용)
  const { data } = useQuery({
    ...adoptionQueries.popular(undefined, CARD_COUNT),
    throwOnError: false,
  })
  const fetched = (data ?? []).slice(0, CARD_COUNT).map(mapAdoptionCard)

  // 데이터 없으면(로딩/실패/빈 목록) 목업으로 스켈레톤 유지
  const listings = fetched.length > 0 ? fetched : createMockListings().slice(0, CARD_COUNT)

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
