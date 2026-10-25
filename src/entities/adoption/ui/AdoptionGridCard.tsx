'use client'

import { FavoriteIcon, GenderIcon } from '@/shared/assets'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { MediaCard, PopularBadge, ToggleIconButton } from '@/shared/ui'
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
    // [refactored] 템플릿 문자열 분기 → cn
    <div className={cn('h-full min-w-0', className)}>
      <MediaCard
        href={`/adoption/${listing.listingId}`}
        thumbnailUrl={listing.thumbnailUrl}
        alt={listing.name}
        title={listing.name}
        description={listing.birthDateText}
        titleTrailing={
          <GenderIcon gender={listing.gender} className="size-6 shrink-0 text-neutral-850" />
        }
        preload={preload}
        dimmed={status === 'adopted'}
        badge={
          listing.isPopular && (
            <PopularBadge variant="primaryOutline" size="responsive" iconSize="responsive" />
          )
        }
        status={<AdoptionStatusBadge status={status} />}
        action={
          showFavorite &&
          onToggle && (
            <ToggleIconButton
              icon={FavoriteIcon}
              hasFillState
              size="responsive"
              tone="onImage"
              aria-label="관심 등록"
              pressed={isFavorite}
              onClick={onToggle}
            />
          )
        }
      />
    </div>
  )
}

export { AdoptionGridCard }
export type { AdoptionGridCardListing }
