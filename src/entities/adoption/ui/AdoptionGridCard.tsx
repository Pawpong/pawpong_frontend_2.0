'use client'

import { GenderIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { FavoriteToggle, MediaCard, PopularBadge } from '@/shared/ui'
import { AdoptionStatusBadge } from './AdoptionStatusBadge'

/** 이 카드가 실제로 그리는 필드만 (분양글 목록처럼 다른 응답 타입도 그대로 넘길 수 있게) */
type AdoptionGridCardListing = Pick<
  AdoptionListingCard,
  'listingId' | 'name' | 'gender' | 'birthDateText' | 'thumbnailUrl' | 'status'
> & { isPopular?: boolean }

interface AdoptionGridCardProps {
  listing: AdoptionGridCardListing
  isFavorite?: boolean
  onToggle?: () => void
  /** 관심 하트 노출 (기본 true). 내 분양글처럼 관심 등록이 없는 화면은 false */
  showFavorite?: boolean
  preload?: boolean
  className?: string
}

/** 탐색/홈 공용 세로형 카드 (프레젠테이셔널). 관심 연결은 호출부(features 래퍼)가 담당한다. */
const AdoptionGridCard = ({
  listing,
  isFavorite,
  onToggle,
  showFavorite = true,
  preload = false,
  className,
}: AdoptionGridCardProps) => {
  const { status } = listing

  return (
    <MediaCard
      href={`/adoption/${listing.listingId}`}
      thumbnailUrl={listing.thumbnailUrl}
      alt={listing.name}
      preload={preload}
      className={cn(
        'transition-[box-shadow,background-color,border-radius] duration-200 ease-out pc:hover:overflow-hidden pc:hover:rounded-[1.25rem] pc:hover:bg-white pc:hover:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)] pc:focus-visible:rounded-[1.25rem] pc:focus-visible:bg-white pc:focus-visible:shadow-[0_7px_7px_0_rgba(55,55,55,0.1)]',
        className,
      )}
      overlay={
        <>
          {status === 'adopted' && <div className="absolute inset-0 bg-white/70" />}

          <div className="absolute top-1 right-2 left-2 flex items-center gap-1 pc:top-2 pc:right-3 pc:left-3">
            {listing.isPopular && (
              <PopularBadge
                variant="primaryOutline"
                size="md"
                iconSize="responsive"
                className="bg-white pc:h-[1.8125rem] pc:py-1 pc:text-sm"
              />
            )}
            <AdoptionStatusBadge status={status} size="md" className="shrink-0 pc:hidden" />
          </div>

          {/* 하트는 클릭을 가로채므로(preventDefault) 토글이 없는 화면에선 아예 그리지 않는다 */}
          {showFavorite && (
            <FavoriteToggle
              isFavorite={isFavorite}
              onToggle={onToggle}
              className="absolute right-2 bottom-1 pc:right-3 pc:bottom-2"
              iconClassName={cn('size-8 pc:size-12', !isFavorite && '!text-white/60')}
            />
          )}
        </>
      }
      trailing={
        <AdoptionStatusBadge
          status={status}
          size="md"
          className="hidden shrink-0 pc:flex pc:h-[1.8125rem] pc:py-1 pc:text-sm"
        />
      }
    >
      <div className="flex min-w-0 items-center">
        <p className="truncate text-sm leading-[1.5] font-semibold text-neutral-850 pc:text-base">
          {listing.name}
        </p>
        <GenderIcon gender={listing.gender} className="size-7 shrink-0 text-neutral-850" />
      </div>
      <p className="truncate text-xs leading-[1.5] font-medium text-neutral-850 pc:text-sm">
        {listing.birthDateText}
      </p>
    </MediaCard>
  )
}

export { AdoptionGridCard }
export type { AdoptionGridCardListing }
