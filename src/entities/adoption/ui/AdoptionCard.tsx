'use client'

import Image from 'next/image'
import { tv } from 'tailwind-variants'
import { cn } from '@/shared/lib/Cn'
import { FavoriteIcon } from '@/shared/assets/icons'
import { Badge } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_STATUS_LABEL } from '@/shared/types'

const statusBadgeVariants = tv({
  base: 'shrink-0 rounded-full font-semibold text-white whitespace-nowrap',
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

/* ═══════════════════════════════════════════════
   세로형 카드
   - 모바일: 이미지 + 텍스트 분리 (gap 4px, 배경 없음)
   - 데스크탑: 하나의 카드 (bg #e7e7e7, rounded 15px)
   ═══════════════════════════════════════════════ */
const AdoptionCard = ({ listing, className }: AdoptionCardProps) => {
  const isCompleted = listing.status === 'completed'

  return (
    <div className={cn('', className)}>
      {/* ══════ 모바일 카드 ══════ */}
      <div className="flex flex-col gap-[0.25rem] tab:hidden">
        {/* 이미지: h164, rounded-6, bg #d4d4d4 */}
        <div className="relative h-[10.25rem] w-full overflow-hidden rounded-[0.375rem] bg-[#d4d4d4]">
          <Image
            src={listing.thumbnailUrl}
            alt={listing.name}
            fill
            className="object-cover"
          />
          {isCompleted && <div className="absolute inset-0 bg-white/70" />}
          <button
            type="button"
            className="absolute bottom-[0.5rem] right-[0.625rem]"
          >
            <FavoriteIcon className="size-[1.403rem] text-[#5d5d5d]" />
          </button>
        </div>

        {/* 텍스트: gap 4px, 배경 없음 */}
        <div className="flex flex-col gap-[0.25rem]">
          {/* 이름 + 상태배지 (gap 4px) */}
          <div className="flex gap-[0.25rem] items-start">
            <p className="line-clamp-2 min-w-0 flex-1 text-[0.875rem] font-semibold leading-normal text-[#5d5d5d]">
              {listing.name}
            </p>
            <span
              className={cn(
                statusBadgeVariants({ status: listing.status }),
                'inline-flex h-[1.1875rem] w-[3.5rem] items-center justify-center px-[0.625rem] py-[0.25rem] text-[0.625rem] leading-[1.375rem]',
              )}
            >
              {ADOPTION_STATUS_LABEL[listing.status]}
            </span>
          </div>
          {/* 문의/관심/조회 (gap 6px, text 12px) */}
          <div className="flex items-center gap-[0.375rem] text-[0.75rem] font-medium leading-normal text-[#8e8e8e]">
            <span>문의 {listing.inquiryCount}</span>
            <span>관심 {listing.favoriteCount}</span>
            <span>조회 {listing.viewCount}</span>
          </div>
          {/* 게시날짜 (gap 7px, text 12px) */}
          <div className="flex items-center gap-[0.438rem] text-[0.75rem] leading-normal text-[#a3a3a3]">
            <span>게시날짜</span>
            <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
            <span>{listing.postedAt}</span>
          </div>
        </div>
      </div>

      {/* ══════ 데스크탑 카드 ══════ */}
      {/* 하나의 카드 컨테이너: bg #e7e7e7, rounded 14.968px */}
      <div className="hidden overflow-hidden rounded-[0.935rem] bg-[#e7e7e7] tab:block">
        {/* 이미지: aspect 348:287 */}
        <div className="relative aspect-[348/287] w-full overflow-hidden">
          <Image
            src={listing.thumbnailUrl}
            alt={listing.name}
            fill
            className="object-cover"
          />
          {isCompleted && <div className="absolute inset-0 bg-white/70" />}
          {/* 인기 배지 (left 19.64, top 16.06) */}
          {listing.isPopular && (
            <Badge
              variant="outline"
              className="absolute left-[1.228rem] top-[1.004rem] bg-white"
            >
              인기🔥
            </Badge>
          )}
        </div>

        {/* 정보: px 19.65, pt 19.84,*/}
        <div className="px-[1.228rem] pb-[0.68rem] pt-[1.103rem]">
          {/* 이름 + 상태배지 */}
          <div className="flex items-start justify-between gap-[0.5rem]">
            <p className="line-clamp-2 min-w-0 flex-1 text-[1rem] font-semibold leading-[1.286rem] text-[#5d5d5d]">
              {listing.name}
            </p>
            <span
              className={cn(
                statusBadgeVariants({ status: listing.status }),
                'px-[0.585rem] py-[0.234rem] text-[0.819rem] leading-[1.286rem]',
              )}
            >
              {ADOPTION_STATUS_LABEL[listing.status]}
            </span>
          </div>
          {/* 성별 + 나이 (top 330.02, gap 7.484) */}
          <div className="mt-[0.162rem] flex items-center gap-[0.468rem] text-[1rem] font-semibold leading-[1.286rem] text-[#5d5d5d]">
            <span>{listing.gender === 'male' ? '남자' : '여자'}</span>
            <span>{listing.ageText}</span>
          </div>
          {/* 문의/관심/조회 (top 368, gap 18.71) */}
          <div className="mt-[1.088rem] flex items-center gap-[1.169rem] text-[0.819rem] font-medium leading-[1.286rem] text-[#8e8e8e]">
            <span>문의 {listing.inquiryCount}</span>
            <span>관심 {listing.favoriteCount}</span>
            <span>조회 {listing.viewCount}</span>
          </div>
          {/* 게시날짜(top 393.72) + 관심있어요(left 229.7, top 381.09) */}
          <div className="mt-[0.321rem] flex items-center justify-between">
            <div className="flex items-center gap-[0.438rem] text-[0.75rem] text-[#a3a3a3]">
              <span>게시날짜</span>
              <span className="size-[0.188rem] rounded-full bg-[#a3a3a3]" />
              <span>{listing.postedAt}</span>
            </div>
            <button
              type="button"
              className="flex items-center gap-[0.585rem] rounded-full p-[0.585rem] text-[0.819rem] font-medium text-[#5d5d5d]"
            >
              <FavoriteIcon className="size-[1.403rem]" />
              <span>관심있어요</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   가로형 카드 — 모바일 인기 동물 섹션 전용
   피그마: bg #f0f0f0, rounded 6, px8 py7, img 100x100
   ═══════════════════════════════════════════════ */
const AdoptionCardHorizontal = ({ listing, className }: AdoptionCardProps) => {
  return (
    <div
      className={cn(
        'relative flex items-center gap-[0.5625rem] rounded-[0.375rem] bg-[#f0f0f0] px-[0.5rem] py-[0.4375rem]',
        className,
      )}
    >
      {/* 이미지 100x100 */}
      <div className="relative size-[6.25rem] shrink-0 overflow-hidden">
        <Image
          src={listing.thumbnailUrl}
          alt={listing.name}
          fill
          className="object-cover"
        />
      </div>

      {/* 정보 */}
      <div className="flex min-w-0 flex-1 flex-col gap-[0.4375rem]">
        {/* 이름 + 상태배지 */}
        <div className="flex flex-col gap-px">
          <p className="line-clamp-1 text-[0.875rem] font-bold leading-[1.5] text-[#5d5d5d]">
            {listing.name}
          </p>
          <div className="flex items-center">
            <span className="rounded-full bg-[#5d5d5d] px-[0.5rem] py-[0.125rem] text-[0.75rem] font-semibold leading-normal text-white">
              {ADOPTION_STATUS_LABEL[listing.status]}
            </span>
          </div>
        </div>

        {/* 문의/관심/조회 + 관심있어요 */}
        <div className="flex flex-col items-end">
          <div className="flex w-full items-center justify-end gap-[0.5rem] text-[0.625rem] font-medium leading-[1.286rem] text-[#8e8e8e]">
            <span>문의 {listing.inquiryCount}</span>
            <span>관심 {listing.favoriteCount}</span>
            <span>조회 {listing.viewCount}</span>
          </div>
          <button
            type="button"
            className="flex items-center gap-[0.25rem] rounded-full text-[0.75rem] font-medium text-[#5d5d5d]"
          >
            <FavoriteIcon className="size-[1.403rem]" />
            <span>관심있어요</span>
          </button>
        </div>
      </div>

      {/* 인기 배지: left16 top13.76 h22 px8 py2 text12 */}
      {listing.isPopular && (
        <span className="absolute left-[1rem] top-[0.86rem] rounded-full border border-[#a8a8a8] bg-white px-[0.5rem] py-[0.125rem] text-[0.75rem] font-semibold leading-normal text-[#a8a8a8]">
          인기🔥
        </span>
      )}
    </div>
  )
}

export { AdoptionCard, AdoptionCardHorizontal }
