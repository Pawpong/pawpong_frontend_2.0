'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Badge, ListingStats } from '@/shared/ui'
import { cn } from '@/shared/lib/Cn'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'

interface ReservedListingCardProps {
  listing: AdoptionListingCard
  className?: string
}

const ReservedListingCard = ({ listing, className }: ReservedListingCardProps) => {
  const isCompleted = listing.status === 'completed'

  return (
    <Link
      href={`/adoption/${listing.listingId}`}
      className={cn(
        'relative flex overflow-hidden rounded-[0.375rem] bg-[#f0f0f0] tab:rounded-2xl tab:bg-[#e7e7e7] tab:h-[19.063rem]',
        className,
      )}
    >
      {/* 이미지 */}
      <div className="relative m-[0.438rem] size-[6.25rem] shrink-0 overflow-hidden rounded-[0.375rem] tab:m-0 tab:my-auto tab:ml-[1.719rem] tab:h-[14.124rem] tab:w-[13.647rem] tab:rounded-[0.437rem]">
        <Image
          src={listing.thumbnailUrl}
          alt={listing.name}
          fill
          className="object-cover"
        />
        {isCompleted && (
          <div className="absolute inset-0 bg-white/70" />
        )}
        {listing.isPopular && (
          <Badge
            variant="outline"
            className="absolute left-2 top-2 bg-white tab:left-[0.625rem] tab:top-[1.125rem]"
          >
            인기🔥
          </Badge>
        )}
      </div>

      {/* 정보 영역 */}
      <div className="flex flex-1 flex-col py-[0.438rem] pr-3 tab:py-[2.319rem] tab:pl-[1.5rem] tab:pr-[1.719rem]">
        {/* 이름 */}
        <p className="text-sm font-bold leading-[1.5] text-text-primary tab:text-xl tab:font-semibold">
          {listing.name}
        </p>

        {/* 뱃지 + 데스크탑 성별·나이 */}
        <div className="flex flex-wrap items-center gap-1 tab:gap-[1.125rem]">
          <Badge
            variant="status"
            className="bg-text-primary px-2 py-[0.125rem] text-xs leading-[1.375rem] tab:px-[0.585rem] tab:py-[0.234rem] tab:leading-[1.286rem] tab:text-sm"
          >
            {ADOPTION_STATUS_LABEL[listing.status]}
          </Badge>
          <span className="hidden size-[0.253rem] rounded-full bg-text-primary tab:block" />
          <span className="hidden text-xl font-semibold leading-[1.375rem] text-text-primary tab:block">
            {GENDER_LABEL[listing.gender]}
          </span>
          <span className="hidden size-[0.253rem] rounded-full bg-text-primary tab:block" />
          <span className="hidden text-xl font-semibold leading-[1.375rem] text-text-primary tab:block">
            {listing.ageText}
          </span>
        </div>

        {/* 설명: 데스크탑만 */}
        {listing.description && (
          <p className="mt-[1.125rem] hidden line-clamp-3 text-base font-semibold leading-[1.375rem] text-text-primary tab:block">
            {listing.description}
          </p>
        )}

        {/* 문의/관심/조회 */}
        <ListingStats
          inquiryCount={listing.inquiryCount}
          favoriteCount={listing.favoriteCount}
          viewCount={listing.viewCount}
          size="md"
          className="mt-auto gap-2 text-[0.625rem] tab:gap-5 tab:text-sm"
        />

        {/* 게시날짜 */}
        <div className="flex items-center gap-[0.438rem] text-xs text-[#a3a3a3] tab:text-sm">
          <span>게시날짜</span>
          <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
          <span>{listing.postedAt}</span>
        </div>
      </div>

      {/* 대화중인 채팅 버튼: 데스크탑만 */}
      {listing.chatCount !== undefined && listing.chatCount > 0 && (
        <span className="absolute bottom-[1.719rem] right-[1.719rem] hidden h-12 w-[11.938rem] items-center justify-center rounded-full bg-text-primary text-base font-semibold text-white tab:flex">
          대화중인 채팅{isCompleted ? '' : ` ${listing.chatCount}`}
        </span>
      )}
    </Link>
  )
}

export { ReservedListingCard }
