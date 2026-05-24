'use client'

import Image from 'next/image'
import { cn } from '@/shared/lib/Cn'
import { Badge, ListingStats } from '@/shared/ui'
import type { AdoptedListingCard as AdoptedListingCardType } from '@/shared/types'

interface AdoptedListingCardProps {
  listing: AdoptedListingCardType
}

const AdoptedListingCard = ({ listing }: AdoptedListingCardProps) => {
  return (
    <>
      {/* 모바일 카드 */}
      <div className="flex rounded-[0.375rem] bg-[#f0f0f0] p-[0.5rem] tab:hidden">
        {/* 이미지 100x100 */}
        <div className="relative size-[6.25rem] shrink-0 overflow-hidden">
          <Image
            src={listing.thumbnailUrl}
            alt={listing.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/70" />
          {listing.isPopular && (
            <Badge
              variant="outline"
              className="absolute left-[0.5rem] top-[0.43rem] bg-white px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
            >
              인기
            </Badge>
          )}
        </div>

        {/* 정보 */}
        <div className="flex min-w-0 flex-1 flex-col justify-between py-[0.0625rem] pl-[0.5625rem]">
          <div className="flex flex-col">
            <p className="line-clamp-1 text-sm font-bold leading-[1.5] text-[#5d5d5d]">
              {listing.name}
            </p>
            <div className="mt-[0.125rem] flex items-center">
              <Badge
                variant="status"
                className="bg-[#5d5d5d] px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
              >
                분양완료
              </Badge>
            </div>
          </div>

          <div className="flex flex-col">
            <ListingStats
              inquiryCount={listing.inquiryCount}
              favoriteCount={listing.favoriteCount}
              viewCount={listing.viewCount}
              size="sm"
              className="gap-[0.5rem]"
            />
            <div className="flex items-center gap-[0.438rem] text-[0.75rem] leading-normal text-[#a3a3a3]">
              <span>게시날짜</span>
              <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
              <span>{listing.postedAt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* PC 카드 */}
      <div className="hidden overflow-hidden rounded-2xl bg-[#e7e7e7] tab:flex tab:h-[19.0625rem]">
        {/* 이미지 */}
        <div className="relative w-[13.647rem] shrink-0 overflow-hidden rounded-[0.437rem]">
          <Image
            src={listing.thumbnailUrl}
            alt={listing.name}
            fill
            className="object-cover"
          />
          <div className="absolute inset-0 bg-white/70" />
          {listing.isPopular && (
            <Badge
              variant="outline"
              className="absolute left-[1rem] top-[1rem] bg-white"
            >
              인기
            </Badge>
          )}
        </div>

        {/* 정보 */}
        <div className="flex flex-1 flex-col justify-between px-[2rem] py-[2.5rem]">
          <div className="flex flex-col">
            {/* 이름 + 성별/나이 + 분양완료 배지 */}
            <div className="flex items-center gap-[1.125rem]">
              <p className="text-xl font-semibold leading-[1.375rem] text-[#5d5d5d]">
                {listing.name}
              </p>
              <span className="size-[0.253rem] rounded-full bg-[#5d5d5d]" />
              <span className="text-xl font-semibold leading-[1.375rem] text-[#5d5d5d]">
                성별
              </span>
              <span className="size-[0.253rem] rounded-full bg-[#5d5d5d]" />
              <span className="text-xl font-semibold leading-[1.375rem] text-[#5d5d5d]">
                {listing.ageText}
              </span>
              <Badge
                variant="status"
                className="bg-[#5d5d5d] px-[0.585rem] py-[0.234rem] text-sm leading-[1.375rem]"
              >
                분양완료
              </Badge>
            </div>

            {/* 설명 */}
            <p className="mt-[1.375rem] line-clamp-3 text-base font-semibold leading-[1.375rem] text-[#5d5d5d]">
              {listing.description}
            </p>

            {/* 문의/관심/조회 */}
            <ListingStats
              inquiryCount={listing.inquiryCount}
              favoriteCount={listing.favoriteCount}
              viewCount={listing.viewCount}
              className="mt-[0.75rem] gap-[1.25rem] text-sm leading-[1.375rem]"
            />
          </div>

          {/* 하단: 게시날짜 + 대화중인 채팅 버튼 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-[0.438rem] text-sm text-[#a3a3a3]">
              <span>게시날짜</span>
              <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
              <span>{listing.postedAt}</span>
            </div>
            <button
              type="button"
              className={cn(
                'rounded-full bg-[#5d5d5d] px-[2.5rem] py-[0.625rem]',
                'text-base font-semibold text-white',
              )}
            >
              대화중인 채팅
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

export { AdoptedListingCard }
