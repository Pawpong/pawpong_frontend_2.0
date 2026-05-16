'use client'

import Image from 'next/image'
import { tv } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'
import { FavoriteIcon } from '@/shared/assets/icons'
import { Badge } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_STATUS_LABEL } from '@/shared/types'

const statusBadge = tv({
  base: 'rounded-full px-[0.5rem] py-[0.25rem] text-[0.75rem] font-semibold leading-[1.25rem] text-white',
  variants: {
    status: {
      available: 'bg-[#5d5d5d]',
      reserved: 'bg-[#5d5d5d]',
      completed: 'bg-[#a4a4a4]',
    },
  },
})

interface AdoptionCardProps {
  listing: AdoptionListingCard
  className?: string
}

const AdoptionCard = ({ listing, className }: AdoptionCardProps) => {
  const genderLabel = listing.gender === 'male' ? '남자' : '여자'
  const isCompleted = listing.status === 'completed'

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-[0.9375rem] bg-[#e7e7e7]',
        className,
      )}
    >
      {/* 썸네일 */}
      <div className="relative aspect-[348/287] w-full overflow-hidden">
        <Image
          src={listing.thumbnailUrl}
          alt={listing.name}
          fill
          className="object-cover"
        />
        {isCompleted && (
          <div className="absolute inset-0 bg-white/70" />
        )}
      </div>

      {/* 카드 정보 */}
      <div className="flex flex-col gap-[0.25rem] px-[1.25rem] pb-[1rem] pt-[0.75rem]">
        {/* 이름 + 상태 배지 */}
        <div className="flex items-start justify-between">
          <p className="line-clamp-1 flex-1 text-[1rem] font-semibold leading-[1.25rem] text-[#5d5d5d]">
            {listing.name}
          </p>
          <span className={statusBadge({ status: listing.status })}>
            {ADOPTION_STATUS_LABEL[listing.status]}
          </span>
        </div>

        {/* 성별 + 나이 */}
        <div className="flex items-center gap-[0.5rem] text-[1rem] font-semibold leading-[1.25rem] text-[#5d5d5d]">
          <span>{genderLabel}</span>
          <span>{listing.ageText}</span>
        </div>

        {/* 문의/관심/조회 + 관심있어요 */}
        <div className="mt-[0.75rem] flex items-center justify-between">
          <div className="flex items-center gap-[1.125rem] text-[0.8125rem] font-medium text-[#8e8e8e]">
            <span>문의 {listing.inquiryCount}</span>
            <span>관심 {listing.favoriteCount}</span>
            <span>조회 {listing.viewCount}</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-[0.5rem] text-[0.8125rem] font-medium text-[#5d5d5d]"
          >
            <FavoriteIcon className="size-[1.375rem] text-[#5d5d5d]" />
            <span>관심있어요</span>
          </button>
        </div>

        {/* 게시날짜 */}
        <div className="flex items-center gap-[0.4375rem] text-[0.75rem] text-[#a3a3a3]">
          <span>게시날짜</span>
          <span className="size-[0.1875rem] rounded-full bg-[#a3a3a3]" />
          <span>{listing.postedAt}</span>
        </div>
      </div>

      {/* 인기 배지 */}
      {listing.isPopular && (
        <Badge
          variant="outline"
          className="absolute left-[1.25rem] top-[1rem] bg-white"
        >
          인기
        </Badge>
      )}
    </div>
  )
}

export { AdoptionCard }
