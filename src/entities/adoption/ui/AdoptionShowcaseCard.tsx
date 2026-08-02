'use client'

import Image from 'next/image'
import Link from 'next/link'
import { FireIcon, GenderIcon } from '@/shared/assets/icons'
import { cn } from '@/shared/lib/cn'
import type { AdoptionListingCard } from '@/shared/types'
import { Badge, FavoriteToggle } from '@/shared/ui'

const STATUS_BADGE_CLASS: Record<AdoptionListingCard['status'], string> = {
  available: 'bg-primary-500 text-white',
  reserved: 'bg-primary-500 text-white',
  completed: 'bg-neutral-150 text-neutral-400',
}

const STATUS_BADGE_LABEL: Record<AdoptionListingCard['status'], string> = {
  available: '분양중',
  reserved: '예약중',
  completed: '분양완료',
}

interface AdoptionShowcaseCardProps {
  listing: AdoptionListingCard
  className?: string
  isFavorite?: boolean
  onToggle?: () => void
}

/** 홈 분양 쇼케이스용 프레젠테이셔널 카드. 즐겨찾기 연결은 features 래퍼가 담당한다. */
const AdoptionShowcaseCard = ({
  listing,
  className,
  isFavorite,
  onToggle,
}: AdoptionShowcaseCardProps) => (
  <Link
    href={`/adoption/${listing.listingId}`}
    className={cn('flex w-[10.25rem] flex-col pc:w-auto', className)}
  >
    <div className="relative h-[8.3649rem] w-[10.25rem] overflow-hidden rounded bg-neutral-700 pc:aspect-[348/284] pc:h-auto pc:w-full pc:rounded-[0.5rem]">
      <div className="absolute inset-0 pc:inset-auto pc:top-[-14.064%] pc:left-[-15.28%] pc:h-[132.476%] pc:w-[144.064%]">
        <Image src={listing.thumbnailUrl} alt={listing.name} fill className="object-cover" />
      </div>
      {listing.isPopular && (
        <Badge
          variant="outline"
          className="absolute top-2 left-3 hidden h-[1.8125rem] gap-1 border-primary-500 bg-white px-2 py-0 text-sm leading-[1.5] font-semibold text-primary-500 pc:flex"
        >
          <FireIcon className="h-[1.125rem] w-4 shrink-0" />
          인기
        </Badge>
      )}
      <div className="absolute top-0 left-0 flex items-center gap-1 px-2 py-1 pc:hidden">
        <Badge className={cn('h-6 px-2 py-0 text-[0.625rem]', STATUS_BADGE_CLASS[listing.status])}>
          {STATUS_BADGE_LABEL[listing.status]}
        </Badge>
        {listing.isPopular && (
          <Badge
            variant="outline"
            className="h-6 border-primary-500 bg-white px-2 py-0 text-[0.625rem] font-semibold text-primary-500"
          >
            인기
          </Badge>
        )}
      </div>
      <FavoriteToggle
        isFavorite={isFavorite}
        onToggle={onToggle}
        className="absolute right-2 bottom-1 pc:right-3 pc:bottom-2"
        iconClassName={cn('size-8 pc:size-12', !isFavorite && '!text-neutral-50')}
      />
    </div>

    <div className="flex items-start justify-between gap-[0.5rem] p-2 pc:p-[0.75rem]">
      <div className="flex min-w-0 flex-col">
        <div className="flex items-center">
          <p className="truncate text-sm leading-[1.5] font-semibold text-neutral-850 pc:text-base">
            {listing.name}
          </p>
          <GenderIcon
            gender={listing.gender}
            className="size-5 shrink-0 text-neutral-850 pc:size-6"
          />
        </div>
        <p className="truncate text-xs leading-[1.5] font-medium text-neutral-850 pc:text-sm">
          {listing.ageText}
        </p>
      </div>
      <Badge
        className={cn(
          'hidden h-[1.8125rem] shrink-0 px-2 py-1 text-sm pc:flex',
          STATUS_BADGE_CLASS[listing.status],
        )}
      >
        {STATUS_BADGE_LABEL[listing.status]}
      </Badge>
    </div>
  </Link>
)

export { AdoptionShowcaseCard }
export type { AdoptionShowcaseCardProps }
