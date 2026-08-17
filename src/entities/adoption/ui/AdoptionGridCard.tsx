'use client'

import Image from 'next/image'
import Link from 'next/link'
import { GenderIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { FavoriteToggle, PopularBadge } from '@/shared/ui'
import { AdoptionStatusBadge } from './AdoptionStatusBadge'

/** 이 카드가 실제로 그리는 필드만 (분양글 목록처럼 다른 응답 타입도 그대로 넘길 수 있게) */
type AdoptionGridCardListing = Pick<
  AdoptionListingCard,
  'listingId' | 'name' | 'gender' | 'ageText' | 'thumbnailUrl' | 'status'
> & { isPopular?: boolean }

interface AdoptionGridCardProps {
  listing: AdoptionGridCardListing
  isFavorite?: boolean
  onToggle?: () => void
  /** 관심 하트 노출 (기본 true). 내 분양글처럼 관심 등록이 없는 화면은 false */
  showFavorite?: boolean
  className?: string
}

/** 탐색/홈 공용 세로형 카드 (프레젠테이셔널). 관심 연결은 호출부(features 래퍼)가 담당한다. */
const AdoptionGridCard = ({
  listing,
  isFavorite,
  onToggle,
  showFavorite = true,
  className,
}: AdoptionGridCardProps) => {
  const { status } = listing

  return (
    <Link
      href={`/adoption/${listing.listingId}`}
      className={cn(
        'flex h-full w-full flex-col transition-shadow tab:hover:overflow-hidden tab:hover:rounded-[1.25rem] tab:hover:bg-white tab:hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        className,
      )}
    >
      <div className="relative aspect-[348/284] w-full overflow-hidden rounded-[0.5rem] bg-neutral-700">
        <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />

        {status === 'adopted' && <div className="absolute inset-0 bg-white/70" />}

        <div className="absolute top-2 right-3 left-3 flex items-center gap-1">
          {listing.isPopular && (
            <PopularBadge
              variant="primaryOutline"
              size="md"
              iconSize="responsive"
              className="bg-white tab:h-[1.8125rem] tab:py-1 tab:text-sm"
            />
          )}
          <AdoptionStatusBadge status={status} size="md" className="shrink-0 tab:hidden" />
        </div>

        {/* 하트는 클릭을 가로채므로(preventDefault) 토글이 없는 화면에선 아예 그리지 않는다 */}
        {showFavorite && (
          <FavoriteToggle
            isFavorite={isFavorite}
            onToggle={onToggle}
            className="absolute right-2 bottom-1 tab:right-3 tab:bottom-2"
            iconClassName={cn('size-8 tab:size-12', !isFavorite && '!text-neutral-50')}
          />
        )}
      </div>

      <div className="flex min-h-[4.3125rem] items-start justify-between gap-2 p-2 tab:p-3">
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex min-w-0 items-center">
            <p className="truncate text-sm leading-[1.5] font-semibold text-neutral-850 tab:text-base">
              {listing.name}
            </p>
            <GenderIcon
              gender={listing.gender}
              className="size-5 shrink-0 text-neutral-850 tab:size-6"
            />
          </div>
          <p className="truncate text-xs leading-[1.5] font-medium text-neutral-850 tab:text-sm">
            {listing.ageText}
          </p>
        </div>

        <AdoptionStatusBadge
          status={status}
          size="md"
          className="hidden shrink-0 tab:flex tab:h-[1.8125rem] tab:py-1 tab:text-sm"
        />
      </div>
    </Link>
  )
}

export { AdoptionGridCard }
export type { AdoptionGridCardListing }
