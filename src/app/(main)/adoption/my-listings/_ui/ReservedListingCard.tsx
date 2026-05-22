'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge, ListingStats } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import type { AdoptionListingCard } from '@/shared/types'
import { GENDER_LABEL } from '@/shared/types'

interface ReservedListingCardProps {
  listing: AdoptionListingCard
  className?: string
}

const ReservedListingCard = ({ listing, className }: ReservedListingCardProps) => {
  return (
    <Link
      href={`/adoption/${listing.listingId}`}
      className={cn(
        'flex overflow-hidden rounded-2xl bg-[#e7e7e7]',
        className,
      )}
    >
      {/* 이미지 */}
      <div className="relative w-[8.5rem] shrink-0 self-stretch tab:w-[13.647rem]">
        <Image
          src={listing.thumbnailUrl}
          alt={listing.name}
          fill
          className="object-cover"
        />
        {listing.isPopular && (
          <Badge
            variant="outline"
            className="absolute left-2.5 top-3 bg-white tab:left-[2.375rem] tab:top-[3.17rem]"
          >
            인기🔥
          </Badge>
        )}
      </div>

      {/* 정보 */}
      <div className="flex flex-1 flex-col justify-between p-3 tab:px-6 tab:py-5">
        {/* 상단: 이름 + 뱃지 */}
        <div>
          <div className="flex flex-wrap items-center gap-1.5 tab:gap-[1.125rem]">
            <p className="text-sm font-semibold leading-[1.375rem] text-text-primary tab:text-xl">
              {listing.name}
            </p>
            <span className="hidden size-1 rounded-full bg-text-primary tab:block" />
            <span className="hidden text-xl font-semibold leading-[1.375rem] text-text-primary tab:block">
              {GENDER_LABEL[listing.gender]}
            </span>
            <span className="hidden size-1 rounded-full bg-text-primary tab:block" />
            <span className="hidden text-xl font-semibold leading-[1.375rem] text-text-primary tab:block">
              {listing.ageText}
            </span>
            <Badge
              variant="status"
              className="bg-text-primary px-[0.585rem] py-[0.234rem] text-xs leading-[1.286rem] tab:text-sm"
            >
              예약중
            </Badge>
          </div>

          {/* 설명 — 데스크탑만 */}
          {listing.description && (
            <p className="mt-2 hidden text-base font-semibold leading-[1.375rem] text-text-primary line-clamp-3 tab:block">
              {listing.description}
            </p>
          )}

          {/* 문의/관심/조회 */}
          <ListingStats
            inquiryCount={listing.inquiryCount}
            favoriteCount={listing.favoriteCount}
            viewCount={listing.viewCount}
            size="md"
            className="mt-1.5 gap-[0.375rem] tab:mt-3 tab:gap-5 tab:text-sm"
          />

          {/* 게시날짜 — 데스크탑만 */}
          <div className="mt-1 hidden items-center gap-[0.438rem] text-sm text-[#a3a3a3] tab:flex">
            <span>게시날짜</span>
            <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
            <span>{listing.postedAt}</span>
          </div>
        </div>

        {/* 하단: 채팅 버튼 — 데스크탑만 */}
        {listing.chatCount !== undefined && listing.chatCount > 0 && (
          <div className="mt-3 hidden justify-end tab:flex">
            <span className="flex h-12 w-[11.938rem] items-center justify-center rounded-full bg-text-primary text-base font-semibold text-white">
              대화중인 채팅 {listing.chatCount}
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}

export { ReservedListingCard }
