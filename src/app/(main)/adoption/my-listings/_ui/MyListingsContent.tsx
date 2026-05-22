'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowBackIcon } from '@/shared/assets/icons'
import { Container, Separator } from '@/shared/ui'
import { AdoptionCard } from '@/entities/adoption'
import { createMockListings } from '@/shared/mocks/adoption'
import type { AdoptionStatus } from '@/shared/types'
import { StatusFilterChips } from './StatusFilterChips'
import { ReservedListingCard } from './ReservedListingCard'
import { BreederListingCard } from '@/app/(main)/home/_ui/BreederListingCard'

const MyListingsContent = () => {
  const [activeStatus, setActiveStatus] = useState<AdoptionStatus | null>('available')
  const allListings = createMockListings()

  const filteredListings = activeStatus
    ? allListings.filter((l) => l.status === activeStatus)
    : allListings

  const isGroupedView = activeStatus === 'reserved' || activeStatus === 'completed'

  // 예약중/분양완료: 날짜별 그룹핑
  const groupedByDate = useMemo(() => {
    if (!isGroupedView) return null
    const groups = new Map<string, typeof filteredListings>()
    for (const listing of filteredListings) {
      const date = listing.postedAt
      const existing = groups.get(date) ?? []
      existing.push(listing)
      groups.set(date, existing)
    }
    return groups
  }, [filteredListings, isGroupedView])

  return (
    <div className="flex w-full flex-col">
      {/* Navigation Header */}
      <Container>
        <div className="flex items-center py-3 tab:pb-[2rem] tab:pt-[1.5rem]">
          <Link href="/home" className="flex flex-1 items-center">
            <ArrowBackIcon className="size-6 text-text-primary" />
          </Link>
          <h1 className="text-sm font-semibold leading-[1.5] text-text-primary tab:text-xl tab:font-bold tab:leading-[1.375rem]">
            분양 페이지
          </h1>
          <div className="flex-1" />
        </div>
      </Container>

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
          <div className="flex flex-col gap-[3.787rem] py-5 tab:py-8">
            {[...groupedByDate.entries()].map(([date, listings]) => (
              <div key={date} className="flex flex-col gap-2.5">
                <p className="text-sm font-medium leading-[1.375rem] text-text-primary">
                  {date}
                </p>
                <div className="flex flex-col gap-2.5">
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
