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

// Figma 세로형 카드 상태 배지 → 공통 Badge 변형: 분양중/예약중 active(다크), 분양완료 disabled(그레이)
const STATUS_BADGE_VARIANT: Record<AdoptionListingCard['status'], 'active' | 'disabled'> = {
  available: 'active',
  reserved: 'active',
  completed: 'disabled',
}

interface AdoptionCardProps {
  listing: AdoptionListingCard
  className?: string
}

// [refactored] 세로형 카드 이미지(이미지 + 분양완료 오버레이) — 모바일/태블릿 공통, rounded만 className으로 차이
const CardImage = ({
  listing,
  isCompleted,
  className,
}: {
  listing: AdoptionListingCard
  isCompleted: boolean
  className?: string
}) => (
  <div className={cn('relative aspect-[348/284] w-full overflow-hidden bg-[#6b6b6b]', className)}>
    <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
    {isCompleted && <div className="absolute inset-0 bg-white/70" />}
  </div>
)

// [refactored] listing의 문의/관심/조회 카운트를 넘기는 ListingStats 래퍼 (3곳 prop 반복 제거)
const CardStats = ({
  listing,
  size,
  className,
}: {
  listing: AdoptionListingCard
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) => (
  <ListingStats
    inquiryCount={listing.inquiryCount}
    favoriteCount={listing.favoriteCount}
    viewCount={listing.viewCount}
    size={size}
    className={className}
  />
)

/* ═══════════════════════════════════════════════
   세로형 카드 (Figma)
   - 모바일: medium (1023-40492) — rounded-4, 상/하 2행(제목·배지 / stats·하트), 제목=품종명, stats 12px
   - 태블릿+: large (796-81669) — rounded-8, 좌/우 2단(제목·stats / 배지·관심있어요), 제목=품종ǀ성별 나이
   ═══════════════════════════════════════════════ */
const AdoptionCard = ({ listing, className }: AdoptionCardProps) => {
  const isCompleted = listing.status === 'completed'

  return (
    <Link href={`/adoption/${listing.listingId}`} className={cn('block', className)}>
      {/* ══════ 모바일 카드 (Figma 1023-40492, medium) ══════ */}
      <div className="flex flex-col tab:hidden">
        {/* [refactored] 이미지 공통 컴포넌트 — rounded-4 */}
        <CardImage listing={listing} isCompleted={isCompleted} className="rounded-[0.25rem]" />

        {/* 정보: p-8, 상단(제목/배지) · 하단(stats/하트) 2행 (Figma 796-81620) */}
        <div className="flex min-h-[5rem] flex-col justify-between gap-[0.5rem] p-[0.5rem]">
          {/* 상단: 제목 + 입양가능 배지 */}
          <div className="flex items-start justify-between gap-[0.5rem]">
            <p className="line-clamp-2 min-w-0 flex-1 text-[0.875rem] leading-[1.5] font-semibold text-[#3e3e3e]">
              {listing.name}
            </p>
            <Badge variant={STATUS_BADGE_VARIANT[listing.status]} size="md" className="shrink-0">
              {ADOPTION_STATUS_LABEL[listing.status]}
            </Badge>
          </div>
          {/* 하단: 문의/관심/조회 + 하트 */}
          <div className="flex items-end justify-between gap-[0.5rem]">
            <CardStats
              listing={listing}
              className="gap-[0.25rem] text-[0.75rem] leading-[1.5] whitespace-nowrap text-[#6b6b6b]"
            />
            <button type="button" className="shrink-0">
              <FavoriteIcon className="size-6 text-[#a6a6a6]" />
            </button>
          </div>
        </div>
      </div>

      {/* ══════ 태블릿+ 카드 (Figma 796-81669, large) ══════ */}
      {/* 카드 배경 없음 — 이미지만 rounded-8, 정보는 2단(제목/stats · 상태배지/관심있어요) */}
      <div className="hidden h-full flex-col tab:flex">
        {/* [refactored] 이미지 공통 컴포넌트 — rounded-8 */}
        <CardImage listing={listing} isCompleted={isCompleted} className="rounded-[0.5rem]" />

        {/* 정보: flex-1, p-12, 좌(제목/stats) · 우(상태배지/관심있어요) */}
        <div className="flex min-h-[7.5rem] flex-1 justify-between gap-[0.5rem] p-[0.75rem]">
          {/* 좌측: 제목(품종 ǀ 성별 나이, 2줄 clamp) + 문의/관심/조회 */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            <p className="line-clamp-2 text-[1rem] leading-[1.5] font-semibold text-[#3e3e3e]">
              {`${listing.name} | ${GENDER_LABEL[listing.gender]} ${listing.ageText}`}
            </p>
            <CardStats
              listing={listing}
              className="gap-[0.5rem] text-[0.875rem] leading-[1.5] text-[#6b6b6b]"
            />
          </div>
          {/* 우측: 상태배지(상단, 다크) + 관심있어요(하단, 하트+텍스트) */}
          <div className="flex shrink-0 flex-col items-end justify-between">
            <Badge variant={STATUS_BADGE_VARIANT[listing.status]} className="shrink-0">
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
          <CardStats listing={listing} size="sm" className="w-full justify-end" />
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
