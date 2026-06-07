'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'

import { FavoriteIcon } from '@/shared/assets/icons'
import { Badge, FavoriteButton, ListingStats } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import { ADOPTION_STATUS_LABEL, GENDER_LABEL } from '@/shared/types'

const STATUS_BG: Record<AdoptionListingCard['status'], string> = {
  available: 'bg-[#5d5d5d]',
  reserved: 'bg-[#5d5d5d]',
  completed: 'bg-[#a4a4a4]',
}

// Figma 세로형 카드(796-81669 large / 796-81670 medium) 상태 배지: 활성 다크(#3e3e3e), 완료는 그레이
const STATUS_BG_DARK: Record<AdoptionListingCard['status'], string> = {
  available: 'bg-[#3e3e3e]',
  reserved: 'bg-[#3e3e3e]',
  completed: 'bg-[#a4a4a4]',
}

interface AdoptionCardProps {
  listing: AdoptionListingCard
  className?: string
}

/* ═══════════════════════════════════════════════
   세로형 카드 (Figma)
   - 모바일: medium (796-81670) — rounded-4, 하트 이미지 오버레이, 제목=품종명, stats 12px
   - 태블릿+: large (796-81669) — rounded-8, 제목=품종ǀ성별 나이, 하트+관심있어요 텍스트
   ═══════════════════════════════════════════════ */
const AdoptionCard = ({ listing, className }: AdoptionCardProps) => {
  const isCompleted = listing.status === 'completed'

  return (
    <Link href={`/adoption/${listing.listingId}`} className={cn('block', className)}>
      {/* ══════ 모바일 카드 (Figma 796-81670, medium) ══════ */}
      <div className="flex flex-col tab:hidden">
        {/* 이미지: aspect 348/284, rounded-4, bg #6b6b6b, 하트 오버레이(우하단, 회색 #a6a6a6) */}
        <div className="relative aspect-[348/284] w-full overflow-hidden rounded-[0.25rem] bg-[#6b6b6b]">
          <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
          {isCompleted && <div className="absolute inset-0 bg-white/70" />}
          <button type="button" className="absolute right-[0.5rem] bottom-[0.5rem]">
            <FavoriteIcon className="size-9 text-[#a6a6a6]" />
          </button>
        </div>

        {/* 정보: p-8, 좌(제목/stats) · 우(상태배지) */}
        <div className="flex min-h-[5rem] justify-between gap-[0.5rem] p-[0.5rem]">
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <p className="line-clamp-2 text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e]">
              {listing.name}
            </p>
            <ListingStats
              inquiryCount={listing.inquiryCount}
              favoriteCount={listing.favoriteCount}
              viewCount={listing.viewCount}
              className="gap-[0.25rem] text-[0.75rem] leading-[1.5] text-[#6b6b6b]"
            />
          </div>
          <Badge
            variant="status"
            className={cn(
              STATUS_BG_DARK[listing.status],
              'shrink-0 self-start px-[0.5rem] py-[0.125rem] text-[0.875rem] leading-[1.5] font-medium text-[#f6f6f6]',
            )}
          >
            {ADOPTION_STATUS_LABEL[listing.status]}
          </Badge>
        </div>
      </div>

      {/* ══════ 태블릿+ 카드 (Figma 796-81669, large) ══════ */}
      {/* 카드 배경 없음 — 이미지만 rounded-8, 정보는 2단(제목/stats · 상태배지/관심있어요) */}
      <div className="hidden h-full flex-col tab:flex">
        {/* 이미지: aspect 348/284, rounded-8, bg #6b6b6b */}
        <div className="relative aspect-[348/284] w-full overflow-hidden rounded-[0.5rem] bg-[#6b6b6b]">
          <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
          {isCompleted && <div className="absolute inset-0 bg-white/70" />}
        </div>

        {/* 정보: flex-1, p-12, 좌(제목/stats) · 우(상태배지/관심있어요) */}
        <div className="flex min-h-[7.5rem] flex-1 justify-between gap-[0.5rem] p-[0.75rem]">
          {/* 좌측: 제목(품종 ǀ 성별 나이, 2줄 clamp) + 문의/관심/조회 */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <p className="line-clamp-2 text-[1rem] leading-[1.5] font-semibold text-[#3e3e3e]">
              {`${listing.name} | ${GENDER_LABEL[listing.gender]} ${listing.ageText}`}
            </p>
            <ListingStats
              inquiryCount={listing.inquiryCount}
              favoriteCount={listing.favoriteCount}
              viewCount={listing.viewCount}
              className="gap-[0.5rem] text-[0.875rem] leading-[1.5] text-[#6b6b6b]"
            />
          </div>
          {/* 우측: 상태배지(상단, 다크) + 관심있어요(하단, 하트+텍스트) */}
          <div className="flex shrink-0 flex-col items-end justify-between">
            <Badge
              variant="status"
              className={cn(
                STATUS_BG_DARK[listing.status],
                'px-[0.5rem] py-[0.25rem] text-[1rem] leading-[1.5] font-medium text-[#f6f6f6]',
              )}
            >
              {ADOPTION_STATUS_LABEL[listing.status]}
            </Badge>
            <FavoriteButton
              size="md"
              className="gap-[0.25rem] p-0 text-[0.75rem] font-semibold text-[#3e3e3e]"
              iconClassName="size-6 text-[#a6a6a6]"
            />
          </div>
        </div>
      </div>
    </Link>
  )
}

/* ═══════════════════════════════════════════════
   가로형 카드 — 모바일 인기 동물 섹션 전용
   피그마: bg #f0f0f0, rounded 6, px8 py7, img 100x100
   ═══════════════════════════════════════════════ */
const AdoptionCardHorizontal = ({ listing, className }: AdoptionCardProps) => {
  return (
    <Link
      href={`/adoption/${listing.listingId}`}
      className={cn(
        'relative flex items-center gap-[0.5625rem] rounded-[0.375rem] bg-[#f0f0f0] px-[0.5rem] py-[0.4375rem]',
        className,
      )}
    >
      {/* 이미지 100x100 */}
      <div className="relative size-[6.25rem] shrink-0 overflow-hidden">
        <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
      </div>

      {/* 정보 */}
      <div className="flex min-w-0 flex-1 flex-col gap-[0.4375rem]">
        {/* 이름 + 상태배지 */}
        <div className="flex flex-col gap-px">
          <p className="line-clamp-1 text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d]">
            {listing.name}
          </p>
          <div className="flex items-center">
            <Badge
              variant="status"
              className={cn(
                STATUS_BG[listing.status],
                'px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal',
              )}
            >
              {ADOPTION_STATUS_LABEL[listing.status]}
            </Badge>
          </div>
        </div>

        {/* 문의/관심/조회 + 관심있어요 */}
        <div className="flex flex-col items-end">
          <ListingStats
            inquiryCount={listing.inquiryCount}
            favoriteCount={listing.favoriteCount}
            viewCount={listing.viewCount}
            size="sm"
            className="w-full justify-end"
          />
          <FavoriteButton size="sm" />
        </div>
      </div>

      {/* 인기 배지: left16 top13.76 h22 px8 py2 text12 */}
      {listing.isPopular && (
        <Badge
          variant="outline"
          className="absolute top-[0.86rem] left-[1rem] bg-white px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
        >
          인기🔥
        </Badge>
      )}
    </Link>
  )
}

export { AdoptionCard, AdoptionCardHorizontal }
