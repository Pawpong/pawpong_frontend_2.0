'use client'

import Link from 'next/link'
import { Container, PageHeader, Separator } from '@/shared/ui'
import { AdoptionCard } from '@/entities/adoption'
import { createMockListings } from '@/shared/mocks/adoption'
import { useListingsFilter } from '../_lib/useListingsFilter'
import { StatusFilterChips } from './StatusFilterChips'
import { ReservedListingCard } from './ReservedListingCard'
import { BreederListingCard } from '@/app/(main)/home/_ui/BreederListingCard'

const MyListingsContent = () => {
  const allListings = createMockListings()
  const {
    activeStatus,
    setActiveStatus,
    filteredListings,
    isGroupedView,
    groupedByDate,
  } = useListingsFilter(allListings)

  return (
    <div className="flex w-full flex-col pb-12">
      <PageHeader title="분양 페이지" backHref="/home" />

      <Separator className="bg-border-light" />

      {/* CTA: 분양글 작성 */}
      <Container>
        <Link
          href="/adoption/create"
          className="block py-3 text-sm font-medium leading-[1.375rem] text-text-primary tab:py-4 tab:text-base"
        >
          {`분양할 아이가 있나요? 글 작성하러 가기 >`}
        </Link>
      </Container>

      <Separator className="bg-border-light" />

      {/* 분양목록 헤더 + 필터 */}
      <Container>
        <div className="flex items-center justify-between pt-5 tab:pt-8">
          <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-xl">
            분양목록
          </p>
          <StatusFilterChips
            activeStatus={activeStatus}
            onStatusChange={setActiveStatus}
          />
        </div>

        {isGroupedView && groupedByDate ? (
          /* 예약중: 날짜 그룹 + 가로형 리스트 */
          <div className="flex flex-col gap-3 py-5 tab:gap-[3.787rem] tab:py-8">
            {[...groupedByDate.entries()].map(([date, listings]) => (
              <div key={date} className="flex flex-col gap-1.5">
                <p className="text-sm font-medium leading-[1.375rem] text-text-primary">
                  {date}
                </p>
                <div className="flex flex-col gap-2">
                  {listings.map((listing) => (
                    <ReservedListingCard key={listing.listingId} listing={listing} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Mobile: 2열 그리드 */}
            <div className="grid grid-cols-2 gap-[0.625rem] py-[1.25rem] tab:hidden">
              {filteredListings.map((listing) => (
                <BreederListingCard key={listing.listingId} listing={listing} />
              ))}
            </div>

            {/* Desktop: 3열 그리드 */}
            <div className="hidden tab:mt-6 tab:grid tab:grid-cols-3 tab:gap-6 tab:pb-8">
              {filteredListings.map((listing) => (
                <AdoptionCard key={listing.listingId} listing={listing} />
              ))}
            </div>
          </>
        )}
      </Container>
    </div>
  )
}

export { MyListingsContent }
