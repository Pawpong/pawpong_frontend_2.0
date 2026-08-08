'use client'

import Image from 'next/image'
import Link from 'next/link'
import { cn } from '@/shared/lib/cn'

import { FavoriteButton, FavoriteToggle, ListingStats, PopularBadge } from '@/shared/ui'
import type { AdoptionListingCard } from '@/shared/types'
import { GENDER_LABEL } from '@/shared/types'
import { AdoptionStatusBadge } from './AdoptionStatusBadge'

// [refactored] 세로형 카드 제목 공통 클래스 (모바일/태블릿 — 사이즈만 각 카드에서 cn으로 덧붙임)
const CARD_TITLE_BASE = 'line-clamp-2 leading-[1.5] font-semibold text-neutral-850'

interface AdoptionCardProps {
  listing: AdoptionListingCard
  className?: string
  // 제어형 관심 상태 — mutation 연결은 features 레이어 래퍼(FavoriteAdoptionCard)에서 주입
  isFavorite?: boolean
  onToggle?: () => void
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
  <div className={cn('relative aspect-[348/284] w-full overflow-hidden bg-neutral-700', className)}>
    <Image
      src={listing.thumbnailUrl}
      alt={listing.name}
      fill
      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
      className="object-cover"
    />
    {isCompleted && <div className="absolute inset-0 bg-white/70" />}
    {/* 인기(bestBadge) 좌상단 배지 — Figma 796-81671 (mo 14px/py-2 · tab 16px/py-4) */}
    {listing.isPopular && (
      <PopularBadge
        variant="outline"
        iconSize="responsive"
        className="absolute top-[0.6875rem] left-[0.6875rem] bg-white px-2 py-0.5 text-sm leading-[1.5] font-medium text-neutral-700 tab:top-[0.875rem] tab:left-[0.9219rem] tab:py-1 tab:text-base"
      />
    )}
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
const AdoptionCard = ({ listing, className, isFavorite, onToggle }: AdoptionCardProps) => {
  const isCompleted = listing.status === 'adopted'

  return (
    <Link href={`/adoption/${listing.listingId}`} className={cn('block', className)}>
      {/* ══════ 모바일 카드 (Figma 796-81670, medium) ══════ */}
      <div className="flex flex-col tab:hidden">
        {/* 이미지 + 우하단 하트 48px 오버레이 (medium은 하트가 정보영역이 아닌 이미지 위) */}
        <div className="relative">
          <CardImage listing={listing} isCompleted={isCompleted} className="rounded-[0.25rem]" />
          <FavoriteToggle
            isFavorite={isFavorite}
            onToggle={onToggle}
            className="absolute right-0 bottom-0"
            iconClassName="size-12"
          />
        </div>

        {/* 정보: p-8 — 상단(제목 2줄/입양가능 배지) · 하단(stats) (Figma 796-81620) */}
        <div className="flex min-h-[5rem] flex-col justify-between gap-[0.5rem] p-[0.5rem]">
          {/* 상단: 제목 + 입양가능 배지 */}
          <div className="flex items-start justify-between gap-[0.5rem]">
            {/* [refactored] 제목 공통 클래스 + 모바일 사이즈 */}
            <p className={cn(CARD_TITLE_BASE, 'min-w-0 flex-1 text-[0.875rem]')}>{listing.name}</p>
            <AdoptionStatusBadge status={listing.status} size="md" className="shrink-0" />
          </div>
          {/* 하단: 문의/관심/조회 */}
          <CardStats
            listing={listing}
            className="gap-[0.25rem] text-[0.75rem] leading-[1.5] whitespace-nowrap text-neutral-700"
          />
        </div>
      </div>

      {/* ══════ 태블릿+ 카드 (Figma 796-81669, large) ══════ */}
      {/* 카드 배경 없음 — 이미지만 rounded-8, 정보는 2단(제목/stats · 상태배지/관심있어요) */}
      {/* hover: bg white + rounded-20 + drop shadow (Figma 1867-254861) */}
      <div className="hidden h-full flex-col transition-shadow tab:flex tab:hover:overflow-hidden tab:hover:rounded-[1.25rem] tab:hover:bg-white tab:hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]">
        {/* [refactored] 이미지 공통 컴포넌트 — rounded-8 */}
        <CardImage listing={listing} isCompleted={isCompleted} className="rounded-[0.5rem]" />

        {/* 정보: flex-1, p-12, 좌(제목/stats) · 우(상태배지/관심있어요) */}
        <div className="flex min-h-[7.5rem] flex-1 justify-between gap-[0.5rem] p-[0.75rem]">
          {/* 좌측: 제목(품종 ǀ 성별 나이, 2줄 clamp) + 문의/관심/조회 */}
          <div className="flex min-w-0 flex-1 flex-col justify-between">
            {/* [refactored] 제목 공통 클래스 + 태블릿 사이즈 */}
            <p className={cn(CARD_TITLE_BASE, 'text-[1rem]')}>
              {`${listing.name} | ${GENDER_LABEL[listing.gender]} ${listing.ageText}`}
            </p>
            <CardStats
              listing={listing}
              className="gap-[0.5rem] text-[0.875rem] leading-[1.5] text-neutral-700"
            />
          </div>
          {/* 우측: 상태배지(상단, 다크) + 관심있어요(하단, 하트+텍스트) */}
          <div className="flex shrink-0 flex-col items-end justify-between">
            <AdoptionStatusBadge status={listing.status} className="shrink-0" />
            <FavoriteButton
              size="md"
              isFavorite={isFavorite}
              onToggle={onToggle}
              className="p-0 text-[0.75rem] font-semibold text-neutral-850"
              iconClassName="size-8"
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
const AdoptionCardHorizontal = ({
  listing,
  className,
  isFavorite,
  onToggle,
}: AdoptionCardProps) => {
  return (
    <Link
      href={`/adoption/${listing.listingId}`}
      className={cn(
        'relative flex items-center gap-[0.5625rem] rounded-[0.375rem] bg-[#f0f0f0] px-[0.5rem] py-[0.4375rem] tab:gap-[1rem]',
        className,
      )}
    >
      {/* 이미지 100x100 */}
      <div className="relative size-[6.25rem] shrink-0 overflow-hidden">
        <Image
          src={listing.thumbnailUrl}
          alt={listing.name}
          fill
          sizes="100px"
          className="object-cover"
        />
      </div>

      {/* 정보 */}
      <div className="flex min-w-0 flex-1 flex-col gap-[0.4375rem]">
        {/* 이름 + 상태배지 */}
        <div className="flex flex-col gap-px">
          <p className="line-clamp-1 text-[0.875rem] leading-[1.5] font-bold text-[#5d5d5d]">
            {listing.name}
          </p>
          <div className="flex items-center">
            <AdoptionStatusBadge
              status={listing.status}
              size="md"
              className="px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
            />
          </div>
        </div>

        {/* 문의/관심/조회 + 관심있어요 */}
        <div className="flex flex-col items-end">
          <CardStats listing={listing} size="sm" className="w-full justify-end" />
          <FavoriteButton size="sm" isFavorite={isFavorite} onToggle={onToggle} />
        </div>
      </div>

      {/* 인기 배지: left16 top13.76 h22 px8 py2 text12 */}
      {listing.isPopular && (
        <PopularBadge
          variant="outline"
          className="absolute top-[0.86rem] left-[1rem] bg-white px-[0.5rem] py-[0.125rem] text-[0.75rem] leading-normal"
        />
      )}
    </Link>
  )
}

export { AdoptionCard, AdoptionCardHorizontal }
