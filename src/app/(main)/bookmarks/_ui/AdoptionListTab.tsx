'use client'

import { Container } from '@/shared/ui'
import { AdoptedListingCard } from './AdoptedListingCard'
import type { AdoptedListingCard as AdoptedListingCardType } from '@/shared/types'

interface AdoptionListTabProps {
  listings: AdoptedListingCardType[]
}

const AdoptionListTab = ({ listings }: AdoptionListTabProps) => {
  const groupedByDate = listings.reduce<Record<string, AdoptedListingCardType[]>>((acc, item) => {
    const date = item.adoptedAt
    if (!acc[date]) acc[date] = []
    acc[date].push(item)
    return acc
  }, {})

  return (
    // 패딩: 모바일 py20·px16(기본 20→px-4 오버라이드) / tab px48 / pc px80·py40 — 카드는 max-w로 중앙정렬
    <Container className="px-4 py-5 pc:py-10">
      <div className="flex flex-col gap-3 tab:gap-[0.625rem]">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="flex flex-col gap-[0.375rem] tab:gap-[0.625rem]">
            {/* 입양 날짜 — 모바일·탭 body-sm(12) / pc body-md(14), medium, #6b6b6b */}
            <p className="text-body-sm font-medium text-neutral-700 pc:text-body-md">
              입양 날짜 : {date}
            </p>
            {items.map((listing) => (
              <AdoptedListingCard key={listing.listingId} listing={listing} />
            ))}
          </div>
        ))}
      </div>
    </Container>
  )
}

export { AdoptionListTab }
