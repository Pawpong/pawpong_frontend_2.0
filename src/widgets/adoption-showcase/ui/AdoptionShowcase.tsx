import { ShowcaseSection } from '@/shared/ui'
import { createMockListings } from '@/shared/mocks/adoption'
import { FavoriteAdoptionShowcaseCard } from '@/features/adoption'

const CARD_COUNT = 4

// ponytail: 분양 목록 API(AdoptionPetCard)가 카드 타입(AdoptionListingCard)과 아직 불일치 —
// explore도 동일하게 이 카드엔 목데이터 사용. 타입 정합되면 adoptionQueries.list로 교체.
const AdoptionShowcase = () => {
  const listings = createMockListings().slice(0, CARD_COUNT)

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
