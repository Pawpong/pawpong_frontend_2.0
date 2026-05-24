'use client'

import { Container, SectionHeader } from '@/shared/ui'
import { AdoptionCard } from '@/entities/adoption'
import type { AdoptionListingCard } from '@/shared/types'

interface FavoritesTabProps {
  listings: AdoptionListingCard[]
}

const FavoritesTab = ({ listings }: FavoritesTabProps) => (
  <Container>
    <div className="pt-5 tab:pt-8">
      <SectionHeader
        title={`입양 관심목록 ${listings.length}`}
        linkText="입양페이지 가기"
        linkHref="/adoption"
      />
    </div>

    {/* 모바일: 2열 그리드 */}
    <div className="grid grid-cols-2 gap-4 pb-15 pt-3 tab:hidden">
      {listings.map((listing) => (
        <AdoptionCard key={listing.listingId} listing={listing} />
      ))}
    </div>

    {/* PC: 3열 그리드 */}
    <div className="hidden tab:mt-6 tab:grid tab:grid-cols-3 tab:gap-[1.156rem] tab:pb-10">
      {listings.map((listing) => (
        <AdoptionCard key={listing.listingId} listing={listing} />
      ))}
    </div>
  </Container>
)

export { FavoritesTab }
