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
    <Container>
      <div className="pt-5 tab:pt-8">
        <h2 className="text-sm leading-[1.5] font-bold text-text-primary tab:text-xl">
          내가 입양한 목록 {listings.length}
        </h2>
      </div>

      <div className="flex flex-col gap-3 pt-4 pb-15 tab:gap-[0.625rem] tab:pt-6 tab:pb-10">
        {Object.entries(groupedByDate).map(([date, items]) => (
          <div key={date} className="flex flex-col gap-[0.375rem] tab:gap-[0.625rem]">
            <p className="text-xs leading-[1.5] font-medium text-text-primary tab:text-sm tab:leading-[1.375rem]">
              {date}
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
