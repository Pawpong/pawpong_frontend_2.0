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
        'relative flex overflow-hidden rounded-2xl bg-[#e7e7e7] tab:h-[19.063rem]',
        className,
      )}
    >
      {/* 이미지: 세로 센터, rounded-7px */}
      <div className="relative w-[7rem] shrink-0 self-stretch tab:my-auto tab:ml-[1.719rem] tab:h-[14.124rem] tab:w-[13.647rem] tab:self-auto tab:overflow-hidden tab:rounded-[0.437rem]">
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
      <div className="flex flex-1 flex-col p-3 tab:py-[2.319rem] tab:pl-[1.5rem] tab:pr-[1.719rem]">
        {/* 이름 · 성별 · 나이 + 뱃지 */}
        <div className="flex flex-wrap items-center gap-1 tab:gap-[1.125rem]">
          <p className="text-sm font-semibold leading-[1.375rem] text-text-primary tab:text-xl">
            {listing.name}
          </p>
          <span className="hidden size-[0.253rem] rounded-full bg-text-primary tab:block" />
          <span className="hidden text-xl font-semibold leading-[1.375rem] text-text-primary tab:block">
            {GENDER_LABEL[listing.gender]}
          </span>
          <span className="hidden size-[0.253rem] rounded-full bg-text-primary tab:block" />
          <span className="hidden text-xl font-semibold leading-[1.375rem] text-text-primary tab:block">
            {listing.ageText}
          </span>
          <Badge
            variant="status"
            className="bg-text-primary px-[0.585rem] py-[0.234rem] text-xs leading-[1.286rem] tab:text-sm"
          >
            {ADOPTION_STATUS_LABEL[listing.status]}
          </Badge>
        </div>

        {/* 설명 */}
        {listing.description && (
          <p className="mt-2 line-clamp-2 text-xs leading-[1.375rem] text-text-primary tab:mt-[1.125rem] tab:line-clamp-3 tab:text-base tab:font-semibold">
            {listing.description}
          </p>
        )}

        {/* 문의/관심/조회 */}
        <ListingStats
          inquiryCount={listing.inquiryCount}
          favoriteCount={listing.favoriteCount}
          viewCount={listing.viewCount}
          size="md"
          className="mt-1.5 gap-[0.375rem] tab:mt-[0.75rem] tab:gap-5 tab:text-sm"
        />

        {/* 게시날짜 */}
        <div className="mt-auto flex items-center gap-[0.438rem] pt-2 text-xs text-[#a3a3a3] tab:text-sm">
          <span>게시날짜</span>
          <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
          <span>{listing.postedAt}</span>
        </div>
      </div>

      {/* 대화중인 채팅 버튼: 우하단 */}
      {listing.chatCount !== undefined && listing.chatCount > 0 && (
        <span className="absolute bottom-3 right-3 flex h-8 items-center justify-center rounded-full bg-text-primary px-3 text-xs font-semibold text-white tab:bottom-[1.719rem] tab:right-[1.719rem] tab:h-12 tab:w-[11.938rem] tab:text-base">
          대화중인 채팅{isCompleted ? '' : ` ${listing.chatCount}`}
        </span>
      )}
    </Link>
  )
}

export { ReservedListingCard }
